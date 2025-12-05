"use client";

import Image from "next/image";
import { X, Download, Eye as ViewIcon, Pencil } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function LeadDetailsModal({ open, onClose, data, mode }) {
  const modalRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);

  // Preview helper for local file blob
  const previewLocalFile = (file) => (file ? URL.createObjectURL(file) : null);

  // Sync values on open
  useEffect(() => {
    if (open) {
      setForm(data);
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
      alert("Updated!");
      setEditMode(false);
      onClose(true);
    } else {
      alert(result.message || "Update failed");
    }
  };

  return (
    <>
      {/* ----------- MAIN MODAL ----------- */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99]">
        <div
          ref={modalRef}
          className="w-[90%] max-w-6xl bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg max-h-[90vh] overflow-y-auto p-6 shadow-lg"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white">
              {editMode ? "Edit Lead" : "Lead Details"}
            </h2>

            <div className="flex gap-2">
              {mode === "edit" && (
                !editMode ? (
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setEditMode(true)}>
                    Edit
                  </button>
                ) : (
                  <>
                    <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleSave}>
                      Save
                    </button>

                    <button
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
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

              <button onClick={() => onClose(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ----------- CONTENT GRID ----------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">

            {/* TEXT FIELDS */}
            {Object.entries(data).map(([key]) => {
              if (key === "_id" || key === "__v" || typeof data[key] === "object") return null;

              return (
                <div key={key} className="p-3 border rounded-md dark:border-gray-700">
                  <p className="text-[11px] uppercase text-gray-500 dark:text-gray-400 font-semibold">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>

                  {editMode ? (
                    <input
                      type="text"
                      className="w-full mt-2 p-2 border rounded dark:border-gray-700 dark:bg-gray-800"
                      value={form[key] || ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-sm dark:text-gray-200">{form[key] || "—"}</p>
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
                <div key={field} className="p-3 border rounded-md dark:border-gray-700 text-center">
                  <p className="text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-400">{field}</p>

                  {previewURL ? (
                    <Image
                      src={previewURL}
                      width={120}
                      height={120}
                      alt="Preview"
                      className="mt-3 rounded border object-cover mx-auto cursor-pointer hover:opacity-70 transition"
                      onClick={() => setPreviewSrc(previewURL)}
                    />
                  ) : (
                    <p className="mt-2 text-gray-400 dark:text-gray-600">No file</p>
                  )}

                  <div className="flex justify-center gap-2 mt-2">
                    {storedId && !newFile && (
                      <a href={`/api/all-leads/files/${storedId}`} download className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Download size={18} />
                      </a>
                    )}

                    {editMode && (
                      <button
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
                        onClick={() => document.getElementById(`file-${field}`).click()}
                      >
                        <Pencil size={18} />
                        Replace
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
                <div key={field} className="p-3 border rounded-md dark:border-gray-700">
                  <p className="text-[11px] uppercase text-gray-500 dark:text-gray-400 font-semibold">{field}</p>

                  <div className="flex items-center gap-3 mt-3">
                    {storedId && !newFile && (
                      <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => window.open(`/api/all-leads/files/${storedId}`, "_blank")}>
                        <ViewIcon size={18} />
                      </button>
                    )}

                    {storedId && !newFile && (
                      <a href={`/api/all-leads/files/${storedId}`} download className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Download size={18} />
                      </a>
                    )}

                    <span className="text-sm dark:text-gray-300">{fileName || "No File"}</span>
                  </div>

                  {editMode && (
                    <>
                      <button
                        className="mt-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
                        onClick={() => document.getElementById(`file-${field}`).click()}
                      >
                        <Pencil size={18} /> Replace
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
              );
            })}
          </div>
        </div>
      </div>

      {/* -------- IMAGE PREVIEW POPUP -------- */}
      {previewSrc && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[100]" onClick={() => setPreviewSrc(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image src={previewSrc} width={500} height={500} alt="Preview" className="rounded shadow-lg" />
            <button className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-2 rounded-full" onClick={() => setPreviewSrc(null)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
