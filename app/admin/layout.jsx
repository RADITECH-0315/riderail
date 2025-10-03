import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";  // fixed relative path
import { redirect } from "next/navigation";

export const metadata = { title: "RVM Admin" };

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="px-6 py-3 border-b flex items-center justify-between">
        <h1 className="font-bold text-lg">RVM Admin Panel</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/bookings">Bookings</Link>
          <Link href="/admin/payments">Payments</Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
