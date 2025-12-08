"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/authSlice";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Hide navbar on auth pages (login, signup, verify)
  const isAuthPage = pathname?.startsWith('/auth/');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (isAuthPage) {
    return null;
  }

  async function handleLogout() {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  const userEmail = user?.email || "User";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userInitial = userName?.[0]?.toUpperCase() || "U";

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <nav className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo - Clickable */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-3 sm:pl-2 hover:cursor-pointer  transition-opacity"
          >
            {/* Play Icon/Logo Symbol */}
            <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg shadow-md">
              <svg
                className="w-5 h-5 text-white fill-current  transform translate-x-[1px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M3 22v-20l18 10-18 10z" />
              </svg>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col text-left leading-none">
              <span className="text-xl sm:text-2xl font-extrabold text-teal-600">
                MeetingAI
              </span>
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">
                Intelligent Meeting Insights
              </span>
            </div>
          </button>

          {/* Right Section - Menu Items and Profile */}
          <div className="flex items-center gap-6">
            {/* Desktop Menu - Only visible on md and above */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-300 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                Dashboard
              </Link>

              <Link
                href="/upload"
                className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-300 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                Upload
              </Link>


              <Link
                href="/history"
                className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-300 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                History
              </Link>

              <Link
                href="/about"
                className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-300 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                About
              </Link>
            </div>

            {/* Profile Icon - Desktop */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-10 h-10 rounded-full font-bold flex items-center cursor-pointer justify-center transition ${isAuthenticated
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                title={isAuthenticated ? userName : "Guest"}
              >
                {isAuthenticated ? userInitial : "?"}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-700">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-300"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-4 py-2 text-sm text-teal-600 hover:bg-gray-100 border-t border-gray-300 font-medium"
                        onClick={() => setShowDropdown(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle - Only visible below md */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden  rounded-lg hover:bg-gray-100 transition"
            >
              {showSidebar ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar - Only visible below md */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setShowSidebar(false)}
      >
        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10"></div>
      </div>

      <aside
        className={`fixed top-0 right-0 h-screen w-64 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ${showSidebar ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-1 border-b  border-gray-200 bg-teal-600">
          <div className="flex items-center pl-2 md:pt-0 pt-1 space-x-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <svg
                className="w-5 h-5 text-teal-600 fill-current transform translate-x-[1px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M3 22v-20l18 10-18 10z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">MeetingAI</span>
              <span className="text-xs text-teal-100">Meeting Insights</span>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 p-1 hover:bg-teal-700 rounded"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="p-4 space-y-2">
          <Link
            href="/upload"
            onClick={() => setShowSidebar(false)}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition"
          >
            Upload
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setShowSidebar(false)}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/history"
            onClick={() => setShowSidebar(false)}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition"
          >
            History
          </Link>
          <Link
            href="/about"
            onClick={() => setShowSidebar(false)}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition"
          >
            About
          </Link>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={() => setShowSidebar(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition"
              >
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </Link>
              <button
                onClick={() => {
                  setShowSidebar(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition border-t border-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setShowSidebar(false)}
                className="block w-full text-center px-4 py-2 text-gray-700 hover:bg-teal-50 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setShowSidebar(false)}
                className="block w-full text-center px-4 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
