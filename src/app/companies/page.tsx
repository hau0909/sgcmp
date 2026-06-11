import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SearchCompanies } from "@/features/company";

export const metadata = {
  title: "SGCMP - Tìm Bảo Vệ",
  description: "Tìm kiếm và thuê công ty dịch vụ bảo vệ uy tín, chuyên nghiệp hàng đầu.",
};

export default function CompaniesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col bg-surface min-h-screen">
        <SearchCompanies />
      </main>
      <Footer />
    </>
  );
}
