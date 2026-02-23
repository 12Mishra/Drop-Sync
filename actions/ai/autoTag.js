"use server";

import { GoogleGenAI } from "@google/genai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {prisma} from "../db/db";


const s3Client = new S3Client({
  region: process.env.NEXT_AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
  },
});

let _ai = null;
function getAI() {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
  return _ai;
}

const CATEGORIES = [
  "Photos",
  "Screenshots",
  "Diagrams & Charts",
  "Artwork & Design",
  "Documents",
  "PDFs",
  "Presentations",
  "Spreadsheets",
  "Videos",
  "Uncategorized",
];


const IMAGE_ANALYSIS_PROMPT = `
You are a precise file categorisation assistant. Analyse the image carefully and return a JSON object with exactly two keys:

1. "category" — choose ONE from this exact list:
   - "Photos"         : real-world photographs (portraits, landscapes, food, events, products, nature)
   - "Screenshots"    : UI/UX screenshots, web pages, desktop or mobile screen captures, software interfaces
   - "Diagrams & Charts" : ANY of — circuit diagrams, schematics, block diagrams, flowcharts, ER diagrams,
                           UML diagrams, architecture diagrams, network diagrams, bar charts, pie charts,
                           line graphs, scatter plots, histograms, engineering drawings, graph plots,
                   signal waveforms, timing diagrams, Gantt charts, mind maps
   - "Artwork & Design"  : illustrations, digital art, logos, icons, posters, UI mockups, design assets

2. "tags" — array of 3 to 5 lowercase descriptive tags specific to the content
   Good examples: ["circuit diagram", "electronics", "resistors"], ["bar chart", "sales data", "quarterly"]

Rules:
- If the image contains any technical drawing, graph, or diagram — always choose "Diagrams & Charts"
- Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Example: {"category": "Diagrams & Charts", "tags": ["circuit diagram", "electronics", "schematic", "resistors"]}
`.trim();

const DOCUMENT_ANALYSIS_PROMPT = (fileName, mimeType) => `
You are a file categorisation assistant. Based ONLY on the file name and type below, infer the most likely category and tags.

File name: "${fileName}"
MIME type: "${mimeType}"

Return a JSON object with:
1. "category" — choose ONE: "Documents" or "PDFs"
2. "tags" — array of 3 to 5 lowercase descriptive tags inferred from the file name
   Examples: ["invoice", "finance", "billing"], ["research paper", "academic", "machine learning"]

Respond ONLY with valid JSON. No markdown, no code fences, no explanation.
Example: {"category": "PDFs", "tags": ["invoice", "finance", "2024"]}
`.trim();

function getMimeTypeFromFileName(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  const map = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
  };
  return map[ext] ?? "application/octet-stream";
}

function ruleBasedCategory(mimeType) {
  if (mimeType.startsWith("video/"))
    return { category: "Videos", tags: ["video"] };

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-powerpoint"
  )
    return { category: "Presentations", tags: ["presentation", "slides"] };

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "text/csv"
  )
    return { category: "Spreadsheets", tags: ["spreadsheet", "data"] };

  return null;
}

async function fetchFileAsBase64(fileURL) {
  const fileKey = fileURL.split("/").pop();

  const presignedUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.NEXT_AWS_BUCKET_NAME,
      Key: fileKey,
    }),
    { expiresIn: 120 }
  );

  const res = await fetch(presignedUrl);
  if (!res.ok) throw new Error(`S3 fetch failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

async function callGemini(contents) {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
  });

  const raw =
    response.text ??
    response.candidates?.[0]?.content?.parts?.[0]?.text ??
    "";

  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
  }

  if (!text) throw new Error("Gemini returned an empty response.");

  return JSON.parse(text);
}


/**
 * Analyses a file already stored in S3 with Gemini and writes
 * { category, tags } back to the DB record.
 *
 * Safe to call without await — failures are swallowed so they never
 * break the upload flow.
 *
 * @param {number} fileId     - DB id of the Files record
 * @param {string} fileURL    - The bare S3 URL (no query params)
 * @param {string} mimeType   - MIME type of the file
 * @param {string} fileName   - Original / custom file name
 */
export async function autoTagFile(fileId, fileURL, mimeType, fileName) {
  let result = { category: "Uncategorized", tags: [], error: null };

  try {
    const ruled = ruleBasedCategory(mimeType);
    if (ruled) {
      result = { ...ruled, error: null };
    } else if (mimeType.startsWith("image/")) {
      const base64 = await fetchFileAsBase64(fileURL);
      const ai = await callGemini([
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: IMAGE_ANALYSIS_PROMPT },
          ],
        },
      ]);
      if (!CATEGORIES.includes(ai.category)) ai.category = "Uncategorized";
      result = { ...ai, error: null };
    } else if (
      mimeType === "application/pdf" ||
      mimeType === "application/msword" ||
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const ai = await callGemini([
        {
          role: "user",
          parts: [{ text: DOCUMENT_ANALYSIS_PROMPT(fileName, mimeType) }],
        },
      ]);
      ai.category =
        mimeType === "application/pdf" ? "PDFs" : "Documents";
      result = { ...ai, error: null };
    } else {
      result = { category: "Documents", tags: ["file"], error: null };
    }

    if (!Array.isArray(result.tags)) result.tags = [];
    result.tags = result.tags.map(String).slice(0, 5);
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.error(`[autoTag] AI failed for file ${fileId} (${fileName}):`, msg);
    result = { category: "Uncategorized", tags: [], error: msg };
  }

  // DB write (best-effort)
  try {
    await prisma.files.update({
      where: { id: fileId },
      data: { category: result.category, tags: result.tags },
    });
  } catch (dbErr) {
    console.error(`[autoTag] DB update failed for file ${fileId}:`, dbErr.message);
    if (!result.error) result.error = `DB: ${dbErr.message}`;
  }

  return result;
}

/**
 * Re-tags every file belonging to the given user.
 * MIME type is inferred from the file extension since it isn't stored in the DB.
 * Processes files sequentially to avoid Gemini rate limits.
 *
 * @param {object} session - next-auth session object
 * @returns {{ tagged: number, total: number }}
 */
export async function retagAllFiles(session) {
  const userId = parseInt(session?.user?.id);
  if (!userId) return { failure: "Not authenticated" };

  const files = await prisma.files.findMany({
    where: { user_id: userId },
    select: { id: true, fileName: true, fileURL: true },
  });

  let tagged = 0;
  let firstError = null;
  for (const file of files) {
    const mimeType = getMimeTypeFromFileName(file.fileName);
    const result = await autoTagFile(file.id, file.fileURL, mimeType, file.fileName);
    if (result.category !== "Uncategorized") tagged++;
    if (result.error && !firstError) firstError = result.error;
  }

  return { success: { tagged, total: files.length, firstError } };
}
