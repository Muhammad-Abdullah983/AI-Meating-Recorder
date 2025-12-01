import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/footer";
import ReduxProvider from "@/providers/ReduxProvider";
import AuthInitializer from "@/providers/AuthInitializer";
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
