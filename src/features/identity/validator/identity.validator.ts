import { checkIdentityExists } from "../repository/identity.repository";

export const validateIdentityExists = async (
  identityId: string
): Promise<boolean> => {
  if (!identityId) throw new Error("Identity ID là bắt buộc");
  return await checkIdentityExists(identityId);
};
