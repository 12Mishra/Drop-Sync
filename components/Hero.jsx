"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Upload, Zap, Share2, QrCode } from "lucide-react";
import { useSession } from "next-auth/react";

const features = [
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    description:
      "Upload files effortlessly with drag-and-drop or click-to-select. Supports images, PDFs, documents, and videos up to 10MB.",
  },
  {
    icon: Zap,
    title: "AI Auto-Tagging",
    description:
      "Powered by Google Gemini, every file gets automatically categorized and tagged so you can find anything instantly.",
  },
  {
    icon: Share2,
    title: "Instant Sharing",
    description:
      "Copy a shareable link or generate a QR code for any file — perfect for quick sharing across devices.",
  },
];

const steps = [
  {
    step: "01",
    title: "Sign Up",
    desc: "Create your account in seconds. No credit card needed.",
  },
  {
    step: "02",
    title: "Upload",
    desc: "Drop files or click to select from your device.",
  },
  {
    step: "03",
    title: "Share",
    desc: "Copy links or scan QR codes to share instantly.",
  },
];

export default function Hero() {
  const { data: session } = useSession();

  return (
    <div className="bg-black text-white">
      <section className="relative isolate min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/8 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-powered file management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.08]"
          >
            Drop it. <span className="text-amber-500">Sync it.</span>
            <br />
            Share it.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-white/50 max-w-xl mx-auto leading-relaxed"
          >
            A personal file vault with AI tagging, instant link sharing, and QR
            code generation. Upload once, access anywhere.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
          >
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              Start Uploading
            </Link>
            {!session ? (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium rounded-lg transition-colors text-sm"
              >
                Sign In
              </Link>
            ) : null}
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Everything you need,{" "}
              <span className="text-amber-500">nothing you don&apos;t</span>
            </h2>
            <p className="text-white/40 text-base max-w-md mx-auto">
              Built lean for personal use — fast, simple, and smart.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="p-6 rounded-xl border border-white/8 hover:border-amber-500/25 bg-white/[0.02] hover:bg-amber-500/[0.04] transition-all duration-300"
              >
                <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 w-fit">
                  <feature.icon className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Up and running in <span className="text-amber-500">3 steps</span>
            </h2>
            <p className="text-white/40 text-base">
              No complicated setup. Just create, upload, and share.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-6 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4 mx-auto">
                  <span className="text-amber-500 font-bold text-sm">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="p-10 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-amber-500/5 blur-2xl" />
            <QrCode className="h-8 w-8 text-amber-500/60 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to get started?
            </h2>
            <p className="text-white/40 text-sm mb-8">
              Create your free account and start managing files smarter.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
