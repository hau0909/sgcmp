import { supabase } from "@/lib/supabase";
import { RegistrationWithCompany, RegistrationDetail } from "../types";

export const checkRegistrationDuplicatesRepo = async (
  userId: string,
  payload: {
    phoneNumber: string;
    identityId: string;
    businessLicenseNo: string;
  }
) => {
  if (payload.phoneNumber) {
    const { data: dupPhone } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone_number", payload.phoneNumber)
      .neq("user_id", userId)
      .maybeSingle();
    if (dupPhone) throw new Error("ERR_DUP_PHONE");
  }

  if (payload.identityId) {
    const { data: dupIdentity } = await supabase
      .from("identities")
      .select("user_id")
      .eq("identity_id", payload.identityId)
      .neq("user_id", userId)
      .maybeSingle();
    if (dupIdentity) throw new Error("ERR_DUP_IDENTITY");
  }



  if (payload.businessLicenseNo) {
    const { data: dupLicense } = await supabase
      .from("companies")
      .select("company_id")
      .eq("business_license_no", payload.businessLicenseNo)
      .neq("owner_id", userId)
      .maybeSingle();
    if (dupLicense) throw new Error("ERR_DUP_LICENSE");
  }
};

export const getRegistrations = async (): Promise<RegistrationWithCompany[]> => {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, companies(company_name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as RegistrationWithCompany[]) || [];
};

export const getRegistrationDetail = async (id: string): Promise<RegistrationDetail | null> => {
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("*, companies(*)")
    .eq("registration_id", id)
    .maybeSingle();

  if (regError) {
    throw regError;
  }

  if (!regData) {
    return null;
  }

  const registration = regData as any;
  const company = registration.companies;

  let profiles = null;
  let identities = null;
  let companyImgs: any[] = [];

  if (company && company.owner_id) {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", company.owner_id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }
    profiles = profileData;

    // Fetch identity
    const { data: identityData, error: identityError } = await supabase
      .from("identities")
      .select("*")
      .eq("user_id", company.owner_id)
      .maybeSingle();

    if (identityError) {
      // Don't throw if not found, but throw on database error
      if (identityError.code !== "PGRST116") {
        throw identityError;
      }
    }
    identities = identityData;
  }

  if (company && company.company_id) {
    // Fetch company images
    const { data: imgsData, error: imgsError } = await supabase
      .from("company_imgs")
      .select("*")
      .eq("company_id", company.company_id);

    if (imgsError) {
      throw imgsError;
    }
    companyImgs = imgsData || [];
  }

  return {
    ...registration,
    companies: company
      ? {
          ...company,
          profiles,
          identities,
          companyImgs,
        }
      : null,
  } as RegistrationDetail;
};

export const updateRegistrationStatus = async (id: string, status: "approved" | "rejected", note?: string): Promise<void> => {
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("company_id")
    .eq("registration_id", id)
    .maybeSingle();

  if (regError) {
    throw regError;
  }

  if (!regData) {
    throw new Error("Không tìm thấy hồ sơ đăng ký");
  }

  const updatePayload: any = { status, updated_at: new Date().toISOString() };
  if (note !== undefined) {
    updatePayload.note = note;
  }

  const { error: updateRegError } = await supabase
    .from("registrations")
    .update(updatePayload)
    .eq("registration_id", id);

  if (updateRegError) {
    throw updateRegError;
  }

  if (regData.company_id) {
    const companyStatus = status === "approved" ? "active" : "rejected";
    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({ status: companyStatus })
      .eq("company_id", regData.company_id);

    if (updateCompanyError) {
      throw updateCompanyError;
    }

    // Promote the owner's profile role to 'company-admin' only when approved
    if (status === "approved") {
      const { data: companyData, error: fetchCompanyError } = await supabase
        .from("companies")
        .select("owner_id")
        .eq("company_id", regData.company_id)
        .maybeSingle();

      if (fetchCompanyError) {
        throw fetchCompanyError;
      }

      if (companyData?.owner_id) {
        const { error: updateRoleError } = await supabase
          .from("profiles")
          .update({ role: "company-admin" })
          .eq("user_id", companyData.owner_id);

        if (updateRoleError) {
          throw updateRoleError;
        }
      }
    }
  }
};

export const getRegistrationByOwnerId = async (userId: string): Promise<RegistrationDetail | null> => {
  // Tìm company của user này
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("company_id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  if (!companyData) {
    return null;
  }

  // Tìm registration theo company_id
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("*, companies(*)")
    .eq("company_id", companyData.company_id)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (regError) {
    throw regError;
  }

  if (!regData) {
    return null;
  }

  const registration = regData as any;
  const company = registration.companies;

  let profiles = null;
  let identities = null;
  let companyImgs: any[] = [];

  if (company && company.owner_id) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", company.owner_id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }
    profiles = profileData;

    const { data: identityData, error: identityError } = await supabase
      .from("identities")
      .select("*")
      .eq("user_id", company.owner_id)
      .maybeSingle();

    if (identityError && identityError.code !== "PGRST116") {
      throw identityError;
    }
    identities = identityData;
  }

  if (company && company.company_id) {
    const { data: imgsData, error: imgsError } = await supabase
      .from("company_imgs")
      .select("*")
      .eq("company_id", company.company_id);

    if (imgsError) {
      throw imgsError;
    }
    companyImgs = imgsData || [];
  }

  return {
    ...registration,
    companies: company
      ? {
          ...company,
          profiles,
          identities,
          companyImgs,
        }
      : null,
  } as RegistrationDetail;
};

export const createRegistrationFlow = async (payload: {
  userId: string;
  profile: {
    fullName: string;
    phoneNumber: string;
    avatarUrl: string | null;
  };
  identity: {
    identityId: string;
    issueDate: string;
    issuePlace: string;
    frontUrl: string;
    backUrl: string;
  };
  company: {
    companyId?: string | null;
    companyName: string;
    businessLicenseNo: string;
    licenseFileUrl: string | null;
    address: any;
    email: string;
    phone: string;
    description: string | null;
  };
  images: {
    imageUrl: string;
    imageType: "logo" | "banner" | "other";
  }[];
}): Promise<string> => {
  // Check if user already owns a company
  const { data: existingCompany, error: checkError } = await supabase
    .from("companies")
    .select("company_id")
    .eq("owner_id", payload.userId)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Kiểm tra hồ sơ đăng ký cũ thất bại: ${checkError.message}`);
  }

  if (existingCompany) {
    throw new Error("Tài khoản của bạn đã đăng ký doanh nghiệp hoặc đang có đơn đăng ký chờ duyệt.");
  }

  // 1. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: payload.profile.fullName,
      phone_number: payload.profile.phoneNumber,
      avatar_url: payload.profile.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", payload.userId);

  if (profileError) {
    throw new Error(`Cập nhật hồ sơ cá nhân thất bại: ${profileError.message}`);
  }

  // 2. Upsert Identity (CCCD details)
  const { error: identityError } = await supabase
    .from("identities")
    .upsert({
      user_id: payload.userId,
      identity_id: payload.identity.identityId,
      issue_date: payload.identity.issueDate,
      issue_place: payload.identity.issuePlace,
      front_url: payload.identity.frontUrl,
      back_url: payload.identity.backUrl,
      updated_at: new Date().toISOString(),
    });

  if (identityError) {
    throw new Error(`Lưu thông tin định danh CCCD thất bại: ${identityError.message}`);
  }

  // 3. Insert Company
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .insert({
      company_id: payload.company.companyId || undefined,
      owner_id: payload.userId,
      company_name: payload.company.companyName,
      business_license_no: payload.company.businessLicenseNo,
      license_file_url: payload.company.licenseFileUrl,
      address: payload.company.address,
      email: payload.company.email,
      phone: payload.company.phone,
      description: payload.company.description,
      status: "pending_register",
    })
    .select("company_id")
    .single();

  if (companyError) {
    throw new Error(`Đăng ký thông tin công ty thất bại: ${companyError.message}`);
  }

  const companyId = companyData.company_id;

  // 4. Insert Company Images (Logo, Banner, Gallery)
  if (payload.images && payload.images.length > 0) {
    const imageInserts = payload.images.map((img) => ({
      company_id: companyId,
      image_url: img.imageUrl,
      image_type: img.imageType,
    }));

    const { error: imagesError } = await supabase
      .from("company_imgs")
      .insert(imageInserts);

    if (imagesError) {
      throw new Error(`Lưu hình ảnh công ty thất bại: ${imagesError.message}`);
    }
  }

  // 5. Insert Registration Record (pending status)
  const registrationCode = `REG-${new Date().getFullYear()}-${Math.floor(
    100000 + Math.random() * 900000
  )}`;

  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .insert({
      registration_code: registrationCode,
      company_id: companyId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("registration_code")
    .single();

  if (regError) {
    throw new Error(`Tạo yêu cầu xét duyệt đăng ký thất bại: ${regError.message}`);
  }

  return regData.registration_code;
};

export const updateRegistrationFlow = async (
  userId: string,
  registrationId: string,
  payload: {
    profile: {
      fullName: string;
      phoneNumber: string;
      avatarUrl: string | null;
    };
    identity: {
      identityId: string;
      issueDate: string;
      issuePlace: string;
      frontUrl: string;
      backUrl: string;
    };
    company: {
      companyName: string;
      businessLicenseNo: string;
      licenseFileUrl: string | null;
      address: any;
      email: string;
      phone: string;
      description: string | null;
    };
    images: {
      imageUrl: string;
      imageType: "logo" | "banner" | "other";
    }[];
    companyId: string;
  }
): Promise<void> => {
  // 1. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: payload.profile.fullName,
      phone_number: payload.profile.phoneNumber,
      avatar_url: payload.profile.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (profileError) {
    throw new Error(`Cập nhật hồ sơ cá nhân thất bại: ${profileError.message}`);
  }

  // 2. Upsert Identity
  const { error: identityError } = await supabase
    .from("identities")
    .upsert({
      user_id: userId,
      identity_id: payload.identity.identityId,
      issue_date: payload.identity.issueDate,
      issue_place: payload.identity.issuePlace,
      front_url: payload.identity.frontUrl,
      back_url: payload.identity.backUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (identityError) {
    throw new Error(`Cập nhật thông tin CCCD thất bại: ${identityError.message}`);
  }

  // 3. Update Company (reset status to pending_register)
  const { error: companyError } = await supabase
    .from("companies")
    .update({
      company_name: payload.company.companyName,
      business_license_no: payload.company.businessLicenseNo,
      license_file_url: payload.company.licenseFileUrl,
      address: payload.company.address,
      email: payload.company.email,
      phone: payload.company.phone,
      description: payload.company.description,
      status: "pending_register",
    })
    .eq("company_id", payload.companyId);

  if (companyError) {
    throw new Error(`Cập nhật thông tin công ty thất bại: ${companyError.message}`);
  }

  // 4. Delete all old company images, then re-insert new ones
  const { error: deleteImgsError } = await supabase
    .from("company_imgs")
    .delete()
    .eq("company_id", payload.companyId);

  if (deleteImgsError) {
    throw new Error(`Xóa ảnh cũ thất bại: ${deleteImgsError.message}`);
  }

  if (payload.images && payload.images.length > 0) {
    const imageInserts = payload.images.map((img) => ({
      company_id: payload.companyId,
      image_url: img.imageUrl,
      image_type: img.imageType,
    }));

    const { error: imgsError } = await supabase
      .from("company_imgs")
      .insert(imageInserts);

    if (imgsError) {
      throw new Error(`Lưu ảnh mới thất bại: ${imgsError.message}`);
    }
  }

  // 5. Update Registration status to "resubmitted" and clear old rejection note
  const { error: regError } = await supabase
    .from("registrations")
    .update({
      status: "resubmitted",
      note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("registration_id", registrationId);

  if (regError) {
    throw new Error(`Cập nhật trạng thái hồ sơ thất bại: ${regError.message}`);
  }
};

