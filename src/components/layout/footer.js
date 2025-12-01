"use client";

import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gray-900 text-gray-300">
            {/* Main Footer Content */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8 sm:py-16 sm:ml-11">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg shadow-md">
                                <svg
                                    className="w-5 h-5 text-white fill-current transform translate-x-px"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M3 22v-20l18 10-18 10z" />
                                </svg>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-lg font-extrabold text-teal-400">MeetingAI</span>
                                <span className="text-xs text-gray-500">Meeting Insights</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">
                            Transform your meetings into actionable insights with AI-powered analysis and summaries.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div className="col-span-1">
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/dashboard" className="text-sm hover:text-teal-400 transition">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/meetings/upload" className="text-sm hover:text-teal-400 transition">
                                    Upload Meetings
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="text-sm hover:text-teal-400 transition">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#pricing" className="text-sm hover:text-teal-400 transition">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="col-span-1">
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#docs" className="text-sm hover:text-teal-400 transition">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="#faq" className="text-sm hover:text-teal-400 transition">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="#blog" className="text-sm hover:text-teal-400 transition">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#support" className="text-sm hover:text-teal-400 transition">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="col-span-1">
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#about" className="text-sm hover:text-teal-400 transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#privacy" className="text-sm hover:text-teal-400 transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#terms" className="text-sm hover:text-teal-400 transition">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="#contact" className="text-sm hover:text-teal-400 transition">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800"></div>

            {/* Bottom Footer */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-sm text-gray-500">
                    © {currentYear} MeetingAI. All rights reserved.
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-teal-400 transition"
                        title="Twitter"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.006 3.749 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.273 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                    </a>

                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-teal-400 transition"
                        title="GitHub"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>

                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-teal-400 transition"
                        title="LinkedIn"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.006 1.42-.103.249-.129.597-.129.946v5.439h-3.554s.047-8.842 0-9.769h3.554v1.383c.43-.665 1.199-1.61 2.920-1.61 2.134 0 3.734 1.39 3.734 4.38v5.616zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.956.77-1.71 1.957-1.71 1.187 0 1.915.75 1.94 1.71 0 .951-.753 1.71-1.982 1.71zm1.58 11.597H3.635V9.683h3.282v10.769zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}
