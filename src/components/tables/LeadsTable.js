"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import LeadDetailsModal from "../LeadDetailsModal";
export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
const [selectedLead, setSelectedLead] = useState(null);
const [modalMode, setModalMode] = useState("view");
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 50; // ✅ SHOW 50 ROWS
  const [totalPages, setTotalPages] = useState(1);

  // Page jump input
  const [pageInput, setPageInput] = useState("");

  const fetchLeads = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/all-leads?page=${page}&limit=${limit}`);
      const data = await res.json();

      if (data.success) {
        // smooth transition (only row content)
        setLeads([]);
        setTimeout(() => {
          setLeads(data.leads);
          setTotalPages(data.pagination.totalPages);
        }, 120);
      }
    } catch (err) {
      console.log("❌ Fetch error:", err);
    }

    setTimeout(() => setLoading(false), 120);
  };

const openModal = (lead, mode) => {
  setSelectedLead(lead);
  setModalMode(mode);
  setModalOpen(true);
};
  useEffect(() => {
    fetchLeads();
  }, [page]);

  const handleJumpPage = (e) => {
    if (e.key === "Enter") {
      let num = Number(pageInput);

      if (!num || num < 1) num = 1;
      if (num > totalPages) num = totalPages; // ✅ Jump to last page if too big

      setPage(num);
      setPageInput("");
    }
  };

  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);

  return (
    <div className="space-y-6">

      {/* ---------- SCROLLABLE TABLE CONTAINER ---------- */}
      <div className="rounded-lg border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700 overflow-hidden">

        {/* Scroll only table, not page */}
        <div className="max-h-[600px] overflow-y-auto"> {/* ✅ Scroll bar only table */}
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-[#465fff]">
                {["#","Location", "Capacity", "Admin Name", "Email", "Phone", "Actions"].map((heading) => (
                  <TableCell
                    key={heading}
                    className="px-5 py-3 font-bold text-white text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {(loading ? [...Array(limit)] : leads).map((lead, index) => (
                <TableRow
                  key={index}
                  className={`transition-all duration-300 ${
                    loading ? "opacity-40 translate-y-[2px]" : "opacity-100 translate-y-0"
                  } ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  } hover:bg-[#E8F0FE] dark:hover:bg-gray-700`}
                >
                  {loading ? (
                    <TableCell colSpan={6} className="animate-pulse px-5 py-3">
                      <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </TableCell>
                  ) : (
                  <>
                   <TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700 text-center ">
    {(page - 1) * limit + index + 1}
  </TableCell>
  <TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700">
    {lead.locationName}
  </TableCell>

  <TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700">
    {lead.capacity}
  </TableCell>

  <TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700">
    {lead.adminName}
  </TableCell>

  <TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700">
    {lead.adminEmail}
  </TableCell>

  <TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700">
    {lead.adminPhone}
  </TableCell>
<TableCell className="px-5 py-3 border border-gray-300 dark:border-gray-700">
  <div className="flex items-center justify-center gap-3">

    {/* VIEW BUTTON WITH TOOLTIP */}
    <div className="relative group">
      <button
        onClick={() => openModal(lead, "view")}
        className="flex items-center justify-center w-8 h-8 rounded-md border bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/40 hover:bg-[#27AE60]/20 transition-all"
      >
        <Eye size={16} />
      </button>

      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-black text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200">
        View Details
      </span>
    </div>

    {/* EDIT BUTTON WITH TOOLTIP */}
    <div className="relative group">
      <button
        onClick={() => openModal(lead, "edit")}
        className="flex items-center justify-center w-8 h-8 rounded-md border bg-[#E67E22]/10 text-[#E67E22] border-[#E67E22]/40 hover:bg-[#E67E22]/20 transition-all"
      >
        <Pencil size={16} />
      </button>

      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-black text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200">
        Edit Lead
      </span>
    </div>

  </div>
</TableCell>

                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className="flex items-center justify-center gap-3">

        <button
          onClick={prevPage}
          disabled={page === 1}
          className={`px-3 py-2 border rounded-md flex items-center gap-1 text-sm ${
            page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          <ChevronLeft size={18} /> Prev
        </button>

        {[...Array(totalPages)]
          .slice(Math.max(0, page - 3), page + 2)
          .map((_, i) => {
            const num = i + (page > 3 ? page - 2 : 1);
            if (num > totalPages) return null;

            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-9 h-9 rounded-md border text-sm transition ${
                  page === num ? "bg-[#465fff] text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {num}
              </button>
            );
          })}

        <input
          type="number"
          placeholder="Go"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={handleJumpPage}
          className="w-20 text-center border rounded-md py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />

        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className={`px-3 py-2 border rounded-md flex items-center gap-1 text-sm ${
            page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          Next <ChevronRight size={18} />
        </button>

      </div>
      <LeadDetailsModal
  open={modalOpen}
  onClose={(shouldRefresh) => {
    setModalOpen(false);
    if (shouldRefresh) fetchLeads();
  }}
  data={selectedLead}
  mode={modalMode}
/>

    </div>
  );
}
