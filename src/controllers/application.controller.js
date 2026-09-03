import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/application.model.js";
import { Heirship } from "../models/heirship.model.js";
import { Successor } from "../models/successor.model.js";
import { Office } from "../models/office.model.js";
import {Certificate} from "../models/certificate.model.js";
import {CertificateTemplate} from "../models/certificate_template.js"
import { Village } from "../models/village.model.js";
import { PostOfficeMaster } from "../models/postOfficeMaster.model.js";
import { PoliceStation } from "../models/policeStation.model.js";
import { SansadMaster } from "../models/sansadMaster.model.js";
import { MouzaMaster } from "../models/mouzaMaster.model.js";
import { DocumentType } from "../models/documentType.model.js";
import { Guideline } from "../models/guideline.model.js";
import {Signature} from "../models/signature.model.js"
import { Otp } from "../models/otp.model.js";
import { sendSms } from "../utils/sendSms.js";
import { sendApplicationSubmitMail } from "../utils/sendEmail.js";
import {renderCertificateBody,renderCertificatePDF} from "../utils/renderCertificateBody.js"
import { uploadToR2 } from "../utils/r2Uploader.js";
import crypto from "crypto";
import path from "path";

// GET /apply/:type
export const getApplicationFormData = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const officeId = req.office._id;

  const [village, post_office, police_station, sansad, mouza, id_type, guidelineDoc] = await Promise.all([
    Village.find({ office: officeId }),
    PostOfficeMaster.find({ office: officeId }),
    PoliceStation.find({ office: officeId }),
    SansadMaster.find({ office: officeId }),
    MouzaMaster.find({ office: officeId }),
    DocumentType.find({ office: officeId }),
    Guideline.findOne({ office: officeId, form_type: type }).select("guidelines"),
  ]);

  const guidelines = guidelineDoc?.guidelines ? guidelineDoc.guidelines.split(/\r\n|\r|\n/) : [];

  return res.json(new ApiResponse(200, { office: req.office, village, post_office, police_station, sansad, mouza, id_type, guidelines }, "Form data fetched."));
});

// POST /save_application
export const storeApplication = asyncHandler(async (req, res) => {
  const b = req.body;

  const requiredFields = [
    "application_type",
    "title",
    "name",
    "mobile",
    "gender",
    "dob",
    "guardian_name",
    "guardian_type",
    "village",
    "post_office",
    "police_station",
    "gp",
    "sansad",
    "district",
    "state",
    "religion",
    "marital_status",
    "id_type",
  ];
  for (const field of requiredFields) {
    if (!b[field]) return res.status(400).json(new ApiError(400, `${field} is required`));
  }
  if (!/^[6-9]\d{9}$/.test(b.mobile)) {
    return res.status(400).json(new ApiError(400, "Invalid mobile number"));
  }
  if (!req.files?.document?.[0] || !req.files?.tax_receipt?.[0]) {
    return res.status(400).json(new ApiError(400, "Document and Tax Receipt files are required"));
  }

  const application_no = crypto.randomBytes(5).toString("hex").toUpperCase();

  // Upload files to R2
  const documentFile = req.files.document[0];
  const taxReceiptFile = req.files.tax_receipt[0];

  const documentUrl = await uploadToR2(
    documentFile.buffer,
    `office-management/applications/document-${Date.now()}${path.extname(documentFile.originalname)}`,
    documentFile.mimetype
  );
  const taxReceiptUrl = await uploadToR2(
    taxReceiptFile.buffer,
    `office-management/applications/tax_receipt-${Date.now()}${path.extname(taxReceiptFile.originalname)}`,
    taxReceiptFile.mimetype
  );

  const application = await Application.create({
    office: req.office._id,
    application_no,
    application_type: b.application_type,
    title: b.title,
    name: b.name,
    email: b.email,
    mobile: b.mobile,
    gender: b.gender,
    dob: b.dob,
    guardian_name: b.guardian_name,
    guardian_type: b.guardian_type,
    address: b.address,
    village: b.village,
    post_office: b.post_office,
    police_station: b.police_station,
    gp: b.gp,
    sansad: b.sansad,
    district: b.district,
    state: b.state,
    religion: b.religion,
    caste: b.caste,
    sub_caste: b.sub_caste,
    marital_status: b.marital_status,
    yearly_income: b.yearly_income,
    id_type: b.id_type,
    id_file: documentUrl,
    tax_receipt: taxReceiptUrl,
    id_no: b.id_no?.trim(),
  });

  await sendApplicationSubmitMail({
    to: application.email,
    officeName: req.office.name,
    applicantName: application.name,
    applicationType: application.application_type,
    applicationNo: application.application_no,
  });

  await sendSms(
    application.mobile,
    `Dear Applicant, your application for ${application.application_type} certificate with ID ${application_no} has been successfully submitted. Please keep this ID for future reference. Regards, ${req.office.name}`,
    "1407172986181821963"
  );

  return res.status(201).json(new ApiResponse(201, { application_no: application.application_no }, "Application Submitted!"));
});

// POST /save_heirship
export const storeHeirship = asyncHandler(async (req, res) => {
  const b = req.body;

  const requiredFields = [
    "title",
    "name",
    "mobile",
    "gender",
    "dob",
    "guardian_name",
    "guardian_type",
    "village",
    "post_office",
    "police_station",
    "gp",
    "sansad",
    "district",
    "state",
    "religion",
    "id_type",
  ];
  for (const field of requiredFields) {
    if (!b[field]) return res.status(400).json(new ApiError(400, `${field} is required`));
  }
  if (!/^[6-9]\d{9}$/.test(b.mobile)) {
    return res.status(400).json(new ApiError(400, "Invalid mobile number"));
  }
  if (!req.files?.document?.[0] || !req.files?.tax_receipt?.[0] || !req.files?.member_authorization?.[0]) {
    return res.status(400).json(new ApiError(400, "Document, Tax Receipt and Member Authorization files are required"));
  }

  const application_no = crypto.randomUUID();

  const documentFile = req.files.document[0];
  const taxReceiptFile = req.files.tax_receipt[0];
  const memberAuthFile = req.files.member_authorization[0];

  const documentUrl = await uploadToR2(documentFile.buffer, `office-management/heirship/document-${Date.now()}${path.extname(documentFile.originalname)}`, documentFile.mimetype);
  const taxReceiptUrl = await uploadToR2(
    taxReceiptFile.buffer,
    `office-management/heirship/tax_receipt-${Date.now()}${path.extname(taxReceiptFile.originalname)}`,
    taxReceiptFile.mimetype
  );
  const memberAuthUrl = await uploadToR2(
    memberAuthFile.buffer,
    `office-management/heirship/member_auth-${Date.now()}${path.extname(memberAuthFile.originalname)}`,
    memberAuthFile.mimetype
  );

  const heirship = await Heirship.create({
    office: req.office._id,
    application_no,
    title: b.title,
    name: b.name,
    email: b.email,
    mobile: b.mobile,
    gender: b.gender,
    doe: b.dob,
    guardian_name: b.guardian_name,
    guardian_type: b.guardian_type,
    address: b.address,
    village: b.village,
    post_office: b.post_office,
    police_station: b.police_station,
    gp: b.gp,
    sansad: b.sansad,
    district: b.district,
    state: b.state,
    religion: b.religion,
    id_type: b.id_type,
    id_file: documentUrl,
    tax_receipt: taxReceiptUrl,
    member_authorization: memberAuthUrl,
    id_no: b.id_no?.trim(),
  });

  const names = [].concat(b.successor_name || []);
  const guardians = [].concat(b.successor_gurdian || []);
  const relations = [].concat(b.successor_relationship || []);
  const ages = [].concat(b.successor_age || []);
  const addresses = [].concat(b.successor_address || []);

  if (names.length) {
    const successors = names.map((name, i) => ({
      application_no: heirship._id,
      name,
      gurdian_name: guardians[i],
      relation: relations[i],
      age: ages[i],
      address: addresses[i],
    }));
    await Successor.insertMany(successors);
  }

  await sendApplicationSubmitMail({
    to: heirship.email,
    officeName: req.office.name,
    applicantName: heirship.name,
    applicationType: "heirship",
    applicationNo: heirship.application_no,
  });

  return res.status(201).json(new ApiResponse(201, { application_no: heirship.application_no }, "Application Submitted!"));
});

// POST /check_status
export const getApplicationStatus = asyncHandler(async (req, res) => {
  const { application_no } = req.body;
  if (!application_no) return res.status(400).json(new ApiError(400, "Application number is required"));

  const application = (await Application.findOne({ application_no, office: req.office._id })) || (await Heirship.findOne({ application_no, office: req.office._id }));

  if (!application) return res.status(404).json(new ApiError(404, "Application not found."));

  return res.json(new ApiResponse(200, application, "Application status fetched."));
});

// export const generateCertificate = asyncHandler(async (req, res) => {
//   const { application_no } = req.body;

//   const application = await Application.findOne({ application_no, office: req.user.office });
//   if (!application) return res.status(404).json(new ApiError(404, "Application not found."));

//   const office = await Office.findById(req.user.office);
//   const template = await CertificateTemplate.findOne({
//     office: req.user.office,
//     certificate_type: application.application_type,
//   });
//   if (!template) return res.status(400).json(new ApiError(400, "No template configured for this certificate type."));

//   // lookup names (village/post_office/police_station/sansad)
//   const [village, postOffice, policeStation, sansad] = await Promise.all([
//     Village.findById(application.village),
//     PostOfficeMaster.findById(application.post_office),
//     PoliceStation.findById(application.police_station),
//     SansadMaster.findById(application.sansad),
//   ]);

//   const bodyText = renderCertificateBody(template.body, {
//     application,
//     office,
//     village_name: village?.name,
//     post_office_name: postOffice?.name,
//     police_station_name: policeStation?.name,
//     sansad_name: sansad?.name,
//   });

//   const certificate_no = crypto.randomBytes(8).toString("hex").toUpperCase();

//   const pdfBuffer = await renderCertificatePDF({
//     title: template.title,
//     office,
//     bodyText,
//     certificate_no,
//     signatureUrl,
//   });

//   const certificateUrl = await uploadToR2(pdfBuffer, `office-management/certificates/certificate-${certificate_no}.pdf`, "application/pdf");

//   const certificate = await Certificate.create({
//     office: req.user.office,
//     application: application._id,
//     application_no,
//     name: application.name,
//     certificate_no,
//     certificate_type: application.application_type,
//     issue_date: req.body.issue_date || new Date(),
//     issued_by: req.user._id,
//     certificate_file: certificateUrl, // 👈 schema-তে এই field যোগ করতে হবে
//   });

//   application.status = "completed";
//   await application.save();

//   return res.status(201).json(new ApiResponse(201, certificate, "Certificate generated."));
// });

// POST /send-otp

export const generateCertificate = asyncHandler(async (req, res) => {
  try {
    const officeId = req.office._id;
    const { application_no, mobile } = req.body;

    console.log("=== GENERATE CERTIFICATE REQUEST ===");
    console.log("office:", officeId, "application_no:", application_no, "mobile:", mobile);

    if (!application_no?.trim() || !mobile?.trim()) {
      console.log("=== VALIDATION FAILED: missing application_no or mobile ===");
      return res.status(400).json(new ApiError(400, "Application No and Mobile are required."));
    }

    const application = await Application.findOne({
      application_no: application_no.trim(),
      office: officeId,
    });
    console.log("application found:", !!application);

    if (!application) {
      console.log("=== APPLICATION NOT FOUND ===");
      return res.status(404).json(new ApiError(404, "Application not found. Please check your Application No."));
    }

    console.log("db mobile:", application.mobile, "| input mobile:", mobile.trim());
    if (application.mobile !== mobile.trim()) {
      console.log("=== MOBILE MISMATCH ===");
      return res.status(400).json(new ApiError(400, "Mobile number does not match our records."));
    }

    console.log("application status:", application.status);
    if (application.status === "rejected") {
      console.log("=== APPLICATION REJECTED ===");
      return res.status(400).json(new ApiError(400, "This application was rejected. Certificate not available."));
    }
    if (application.status !== "completed") {
      console.log("=== APPLICATION NOT COMPLETED YET ===");
      return res.status(400).json(new ApiError(400, "Your certificate is not ready yet. Please check back later."));
    }

    // ---- Case 1: already generated — fetch existing PDF and stream it back ----
    let certificate = await Certificate.findOne({ application_no: application_no.trim(), office: officeId });
    console.log("existing certificate found:", !!certificate, certificate?.certificate_file || "no file");

    if (certificate?.certificate_file) {
      console.log("=== FETCHING EXISTING CERTIFICATE FILE ===", certificate.certificate_file);
      const fileRes = await fetch(certificate.certificate_file);
      console.log("existing file fetch status:", fileRes.status);

      if (!fileRes.ok) {
        console.log("=== FAILED TO FETCH EXISTING CERTIFICATE FILE FROM R2 ===");
        return res.status(502).json(new ApiError(502, "Failed to fetch existing certificate file."));
      }
      const arrayBuffer = await fileRes.arrayBuffer();
      console.log("=== SENDING EXISTING PDF, size:", arrayBuffer.byteLength, "bytes ===");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${certificate.certificate_no}.pdf"`);
      return res.send(Buffer.from(arrayBuffer));
    }

    // ---- Case 2: not generated yet — generate now ----
    console.log("=== NO EXISTING CERTIFICATE — GENERATING NEW ONE ===");

    const office = await Office.findById(officeId);
    console.log("office found:", !!office);

    const template = await CertificateTemplate.findOne({
      office: officeId,
      certificate_type: application.application_type,
    });
    console.log("template found:", !!template, "| certificate_type:", application.application_type);

    if (!template) {
      console.log("=== NO TEMPLATE CONFIGURED ===");
      return res.status(400).json(new ApiError(400, "Certificate template not configured. Please contact the office."));
    }

    const [village, postOffice, policeStation, sansad] = await Promise.all([
      Village.findById(application.village),
      PostOfficeMaster.findById(application.post_office),
      PoliceStation.findById(application.police_station),
      SansadMaster.findById(application.sansad),
    ]);
    console.log("lookups resolved:", {
      village: village?.name,
      postOffice: postOffice?.name,
      policeStation: policeStation?.name,
      sansad: sansad?.name,
    });

    const bodyText = renderCertificateBody(template.body, {
      application,
      office,
      village_name: village?.name,
      post_office_name: postOffice?.name,
      police_station_name: policeStation?.name,
      sansad_name: sansad?.name,
    });
    console.log("=== BODY TEXT RENDERED ===");

    const certificate_no = crypto.randomBytes(8).toString("hex").toUpperCase();
    console.log("generated certificate_no:", certificate_no);

    const pradhanSignature = await Signature.findOne({ office: officeId, person: "pradhan" });
    console.log("pradhan signature found:", !!pradhanSignature?.image);

    console.log("=== RENDERING PDF ===");
    const pdfBuffer = await renderCertificatePDF({
      title: template.title,
      office,
      bodyText,
      certificate_no,
      signatureUrl: pradhanSignature?.image,
    });
    console.log("=== PDF RENDERED, size:", pdfBuffer.length, "bytes ===");

    console.log("=== UPLOADING TO R2 ===");
    const certificateUrl = await uploadToR2(
      pdfBuffer,
      `office-management/certificates/certificate-${certificate_no}.pdf`,
      "application/pdf"
    );
    console.log("=== UPLOADED TO R2:", certificateUrl, "===");

    certificate = await Certificate.create({
      office: officeId,
      application: application._id,
      application_no: application_no.trim(),
      name: application.name,
      certificate_no,
      certificate_type: application.application_type,
      issue_date: new Date(),
      certificate_file: certificateUrl,
    });
    console.log("=== CERTIFICATE RECORD CREATED:", certificate._id, "===");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${certificate_no}.pdf"`);
    console.log("=== SENDING NEWLY GENERATED PDF ===");
    return res.send(pdfBuffer);
  } catch (error) {
    console.log("=== CATCH BLOCK HIT IN generateCertificate ===");
    console.log("Error name:", error?.name);
    console.log("Error message:", error?.message);
    console.log("Error stack:", error?.stack);
    return res
      .status(500)
      .json(new ApiError(500, error?.message || "Failed to generate certificate. Please try again."));
  }
});

export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json(new ApiError(400, "Valid mobile number is required"));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.findOneAndUpdate({ mobile }, { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, { upsert: true, new: true });

  await sendSms(mobile, `${otp} is your OTP to login into Citizen Portal. Please do not share this OTP with anyone.`, "1407172715834228636");

  return res.json(new ApiResponse(200, {}, "OTP sent successfully."));
});

// POST /verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json(new ApiError(400, "Mobile and OTP are required"));

  const record = await Otp.findOne({ mobile, otp });
  if (!record) return res.status(400).json(new ApiError(400, "Invalid OTP. Please try again."));

  await Otp.deleteOne({ _id: record._id });
  return res.json(new ApiResponse(200, {}, "OTP verified successfully."));
});
