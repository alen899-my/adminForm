"use client";

import Image from "next/image";
import { X, Download, Eye as ViewIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function LeadDetailsModal({ open, onClose, data }) {
  const modalRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  // ---- Close on background click ----
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {

      // ⛔ Prevent closing main modal when preview is open
      if (previewSrc) return;

      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, previewSrc]);

  // ---- Close with ESC ----
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (previewSrc) setPreviewSrc(null);
        else onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, previewSrc, onClose]);

  if (!open || !data) return null;

  // organize attachments
  const files = {
    companyLogo: null,
    clientLogo: null,
    vatCertificate: null,
    tradeLicense: null,
  };

  data.attachments?.forEach((file) => {
    if (files[file.fieldname] === null) files[file.fieldname] = file;
  });

  return (
    <>
      {/* -------- Main Modal -------- */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto p-6 shadow-xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white">Lead Full Details</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {Object.entries(data).map(([key, value]) => {
              if (typeof value === "object" || key === "_id" || key === "__v") return null;

              return (
                <div key={key} className="p-3 border rounded-md dark:border-gray-700">
                  <p className="text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-sm mt-1 dark:text-gray-200">{value || "—"}</p>
                </div>
              );
            })}

            {/* IMAGES PREVIEW + DOWNLOAD */}
            {["companyLogo", "clientLogo"].map((fileKey) => (
              <div key={fileKey} className="p-3 border rounded-md text-center dark:border-gray-700">
                <p className="text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-400">{fileKey}</p>

                {files[fileKey] ? (
                  <>
                    <Image
                      src={`/api/all-leads/files/${files[fileKey].fileId}`}
                      alt={files[fileKey].filename}
                      width={120}
                      height={120}
                      className="mt-3 rounded border object-cover mx-auto cursor-pointer hover:opacity-80 transition"
                      onClick={() =>
                        setPreviewSrc(`/api/all-leads/files/${files[fileKey].fileId}`)
                      }
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-2">
                   

                      <a
                        href={`/api/all-leads/files/${files[fileKey].fileId}`}
                        download
                        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-sm mt-3 text-gray-400 dark:text-gray-500">No file</p>
                )}
              </div>
            ))}

            {/* PDF PREVIEW + DOWNLOAD */}
            {["vatCertificate", "tradeLicense"].map((fileKey) => (
              <div key={fileKey} className="p-3 border rounded-md dark:border-gray-700">
                <p className="text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-400">{fileKey}</p>

                {files[fileKey] ? (
                  <div className="flex items-center gap-3 mt-3">
                    

                    <a
                      href={`/api/all-leads/files/${files[fileKey].fileId}`}
                      download
                      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </a>

                    <span className="text-sm dark:text-gray-300">
                      {files[fileKey].filename}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm mt-3 text-gray-400 dark:text-gray-500">No file</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------- IMAGE PREVIEW MODAL -------- */}
      {previewSrc && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[100]"
          onClick={() => setPreviewSrc(null)} // close when clicking outside preview
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // ⛔ prevent parent closing
          >
            <Image src={previewSrc} width={500} height={500} alt="Preview" className="rounded shadow-lg" />

            <button
              onClick={() => setPreviewSrc(null)}
              className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
