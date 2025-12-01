"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/authSlice";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Hide navbar on auth pages (login, signup, verify)
  const isAuthPage = pathname?.startsWith('/auth/');

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
    <header className="w-full bg-white border border-b shadow-sm">
      <nav className="max-w-8xl mx-auto px-6 py-2 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center space-x-3 p-1 sm:p-1 lg:p-1">

          {/* Play Icon/Logo Symbol */}
          <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg shadow-md">
            {/* Simple right-pointing triangle for the play symbol */}
            <svg
              className="w-5 h-5 text-white fill-current transform translate-x-[1px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M3 22v-20l18 10-18 10z" />
            </svg>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col leading-none">
            {/* Main Brand Name */}
            <span className="text-2xl font-extrabold text-teal-600">
              MeetingAI
            </span>
            {/* Tagline */}
            <span className="text-sm font-medium text-gray-500 mt-1">
              Intelligent Meeting Insights
            </span>
          </div>
        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-6">

          <Link
            href="/upload"
            className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-600 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            Upload
          </Link>


          <Link href="/dashboard"
            className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-600 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            Dashboard
          </Link>

          <Link href="/history"
            className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-600 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            History
          </Link>

          <Link href="/about"
            className="relative text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-teal-600 hover:text-teal-500 after:transition-all after:duration-300 hover:after:w-full"

          >
            About
          </Link>

          {/* Profile Icon - Always Visible */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition ${isAuthenticated
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
        </div>
      </nav>
    </header>
  );
}
