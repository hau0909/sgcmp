export interface BankAccount {
  id: string;
  bank_code: string;       // vietqr id: "mbbank", "vcb", "acb", ...
  bank_name: string;       // "Ngân hàng TMCP Quân đội (MBBank)"
  account_number: string;  // "0852933924"
  account_name: string;    // "NGUYEN DINH HAU"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
