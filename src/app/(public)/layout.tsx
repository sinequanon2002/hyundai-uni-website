import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}
