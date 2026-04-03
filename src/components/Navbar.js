import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

export default function Navbar({ activeSection }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: ROUTES.HOME, label: 'Home', id: 'home' },
    { href: '/#features', label: 'Features', id: 'features' },
    { href: '/#about', label: 'About', id: 'about' },
  ];

  const isHome = router.pathname === ROUTES.HOME;

  const getLinkClasses = (link) => {
    const base = 'text-sm font-medium transition-colors ';

    if (activeSection && link.id) {
      return activeSection === link.id
        ? base + 'text-[#62BABB]'
        : base + 'text-slate-100 hover:text-[#62BABB]';
    }

    if (!activeSection && link.href === '/' && isHome) {
      return base + 'text-[#62BABB]';
    }

    const isCurrentPath = router.pathname === link.href;
    return isCurrentPath
      ? base + 'text-[#62BABB]'
      : base + 'text-slate-100 hover:text-[#62BABB]';
  };

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const navBase =
    'fixed inset-x-0 top-0 z-40 transition-colors duration-300 border-b';
  // Solid style when scrolled or on non-home pages: add background + blur + shadow
  const navSolid =
    'bg-[#0F2944]/95 border-[#0F2944] shadow-sm backdrop-blur';
  const navTransparent =
    'bg-transparent border-transparent';

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <nav className={`${navBase} ${scrolled ? navSolid : navTransparent}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-20">
            {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <Image
              src="/mano-logo.png"
              alt="Mano App logo"
              width={200}
              height={60}
              className="h-15 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={getLinkClasses(link)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          </div>

          {/* Auth actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  className={`text-sm font-medium transition-colors ${
                    router.pathname.startsWith(ROUTES.DASHBOARD)
                      ? 'text-[#62BABB]'
                      : 'text-slate-100 hover:text-[#62BABB]'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-[#62BABB] focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-[#62BABB] text-[#0F2944] rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.name?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        'U'}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href={ROUTES.PROFILE}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="text-sm font-semibold text-slate-100 hover:text-[#62BABB]"
                >
                  Login
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="text-sm font-semibold bg-[#62BABB] text-[#0F2944] px-4 py-2 rounded-full shadow hover:bg-[#7DC3B5]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-100 hover:bg-[#17365a]"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#17365a] bg-[#0F2944]">
          <div className="px-4 py-3 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`${getLinkClasses(link)} py-2`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-slate-100 py-2 hover:text-[#62BABB]"
                >
                  Dashboard
                </Link>
                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-slate-100 py-2 hover:text-[#62BABB]"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="text-sm font-medium text-red-400 py-2 text-left hover:text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-slate-100 py-2 hover:text-[#62BABB]"
                >
                  Login
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm font-semibold bg-[#62BABB] text-[#0F2944] px-4 py-2 rounded-full hover:bg-[#7DC3B5] mt-1 shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
