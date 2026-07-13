import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BrandProvider } from "@/contexts/brand-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider>
      <div className="flex h-screen overflow-hidden bg-[#FAFAFB]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header with brand selector */}
          <Header />

          {/* Main content with off-white background */}
          <main className="flex-1 overflow-y-auto bg-[#FAFAFB]">
            {children}
          </main>
        </div>
      </div>
    </BrandProvider>
  );
}
