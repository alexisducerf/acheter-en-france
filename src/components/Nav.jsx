import { useState, useEffect } from 'react';

const links = [
  { href: '/', label: 'Recherche' },
  { href: '/about', label: 'À propos' },
];

const Logo = () => (
  <a href="/" className="flex items-center gap-2.5">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" strokeLinejoin="round" />
        <path d="M9.5 10.5 12 8.5l2.5 2V13h-5v-2.5Z" strokeLinejoin="round" />
      </svg>
    </span>
    <span className="font-display text-xl font-medium tracking-tight text-ink">
      Où&nbsp;Acheter
    </span>
  </a>
);

const Nav = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentPath(window.location.pathname.replace(/\/$/, '') || '/');
  }, []);

  const isActive = (path) => currentPath === path;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-ink text-white'
                  : 'text-ink-soft hover:bg-surface hover:text-ink'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="grid h-10 w-10 place-items-center rounded-xl text-ink-soft transition hover:bg-surface sm:hidden"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Ouvrir le menu</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {isOpen
              ? <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      <div id="mobile-menu" className={`border-t border-line sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-1 px-4 py-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-4 py-2.5 text-base font-medium ${
                isActive(link.href) ? 'bg-ink text-white' : 'text-ink-soft hover:bg-surface'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Nav;
