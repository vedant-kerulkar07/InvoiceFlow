import { useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { logoutUser } from "../../services/auth.service";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/invoices", label: "Invoices" },
];

const Topbar = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logoutUser();

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-40 border-b border-[#E8E6F2] bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="rounded text-xl font-bold tracking-tight text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            InvoiceFlow
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex h-16 items-center text-sm font-medium transition-colors focus:outline-none focus-visible:text-violet-700 ${
                    isActive
                      ? "text-violet-700"
                      : "text-[#6B6785] hover:text-[#2B2640]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="topbar-underline"
                        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border border-[#E8E6F2] bg-white px-4 py-2 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#2B2640] transition-colors hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-[#E8E6F2] bg-white md:hidden"
            >
              <nav className="space-y-1 px-4 py-3 sm:px-6">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-[#6B6785] hover:bg-[#F7F6FB] hover:text-[#2B2640]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mt-2 w-full rounded-lg border border-[#E8E6F2] bg-white px-4 py-2.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
};

export default Topbar;