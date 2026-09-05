import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/application.model.js";
import { Heirship } from "../models/heirship.model.js";
import { Successor } from "../models/successor.model.js";
import { LandNoc } from "../models/landNoc.model.js";
import { Burning } from "../models/burning.model.js";
import { Certificate } from "../models/certificate.model.js";
import { CertificateTemplate } from "../models/certificate_template.js";
import { Office } from "../models/office.model.js";
import { Village } from "../models/village.model.js";
import { PostOfficeMaster } from "../models/postOfficeMaster.model.js";
import { PoliceStation } from "../models/policeStation.model.js";
import { SansadMaster } from "../models/sansadMaster.model.js";
import { MouzaMaster } from "../models/mouzaMaster.model.js";
import { Signature } from "../models/signature.model.js";
import { sendSms } from "../utils/sendSms.js";
import { renderCertificateBody, renderCertificatePDF } from "../utils/renderCertificateBody.js";
import { uploadToR2 } from "../utils/r2Uploader.js";
import crypto from "crypto";
import mongoose from "mongoose";

const safeFindById = (Model, id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return Promise.resolve(null);
  }
  return Model.findById(id);
};

export const generateCertificate = asyncHandler(async (req, res) => {
  const { application_no, issue_date, remarks } = req.body;

  if (!application_no?.trim()) {
    return res.status(400).json(new ApiError(400, "Application No is required."));
  }
  const trimmedNo = application_no.trim();
  const officeId = req.user.office;

  let application = await Application.findOne({ application_no: trimmedNo, office: officeId });
  let sourceType = "application";
  if (!application) {
    application = await Heirship.findOne({ application_no: trimmedNo, office: officeId });
    sourceType = "heirship";
  }
  if (!application) {
    application = await LandNoc.findOne({ application_no: trimmedNo, office: officeId });
    sourceType = "land_noc";
  }
  if (!application) {
    application = await Burning.findOne({ application_no: trimmedNo, office: officeId });
    sourceType = "burning";
  }

  if (!application) {
    return res.status(400).json(new ApiError(400, "Application not found."));
  }
  if (application.status !== "pending") {
    return res.status(400).json(new ApiError(400, "Application already completed or not pending."));
  }

  const office = await Office.findById(officeId);

  const certificateTypeKey =
    sourceType === "burning"
      ? (application.certificate_type || "burning").toLowerCase()
      : sourceType === "land_noc"
      ? "land_noc"
      : sourceType === "heirship"
      ? "heirship"
      : application.application_type;

  const template = await CertificateTemplate.findOne({
    office: officeId,
    certificate_type: certificateTypeKey,
  });

  if (!template) {
    return res.status(400).json(new ApiError(400, `Certificate template not configured for "${certificateTypeKey}". Please add it first.`));
  }

  const [village, postOffice, policeStation, sansad, mouza, successors] = await Promise.all([
    safeFindById(Village, application.village),
    safeFindById(PostOfficeMaster, application.post_office),
    safeFindById(PoliceStation, application.police_station),
    safeFindById(SansadMaster, application.sansad || application.ward_sansad),
    safeFindById(MouzaMaster, application.mouza),
    sourceType === "heirship" ? Successor.find({ application_no: application._id }) : Promise.resolve([]),
  ]);

  const bodyText = renderCertificateBody(template.body, {
    application,
    office,
    village_name: village?.name,
    post_office_name: postOffice?.name,
    police_station_name: policeStation?.name,
    sansad_name: sansad?.name,
    mouza_name: mouza?.name,
    successors,
  });

  const certificate_no = crypto.randomBytes(8).toString("hex").toUpperCase();

  const pradhanSignature = await Signature.findOne({
    office: officeId,
    person: { $regex: /^pradhan$/i },
  });

  const pdfBuffer = await renderCertificatePDF({
    title: template.title,
    office,
    bodyText,
    certificate_no,
    signatureUrl: pradhanSignature?.image,
    successors,
    issue_date: issue_date || new Date(),
  });

  const certificateUrl = await uploadToR2(
    pdfBuffer,
    `office-management/certificates/certificate-${certificate_no}.pdf`,
    "application/pdf"
  );

  const certificate = await Certificate.findOneAndUpdate(
    { office: officeId, application_no: trimmedNo },
    {
      office: officeId,
      application: sourceType === "application" ? application._id : undefined,
      application_no: trimmedNo,
      name: application.name || application.owner_name || application.deceased_name,
      certificate_no,
      certificate_type: certificateTypeKey,
      issue_date: issue_date || new Date(),
      certificate_file: certificateUrl,
      issued_by: req.user._id,
      remarks,
    },
    { upsert: true, new: true }
  );

  application.status = "completed";
  await application.save();

  await sendSms(
    application.mobile,
    `Dear Applicant, your ${certificate.certificate_type} certificate with ID ${certificate_no} has been successfully generated. You may download it online. Regards, ${office.name}`,
    "1407172986212571350"
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { certificate_no, certificate_url: certificateUrl },
      "Certificate generated successfully."
    )
  );
});

// GET /admin/certificates (protected)
export const listAllCertificates = asyncHandler(async (req, res) => {
  const officeId = req.user.office;

  const certificates = await Certificate.find({ office: officeId })
    .populate("issued_by", "name")
    .sort("-issue_date");

  return res.json(new ApiResponse(200, certificates, "Certificates fetched."));
});

// GET /certificate/:certificate_no/view  — redirects straight to the generated PDF
export const viewCertificateImage = asyncHandler(async (req, res) => {
  const { certificate_no } = req.params;

  const certificate = await Certificate.findOne({ certificate_no });

  if (!certificate) {
    return res.status(404).json(new ApiError(404, "Certificate not found."));
  }
  if (!certificate.certificate_file) {
    return res.status(400).json(new ApiError(400, "Certificate file not generated yet."));
  }

  return res.redirect(certificate.certificate_file);
});

// POST /download (public lookup)
export const publicCertificateView = asyncHandler(async (req, res) => {
  const { certificate_no } = req.body;

  const certificate = await Certificate.findOne({
    office: req.office._id,
    $or: [{ certificate_no }, { application_no: certificate_no }],
  });

  if (!certificate) return res.status(404).json(new ApiError(404, "Certificate not found."));

  return res.json(new ApiResponse(200, certificate, "Certificate found."));
});