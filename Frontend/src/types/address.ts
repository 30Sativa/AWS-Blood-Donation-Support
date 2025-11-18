export interface Address {
  id?: number;
  line1: string;
  district?: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  normalizedAddress?: string;
  placeId?: string;
  confidenceScore?: number;
  latitude?: number;
  longitude?: number;
}

export interface AddressResponse {
  success: boolean;
  message: string | null;
  data: Address;
}

export interface CreateAddressRequest {
  line1: string;
  district?: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  normalizedAddress?: string;
  placeId?: string;
  confidenceScore?: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id?: number;
}

