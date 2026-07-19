const validateName = (name: string) => {
  if (!name || name.trim() === "") {
    throw new Error("Tên dịch vụ không được để trống.");
  }
  if (name.length > 50) {
    throw new Error("Tên dịch vụ không được vượt quá 50 ký tự.");
  }
};

const validateDescription = (description: string) => {
  if (!description || description.trim() === "") {
    throw new Error("Mô tả dịch vụ không được để trống.");
  }
  if (description.length > 150) {
    throw new Error("Mô tả dịch vụ không được vượt quá 150 ký tự.");
  }
};

export const validateCreateServiceInput = (payload: { name: string; description: string }) => {
  validateName(payload.name);
  validateDescription(payload.description);
};

export const validateUpdateServiceInput = (payload: { name?: string; description?: string }) => {
  if (payload.name !== undefined) {
    validateName(payload.name);
  }
  if (payload.description !== undefined) {
    validateDescription(payload.description);
  }
};

