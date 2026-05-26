export interface UserAddress {
  id?: number;
  label: string;
  customLabel?: string;
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

