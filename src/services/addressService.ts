import type { Address } from "../types/user";
import { apiRequest, toJsonBody } from "./apiClient";

type AddressRequest = Omit<Address, "createdAt">;

export const prepareAddressRequest = <T extends AddressRequest>(data: T): T => {
  const floor = data.floor?.trim();
  const apartmentNumber = data.apartmentNumber?.trim();
  const buildingCode = data.buildingCode?.trim();
  const fullAddress = data.buildingId
    ? `Căn hộ ${apartmentNumber || ""}, tầng ${floor || ""}, tòa ${buildingCode || data.buildingId}`
    : data.fullAddress.trim();

  return {
    ...data,
    fullAddress,
    floor,
    apartmentNumber,
  };
};

export const getAllAddresses = () =>
  apiRequest<Address[]>("/user-addresses", { requireAuth: true });

export const getAddressById = (id: string | number) =>
  apiRequest<Address>(`/user-addresses/${id}`, { requireAuth: true });

export const createAddress = (data: Omit<Address, "id" | "createdAt">) =>
  apiRequest<Address>("/user-addresses", {
    method: "POST",
    body: toJsonBody(prepareAddressRequest(data)),
    requireAuth: true,
  });

export const updateAddress = (id: string | number, data: Omit<Address, "createdAt">) =>
  apiRequest<Address>(`/user-addresses/${id}`, {
    method: "PUT",
    body: toJsonBody(prepareAddressRequest(data)),
    requireAuth: true,
  });

export const deleteAddress = (id: string | number) =>
  apiRequest<void>(`/user-addresses/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
