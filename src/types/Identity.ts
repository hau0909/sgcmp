export interface Identity {
  identity_id: string;
  user_id: string;
  issue_date: Date;
  issue_place: string;
  created_at: Date;
  updated_at: Date | null;
}
