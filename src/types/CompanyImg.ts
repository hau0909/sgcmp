import { ImageType } from "./Enum";

export interface CompanyImg {
  image_id: string; // UUID
  company_id: string; // UUID
  image_url: string;
  image_type: ImageType;
  created_at: string; // TIMESTAMPTZ (ISO String)
}