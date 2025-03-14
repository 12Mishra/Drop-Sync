export default function Hero() {
  return (
    <div className="relative isolate px-4 pt-6 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-48">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white-900 sm:text-6xl">
            Share Your Content with Ease
          </h1>
          <p className="mt-6 text-lg leading-8 text-white-600">
            Upload, share, and manage your content effortlessly. Our platform makes it simple 
            to share files with anyone, anywhere. Whether it's photos, documents, or media files, 
            we've got you covered with powerful features and intuitive sharing options.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-amber-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Get Started
            </a>
            <a href="#features" className="text-sm font-semibold leading-6 text-white-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
