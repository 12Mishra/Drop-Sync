"use client"

import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="relative isolate px-4 pt-6 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-48">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white-900 sm:text-6xl"
          >
            Share Your Content with Ease
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-white-600"
          >
            Upload, share, and manage your content effortlessly. Our platform makes it simple 
            to share files with anyone, anywhere. Whether it's photos, documents, or media files, 
            we've got you covered with powerful features and intuitive sharing options.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/auth/signup"
              className="rounded-md bg-amber-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Get Started
            </motion.a>
            <motion.a 
              whileHover={{ x: 5 }}
              href="#features" 
              className="text-sm font-semibold leading-6 text-white-900"
            >
              Learn more <span aria-hidden="true">→</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
