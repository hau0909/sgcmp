import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface-container text-on-surface-variant font-sans py-12 border-t border-outline-variant/30 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="font-sans text-[20px] font-bold text-primary flex items-center gap-2">
            <Image
              src={"/logo.png"}
              width={30}
              height={30}
              alt="logo image"
              className="drop-shadow-sm/20 shadow-secondary"
            />
            SGCMP
          </div>
          <p className="text-[13px] text-outline">
            &copy; {new Date().getFullYear()} SGCMP. Bảo lưu mọi quyền.
          </p>
        </div>

        {/* Footer Links */}
        <nav className="flex flex-wrap justify-center gap-8">
          <a
            className="text-[13px] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            href="#"
          >
            Điều khoản dịch vụ
          </a>
          <a
            className="text-[13px] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            href="#"
          >
            Chính sách bảo mật
          </a>
          <a
            className="text-[13px] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            href="#"
          >
            Liên hệ
          </a>
          <a
            className="text-[13px] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            href="#"
          >
            Hỗ trợ
          </a>
        </nav>
      </div>
    </footer>
  );
}
