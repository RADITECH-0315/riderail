// app/admin/page.jsx
export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p className="text-gray-500">Welcome to RVM Rideway Admin Panel 🚖</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border">📊 Metrics (coming soon)</div>
        <div className="p-4 rounded-2xl border">📅 Recent Bookings</div>
        <div className="p-4 rounded-2xl border">💳 Payments Overview</div>
      </div>
    </div>
  );
}
