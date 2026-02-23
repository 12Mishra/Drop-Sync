"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { displayFiles, getSignedURL } from "@/actions/upload/upload";
import { autoTagFile, retagAllFiles } from "@/actions/ai/autoTag";
import Files from "@/components/Files";
import axios from "axios";
import { Zap, HardDrive, FileStack } from "lucide-react";

export default function FileUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [dispFiles, setDispFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customFileNames, setCustomFileNames] = useState([]);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retagging, setRetagging] = useState(false);
  const [totalFileSize, setTotalFileSize] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  async function fetchFiles() {
    try {
      const dispResponse = await displayFiles(session);
      console.log("Fetched files:", dispResponse);

      if (dispResponse?.success?.response) {
        const responseFiles = dispResponse.success.response;
        setDispFiles(responseFiles);
        const filesize = responseFiles.reduce((sum, file) => sum + file.fileSize, 0);
        setTotalFileSize(Math.ceil(filesize));
      } else {
        console.error("Unexpected response structure:", dispResponse);
        toast.error("Failed to load files: Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    }
  }

  useEffect(() => {
    fetchFiles();
  }, [session]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const addFiles = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setCustomFileNames((prev) => [...prev, ...newFiles.map((f) => f.name)]);
  };

  const computeSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  function handleFileChange(e) {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
    e.target.value = "";
  }

  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setCustomFileNames((prev) => prev.filter((_, i) => i !== index));
    if (renamingIndex === index) setRenamingIndex(null);
  }

  async function handleFileUpload(e) {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select a file first!");
      return;
    }
    setLoading(true);

    const count = selectedFiles.length;
    const uploadedFiles = [];

    try {
      await toast.promise(
        (async () => {
          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const fileName = customFileNames[i];

            const checksum = await computeSHA256(file);
            const response = await getSignedURL(
              file.type,
              file.size,
              checksum,
              fileName
            );

            if (response.failure !== undefined) {
              throw new Error(`Could not upload "${fileName}"`);
            }

            const { url, id } = response.success;
            const uploadRes = await axios.put(url, file, {
              headers: { "Content-Type": file.type },
            });

            if (uploadRes.status !== 200) {
              throw new Error(`Upload failed for "${fileName}"`);
            }

            uploadedFiles.push({
              id,
              fileURL: url.split("?")[0],
              type: file.type,
              name: fileName,
            });
          }

          setSelectedFiles([]);
          setCustomFileNames([]);
          setRenamingIndex(null);
          fetchFiles();
        })(),
        {
          pending: `Uploading ${count} file${count > 1 ? "s" : ""}...`,
          success: `${count} file${count > 1 ? "s" : ""} uploaded successfully!`,
          error: "Upload failed. Please try again.",
        }
      );

      if (uploadedFiles.length > 0) {
        toast.info("AI tagging running in background...", { autoClose: 2500 });
        uploadedFiles.forEach(({ id, fileURL, type, name }) => {
          autoTagFile(id, fileURL, type, name)
            .then(() => fetchFiles())
            .catch(console.error);
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRetagAll() {
    if (!session) return;
    setRetagging(true);
    const toastId = toast.loading("AI is tagging all your files...");
    try {
      const result = await retagAllFiles(session);
      const { tagged, total, firstError } = result?.success ?? {};

      toast.update(toastId, {
        render: `Tagged ${tagged} of ${total} file${total !== 1 ? "s" : ""}${firstError ? " (some failed)" : "!"}`,
        type: firstError ? "warning" : "success",
        isLoading: false,
        autoClose: 4000,
      });

      if (firstError) {
        setTimeout(
          () => toast.error(`Tagging error: ${firstError}`, { autoClose: 10000 }),
          300
        );
      }

      await fetchFiles();
    } catch (err) {
      toast.update(toastId, {
        render: `Tagging failed: ${err?.message ?? "Check your GEMINI_API_KEY."}`,
        type: "error",
        isLoading: false,
        autoClose: 6000,
      });
    } finally {
      setRetagging(false);
    }
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* ── Page header ── */}
      <div className="border-b border-white/5 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">My Files</h1>
              <p className="text-white/35 text-sm mt-0.5">{session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <FileStack className="h-4 w-4" />
                {dispFiles.length} {dispFiles.length === 1 ? "file" : "files"}
              </span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1.5 text-amber-500/80">
                <HardDrive className="h-4 w-4" />
                {totalFileSize} MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Upload panel ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-white/8 bg-zinc-950/40 p-6">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-5">
                Upload Files
              </h2>

              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-amber-500 bg-amber-500/5 scale-[1.01]"
                    : "border-white/10 hover:border-amber-500/35 hover:bg-white/[0.015]"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileChange}
                />

                <div
                  className={`mx-auto mb-4 h-12 w-12 rounded-full border flex items-center justify-center transition-colors ${
                    dragActive
                      ? "border-amber-500 bg-amber-500/20"
                      : "border-amber-500/25 bg-amber-500/8"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 transition-colors ${dragActive ? "text-amber-400" : "text-amber-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>

                <p className="text-white/60 text-sm mb-1">
                  <span className="text-amber-500 font-medium">Click to upload</span>{" "}
                  or drag and drop
                </p>
                <p className="text-white/25 text-xs">
                  Images, PDFs, documents, videos · up to 10MB each
                </p>
              </div>

              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="h-4 w-4 text-amber-500"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          {renamingIndex === index ? (
                            <input
                              type="text"
                              value={customFileNames[index]}
                              onChange={(e) => {
                                const updated = [...customFileNames];
                                updated[index] = e.target.value;
                                setCustomFileNames(updated);
                              }}
                              className="bg-zinc-800 text-white px-2 py-1 rounded text-sm w-full border border-white/10 focus:outline-none focus:border-amber-500/50"
                              onBlur={() => setRenamingIndex(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setRenamingIndex(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white truncate">
                                {customFileNames[index]}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingIndex(index);
                                }}
                                className="text-amber-500/40 hover:text-amber-500 flex-shrink-0 transition-colors"
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-white/25 mt-0.5">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-white/25 hover:text-white/60 ml-3 flex-shrink-0 transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload button */}
            <button
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedFiles.length > 0 && !loading
                  ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
              }`}
              onClick={handleFileUpload}
              disabled={selectedFiles.length === 0 || loading}
            >
              {loading
                ? "Uploading..."
                : selectedFiles.length > 0
                ? `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}`
                : "Select files to upload"}
            </button>
          </div>

          {/* ── Side panel ── */}
          <div className="space-y-4">
            {/* Storage stats */}
            <div className="rounded-xl border border-white/8 bg-zinc-950/40 p-6">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-5">
                Storage
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-white/40">Used</span>
                  <span className="text-amber-500 font-semibold">{totalFileSize} MB</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalFileSize / 500) * 100, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-white">{dispFiles.length}</p>
                    <p className="text-xs text-white/35 mt-0.5">Files</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-center">
                    <p className="text-2xl font-bold text-amber-400">{totalFileSize}</p>
                    <p className="text-xs text-white/35 mt-0.5">MB used</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI retag */}
            <div className="rounded-xl border border-white/8 bg-zinc-950/40 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  AI Tagging
                </h2>
              </div>
              <p className="text-xs text-white/35 mb-4 leading-relaxed">
                Re-analyze all your files with Gemini AI to refresh categories and tags.
              </p>
              <button
                onClick={handleRetagAll}
                disabled={retagging || dispFiles.length === 0}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  retagging || dispFiles.length === 0
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "border border-amber-500/30 bg-amber-500/8 text-amber-400 hover:bg-amber-500/15"
                }`}
              >
                {retagging ? "Tagging files…" : "Tag All Files with AI"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Files section ── */}
      <div className="border-t border-white/5 mt-2">
        {dispFiles && dispFiles.length > 0 ? (
          <Files files={dispFiles} fetchFiles={fetchFiles} />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-white/25">
            <svg
              className="h-14 w-14 mb-4 text-white/10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">No files yet — upload your first file above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
