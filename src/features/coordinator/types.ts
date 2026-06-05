import { Coordinator } from "@/types/Coordinator";
import { Profile } from "@/types/Profile";

export interface CoordinatorWithUser extends Coordinator {
  profiles: Profile;
}
