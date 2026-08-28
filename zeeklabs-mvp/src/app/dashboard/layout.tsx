import { Header } from "@/components/layout/header";
import { BrandProvider } from "@/contexts/brand-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFB]">
        {/* Header with logo, brand selector, and settings */}
        <Header />

        {/* Main content with off-white background */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAFB]">
          {children}
        </main>
      </div>
    </BrandProvider>
  );
}
