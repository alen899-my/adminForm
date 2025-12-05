"use client";

import Image from "next/image";
import { X, Download, Eye as ViewIcon, Pencil, FileText } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function LeadDetailsModal({ open, onClose, data, mode }) {
  const modalRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
  // Preview helper for local file blob
  const previewLocalFile = (file) => (file ? URL.createObjectURL(file) : null);

  // Sync values on open
useEffect(() => {
  if (open) {
    setForm(data);              // keep status inside form
    setEditMode(mode === "edit");
  }
}, [open, data, mode]);


  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (previewSrc) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, previewSrc]);

  // ESC close
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (e.key === "Escape") {
        if (previewSrc) setPreviewSrc(null);
        else onClose(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, previewSrc]);

  if (!open || !data) return null;

  // Attachments reference
  const files = { companyLogo: null, clientLogo: null, vatCertificate: null, tradeLicense: null };
  data.attachments?.forEach((file) => {
    if (!files[file.fieldname]) files[file.fieldname] = file;
  });

  const formatFileId = (id) => String(id).replace(/ObjectId\("(.+)"\)/, "$1");

  const StatusToggle = ({ lead, index }) => {

    const toggleStatus = async () => {
      const newStatus = lead.status === "pending" ? "completed" : "pending";

      // 🔥 Call new API
      await fetch(`/api/update-status/${lead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // 🔥 Update UI
      updateRowStatus(index, newStatus);
    };

    return (
      <button
        onClick={toggleStatus}
        className={`px-3 py-1 rounded-md text-xs font-semibold transition border shadow-sm
          ${
            lead.status === "completed"
              ? "bg-green-600 text-white hover:bg-green-700 border-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          }`}
      >
        {lead.status === "completed" ? "Completed" : "Pending"}
      </button>
    );
  };

  // ---- SAVE ----
  const handleSave = async () => {
    const fd = new FormData();

    Object.entries(form).forEach(([key, val]) => {
  if (
    typeof val !== "object" &&
    key !== "attachments" &&
    key !== "_id" &&
    key !== "__v"

   
  ) {
    fd.append(key, val);
  }
});

    ["companyLogo", "clientLogo", "vatCertificate", "tradeLicense"].forEach((field) => {
      if (form[field] instanceof File) {
        fd.append(field, form[field]);
      }
    });

    const res = await fetch(`/api/all-leads/${form._id}`, {
      method: "PUT",
      body: fd,
    });

    const result = await res.json();
    if (result.success) {
      setToast({ show: true, message: "Updated Successfully!", type: "success" });

      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
        setEditMode(false);
        onClose(true);
      }, 2000);
    } else {
      setToast({ show: true, message: result.message || "Update failed", type: "error" });

      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
    }

  };

  return (
    <>
      {/* ----------- MAIN MODAL ----------- */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[99] p-4 transition-all duration-300">
      
        <div
          ref={modalRef}
          className="w-full max-w-6xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        >
          {toast.show && (
            <div
              className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 z-[200] ${
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* HEADER */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-300 dark:border-gray-700 px-5 py-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                {editMode ? "Edit Lead Information" : "Lead Details"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage and view client details below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {mode === "edit" && (
                !editMode ? (
                  <button 
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-normal rounded-md hover:bg-blue-700 transition-colors shadow-sm" 
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button 
                      className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-normal rounded-md hover:bg-emerald-700 transition-colors shadow-sm" 
                      onClick={handleSave}
                    >
                      Save
                    </button>

                    <button
                      className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-normal rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setForm(data);
                        setEditMode(false);
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )
              )}

              <button 
                onClick={() => onClose(false)} 
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ----------- CONTENT GRID ----------- */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* STATUS DROPDOWN (Only visible during edit mode) */}
                <div className="group flex flex-col p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/40 hover:border-gray-400 dark:hover:border-gray-500 transition-all">
                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Status
                </label>

                {editMode ? (
                    <select
                    value={form.status || "pending"}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full p-2 text-[15px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-normal"
                    >
                    <option value="pending">Pending</option>
                    
                    <option value="completed">Completed</option>
                    </select>
                ) : (
                    <span
                    className={`
                        inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full w-fit
                        ${
                        data.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                            : data.status === "ongoing"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white"
                        }
                    `}
                    >
                    {data.status}
                    </span>
                )}
                </div>

              {/* TEXT FIELDS */}
              {Object.entries(data).map(([key]) => {
  if (
    key === "_id" ||
    key === "__v" ||
     key === "status" ||
    typeof data[key] === "object"
  )
    return null;
                return (
                  <div key={key} className="group flex flex-col p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/40 hover:border-gray-400 dark:hover:border-gray-500 transition-all">
                    <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>

                    {editMode ? (
                      <input
                        type="text"
                        className="w-full p-2 text-[15px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-normal"
                        value={form[key] || ""}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      />
                    ) : (
                      <p className="text-[15px] font-normal text-gray-800 dark:text-gray-100 break-words leading-snug">
                        {form[key] || <span className="text-gray-400 italic font-light">Not provided</span>}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* ---- IMAGE FIELDS ---- */}
              {["companyLogo", "clientLogo"].map((field) => {
                const stored = files[field];
                const storedId = stored ? formatFileId(stored.fileId) : null;
                const newFile = form[field] instanceof File ? form[field] : null;
                const previewURL = newFile ? previewLocalFile(newFile) : storedId ? `/api/all-leads/files/${storedId}` : null;

                return (
                  <div key={field} className="flex flex-col p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm text-center items-center justify-between">
                    <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium w-full text-left mb-2">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>

                    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[120px] bg-gray-50 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600 mb-2 overflow-hidden">
                      {previewURL ? (
                        <div className="relative group w-full h-full flex items-center justify-center p-2">
                          <Image
                            src={previewURL}
                            width={120}
                            height={120}
                            alt="Preview"
                            className="rounded-sm object-contain max-h-[100px] cursor-zoom-in transition-transform hover:scale-105"
                            onClick={() => setPreviewSrc(previewURL)}
                          />
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs flex flex-col items-center gap-1 font-normal">
                          <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">?</span>
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full">
                      {storedId && !newFile && (
                        <a 
                          href={`/api/all-leads/files/${storedId}`} 
                          download 
                          className="flex-1 flex items-center justify-center gap-2 p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-xs font-normal text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                          <Download size={14} /> Download
                        </a>
                      )}

                      {editMode && (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded text-xs font-normal text-blue-600 dark:text-blue-400 transition-colors border border-blue-200 dark:border-blue-800"
                          onClick={() => document.getElementById(`file-${field}`).click()}
                        >
                          <Pencil size={14} /> {previewURL ? "Change" : "Upload"}
                        </button>
                      )}

                      <input
                        id={`file-${field}`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, [field]: e.target.files[0] })}
                      />
                    </div>
                  </div>
                );
              })}

              {/* ---- PDF FIELDS ---- */}
              {["vatCertificate", "tradeLicense"].map((field) => {
                const stored = files[field];
                const storedId = stored ? formatFileId(stored.fileId) : null;
                const newFile = form[field] instanceof File ? form[field] : null;
                const fileName = newFile ? newFile.name : stored?.filename;

                return (
                  <div key={field} className="flex flex-col p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm justify-between">
                    <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded mb-2">
                      <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded text-red-500 border border-red-100 dark:border-red-900/30">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                         <p className="text-[13px] font-normal text-gray-700 dark:text-gray-300 truncate w-32 sm:w-40">
                            {fileName || "No Document"}
                         </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {storedId && !newFile && (
                        <a 
                            href={`/api/all-leads/files/${storedId}`} 
                            download 
                            className="flex-1 p-1.5 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-xs font-normal transition-colors border border-gray-200 dark:border-gray-700"
                        >
                          <Download size={14} /> Download
                        </a>
                      )}

                      {editMode && (
                        <>
                          <button
                            className="flex-1 p-1.5 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded text-xs font-normal text-blue-600 dark:text-blue-400 transition-colors border border-blue-200 dark:border-blue-800"
                            onClick={() => document.getElementById(`file-${field}`).click()}
                          >
                            <Pencil size={14} /> Upload
                          </button>

                          <input
                            id={`file-${field}`}
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) => setForm({ ...form, [field]: e.target.files[0] })}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* -------- IMAGE PREVIEW POPUP -------- */}
      {previewSrc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] animate-in fade-in duration-200" onClick={() => setPreviewSrc(null)}>
          <div className="relative p-2" onClick={(e) => e.stopPropagation()}>
            <Image 
                src={previewSrc} 
                width={600} 
                height={600} 
                alt="Preview" 
                className="rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] object-contain bg-white dark:bg-gray-900" 
            />
            <button 
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full shadow-lg transition-transform hover:scale-110" 
                onClick={() => setPreviewSrc(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      
    </>
  );
}