import type { User } from '@/types/user';

const API_URL = 'http://localhost:8080/api/v1';

// Try to fetch the current user from the backend. If the request fails (dev mode),
// fall back to a lightweight mock so the UI remains usable.
export const getCurrentUser = async (): Promise<User> => {
  try {
    const res = await fetch(`${API_URL}/user/me`, {
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await res.json();
    return data as User;
  } catch (e) {
    // Fallback mock user for local development
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: 'local-1',
            fullName: 'Julianne Smith',
            email: 'julianne.s@organicmart.com',
            phone: '+1 (555) 012-3456',
            avatarUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCqNIrKjh2aqxLa6Eako4PXR3e-StDX0h0NDqmfC3NjakrIioGGmvTba_MdsQ-UpSdIOTSuC8xiUnwyRhWyoGaz2rBKpok_rAr8iB6TSNBiz-rDwPOUh6clWso-l6IiCnqSHBdSdBs1LsggVmSwJb4zD1_yu-0BS1cr2RsUs60UXR6931P-BPY5vdY-eMORmz-QP-xnowOl-imXV5qpMdteEc3QRFuzrChFpGYpoTwIo6cTTuzxam5CaeS71FYsQdnOBU_D7LSvlKE',
            status: 'Premium Member',
            addresses: [
              {
                id: 'addr-1',
                label: 'Home Office',
                street: '123 Greenway Drive, Apt 4B',
                city: 'Sustainable Heights',
                state: 'CA',
                postalCode: '90210',
                country: 'United States',
                isPrimary: true,
              },
            ],
            recentOrders: [
              { id: '#OM-92834', date: '2023-10-24', status: 'Out for Delivery', total: 84.5 },
              { id: '#OM-91522', date: '2023-10-18', status: 'Delivered', total: 122.1 },
            ],
          }),
        250
      )
    );
  }
};

