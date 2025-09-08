// app/admin/layout.jsx
import Link from "next/link";

export const metadata = {
  title: "RVM Admin",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="px-6 py-3 border-b flex items-center gap-6">
        <h1 className="font-semibold">RVM Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/bookings">Bookings</Link>
          <Link href="/admin/payments">Payments</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
