"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";

export default function RecentOrders() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/analytics/leads");
        const { success, recentLeads } = await res.json();
        if (success) setLeads(recentLeads);
      } catch (error) {
        console.error("Error fetching recent leads", error);
      }
    }

    loadLeads();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Leads
          </h3>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Lead Name
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Location
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Created At
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {leads.map((lead, index) => (
              <TableRow key={index}>
                <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {lead.adminName || "No Name"}
                  <p className="text-gray-400 text-xs">{lead.adminEmail}</p>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {lead.locationName}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      lead.status === "completed"
                        ? "success"
                        : lead.status === "pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {lead.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}

            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-5 text-center text-gray-400">
                  No recent leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
