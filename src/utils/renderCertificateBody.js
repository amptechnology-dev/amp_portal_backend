import puppeteer from "puppeteer";
import QRCode from "qrcode";

// ---------- Number to Words (Indian numbering system) ----------
const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const twoDigits = (n) => {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
};

const threeDigits = (n) => {
  if (n < 100) return twoDigits(n);
  return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
};

export const numberToWords = (num) => {
  num = Math.round(Number(num) || 0);
  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  const parts = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(" ") + " Only";
};

// ---------- HTML escape ----------
const escapeHtml = (str = "") =>
  String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "");

// ---------- Guardian relation helper (S/O, D/O, W/O) ----------
const buildGuardianRelation = (guardian_type, gender) => {
  if (!guardian_type) return "";
  const map = {
    Father: gender === "Female" ? "D/O" : "S/O",
    Husband: "W/O",
    Mother: gender === "Female" ? "D/O" : "S/O",
  };
  return map[guardian_type] || guardian_type;
};

// ---------- Successor table (Heirship) ----------
const SUCCESSOR_TABLE_TOKEN = "###SUCCESSOR_TABLE###";

const buildSuccessorTableHtml = (successors = []) => {
  if (!successors.length) return "";
  const rows = successors
    .map(
      (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.name || "")}</td>
        <td>${escapeHtml(s.relation || "")}</td>
        <td>${escapeHtml(String(s.age ?? ""))}</td>
        <td>${escapeHtml(s.address || "")}</td>
      </tr>`
    )
    .join("");

  return `
  <table class="successor-table">
    <thead>
      <tr>
        <th>Sl No</th>
        <th>Name of Successor</th>
        <th>Relation With Deceased</th>
        <th>Age</th>
        <th>Address of Successor</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
};

// ---------- Render certificate body (replace {{placeholders}}) ----------
export const renderCertificateBody = (templateBody, data) => {
  const { application, office, successors = [] } = data;

  const values = {
    // Personal (common)
    name: application.name || application.owner_name,
    father_name: application.guardian_name,
    guardian_name: application.guardian_name,
    guardian_relation: buildGuardianRelation(application.guardian_type, application.gender),
    id_no: application.id_no,
    bpl_number: application.id_no,
    gender: application.gender,
    caste: application.caste,
    sub_caste: application.sub_caste,

    // Address / jurisdiction (common)
    village: data.village_name,
    village_name: data.village_name,
    post_office: data.post_office_name,
    post_office_name: data.post_office_name,
    police_station: data.police_station_name,
    police_station_name: data.police_station_name,
    district: application.district,
    district_name: application.district,
    jurisdiction: application.gp || office?.block || "",
    sansad: data.sansad_name,
    sansad_name: data.sansad_name,

    // Office
    office_name: office?.name,
    pradhan_name: office?.pradhan_name,
    upa_pradhan_name: office?.upa_pradhan_name,

    // Financial
    yearly_income: application.yearly_income,
    yearly_income_words: numberToWords(application.yearly_income),

    // ---- Land NOC specific ----
    dag_no: application.dag_no,
    khatian_no: application.khatian_no,
    jl_no: application.jl_no,
    mouza: data.mouza_name,
    land_area: application.land_area,
    chatak: application.chatak,
    sq_feet: application.sq_feet,
    ward_sansad: data.sansad_name,
    owner_name: application.owner_name,
    relation_with: application.relation_with,
    relation_with_name: application.relation_with_name,
    from_land_type: application.from_land_type,
    to_land_type: application.to_land_type,
    land_used_as: application.land_used_as,

    // ---- Burning specific ----
    deceased_name: application.deceased_name,
    memo_no: application.memo_no,
    memo_date: formatDate(application.memo_date),
    certificate_type_label: application.certificate_type,
    resident_type: application.resident_type === "TENANT" ? "Tenant" : "Permanent Resident",
    died_on: formatDate(application.died_on),
    burnt_buried_on: formatDate(application.burnt_buried_on),
    place: application.place,
    pin_code: application.pin_code,
    issued_to: application.issued_to,
    relation_with_deceased: application.relation_with_deceased,

    // ---- Heirship specific ----
    deceased_date_of_death: formatDate(application.doe),
    successor_table: successors.length ? SUCCESSOR_TABLE_TOKEN : "",

    // Meta
    date: new Date().toLocaleDateString("en-IN"),
  };

  return templateBody.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (values[key] === undefined || values[key] === null || values[key] === "") {
      console.warn(`[renderCertificateBody] Unresolved placeholder: {{${key}}}`);
      return "";
    }
    return values[key];
  });
};

// ---------- Puppeteer browser reuse ----------
let browserPromise = null;
const getBrowser = () => {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
};

// ---------- Render certificate PDF ----------
export const renderCertificatePDF = async ({
  title,
  office,
  bodyText,
  certificate_no,
  signatureUrl,
  successors = [],
  issue_date = new Date(),
}) => {
  const qrDataUrl = await QRCode.toDataURL(certificate_no, { margin: 1, width: 160 });

  const dateStr = new Date(issue_date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let bodyHtml = escapeHtml(bodyText).replace(/\n/g, "<br/>");
  // successor table token was inserted before escaping (plain text, no special chars), so replace after escape:
  bodyHtml = bodyHtml.replace(SUCCESSOR_TABLE_TOKEN, buildSuccessorTableHtml(successors));

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica', Arial, sans-serif;
      margin: 0;
      padding: 45px 55px;
      color: #1a1a1a;
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 480px;
      left: 50%;
      transform: translateX(-50%);
      width: 380px;
      height: 380px;
      opacity: 0.06;
      z-index: 0;
    }
    .watermark img { width: 100%; height: 100%; object-fit: contain; }
    .content { position: relative; z-index: 1; }
    .header { text-align: center; margin-bottom: 4px; }
    .logo {
      width: 72px; height: 72px; border-radius: 50%;
      border: 2px solid #2b3a67; margin: 0 auto 8px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; background: #fff;
    }
    .logo img { width: 85%; height: 85%; object-fit: contain; }
    .office-of { letter-spacing: 3px; font-size: 12px; font-weight: bold; color: #2b3a67; }
    .office-name { font-size: 36px; font-weight: 800; color: #2f7fc1; margin: 2px 0; }
    .office-sub { font-size: 17px; font-weight: 600; color: #222; margin-bottom: 8px; }
    .divider { border: none; border-top: 2px solid #7d9cc4; margin: 4px 0 16px; }
    .bottom-divider { border: none; border-top: 2px solid #7d9cc4; margin-top: 24px; }
    .officials { display: flex; justify-content: space-between; font-size: 13px; color: #2f7fc1; margin-bottom: 18px; }
    .officials .col.right { text-align: right; }
    .officials .name { font-weight: bold; }
    .officials .role { color: #2f7fc1; }
    .officials .phone { color: #2f7fc1; }
    .meta { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: bold; color: #111; margin-bottom: 26px; }
    .cert-title { text-align: center; font-size: 23px; font-weight: bold; color: #2f7fc1; margin-bottom: 2px; }
    .cert-subtitle { text-align: center; font-size: 19px; font-weight: bold; color: #2f7fc1; margin-bottom: 30px; }
    .body-text { font-size: 14.5px; line-height: 2; text-align: justify; margin-bottom: 45px; }
    .successor-table { width: 100%; border-collapse: collapse; margin: 18px 0 40px; font-size: 12.5px; }
    .successor-table th, .successor-table td { border: 1px solid #444; padding: 6px 8px; text-align: left; }
    .successor-table th { background: #f0f3f8; font-weight: bold; }
    .signature-block { display: flex; justify-content: flex-end; margin-bottom: 60px; }
    .signature-block .sig-wrap { text-align: center; }
    .signature-block img.sig-img { height: 55px; object-fit: contain; margin-bottom: 2px; }
    .signature-block .sig-line { border-top: 1px solid #333; width: 190px; margin-top: 4px; padding-top: 4px; font-weight: bold; font-size: 13px; text-align: center; }
    .footer { display: flex; justify-content: flex-start; }
    .footer img { width: 95px; height: 95px; }
  </style>
  </head>
  <body>
    <div class="watermark">
      ${office?.logo ? `<img src="${office.logo}" />` : ""}
    </div>
    <div class="content">
      <div class="header">
        <div class="logo">${office?.logo ? `<img src="${office.logo}" />` : ""}</div>
        <div class="office-of">OFFICE OF THE</div>
        <div class="office-name">${escapeHtml(office?.name)}</div>
        <div class="office-sub">${escapeHtml(office?.area_name || "")}</div>
      </div>
      <hr class="divider" />
      <div class="officials">
        <div class="col">
          <div class="name">${escapeHtml(office?.pradhan_name)}</div>
          <div class="role">Pradhan</div>
          <div class="phone">${escapeHtml(office?.pradhan_mobile || "")}</div>
        </div>
        <div class="col right">
          <div class="name">${escapeHtml(office?.upa_pradhan_name)}</div>
          <div class="role">Upa-pradhan</div>
          <div class="phone">${escapeHtml(office?.upa_pradhan_mobile || "")}</div>
        </div>
      </div>
      <div class="meta">
        <div>No: ${escapeHtml(certificate_no)}</div>
        <div>Date: ${dateStr}</div>
      </div>
      <div class="cert-title">${escapeHtml(title)}</div>
      <div class="cert-subtitle">To Whom It May Concern</div>
      <div class="body-text">${bodyHtml}</div>
      <div class="signature-block">
        <div class="sig-wrap">
          ${signatureUrl ? `<img class="sig-img" src="${signatureUrl}" />` : `<div style="height:55px"></div>`}
          <div class="sig-line">Pradhan</div>
        </div>
      </div>
      <div class="footer">
        <img src="${qrDataUrl}" />
      </div>
      <hr class="bottom-divider" />
    </div>
  </body>
  </html>
  `;

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return pdfBuffer;
  } finally {
    await page.close();
  }
};