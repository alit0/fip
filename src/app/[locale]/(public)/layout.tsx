import TopBar from "@/components/layout/TopBar";
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50">
        <TopBar />
        <MainNav />
      </header>
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
