import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/application.model.js";
import { Heirship } from "../models/heirship.model.js";
import { Successor } from "../models/successor.model.js";
import { Office } from "../models/office.model.js";
import { Certificate } from "../models/certificate.model.js";
import { CertificateTemplate } from "../models/certificate_template.js";
import { Village } from "../models/village.model.js";
import { PostOfficeMaster } from "../models/postOfficeMaster.model.js";
import { PoliceStation } from "../models/policeStation.model.js";
import { SansadMaster } from "../models/sansadMaster.model.js";
import { MouzaMaster } from "../models/mouzaMaster.model.js";
import { DocumentType } from "../models/documentType.model.js";
import { Guideline } from "../models/guideline.model.js";
import { Signature } from "../models/signature.model.js";
import { LandNoc } from "../models/landNoc.model.js";
import { Burning } from "../models/burning.model.js";
import { Otp } from "../models/otp.model.js";
import { sendSms } from "../utils/sendSms.js";
import { HeirshipCertificate } from "../models/heirshipCertificate.model.js";
import { sendApplicationSubmitMail } from "../utils/sendEmail.js";
import { renderCertificateBody, renderCertificatePDF } from "../utils/renderCertificateBody.js";
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
    resident_type: b.resident_type,
    owner_name: b.owner_name,
    mouza: b.mouza,
    pin_code: b.pin_code,
    voter_card_no: b.voter_card_no,
    aadhar_card_no: b.aadhar_card_no,
    pan_card_no: b.pan_card_no,
    ration_card_no: b.ration_card_no,
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

// POST /check_status  (MODIFIED — now checks LandNoc & Burning too)
export const getApplicationStatus = asyncHandler(async (req, res) => {
  const { application_no } = req.body;
  if (!application_no) return res.status(400).json(new ApiError(400, "Application number is required"));

  const application =
    (await Application.findOne({ application_no, office: req.office._id })) ||
    (await Heirship.findOne({ application_no, office: req.office._id })) ||
    (await LandNoc.findOne({ application_no, office: req.office._id })) ||
    (await Burning.findOne({ application_no, office: req.office._id }));

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

    if (!application_no?.trim() || !mobile?.trim()) {
      return res.status(400).json(new ApiError(400, "Application No and Mobile are required."));
    }

    const trimmedNo = application_no.trim();

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
      return res.status(404).json(new ApiError(404, "Application not found. Please check your Application No."));
    }

    if (application.mobile !== mobile.trim()) {
      return res.status(400).json(new ApiError(400, "Mobile number does not match our records."));
    }

    if (application.status === "rejected") {
      return res.status(400).json(new ApiError(400, "This application was rejected. Certificate not available."));
    }
    if (application.status !== "completed") {
      return res.status(400).json(new ApiError(400, "Your certificate is not ready yet. Please check back later."));
    }

    // ---- Already generated — return existing CDN URL (all types, including heirship) ----
    let certificate = await Certificate.findOne({ application_no: trimmedNo, office: officeId });

    if (certificate?.certificate_file) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            certificate_url: certificate.certificate_file,
            certificate_no: certificate.certificate_no,
          },
          "Certificate ready"
        )
      );
    }

    // ---- Not generated yet — generate now (Application / Heirship / LandNoc / Burning) ----
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
      return res.status(400).json(new ApiError(400, "Certificate template not configured. Please contact the office."));
    }

    const [village, postOffice, policeStation, sansad, mouza, successors] = await Promise.all([
      Village.findById(application.village),
      PostOfficeMaster.findById(application.post_office),
      PoliceStation.findById(application.police_station), // land_noc/burning/heirship-এ না থাকলে null-ই ফিরবে
      SansadMaster.findById(application.sansad || application.ward_sansad),
      MouzaMaster.findById(application.mouza),
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

    // NOTE: DB তে person field "Pradhan" (capital P) হিসেবে save করা আছে — case-insensitive match
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
    });

    const certificateUrl = await uploadToR2(
      pdfBuffer,
      `office-management/certificates/certificate-${certificate_no}.pdf`,
      "application/pdf"
    );

    certificate = await Certificate.create({
      office: officeId,
      application: sourceType === "application" ? application._id : undefined,
      application_no: trimmedNo,
      name: application.name || application.owner_name || application.deceased_name,
      certificate_no,
      certificate_type: certificateTypeKey,
      issue_date: new Date(),
      certificate_file: certificateUrl,
    });

    return res.status(200).json(new ApiResponse(200, { certificate_url: certificateUrl, certificate_no }, "Certificate generated"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error?.message || "Failed to generate certificate. Please try again."));
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

// POST /save_land_noc
export const storeLandNoc = asyncHandler(async (req, res) => {
  const b = req.body;

  const requiredFields = [
    "mobile",
    "date",
    "dag_no",
    "khatian_no",
    "jl_no",
    "mouza",
    "land_area",
    "ward_sansad",
    "post_office",
    "village",
    "owner_name",
    "relation_with",
    "relation_with_name",
    "from_land_type",
    "to_land_type",
    "land_used_as",
  ];
  for (const field of requiredFields) {
    if (!b[field]) return res.status(400).json(new ApiError(400, `${field} is required`));
  }
  if (!/^[6-9]\d{9}$/.test(b.mobile)) {
    return res.status(400).json(new ApiError(400, "Invalid mobile number"));
  }

  const application_no = crypto.randomBytes(5).toString("hex").toUpperCase();

  const landNoc = await LandNoc.create({
    office: req.office._id,
    application_no,
    mobile: b.mobile,
    sl_no: b.sl_no,
    date: b.date,
    dag_no: b.dag_no,
    khatian_no: b.khatian_no,
    jl_no: b.jl_no,
    mouza: b.mouza,
    land_area: b.land_area,
    chatak: b.chatak,
    sq_feet: b.sq_feet,
    ward_sansad: b.ward_sansad,
    post_office: b.post_office,
    village: b.village,
    owner_name: b.owner_name,
    relation_with: b.relation_with,
    relation_with_name: b.relation_with_name,
    from_land_type: b.from_land_type,
    to_land_type: b.to_land_type,
    land_used_as: b.land_used_as,
  });

  await sendSms(
    landNoc.mobile,
    `Dear Applicant, your application for Land NOC with ID ${application_no} has been successfully submitted. Please keep this ID for future reference. Regards, ${req.office.name}`,
    "1407172986181821963"
  );

  return res.status(201).json(new ApiResponse(201, { application_no: landNoc.application_no }, "Application Submitted!"));
});

// POST /save_burning
export const storeBurning = asyncHandler(async (req, res) => {
  const b = req.body;

  const requiredFields = [
    "mobile",
    "memo_no",
    "memo_date",
    "certificate_type",
    "deceased_name",
    "gender",
    "relation_with",
    "relation_with_name",
    "resident_type",
    "died_on",
    "burnt_buried_on",
    "sansad",
    "village",
    "post_office",
    "mouza",
    "pin_code",
    "issued_to",
    "relation_with_deceased",
  ];
  for (const field of requiredFields) {
    if (!b[field]) return res.status(400).json(new ApiError(400, `${field} is required`));
  }
  if (!/^[6-9]\d{9}$/.test(b.mobile)) {
    return res.status(400).json(new ApiError(400, "Invalid mobile number"));
  }
  if (b.resident_type === "TENANT" && !b.owner_name?.trim()) {
    return res.status(400).json(new ApiError(400, "Owner name is required for tenants"));
  }

  const application_no = crypto.randomBytes(5).toString("hex").toUpperCase();

  const burning = await Burning.create({
    office: req.office._id,
    application_no,
    issued_by: b.issued_by,
    mobile: b.mobile,
    memo_no: b.memo_no,
    memo_date: b.memo_date,
    certificate_type: b.certificate_type,
    deceased_name: b.deceased_name,
    gender: b.gender,
    relation_with: b.relation_with,
    relation_with_name: b.relation_with_name,
    resident_type: b.resident_type,
    owner_name: b.owner_name,
    died_on: b.died_on,
    burnt_buried_on: b.burnt_buried_on,
    place: b.place,
    sansad: b.sansad,
    village: b.village,
    post_office: b.post_office,
    mouza: b.mouza,
    pin_code: b.pin_code,
    issued_to: b.issued_to,
    relation_with_deceased: b.relation_with_deceased,
  });

  await sendSms(
    burning.mobile,
    `Dear Applicant, your application for ${burning.certificate_type} certificate with ID ${application_no} has been successfully submitted. Please keep this ID for future reference. Regards, ${req.office.name}`,
    "1407172986181821963"
  );

  return res.status(201).json(new ApiResponse(201, { application_no: burning.application_no }, "Application Submitted!"));
});
