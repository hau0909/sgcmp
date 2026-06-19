import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegisterCompanyStepper from "@/features/registration/components/RegisterCompanyStepper";

export default function RegisterCompanyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mt-20 py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight font-headline">
              Đăng Ký Doanh Nghiệp Bảo Vệ
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 max-w-lg mx-auto leading-relaxed">
              Trở thành đối tác cung cấp dịch vụ bảo vệ trên nền tảng SGCMP để tiếp cận hàng ngàn khách hàng.
            </p>
          </div>
          <RegisterCompanyStepper />
        </div>
      </main>
      <Footer />
    </>
  );
}
