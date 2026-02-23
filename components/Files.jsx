"use client";
import { useState } from "react";
import {
  File,
  FileVideo,
  FileText,
  FileSpreadsheet,
  Presentation,
  BarChart2,
  Camera,
  Monitor,
  Palette,
  List,
  Grid,
  Search,
  Download,
  Trash2,
  Link2,
  ScanLine,
  X,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import QRCode from "qrcode";
import Image from "next/image";
import deleteFile from "@/actions/delete/delete";

// ─── Category config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  Photos: {
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    icon: Camera,
  },
  Screenshots: {
    color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    icon: Monitor,
  },
  "Diagrams & Charts": {
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    icon: BarChart2,
  },
  "Artwork & Design": {
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    dot: "bg-pink-400",
    icon: Palette,
  },
  Documents: {
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    dot: "bg-gray-400",
    icon: FileText,
  },
  PDFs: {
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
    icon: FileText,
  },
  Presentations: {
    color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
    icon: Presentation,
  },
  Spreadsheets: {
    color: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    dot: "bg-teal-400",
    icon: FileSpreadsheet,
  },
  Videos: {
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    dot: "bg-cyan-400",
    icon: FileVideo,
  },
  Uncategorized: {
    color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    dot: "bg-zinc-500",
    icon: File,
  },
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG["Uncategorized"];
}

function FileIcon({ category, className = "h-6 w-6" }) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  return <Icon className={className} />;
}

function CategoryBadge({ category }) {
  if (!category || category === "Uncategorized") return null;
  const { color, dot } = getCategoryConfig(category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {category}
    </span>
  );
}

function TagChip({ tag, onClick, active }) {
  return (
    <span
      onClick={onClick ? () => onClick(tag) : undefined}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${
        active
          ? "bg-amber-500/30 text-amber-300 border-amber-400/50"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
      }`}
    >
      <Tag className="h-2.5 w-2.5" />
      {tag}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Files({ files, fetchFiles }) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
  const [qrSrc, setQrSrc] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);

  const presentCategories = [
    "All",
    ...Array.from(new Set(files.map((f) => f.category).filter(Boolean))).sort(),
  ];

  const lowerSearch = searchTerm.toLowerCase();

  const filteredFiles = files
    .filter((f) => activeCategory === "All" || f.category === activeCategory)
    .filter((f) => !activeTag || (f.tags ?? []).includes(activeTag))
    .filter((f) => {
      if (!lowerSearch) return true;
      const nameMatch = f.fileName?.toLowerCase().includes(lowerSearch);
      const tagMatch = (f.tags ?? []).some((t) =>
        t.toLowerCase().includes(lowerSearch)
      );
      return nameMatch || tagMatch;
    });

  function handleTagClick(tag) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  async function handleCopy(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function generateQR(url) {
    try {
      const qrCode = await QRCode.toDataURL(url);
      setQrSrc(qrCode);
      setQrVisible(true);
    } catch {
      toast.error("Failed to generate QR code");
    }
  }

  async function handleDelete(id) {
    try {
      const response = await deleteFile(id);
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
    <div className="px-6 py-8 bg-black min-h-screen text-white max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-white/80 uppercase tracking-wider">
            Your Files
          </h2>
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-lg border border-white/8">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-white/40 hover:text-white/70"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-white/40 hover:text-white/70"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search + filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-grow max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/30" />
            </div>
            <input
              type="text"
              placeholder="Search files or tags…"
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/8 rounded-lg focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] text-white text-sm placeholder-white/25 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Active tag filter pill */}
        {activeTag && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-white/30">Tag filter:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Tag className="h-3 w-3" />
              {activeTag}
              <button
                onClick={() => setActiveTag(null)}
                className="ml-0.5 hover:text-white transition-colors"
                aria-label="Clear tag filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {presentCategories.map((cat) => {
            const isAll = cat === "All";
            const isActive = activeCategory === cat;
            const config = isAll ? null : getCategoryConfig(cat);
            const count = isAll
              ? files.length
              : files.filter((f) => f.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? isAll
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/35"
                      : `${config.color} opacity-100`
                    : "bg-transparent text-white/40 border-white/8 hover:border-white/15 hover:text-white/60"
                }`}
              >
                {!isAll && (
                  <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                )}
                {cat}
                <span className={`ml-0.5 ${isActive ? "opacity-70" : "opacity-35"}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── List view ── */}
      {viewMode === "list" && (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className="py-3 px-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Tags
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Actions
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">
                  QR
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, idx) => (
                <tr
                  key={file.id}
                  className={`border-b border-white/5 hover:bg-amber-500/[0.03] transition-colors ${
                    idx % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center flex-shrink-0">
                        <FileIcon
                          category={file.category}
                          className="h-4 w-4 text-white/50"
                        />
                      </div>
                      <span className="truncate max-w-[180px] text-sm text-white/80">
                        {file.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge category={file.category} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(file.tags ?? []).slice(0, 3).map((tag) => (
                        <TagChip
                          key={tag}
                          tag={tag}
                          onClick={handleTagClick}
                          active={activeTag === tag}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/35 text-xs whitespace-nowrap">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <a
                        href={file.fileURL}
                        download
                        className="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors"
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4 text-white/40 hover:text-white/70" />
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-white/40 hover:text-red-400" />
                      </button>
                      <button
                        onClick={() => handleCopy(file.fileURL)}
                        className="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors"
                        aria-label="Copy link"
                      >
                        <Link2 className="h-4 w-4 text-white/40 hover:text-white/70" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => generateQR(file.fileURL)}
                      className="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors"
                      aria-label="QR code"
                    >
                      <ScanLine className="h-4 w-4 text-white/40 hover:text-amber-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => {
            const config = getCategoryConfig(file.category);
            return (
              <div
                key={file.id}
                className="group relative flex flex-col p-4 border border-white/8 rounded-xl bg-white/[0.02] hover:bg-amber-500/[0.04] hover:border-amber-500/25 transition-all duration-200"
              >
                {/* Icon */}
                <div
                  className={`mb-3 p-2.5 rounded-lg w-fit ${
                    file.category && file.category !== "Uncategorized"
                      ? config.color.split(" ")[0]
                      : "bg-white/[0.06]"
                  }`}
                >
                  <FileIcon
                    category={file.category}
                    className="h-5 w-5 text-white/80"
                  />
                </div>

                {/* Name */}
                <span
                  className="font-medium text-sm mb-2 truncate w-full text-white/80"
                  title={file.fileName}
                >
                  {file.fileName}
                </span>

                {/* Category badge */}
                <div className="mb-2">
                  <CategoryBadge category={file.category} />
                </div>

                {/* Tags */}
                {file.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {file.tags.slice(0, 3).map((tag) => (
                      <TagChip
                        key={tag}
                        tag={tag}
                        onClick={handleTagClick}
                        active={activeTag === tag}
                      />
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-xs text-white/25">
                        +{file.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Date */}
                <span className="text-white/30 text-xs mt-auto">
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>

                {/* Hover actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <a
                    href={file.fileURL}
                    download
                    className="p-1.5 bg-black/80 hover:bg-amber-500/20 rounded-lg border border-white/10 transition-colors"
                    aria-label="Download"
                  >
                    <Download className="h-3.5 w-3.5 text-white/70" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 bg-black/80 hover:bg-red-500/20 rounded-lg border border-white/10 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white/70" />
                  </button>
                  <button
                    onClick={() => handleCopy(file.fileURL)}
                    className="p-1.5 bg-black/80 hover:bg-amber-500/20 rounded-lg border border-white/10 transition-colors"
                    aria-label="Copy link"
                  >
                    <Link2 className="h-3.5 w-3.5 text-white/70" />
                  </button>
                  <button
                    onClick={() => generateQR(file.fileURL)}
                    className="p-1.5 bg-black/80 hover:bg-amber-500/20 rounded-lg border border-white/10 transition-colors"
                    aria-label="QR code"
                  >
                    <ScanLine className="h-3.5 w-3.5 text-white/70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="h-16 w-16 rounded-2xl border border-white/8 bg-white/[0.03] flex items-center justify-center mb-4">
            <File className="h-8 w-8 text-white/15" />
          </div>
          <h3 className="text-base font-medium mb-1 text-white/50">No files found</h3>
          <p className="text-sm text-white/25">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : activeCategory !== "All"
              ? `No files in "${activeCategory}"`
              : "Upload some files to get started"}
          </p>
        </div>
      )}

      {/* ── QR modal ── */}
      {qrVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50">
          <div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl shadow-2xl relative max-w-sm w-full mx-4">
            <button
              onClick={() => setQrVisible(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/8 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white/50" />
            </button>
            <h2 className="text-base font-bold mb-1 text-center">Scan to Open</h2>
            <p className="text-xs text-white/30 text-center mb-5">
              Point your camera at the QR code
            </p>
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <Image src={qrSrc} alt="QR Code" width={200} height={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
