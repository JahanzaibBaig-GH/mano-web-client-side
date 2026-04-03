import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  FileText,
  UtensilsCrossed,
  BarChart3,
  Droplet,
  Stethoscope,
  Pill,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

const iconClassName = 'w-5 h-5 shrink-0';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
  { href: ROUTES.MEDICAL_HISTORY, label: 'Medical History', icon: FileText },
  { href: ROUTES.DIET_PLANS, label: 'Diet Plans', icon: UtensilsCrossed },
  { href: ROUTES.HEALTH_RISK, label: 'Health Risk', icon: BarChart3 },
  { href: ROUTES.DIABETES, label: 'Diabetes', icon: Droplet },
  { href: ROUTES.DOCTORS, label: 'Find Doctors', icon: Stethoscope },
  { href: ROUTES.PRESCRIPTIONS, label: 'Prescriptions', icon: Pill },
  { href: ROUTES.PROFILE, label: 'Profile Settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (href) =>
    href === ROUTES.DASHBOARD
      ? router.pathname === ROUTES.DASHBOARD
      : router.pathname.startsWith(href);

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center justify-center gap-3 px-5 py-5 border-b border-gray-700">
          <Image
            src="/mano-logo.png"
            alt="Mano App logo"
            width={100}
            height={100}
            className="object-contain"
          />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={iconClassName} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="sidebar-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-900/40 hover:text-red-400"
        >
          <LogOut className={iconClassName} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-900 shrink-0 fixed left-0 top-0 h-full z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay - transparent blackish cover */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/55 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-64 bg-gray-900 z-50 flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
