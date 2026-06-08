export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  fullName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Payload từ frontend gửi lên API register.
 * Frontend đang dùng camelCase.
 */
export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Input cho service.
 * Service cũng nhận camelCase từ controller.
 */
export type RegisterInputService = {
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber: string;
  fullName: string;
  isCoordinator?: boolean;
  tempPass?: string;
  tempPasswordExpiresAt?: string;
};

export type LoginInputService = {
  email: string;
  password: string;
};

/**
 * Params truyền xuống repository.
 * Repository dùng snake_case để map đúng với Supabase metadata/database.
 */
export type RegisterParams = {
  email: string;
  password: string;
  phone_number: string;
  full_name: string;
  isCoordinator?: boolean;
  tempPass?: string;
  tempPasswordExpiresAt?: string;
};

export type LoginParams = {
  email: string;
  password: string;
};
