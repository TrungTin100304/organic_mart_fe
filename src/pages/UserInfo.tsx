import React from 'react';
import { ProfileCard } from '@/components/ProfileCard';
import { useUser } from '@/hooks/useUser';

const UserInfoPage: React.FC = () => {
  const { user, isLoading, error } = useUser();

  if (isLoading) return <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">Loading user...</div>;
  if (error) return <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-red-600">{error}</div>;
  if (!user) return <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">No user found.</div>;

  return (
    <main className="pt-24 pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-3 space-y-2">
          <h2 className="font-headline-md text-headline-md mb-6 px-4">My Account</h2>
          <nav className="space-y-1">
            <a className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg transition-all active:scale-95" href="#">
              <span className="material-symbols-outlined" data-icon="person" data-weight="fill" style={{ fontVariationSettings: `"FILL" 1` }}>person</span>
              Profile Info
            </a>
            <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg transition-all" href="#">Order History</a>
            <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg transition-all" href="#">Addresses</a>
            <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg transition-all" href="#">Settings</a>
          </nav>
        </aside>

        <div className="md:col-span-9 space-y-12">
          <ProfileCard user={user} />

          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-primary">Address Book</h3>
              <button className="text-primary font-bold font-label-lg text-label-lg hover:underline transition-all">Add New Address</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr) => (
                  <div key={addr.id || addr.street} className="p-5 border-2 border-primary bg-surface-container-low rounded-xl relative">
                    {addr.isPrimary && <span className="absolute top-4 right-4 bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Primary</span>}
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary" data-icon="home">home</span>
                      <div>
                        <p className="font-bold font-body-lg text-body-lg mb-1">{addr.label ?? 'Address'}</p>
                        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{addr.street}<br />{addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}<br />{addr.country}</p>
                        <div className="mt-4 flex gap-4">
                          <button className="text-primary font-bold text-label-lg">Edit</button>
                          <button className="text-on-surface-variant font-bold text-label-lg">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 border border-outline-variant hover:border-primary transition-colors rounded-xl flex items-center justify-center border-dashed cursor-pointer">
                  <div className="text-center space-y-2">
                    <span className="material-symbols-outlined text-outline" data-icon="add_location">add_location</span>
                    <p className="text-outline font-label-lg">Add Alternative Address</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-primary">Recent Orders</h3>
              <button className="text-primary font-bold font-label-lg text-label-lg hover:underline transition-all">View All Orders</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant">
                  <tr>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Order ID</th>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Date</th>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Status</th>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {user.recentOrders && user.recentOrders.length > 0 ? (
                    user.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                        <td className="py-4 font-body-md text-body-md font-bold text-primary">{o.id}</td>
                        <td className="py-4 font-body-md text-body-md">{new Date(o.date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${o.status === 'Out for Delivery' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'} text-[12px] font-bold`}>
                            {o.status === 'Out for Delivery' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 font-price-display text-price-display text-right">${o.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-4" colSpan={4}>No orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default UserInfoPage;

