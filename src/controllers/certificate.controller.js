import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/application.model.js";
import { Heirship } from "../models/heirship.model.js";
import { Certificate } from "../models/certificate.model.js";
import { HeirshipCertificate } from "../models/heirshipCertificate.model.js";
import { Signature } from "../models/signature.model.js";
import { Office } from "../models/office.model.js";
import { sendSms } from "../utils/sendSms.js";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import QRCode from "qrcode";
import path from "path";
import crypto from "crypto";
import { ToWords } from "to-words";

GlobalFonts.registerFromPath(path.join(process.cwd(), "public/fonts/Oswald-Bold.ttf"), "Oswald-Bold");
GlobalFonts.registerFromPath(path.join(process.cwd(), "public/fonts/Oswald-Medium.ttf"), "Oswald-Medium");

const toWords = new ToWords();
const numberToWords = (num) => toWords.convert(Number(num) || 0);

// POST /admin/application/complete (protected)
export const generateCertificate = asyncHandler(async (req, res) => {
  const { application_no, issue_date, remarks } = req.body;

  let application = await Application.findOne({ application_no });
  let isHeirship = false;
  if (!application) {
    application = await Heirship.findOne({ application_no });
    isHeirship = true;
  }

  if (!application || application.status !== "pending") {
    return res.status(400).json(new ApiError(400, "Application not found or already completed."));
  }

  const certificate_no = crypto.randomBytes(8).toString("hex").toUpperCase();
  let certificate;

  if (isHeirship) {
    certificate = await HeirshipCertificate.create({
      office: application.office,
      application_no: application.application_no,
      name: application.name,
      certificate_no,
      issue_date,
      certificate_type: "heirship",
      remarks,
    });
  } else {
    certificate = await Certificate.create({
      office: application.office,
      application: application._id,
      application_no: application.application_no,
      name: application.name,
      certificate_no,
      issue_date,
      certificate_type: application.application_type,
      remarks,
    });
  }

  application.status = "completed";
  await application.save();

  const office = await Office.findById(application.office);

  await sendSms(
    application.mobile,
    `Dear Applicant, your ${certificate.certificate_type} certificate with ID ${certificate_no} has been successfully generated. You may download it online. Regards, ${office.name}`,
    "1407172986212571350"
  );

  return res.status(201).json(new ApiResponse(201, { certificate_no }, "Certificate generated successfully."));
});

// GET /admin/certificates (protected)
export const listAllCertificates = asyncHandler(async (req, res) => {
  const officeId = req.user.office;

  const [certificates, heirshipCertificates] = await Promise.all([Certificate.find({ office: officeId }), HeirshipCertificate.find({ office: officeId })]);

  return res.json(new ApiResponse(200, [...certificates, ...heirshipCertificates], "Certificates fetched."));
});

// ---- Canvas helpers ----
const wrapText = (ctx, text, maxWidth) => {
  const paragraphs = text.split("\n");
  if (!maxWidth) return paragraphs;
  const lines = [];
  paragraphs.forEach((para) => {
    const words = para.split(" ");
    let current = "";
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else current = test;
    });
    lines.push(current);
  });
  return lines;
};

const drawText = (ctx, text, x, y, { font = "35px Oswald-Medium", color = "#3a3d3b", align = "left", lineHeight = 1.2, maxWidth } = {}) => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  const fontSize = parseInt(font, 10);
  wrapText(ctx, text, maxWidth).forEach((line, i) => ctx.fillText(line, x, y + i * fontSize * lineHeight));
};

const buildCertificateText = (application, data) => {
  const co = application.guardian_type === "husband" ? "wife of" : application.gender === "male" ? "son of" : "daughter of";
  const he_she = application.gender === "male" ? "He" : "She";
  const him_her = application.gender === "male" ? "him" : "her";
  const his_her = application.gender === "male" ? "his" : "her";

  const base = `This is to certify that ${application.title} ${data.name}, ${co} ${application.guardian_name} is a permanent resident at the village ${application.villageData?.name}, P.O. - ${application.postOffice?.name}, P.S. - ${application.policeStation?.name}, District - ${application.district}, PIN - ${application.postOffice?.pincode}, under the jurisdiction of ${application.sansadData?.name} sansad of ${application.gp}`;

  const map = {
    character: { text: `${base}, - is known to me and bears a good and moral character here.\n\nI wish ${him_her} success in life.`, cert_name: "Character Certificate" },
    unemployment: { text: `${base}, is unemployed till date.`, cert_name: "Unemployment Certificate" },
    residential: { text: `${base}. ${he_she} is known to me.`, cert_name: "Residential Certificate" },
    income: {
      text: `${base}, is known to me. ${his_her[0].toUpperCase() + his_her.slice(1)} gross family income is ₹${application.yearly_income} (Rupees ${numberToWords(
        application.yearly_income
      )} only) per year.\n\nI wish ${him_her} success in life.`,
      cert_name: "Income Certificate",
    },
    caste: {
      text: `${base}. ${he_she} is known to me.\n\n${he_she} belongs to ${String(application.caste).toUpperCase()} community and sub-caste ${String(
        application.sub_caste
      ).toUpperCase()}.`,
      cert_name: "Caste Certificate",
    },
    unmarried: { text: `${base}. ${he_she} is known to me and is unmarried till date.`, cert_name: "Unmarried Certificate" },
    bpl: {
      text: `${base}, is known to me. ${he_she} belongs to a very poor and BPL family bearing ${application.id_no} and yearly income of ${his_her} family is ₹${
        application.yearly_income
      } (Rupees ${numberToWords(application.yearly_income)} only).\n\nAbove information are true to the best of my knowledge. I wish ${him_her} success in life.`,
      cert_name: "BPL Certificate",
    },
    jsy: {
      text: `${base}. - is known to me. ${he_she} is a house wife of a very poor family and yearly income of ${his_her[0].toUpperCase() + his_her.slice(1)} family is ₹${
        application.yearly_income
      } (Rupees ${numberToWords(application.yearly_income)} only).\n\nI recommend ${him_her} for Janani Suraksha Yozana facility. I wish ${his_her} success in life.`,
      cert_name: "Janani Suraksha Yozana Certificate",
    },
    heirship: {
      text: `${base}. ${he_she} has left behind the following legal heirs only in time of death. ${he_she} died on ${new Date(application.doe).toLocaleDateString("en-GB")}.`,
      cert_name: "Heirship Certificate",
    },
  };

  return map[application.application_type] || { text: "", cert_name: "" };
};

// GET /certificate/:certificate_no/image
export const viewCertificateImage = asyncHandler(async (req, res) => {
  const { certificate_no } = req.params;

  const data = (await Certificate.findOne({ certificate_no }).populate("application")) || (await HeirshipCertificate.findOne({ certificate_no }));

  if (!data) return res.status(404).json(new ApiError(404, "Certificate not found."));

  const office = await Office.findById(data.office);

  const application =
    data.application ||
    (await Application.findOne({ application_no: data.application_no }).populate("villageData postOffice policeStation sansadData")) ||
    (await Heirship.findOne({ application_no: data.application_no }).populate("villageData postOffice policeStation sansadData successor"));

  const { text, cert_name } = buildCertificateText(application, data);

  const blankImage = await loadImage(path.join(process.cwd(), "public/blank.png"));
  const canvas = createCanvas(blankImage.width, blankImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(blankImage, 0, 0);

  drawText(ctx, office.name.toUpperCase(), 700, 330, { font: "75px Oswald-Bold", color: "#1272b3", align: "center" });
  drawText(ctx, office.address, 700, 400, { font: "35px Oswald-Bold", align: "center" });
  drawText(ctx, `${office.pradhan_name}\nPradhan\n${office.pradhan_phone}`, 50, 560, { font: "30px Oswald-Bold", color: "#0673bd", lineHeight: 1.8 });
  drawText(ctx, `${office.upapradhan_name}\nUpa-pradhan\n${office.upapradhan_phone}`, 1350, 560, { font: "30px Oswald-Bold", color: "#0673bd", align: "right", lineHeight: 1.8 });
  drawText(ctx, `${cert_name}\nTo Whom It May Concern`, 700, 830, { font: "50px Oswald-Bold", color: "#1272b3", align: "center", lineHeight: 1.8 });
  drawText(ctx, text, 50, 900, { font: "35px Oswald-Medium", lineHeight: 1.9, maxWidth: 1310 });

  if (application.application_type === "heirship") {
    const headerY = 1140;
    let rowY = 1180;
    const cols = { name: 50, guardian: 400, address: 800, relation: 1180, age: 1310 };

    ["Name", "Father/Husband", "Address", "Relation", "Age"].forEach((label, i) => {
      drawText(ctx, label, Object.values(cols)[i], headerY, { font: "28px Oswald-Bold" });
    });

    for (const s of application.successor || []) {
      drawText(ctx, s.name, cols.name, rowY, { font: "26px Oswald-Medium" });
      drawText(ctx, s.gurdian_name, cols.guardian, rowY, { font: "26px Oswald-Medium" });
      drawText(ctx, s.address || "-", cols.address, rowY, { font: "20px Oswald-Medium" });
      drawText(ctx, s.relation, cols.relation, rowY, { font: "26px Oswald-Medium" });
      drawText(ctx, String(s.age), cols.age, rowY, { font: "26px Oswald-Medium" });
      rowY += 35;
    }
  }

  drawText(ctx, `Date: ${new Date(data.issue_date).toLocaleDateString("en-GB")}`, 1350, 630, { font: "28px Oswald-Bold", color: "#000", align: "right" });
  drawText(ctx, `Certificate No: ${data.certificate_no}`, 50, 630, { font: "28px Oswald-Bold", color: "#000" });
  drawText(ctx, `Pradhan\n${office.name}`, 1135, 1920, { font: "30px Oswald-Medium", color: "#000", align: "center" });

  const signature = await Signature.findOne({ office: data.office, person: "Pradhan" });
  if (signature?.image) {
    const signImg = await loadImage(path.join(process.cwd(), signature.image));
    ctx.drawImage(signImg, 870, canvas.height - 310, 500, 200);
  }

  const qrDataUrl = await QRCode.toDataURL(data.certificate_no, { width: 150 });
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, 90, canvas.height - 250, 150, 150);

  const buffer = canvas.toBuffer("image/png");

  if (req.query.download) res.setHeader("Content-Disposition", `attachment; filename="${data.certificate_no}.png"`);
  res.setHeader("Content-Type", "image/png");
  return res.send(buffer);
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
