import { GuardStatus } from "./Enum";

export interface Guard {
  guard_id: string;
  user_id: string;
  company_id: string;
  created_at: string;
  approval_status: GuardStatus;
  rejection_note: string | null;
  verified_at: string | null;
  verified_by: string | null;

  height_cm: number | null;
  weight_kg: number | null;

  health_certificate_path: string | null;
  skill_certificate_paths: string[];
  notable_skills: string[];
};