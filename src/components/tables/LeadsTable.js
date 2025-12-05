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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = all
  const updateRowData = (updatedLead) => {
    setLeads(prev =>
      prev.map(lead =>
        lead._id === updatedLead._id ? updatedLead : lead
      )
    );
  };

  //search
 const fetchLeads = async () => {
  setLoading(true);

  try {
    const res = await fetch(`/api/all-leads?page=${page}&limit=${limit}&search=${search}`);
    const data = await res.json();

    if (data.success) {
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

// Call search immediately or only when pressing button
const handleSearch = () => {
  setPage(1); 
  fetchLeads();
};
  const updateRowStatus = (index, newStatus) => {
    setLeads((prev) => {
      const updated = [...prev];
      // make sure we don't mutate directly
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

const StatusToggle = ({ lead, index }) => {

  const toggleStatus = async () => {
    const newStatus = lead.status === "pending" ? "completed" : "pending";

    await fetch(`/api/update-status/${lead._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    updateRowStatus(index, newStatus);
  };

  return (
    <span
      onClick={toggleStatus}
      className={`
        inline-flex items-center justify-center px-3 py-1 text-[11px] font-medium cursor-pointer rounded-full border transition
        ${
          lead.status === "completed"
            ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:border-green-400 dark:bg-green-700 dark:text-white dark:border-green-600 dark:hover:bg-green-600"
            : "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400 dark:bg-yellow-600 dark:text-white dark:border-yellow-500 dark:hover:bg-yellow-500"
        }
      `}
    >
      {lead.status === "completed" ? "Completed" : "Pending"}
    </span>
  );
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
    <div className="space-y-2 ">
  <div className="flex items-center gap-2 w-full max-w-md">
  <input
    type="text"
    placeholder="Search by name, email, phone..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm dark:bg-gray-900 dark:text-gray-200"
  />

  <button
    onClick={handleSearch}
    className="px-4 py-2 bg-[#465fff] hover:bg-[#374bd1] text-white rounded-lg text-sm"
  >
     Search
  </button>
</div>
      {/* ---------- SCROLLABLE TABLE CONTAINER ---------- */}
      <div className="rounded-xl border border-gray-300 bg-white shadow-xl dark:bg-gray-900 dark:border-gray-700 overflow-hidden">

       
 

        <div className="max-h-[600px] overflow-y-auto custom-scrollbar"> {/* ✅ Scroll bar only table */}
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-[#465fff] dark:bg-[#374bd1] hover:bg-[#465fff] dark:hover:bg-[#374bd1] border-b border-gray-300 dark:border-gray-700">
                {["#","Location", "Capacity", "Admin Name", "Email", "Phone","Status", "Actions"].map((heading) => (
                  <TableCell
                    key={heading}
                    className="px-5 py-4 font-bold text-white text-xs uppercase tracking-wider whitespace-nowrap border-r border-blue-400/30 last:border-r-0"
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
                  className={`transition-colors duration-200 border-b border-gray-300 dark:border-gray-700 ${
                    loading ? "opacity-40" : "opacity-100"
                  } ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  } hover:bg-blue-50 dark:hover:bg-blue-900/10`}
                >
                  {loading ? (
                    <TableCell colSpan={8} className="animate-pulse px-5 py-3">
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </TableCell>
                  ) : (
                  <>
                   <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-center font-medium text-gray-600 dark:text-gray-400 text-xs">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {lead.locationName}
                  </TableCell>

                  <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                    {lead.capacity}
                  </TableCell>

                  <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {lead.adminName}
                  </TableCell>

                  <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                    {lead.adminEmail}
                  </TableCell>

                  <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">
                    {lead.adminPhone}
                  </TableCell>
                  
                  <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-center">
                    <StatusToggle lead={lead} index={index} />
                  </TableCell>

                  <TableCell className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">

                      {/* VIEW BUTTON */}
                      <div className="relative group">
                        <button
                          onClick={() => openModal(lead, "view")}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#27AE60]/30 bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60] hover:text-white transition-all dark:border-[#27AE60]/50 dark:bg-[#27AE60]/20 dark:hover:bg-[#27AE60]"
                        >
                          <Eye size={16} />
                        </button>
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-md">
                          View
                        </span>
                      </div>

                      {/* EDIT BUTTON */}
                      <div className="relative group">
                        <button
                          onClick={() => openModal(lead, "edit")}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E67E22]/30 bg-[#E67E22]/10 text-[#E67E22] hover:bg-[#E67E22] hover:text-white transition-all dark:border-[#E67E22]/50 dark:bg-[#E67E22]/20 dark:hover:bg-[#E67E22]"
                        >
                          <Pencil size={16} />
                        </button>
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-md">
                          Edit
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
{/* ---------- PAGINATION ---------- */}
<div className="flex items-center justify-center gap-2 py-4">

  {/* Prev Button */}
  <button
    onClick={prevPage}
    disabled={page === 1}
    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 font-medium border transition-all 
      ${
        page === 1
          ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-600"
          : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
  >
    <ChevronLeft size={16} /> Prev
  </button>

  {/* Page 1 */}
  <button
    onClick={() => setPage(1)}
    className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all 
      ${
        page === 1
          ? "bg-[#465fff] border-[#465fff] text-white shadow-md dark:bg-[#374bd1] dark:border-[#374bd1]"
          : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
  >
    1
  </button>

  {/* Page 2 */}
  {totalPages > 1 && (
    <button
      onClick={() => setPage(2)}
      className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all 
        ${
          page === 2
            ? "bg-[#465fff] border-[#465fff] text-white shadow-md dark:bg-[#374bd1] dark:border-[#374bd1]"
            : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
    >
      2
    </button>
  )}

  {/* Ellipsis if far away */}
  {page > 3 && (
    <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
  )}

  {/* Current Page Input */}
  <input
    type="number"
    placeholder={page}
    value={pageInput}
    onChange={(e) => setPageInput(e.target.value)}
    onKeyDown={handleJumpPage}
    className="w-16 text-center border border-gray-400 rounded-lg py-2 text-sm outline-none 
      focus:ring-2 focus:ring-[#465fff]/50 
      dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
  />

  {/* Ellipsis before last page */}
  {page < totalPages - 2 && (
    <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
  )}

  {/* Last Page */}
  {totalPages > 2 && (
    <button
      onClick={() => setPage(totalPages)}
      className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all 
        ${
          page === totalPages
            ? "bg-[#465fff] border-[#465fff] text-white shadow-md dark:bg-[#374bd1] dark:border-[#374bd1]"
            : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
    >
      {totalPages}
    </button>
  )}

  {/* Next Button */}
  <button
    onClick={nextPage}
    disabled={page === totalPages}
    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 font-medium border transition-all 
      ${
        page === totalPages
          ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-600"
          : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
  >
    Next <ChevronRight size={16} />
  </button>
</div>


      
      <LeadDetailsModal
  open={modalOpen}
  onClose={(shouldRefresh, updatedLead) => {
    setModalOpen(false);
    if (updatedLead) updateRowData(updatedLead); // ⬅️ update only that row
  }}
  data={selectedLead}
  mode={modalMode}
/>
    </div>
  );
}