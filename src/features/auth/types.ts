export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  fullName: string;
};

export type RegisterParams = {
  email: string;
  password: string;
  phoneNumber?: string;
  fullName?: string;
  isCoordinator?: boolean;
  tempPass?: string;
  tempPasswordExpiresAt?: string;
};

export type RegisterInputService = {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
};
