"use client";
import { useState } from "react";
import {
  File,
  List,
  Grid,
  Search,
  Download,
  Trash2,
  MoreHorizontal,
  Link2,
  ScanLine,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import QRCode from "qrcode";
import Image from "next/image";
import deleteFile from "../../actions/delete/delete";

export default function Files({ files, fetchFiles }) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrSrc, setQrSrc] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleCopy(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  }

  async function generateQR(url) {
    try {
      const qrCode = await QRCode.toDataURL(url);
      setQrSrc(qrCode);
      setQrVisible(true);
    } catch (err) {
      toast.error("Failed to generate QR code");
    }
  }

  async function handleDelete(id) {
    try {
      const response = await deleteFile(id);
      console.log(response);

      if (response.success) {
        toast.success("File deleted");
        await fetchFiles();
      } else {
        toast.error("File could not be deleted");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Could not delete file");
    }
  }

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Files</h1>

        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/70" />
            </div>
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-amber-500/50 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-amber-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2 items-center">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${
                viewMode === "list"
                  ? "bg-amber-500/20 text-white"
                  : "text-white/70 hover:bg-amber-500/10"
              }`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-amber-500/20 text-white"
                  : "text-white/70 hover:bg-amber-500/10"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-amber-500/30">
                <th className="py-3 px-4 text-left text-white/80 font-medium">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-white/80 font-medium">
                  Uploaded
                </th>
                <th className="py-3 px-4 text-right text-white/80 font-medium">
                  Actions
                </th>
                <th className="py-3 px-4 text-right text-white/80 font-medium">
                  QR
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                >
                  <td className="py-3 px-4 flex items-center">
                    <File className="h-6 w-6 text-white mr-3" />
                    <span>{file.fileName}</span>
                  </td>
                  <td className="py-3 px-4 text-white/80">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={file.fileURL}
                        download
                        className="p-1 hover:bg-amber-500/10 rounded"
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4 text-white/80" />
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1 hover:bg-amber-500/10 rounded"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-white/80" />
                      </button>
                      <button
                        onClick={() => handleCopy(file.fileURL)}
                        className="p-1 hover:bg-amber-500/10 rounded"
                        aria-label="More options"
                      >
                        <Link2 className="h-4 w-4 text-white/80" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => generateQR(file.fileURL)}
                      className="p-1 hover:bg-amber-500/10 rounded"
                      aria-label="More options"
                    >
                      <ScanLine className="h-4 w-4 text-white/80" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative flex flex-col items-center p-4 border border-amber-500/30 rounded-lg hover:bg-amber-500/5 transition-colors"
            >
              <div className="mb-3 p-4 bg-amber-500/10 rounded-lg">
                <File className="h-6 w-6 text-white" />
              </div>
              <span className="text-center font-medium mb-1 truncate w-full">
                {file.fileName}
              </span>
              <span className="text-white/70 text-sm">
                {new Date(file.createdAt).toLocaleDateString()}
              </span>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <a
                  href={file.fileURL}
                  download
                  className="p-1 bg-black/70 hover:bg-amber-500/20 rounded"
                  aria-label="Download"
                >
                  <Download className="h-4 w-4 text-white" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1 bg-black/70 hover:bg-amber-500/20 rounded"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={() => handleCopy(file.fileURL)}
                  className="p-1 hover:bg-amber-500/10 rounded"
                  aria-label="More options"
                >
                  <Link2 className="h-4 w-4 text-white/80" />
                </button>
                <button
                  onClick={() => generateQR(file.fileURL)}
                  className="p-1 hover:bg-amber-500/10 rounded"
                  aria-label="More options"
                >
                  <ScanLine className="h-4 w-4 text-white/80" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-white/70">
          <File className="h-16 w-16 mb-4 text-white/50" />
          <h3 className="text-xl font-medium mb-2">No files found</h3>
          <p className="text-white/50">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "Upload some files to get started"}
          </p>
        </div>
      )}

      {qrVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-black p-6 rounded-lg shadow-lg relative max-w-sm w-full">
            <button
              onClick={() => setQrVisible(false)}
              className="absolute top-2 right-2 p-2"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              Scan to Open File
            </h2>
            <div className="flex justify-center">
              <Image src={qrSrc} alt="QR Code" width={200} height={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
