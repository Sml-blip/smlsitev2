import HeaderOne from "@/components/headers/HeaderOne";
import Footer from "@/components/footers/Footer";
import ScrollToTop from "@/components/others/ScrollToTop";
import { Toaster } from "sonner";
import MobileSearch from "@/components/modals/MobileSearch";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <HeaderOne />
      <MobileSearch />
      {children}
      <Footer />
      <ScrollToTop />
      <Toaster position="top-right" duration={2000}/>
    </div>
  );
}
