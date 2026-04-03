import Image from 'next/image';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F4FBFA] flex flex-col">
      <main className="flex-1">{children}</main>
      <footer className="bg-[#08142a] text-slate-200 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {/* Top footer row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            {/* Brand & tagline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/mano-logo.png"
                  alt="MANO logo"
                  width={200}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-slate-300">
                MANO combines smart nutrition, diabetes support and doctor‑guided care in one
                simple, secure health companion.
              </p>
            </div>

            {/* Product links */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-white mb-1">Product</h4>
              <a href="/#features" className="block hover:text-[#62BABB] transition-colors">
                Features
              </a>
              <a href="/#about" className="block hover:text-[#62BABB] transition-colors">
                How it works
              </a>
            </div>

            {/* Company links */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-white mb-1">Company</h4>
              <a href="/terms-of-use" className="block hover:text-[#62BABB] transition-colors">
                Terms of use
              </a>
              <a href="/privacy-policy" className="block hover:text-[#62BABB] transition-colors">
                Privacy policy
              </a>
            </div>

            {/* Call-to-actions only */}
            <div className="space-y-3 text-sm md:text-right">
              <div className="flex md:justify-end gap-3">
                <a
                  href="/signup"
                  className="inline-flex justify-center items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#F3C243] text-[#08142a] hover:bg-[#fbd25d] transition-colors"
                >
                  Sign up
                </a>
                <a
                  href="/login"
                  className="inline-flex justify-center items-center px-5 py-2 rounded-full text-sm font-semibold border border-slate-400 text-slate-100 hover:bg-slate-700 transition-colors"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-slate-800 py-4">
          <p className="text-[11px] text-slate-500 text-center">
            &copy; {new Date().getFullYear()} MANO – Medical AI Nutrition &amp; Online Consultation.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

