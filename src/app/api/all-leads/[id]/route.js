import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(req, context) {
  try {
    // ✅ FIX: unwrap params (Next.js 14+ behavior)
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    const bucket = new GridFSBucket(conn.connection.db, { bucketName: "uploads" });
    const formData = await req.formData();

    const existingLead = await Lead.findById(id);
    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    const fileFields = ["companyLogo", "clientLogo", "vatCertificate", "tradeLicense"];
    let updatedAttachments = [...existingLead.attachments];

    // ---------- Handle file updates ----------
    for (const field of fileFields) {
      const file = formData.get(field);

      if (file instanceof File) {
        // delete old file if exists
        const oldFile = updatedAttachments.find((x) => x.fieldname === field);
        if (oldFile) {
          try {
            await bucket.delete(new ObjectId(oldFile.fileId));
          } catch {}
        }

        // upload new file
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadStream = bucket.openUploadStream(file.name);
        uploadStream.end(buffer);

        const newAttachment = {
          fieldname: field,
          filename: file.name,
          fileId: uploadStream.id,
        };

        // replace or push
        const index = updatedAttachments.findIndex((x) => x.fieldname === field);
        if (index !== -1) updatedAttachments[index] = newAttachment;
        else updatedAttachments.push(newAttachment);
      }
    }

    // ---------- Handle normal text fields ----------
    const updateData = {};
    formData.forEach((val, key) => {
      if (!fileFields.includes(key) && key !== "attachments") {
        updateData[key] = val;
      }
    });

    updateData.attachments = updatedAttachments;

    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
