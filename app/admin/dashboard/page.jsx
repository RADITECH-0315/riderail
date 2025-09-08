"use client";

import useSWR from "swr";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/analytics", fetcher);

  if (isLoading) return <p>Loading...</p>;

  const dailyData = Object.entries(data?.daily || {}).map(([day, count]) => ({
    day,
    count,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">📊 Admin Dashboard</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-white shadow">
          <p className="text-gray-500">Total Revenue (This Month)</p>
          <p className="text-2xl font-bold">₹{data?.totalRevenue || 0}</p>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow">
          <p className="text-gray-500">Completed Rides (This Month)</p>
          <p className="text-2xl font-bold">{data?.totalRides || 0}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 rounded-xl border bg-white shadow">
        <p className="mb-2 font-medium">Rides per Day</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
