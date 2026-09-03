import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/application.model.js";
import { Heirship } from "../models/heirship.model.js";
import { Certificate } from "../models/certificate.model.js";
import { Guideline } from "../models/guideline.model.js";
import { Signature } from "../models/signature.model.js";
import { Download } from "../models/download.model.js";
import { OldData } from "../models/oldData.model.js";
import { OldDataType } from "../models/oldDataType.model.js";
import { sendSms } from "../utils/sendSms.js";
import { uploadToR2 } from "../utils/r2Uploader.js";
import {deleteFromR2} from "../utils/r2Uploader.js"
import fs from "fs";
import path from "path";

// GET /admin/dashboard
export const dashboardStats = asyncHandler(async (req, res) => {
  const officeId = req.user.office;

  const [rejectedApp, rejectedHeir, completedApp, completedHeir, pendingApp, pendingHeir, totalApp, totalHeir, typeCounts] =
    await Promise.all([
      Application.countDocuments({ office: officeId, status: "rejected" }),
      Heirship.countDocuments({ office: officeId, status: "rejected" }),
      Application.countDocuments({ office: officeId, status: "completed" }),
      Heirship.countDocuments({ office: officeId, status: "completed" }),
      Application.countDocuments({ office: officeId, status: "pending" }),
      Heirship.countDocuments({ office: officeId, status: "pending" }),
      Application.countDocuments({ office: officeId }),
      Heirship.countDocuments({ office: officeId }),
      Application.aggregate([{ $match: { office: officeId } }, { $group: { _id: "$application_type", count: { $sum: 1 } } }]),
    ]);

  const typeCountMap = typeCounts.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {});
  typeCountMap.heirship = totalHeir;

  return res.json(
    new ApiResponse(200, {
      rejectedCount: rejectedApp + rejectedHeir,
      completedCount: completedApp + completedHeir,
      pendingCount: pendingApp + pendingHeir,
      totalCount: totalApp + totalHeir,
      typeCounts: typeCountMap,
    }, "Dashboard stats fetched.")
  );
  // Chart.js diye eita frontend e chart banate parbi, ekhane raw data dilam
});

// GET /admin/application?status=pending|rejected|all
export const listApplications = asyncHandler(async (req, res) => {
  const officeId = req.user.office;
  const { status } = req.query;
  const filter = { office: officeId };
  if (status && status !== "all") filter.status = status;

  const [applications, heirships] = await Promise.all([
    Application.find(filter).sort("-createdAt").lean(),
    Heirship.find(filter).sort("-createdAt").lean(),
  ]);

  let combined = [...applications, ...heirships];

  // Attach certificate details for completed applications
  if (!status || status === "all" || status === "completed") {
    const applicationNos = combined
      .filter((app) => app.status === "completed")
      .map((app) => app.application_no);

    if (applicationNos.length > 0) {
      const certificates = await Certificate.find({
        office: officeId,
        application_no: { $in: applicationNos },
      })
        .populate("issued_by", "name")
        .lean();

      const certMap = certificates.reduce((acc, cert) => {
        acc[cert.application_no] = cert;
        return acc;
      }, {});

      combined = combined.map((app) => {
        const cert = certMap[app.application_no];
        if (!cert) return app;
        return {
          ...app,
          certificate_no: cert.certificate_no,
          certificate_type: cert.certificate_type,
          issue_date: cert.issue_date,
          issued_by: cert.issued_by?.name || null,
          remarks: cert.remarks ?? app.remarks,
        };
      });
    }
  }

  combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json(new ApiResponse(200, combined, "Applications fetched."));
});

// GET /admin/application/view/:id  (id = application_no)
export const viewApplication = asyncHandler(async (req, res) => {
  const application =
    (await Application.findOne({ application_no: req.params.id }).populate(
      "village post_office police_station sansad id_type"
    )) ||
    (await Heirship.findOne({ application_no: req.params.id }).populate(
      "village post_office police_station sansad id_type successor"
    ));

  if (!application) {
    return res.status(404).json(new ApiError(404, "Application not found."));
  }

  return res.json(new ApiResponse(200, application, "Application fetched."));
});

// POST /admin/application/reject
export const rejectApplication = asyncHandler(async (req, res) => {
  const { application_no, remarks } = req.body;

  let application = await Application.findOne({ application_no });
  if (!application) application = await Heirship.findOne({ application_no });
  if (!application) return res.status(404).json(new ApiError(404, "Application not found."));

  application.status = "rejected";
  application.rejected_remarks = remarks;
  await application.save();

  await sendSms(
    application.mobile,
    `Dear Applicant, we regret to inform you that your application for ${application.application_type || "heirship"} certificate with ID ${application.application_no} has been rejected. For further details, please contact our office.`,
    "1407172986230698630"
  );

  return res.json(new ApiResponse(200, application, "Application rejected successfully."));
});

// ---------------- Guidelines ----------------
export const listGuidelines = asyncHandler(async (req, res) => {
  const guidelines = await Guideline.find({ office: req.user.office });
  return res.json(new ApiResponse(200, guidelines, "Guidelines fetched."));
});

export const addGuideline = asyncHandler(async (req, res) => {
  const { form_type, guidelines } = req.body;
  if (!form_type || !guidelines) return res.status(400).json(new ApiError(400, "form_type and guidelines are required."));

  const existing = await Guideline.findOne({ office: req.user.office, form_type });
  if (existing) return res.status(409).json(new ApiError(409, "A guideline for this form type already exists."));

  const guideline = await Guideline.create({ office: req.user.office, form_type, guidelines });
  return res.status(201).json(new ApiResponse(201, guideline, "Guideline added successfully!"));
});

export const updateGuideline = asyncHandler(async (req, res) => {
  const guideline = await Guideline.findOneAndUpdate(
    { office: req.user.office, form_type: req.body.form_type },
    { guidelines: req.body.guidelines },
    { new: true }
  );
  if (!guideline) return res.status(404).json(new ApiError(404, "Guideline not found."));
  return res.json(new ApiResponse(200, guideline, "Guidelines updated successfully!"));
});

export const deleteGuideline = asyncHandler(async (req, res) => {
  const guideline = await Guideline.findOneAndDelete({ office: req.user.office, _id: req.params.id });
  if (!guideline) return res.status(404).json(new ApiError(404, "Invalid guideline id!"));
  return res.json(new ApiResponse(200, {}, "Guideline deleted successfully!"));
});

// ---------------- Signatures ----------------
export const listSignatures = asyncHandler(async (req, res) => {
  const signatures = await Signature.find({ office: req.user.office });
  return res.json(new ApiResponse(200, signatures, "Signatures fetched."));
});

export const updateSignature = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json(new ApiError(400, "Signature image is required."));
  if (!req.body.person?.trim())
    return res.status(400).json(new ApiError(400, "Person field is required."));

  const oldSignature = await Signature.findOne({ office: req.user.office, person: req.body.person });

  const signatureUrl = await uploadToR2(
    req.file.buffer,
    `office-management/signatures/signature-${Date.now()}${path.extname(req.file.originalname)}`,
    req.file.mimetype
  );

  const signature = await Signature.findOneAndUpdate(
    { office: req.user.office, person: req.body.person },
    { image: signatureUrl },
    { upsert: true, new: true, runValidators: true }
  );

  if (oldSignature?.image) {
    await deleteFromR2(oldSignature.image).catch((err) =>
      console.error("Failed to delete old signature from R2:", err.message)
    );
  }

  return res.json(new ApiResponse(200, signature, "Signature updated successfully!"));
});

// ---------------- Downloads ----------------
export const listDownloads = asyncHandler(async (req, res) => {
  const files = await Download.find({ office: req.user.office });
  return res.json(new ApiResponse(200, files, "Downloads fetched."));
});

export const addDownload = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json(new ApiError(400, "File is required."));
  if (!req.body.title?.trim()) return res.status(400).json(new ApiError(400, "Title is required."));

  const fileUrl = await uploadToR2(
    req.file.buffer,
    `office-management/downloads/download-${Date.now()}${path.extname(req.file.originalname)}`,
    req.file.mimetype
  );

  const file = await Download.create({
    office: req.user.office,
    title: req.body.title.trim(),
    file: fileUrl,
  });

  return res.status(201).json(new ApiResponse(201, file, "File uploaded successfully."));
});

export const downloadFile = asyncHandler(async (req, res) => {
  const file = await Download.findOne({ office: req.user.office, _id: req.params.id });
  if (!file) return res.status(404).json(new ApiError(404, "File not found."));
  return res.download(file.file, `${file.title}${path.extname(file.file)}`);
});

export const deleteDownload = asyncHandler(async (req, res) => {
  const file = await Download.findOneAndDelete({ office: req.user.office, _id: req.params.id });
  if (!file) return res.status(404).json(new ApiError(404, "File not found."));
  if (fs.existsSync(file.file)) fs.unlinkSync(file.file);
  return res.json(new ApiResponse(200, {}, "File deleted successfully."));
});

// ---------------- Certificate Report ----------------
export const certificateReport = asyncHandler(async (req, res) => {
  const officeId = req.user.office;
  const { certificate_type, from_date, to_date } = req.query;

  const filter = { office: officeId };
  if (certificate_type && certificate_type !== "all") filter.certificate_type = certificate_type;

  if (from_date && to_date) filter.issue_date = { $gte: new Date(from_date), $lte: new Date(to_date) };
  else if (from_date) filter.issue_date = { $gte: new Date(from_date), $lte: new Date() };
  else if (to_date) filter.issue_date = { $lte: new Date(to_date) };

  const [certificates, certificateTypes] = await Promise.all([
    Certificate.find(filter).populate("application").sort("-issue_date"),
    Certificate.distinct("certificate_type"),
  ]);

  return res.json(new ApiResponse(200, { certificates, certificateTypes }, "Report generated."));
  // PDF/Excel export lagle ei data diye `pdfkit`/`exceljs` npm package use korte paris
});

// ---------------- Old Data ----------------
export const oldDataList = asyncHandler(async (req, res) => {
  const [oldData, oldDataTypes] = await Promise.all([
    OldData.find({ office: req.user.office }),
    OldDataType.find({ office: req.user.office }),
  ]);
  return res.json(new ApiResponse(200, { oldData, oldDataTypes }, "Old data fetched."));
});

export const addOldData = asyncHandler(async (req, res) => {
  const { type, no, name, mobile, address, document_type, document_no } = req.body;
  if (!type || !name) return res.status(400).json(new ApiError(400, "type and name are required."));
  if (mobile && !/^[0-9]{1,10}$/.test(mobile)) return res.status(400).json(new ApiError(400, "Invalid mobile number."));

  const data = await OldData.create({ office: req.user.office, type, no, name, mobile, address, document_type, document_no });
  return res.status(201).json(new ApiResponse(201, data, "Data added successfully"));
});

export const deleteOldData = asyncHandler(async (req, res) => {
  const data = await OldData.findOneAndDelete({ office: req.user.office, _id: req.params.id });
  if (!data) return res.status(404).json(new ApiError(404, "Data not found."));
  return res.json(new ApiResponse(200, {}, "Data deleted successfully"));
});