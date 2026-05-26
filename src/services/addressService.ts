import type { UserAddress } from '../types/address';

const API_URL = 'http://localhost:8080/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getUserAddresses = async (): Promise<UserAddress[]> => {
  const response = await fetch(`${API_URL}/user-addresses`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch addresses');
  return response.json();
};

export const createUserAddress = async (address: Omit<UserAddress, 'id'>): Promise<UserAddress> => {
  const response = await fetch(`${API_URL}/user-addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(address),
  });
  if (!response.ok) throw new Error('Failed to create address');
  return response.json();
};
