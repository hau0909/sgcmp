export type GuardStatus = "available" | "working" | "leave";

export type Guard = {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  identityNumber: string;
  address: string;
  position: string;
  experience: string;
  height: string;
  weight: string;
  skills: string[];
  status: GuardStatus;
  username: string;
  mobileStatus: "activated" | "not-activated";
  avatarUrl: string;
};

export const guards: Guard[] = [
  {
    id: "1",
    code: "BV-001",
    fullName: "Nguyễn Văn Hùng",
    phone: "0901234567",
    email: "hung.nv@sgcmp.com",
    gender: "Nam",
    dateOfBirth: "12/05/1990",
    identityNumber: "012345678901",
    address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    position: "Bảo vệ nội bộ",
    experience: "5 năm",
    height: "175 cm",
    weight: "75 kg",
    skills: ["Võ thuật cơ bản", "PCCC & CHCN", "Sơ cấp cứu"],
    status: "available",
    username: "0901234567",
    mobileStatus: "activated",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "2",
    code: "BV-002",
    fullName: "Trần Đình Trung",
    phone: "0918765432",
    email: "trung.td@sgcmp.com",
    gender: "Nam",
    dateOfBirth: "20/08/1992",
    identityNumber: "079234567890",
    address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
    position: "Bảo vệ ca đêm",
    experience: "3 năm",
    height: "170 cm",
    weight: "70 kg",
    skills: ["Lái xe", "Giám sát camera"],
    status: "working",
    username: "0918765432",
    mobileStatus: "activated",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "3",
    code: "BV-003",
    fullName: "Lê Hoàng Nam",
    phone: "0933445566",
    email: "nam.lh@sgcmp.com",
    gender: "Nam",
    dateOfBirth: "15/03/1995",
    identityNumber: "031456789012",
    address: "88 Trần Hưng Đạo, Quận 5, TP.HCM",
    position: "Bảo vệ sự kiện",
    experience: "2 năm",
    height: "172 cm",
    weight: "72 kg",
    skills: ["Sơ cấp cứu"],
    status: "leave",
    username: "0933445566",
    mobileStatus: "not-activated",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
  },
];
