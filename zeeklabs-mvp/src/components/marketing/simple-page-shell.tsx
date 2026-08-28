import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export function SimplePageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFB] flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/home" className="flex items-center gap-2.5">
              <Image src="/zeeklabs-logo.svg" alt="zeeklabs Logo" width={32} height={32} className="h-8 w-8" />
              <span className="font-bold text-lg tracking-tight text-gray-900">
                zeeklabs<span className="text-indigo-600">.ai</span>
              </span>
            </Link>
            <Link
              href="/home"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
        {subtitle && <p className="text-gray-500 mb-10">{subtitle}</p>}
        <div className="space-y-6 text-gray-600 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-indigo-600 [&_a]:hover:underline">
          {children}
        </div>
      </main>

      <footer className="py-8 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} zeeklabs.ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
