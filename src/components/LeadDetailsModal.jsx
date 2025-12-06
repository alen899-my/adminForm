"use client";

import Image from "next/image";
import { X, Download, FileText } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function LeadDetailsModal({ open, onClose, data }) {
  const modalRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (previewSrc) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, previewSrc]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        previewSrc ? setPreviewSrc(null) : onClose(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, previewSrc]);

  if (!open || !data) return null;

  const files = { companyLogo: null, clientLogo: null, vatCertificate: null, tradeLicense: null };
  data.attachments?.forEach((file) => {
    if (!files[file.fieldname]) files[file.fieldname] = file;
  });

  const extractId = (id) => String(id).replace(/ObjectId\("(.+)"\)/, "$1");

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
        
        {/* MODAL */}
        <div
          ref={modalRef}
          className="w-full max-w-6xl bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded-xl max-h-[90vh] overflow-y-auto shadow-xl"
        >
          
          {/* --- HEADER --- */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-5 py-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Viewing client information</p>
            </div>

            <button
              onClick={() => onClose(false)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* --- CONTENT GRID --- */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* STATUS BADGE */}
              <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1 block">
                  Status
                </label>
                <span
                  className={`px-3 py-1 text-xs rounded-md font-medium w-fit
                  ${data.status === "completed"
                    ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-white"
                    : "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-black"
                  }`}
                >
                  {data.status}
                </span>
              </div>

              {/* TEXT FIELDS */}
              {Object.entries(data).map(([key, value]) => {
                if (["_id", "__v", "status", "attachments"].includes(key) || typeof value === "object") return null;

                return (
                  <div key={key} className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <label className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">{key.replace(/([A-Z])/g, " $1")}</label>
                    <p className="mt-1 text-[15px] text-gray-800 dark:text-gray-100">
                      {value || <i className="text-gray-400">No data</i>}
                    </p>
                  </div>
                );
              })}

              {/* IMAGE BLOCKS */}
              {["companyLogo", "clientLogo"].map((field) => {
                const stored = files[field];
                const id = stored ? extractId(stored.fileId) : null;
                const preview = id ? `/api/all-leads/files/${id}` : null;

                return (
                  <div key={field} className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{field.replace(/([A-Z])/g, " $1")}</label>
                    
                    <div className="mt-2 flex items-center justify-center h-[120px] bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
                      {preview ? (
                        <Image
                          unoptimized
                          src={preview}
                          width={100}
                          height={100}
                          onClick={() => setPreviewSrc(preview)}
                          className="cursor-pointer object-contain"
                          alt="Preview"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </div>

                    {id && (
                      <a
                        href={`/api/all-leads/files/${id}`}
                        download
                        className="mt-2 w-full flex items-center justify-center gap-2 text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                      >
                        <Download size={14} /> Download
                      </a>
                    )}
                  </div>
                );
              })}

              {/* PDF FILES */}
              {["vatCertificate", "tradeLicense"].map((field) => {
                const stored = files[field];
                const id = stored ? extractId(stored.fileId) : null;

                return (
                  <div key={field} className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{field.replace(/([A-Z])/g, " $1")}</label>

                    <div className="mt-2 flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <FileText className="text-red-500" size={20} />
                      <span className="text-sm truncate dark:text-gray-200 text-gray-700">
                        {stored?.filename || "No Document"}
                      </span>
                    </div>

                    {id && (
                      <a
                        href={`/api/all-leads/files/${id}`}
                        download
                        className="mt-2 flex items-center justify-center gap-2 text-xs border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      >
                        <Download size={14} /> Download
                      </a>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>

      {/* --- IMAGE PREVIEW OVERLAY --- */}
      {previewSrc && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[10000]"
          onClick={() => setPreviewSrc(null)}
        >
          <Image
            unoptimized
            src={previewSrc}
            width={700}
            height={700}
            className="object-contain max-h-[90vh] rounded-lg shadow-xl"
            alt="Expanded Preview"
          />
        </div>
      )}
    </>
  );
}
