import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { KainarLogo } from './KainarLogo';

const navLinks = [
  { path: '/', label: 'Басты бет' },
  { path: '/report', label: 'Оқиға хабарлау' },
  { path: '/road-safety', label: 'Жол қауіпсіздігі' },
  { path: '/evacuation', label: 'Эвакуация' },
  { path: '/emergency', label: 'Төтенше жағдай әрекеттері' },
  { path: '/memos', label: 'Қауіпсіздік ережелері' },
  { path: '/game', label: 'Оқу ойыны' },
  { path: '/cctv', label: 'Бейнебақылау' },
  { path: '/contacts', label: 'Байланыс' },
  { path: '/admin', label: 'Админ' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <KainarLogo className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">KAINAR COLLEGE</h1>
              <p className="text-sm text-blue-400 font-medium uppercase tracking-wider">Қауіпсіздік порталы</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="xl:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === link.path
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
