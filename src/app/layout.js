import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/footer";
import ReduxProvider from "@/providers/ReduxProvider";
import AuthInitializer from "@/providers/AuthInitializer";
import { Toaster } from "react-hot-toast";
import "./globals.css"; // your global styles

// import { SupabaseProvider } from "@/lib/SupabaseProvider";

export const metadata = {
  title: "AI Meeting Assistant",
  description: "Upload meetings, get summaries, and ask questions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthInitializer>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#363636',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#0d9488',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />

              <main className="flex-1 mt-0">
                {children}
              </main>

              <Footer />
            </div>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
