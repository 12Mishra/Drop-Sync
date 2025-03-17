"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { displayFiles, getSignedURL } from "@/actions/upload/upload";
import Files from "../_components/Files";
import axios from "axios";
import { File } from "lucide-react";

export default function FileUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [dispFiles, setDispFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customFileName, setCustomFileName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [totalFileSize, setTotalFileSize] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
    }
  }, [session]);

  async function fetchFiles() {
    try {
      const dispResponse = await displayFiles(session);
      console.log("Fetched files:", dispResponse);

      if (
        dispResponse &&
        dispResponse.success &&
        dispResponse.success.response
      ) {
        const newFiles = dispResponse.success.response;
        setDispFiles(newFiles);

        const filesize = newFiles.reduce((sum, file) => sum + file.fileSize, 0);
        setTotalFileSize(Math.ceil(filesize));
      } else {
        console.error("Response: ", dispResponse);
        toast.error("Failed to load files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    }
  }
  useEffect(() => {
    if (!session) return;
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

    const uploadedFiles = e.dataTransfer.files;
    toast.info("File upload functionality coming soon!");
  };

  const computeSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  function handleFileChange(e) {
    e.preventDefault();
    setFiles(files)
    setSelectedFile(e.target.files);

  }

  async function handleFileUpload(e) {
    e.preventDefault();
    setLoading(true);

    if (files.length === 0) {
      toast.error("Please select files first!");
      setLoading(false);
      return;
    }

    try {
      for (const file of files) {
        const checksum = await computeSHA256(file);
        const response = await getSignedURL(
          file.type,
          file.size,
          checksum,
          file.name
        );

        if (response.failure !== undefined) {
          throw new Error(`Could not upload file: ${file.name}`);
        }

        const { url } = response.success;

        const uploadRes = await axios.put(url, file, {
          headers: { "Content-Type": file.type },
        });

        if (uploadRes.status !== 200) {
          throw new Error(`Upload failed for file: ${file.name}`);
        }

        console.log(`File uploaded successfully: ${file.name}`);
      }

      fetchFiles();
      toast.success("All files uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Some files failed to upload. Please try again.");
    } finally {
      setLoading(false);
      setFiles([]);
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Files</h1>
          <p className="mt-2 text-black-400">
            Upload and manage your files in one place
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black-900 rounded-xl shadow-2xl p-6 border border-black-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                Upload Files
              </h2>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-black-700 hover:border-amber-500/50"
                }`}
              >
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-black rounded-full flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-amber-500"
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
                  <div className="text-sm text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-amber-500 hover:text-amber-400 focus-within:outline-none"
                    >
                      <span>Click to upload</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1 inline">or drag and drop</p>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-6 w-6 text-amber-500"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          {isRenaming ? (
                            <input
                              type="text"
                              value={customFileName}
                              onChange={(e) =>
                                setCustomFileName(e.target.value)
                              }
                              className="bg-gray-800 text-white px-2 py-1 rounded-md text-sm"
                              onBlur={() => setIsRenaming(false)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setIsRenaming(false);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-white truncate max-w-xs">
                                {customFileName}
                              </span>
                              <button
                                onClick={() => setIsRenaming(true)}
                                className="text-amber-500 hover:text-amber-400"
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
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setFiles(null);
                          }}
                          className="text-gray-400 hover:text-amber-500 transition-colors"
                        >
                          <svg
                            className="h-5 w-5"
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
                      <div className="mt-1 text-xs text-gray-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supports any file type up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                className={`text-white rounded-lg px-4 py-2 ${
                  selectedFile
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-gray-600 cursor-not-allowed"
                } transition-colors`}
                onClick={handleFileUpload}
                disabled={!selectedFile}
              >
                {selectedFile ? "Upload File" : "Select a file"}
              </button>
            </div>
          </div>

          <div className="bg-black-900 rounded-xl shadow-2xl p-6 border border-black-800 h-fit">
            <h2 className="text-xl font-semibold text-white mb-6">
              Storage Overview
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-black-400">Storage Used:</span>
                  <span className="text-amber-500">{totalFileSize} MB</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black-800 rounded-lg p-4">
                  <p className="text-black-400 text-sm">Files uploaded</p>
                  <p className="text-white text-lg font-semibold">
                    {dispFiles.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        {dispFiles && dispFiles.length > 0 ? (
          <Files files={dispFiles} fetchFiles={fetchFiles} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-white/70">
            <File className="h-16 w-16 mb-4 text-white/50" />
            <h3 className="text-xl font-medium mb-2">No files found</h3>
            <p className="text-white/50">"Upload some files to get started"</p>
          </div>
        )}
      </div>
    </div>
  );
}
