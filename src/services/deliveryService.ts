import { apiRequest } from './apiClient';

export type DeliveryMethod = 'STANDARD' | 'EXPRESS' | 'SCHEDULED';

export interface DeliveryFee {
  deliveryMethod: DeliveryMethod;
  shippingFee: number;
  freeShippingThreshold?: number | null;
  estimatedMinutes: number;
  estimatedTime: string;
}

export interface AvailableSlot {
  slotId: number;
  name: string;
  startTime: string;
  endTime: string;
  remainingCapacity: number;
  available: boolean;
  unavailableReason?: string;
}

export const getDeliveryFees = () =>
  apiRequest<DeliveryFee[]>('/delivery/fees', { requireAuth: true });

export const getAvailableSlots = (date: string) =>
  apiRequest<AvailableSlot[]>(`/delivery-slots/available?date=${date}`, { requireAuth: true });
