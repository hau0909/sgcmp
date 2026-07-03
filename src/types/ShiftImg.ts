import { ShiftImgType } from "./Enum";

export interface Shift_Img {
    shift_img_id: string;
    assignment_id: string;

    image_url: string;
    image_path: string | null;
    image_type: ShiftImgType;

    note: string | null;

    created_at: string;
    updated_at: string;
}