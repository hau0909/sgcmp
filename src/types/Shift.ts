export interface Shifts {
  shift_id: string;
  contract_id: string | null;
  shift_name: string | null;
  start_time: string;
  end_time: string;
  required_guards: number;
  location: string | null;
  created_at: string;
  updated_at: string;
};