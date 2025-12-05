"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // Not logged in → redirect
    if (!user) {
      router.replace("/signin");
      return;
    }

    // Logged in but NOT admin → show message
    if (user.role !== "admin") {
      setNotAllowed(true);
      setAuthChecked(true);
      return;
    }

    // Admin → allow
    setAllowed(true);
    setAuthChecked(true);
  }, []); // runs once

  // Prevent flash before auth decision
  if (!authChecked) return null;

  // ❌ Not admin view
  if (notAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="text-center p-6 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-w-sm">
          <p className="text-lg font-semibold text-red-600">Access Denied</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You do not have permission to view this page.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ Admin dashboard
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
