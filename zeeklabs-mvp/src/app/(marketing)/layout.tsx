import { ThemeProvider } from "@/components/providers/theme-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ThemeProvider>
  );
}
