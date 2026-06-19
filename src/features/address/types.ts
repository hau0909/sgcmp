export interface City {
  city_id: number;
  city_name: string;
}

export interface Ward {
  ward_id: number;
  ward_name: string;
  city_id: number;
}

export interface CompanyAddress {
  city_id: number;
  ward_id: number;
  street: string;
}
