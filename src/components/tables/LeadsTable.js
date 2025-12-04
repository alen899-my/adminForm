"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function LeadsTable() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const res = await fetch("/api/all-leads");
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    };
    fetchLeads();
  }, []);

  return (
    <div className="overflow-auto rounded-xl border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <Table className="min-w-[2800px]">
        {/* ---------------- Header ---------------- */}
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300">
            {/* Location & Basics */}
            {[
              "Location Name","Capacity","Wait Time","Maps URL","Latitude","Longitude","Timing","Address",
              "Lobbies","Key Rooms","Distance",
              "Supervisor User","Validation User","Report User",
              "Ticket Type","Fee Type","Ticket Pricing","VAT Type",
              "Driver Count","Driver List",
              "Admin Name","Admin Email","Admin Phone","Training Required",
              "Company Logo","Client Logo","VAT Certificate","Trade License",
              "Submit Method","Created"
            ].map((heading) => (
              <TableCell
                key={heading}
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase border-r border-gray-300 whitespace-nowrap"
              >
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        {/* ---------------- Body ---------------- */}
        <TableBody>
          {leads.map((lead) => {
            // classified attachment mapping
            const files = {
              companyLogo: null,
              clientLogo: null,
              vatCertificate: null,
              tradeLicense: null,
            };

            lead.attachments?.forEach((file) => {
              if (files[file.fieldname] === null) files[file.fieldname] = file;
            });

            return (
              <TableRow
                key={lead._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-300"
              >
                {/* All text fields */}
                {[
                  lead.locationName,lead.capacity,lead.waitTime,lead.mapsUrl,lead.latitude,lead.longitude,lead.timing,
                  lead.address,lead.lobbies,lead.keyRooms,lead.distance,
                  lead.supervisorUser,lead.validationUser,lead.reportUser,
                  lead.ticketType,lead.feeType,lead.ticketPricing,lead.vatType,
                  lead.driverCount,lead.driverList,
                  lead.adminName,lead.adminEmail,lead.adminPhone,lead.trainingRequired
                ].map((value, index) => (
                  <TableCell
                    key={index}
                    className="px-5 py-3 text-sm border-r border-gray-300 whitespace-nowrap dark:text-gray-300"
                  >
                    {value || "—"}
                  </TableCell>
                ))}

                {/* Attachments: Logos */}
                {["companyLogo", "clientLogo"].map((field) =>
                  files[field] ? (
                    <TableCell key={field} className="px-5 py-3 border-r border-gray-300">
                      <Image
                        src={`/api/all-leads/files/${files[field].fileId}`}
                        width={50}
                        height={50}
                        className="rounded border object-cover"
                        alt={files[field].filename}
                      />
                    </TableCell>
                  ) : (
                    <TableCell key={field} className="px-5 py-3 text-gray-400 text-sm border-r border-gray-300">
                      —
                    </TableCell>
                  )
                )}

                {/* Attachments: PDFs */}
                {["vatCertificate", "tradeLicense"].map((field) =>
                  files[field] ? (
                    <TableCell key={field} className="px-5 py-3 border-r border-gray-300">
                      <a
                        href={`/api/all-leads/files/${files[field].fileId}`}
                        className="text-blue-600 underline text-sm"
                        target="_blank"
                        download
                      >
                        📄 {files[field].filename}
                      </a>
                    </TableCell>
                  ) : (
                    <TableCell key={field} className="px-5 py-3 text-gray-400 text-sm border-r border-gray-300">
                      —
                    </TableCell>
                  )
                )}

                {/* Submit + Timestamp */}
                <TableCell className="px-5 py-3 border-r border-gray-300">
                  {lead.documentSubmitMethod}
                </TableCell>

                <TableCell className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
