import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Gallery } from "../models/gallery.model.js";
import { AboutUs } from "../models/about_us.model.js";
import { Service } from "../models/service.model.js";
import { Staff } from "../models/staff.model.js";
import { Office } from "../models/office.model.js";
import { Notice } from "../models/notice.model.js";
import { Faq } from "../models/faq.model.js";
import { CantactUs } from "../models/contact_us.model.js";
import { Ads } from "../models/ads.model.js";
import { Social } from "../models/social.model.js";
import { Grievance } from "../models/grievance.model.js";
import { Activity } from "../models/activity.model.js";
import { People } from "../models/people.model.js";
import { VideoGallery } from "../models/video_gallery.model.js";
import { Enquiry } from "../models/enquiry.model.js";
import { Package } from "../models/package.model.js";
import { Bank } from "../models/bank.model.js";
import { Heading } from "../models/heading.model.js";
import { UsefulLink } from "../models/usefullink.model.js";
import { Counter } from "../models/counter.model.js";
import deleteFile from "../utils/DeleteFile.js";

export const getGallery = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      const gallery = await Gallery.find({ _id: id, office: req.office._id, is_active: true });
      return res.json(new ApiResponse(200, gallery, "Gallery Data fetched."));
    }

    const gallery = await Gallery.find({ office: req.office._id, is_active: true }).sort({ createdAt: -1 });
    return res.json(new ApiResponse(200, gallery, "Gallery Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getAbout = asyncHandler(async (req, res) => {
  try {
    const about = await AboutUs.findOne({ office: req.office._id, is_active: true });
    return res.json(new ApiResponse(200, about, "About data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getSocials = asyncHandler(async (req, res) => {
  try {
    const service = await Social.find({ office: req.office._id });
    return res.json(new ApiResponse(200, service, "Socials Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getService = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      const service = await Service.find({ _id: id, office: req.office._id, is_active: true });
      return res.json(new ApiResponse(200, service, "Service Data fetched."));
    }

    const service = await Service.find({ office: req.office._id, is_active: true }).sort({ createdAt: -1 });
    return res.json(new ApiResponse(200, service, "Service Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getStaff = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      const staff = await Staff.find({ _id: id, office: req.office._id }).populate("category");
      return res.json(new ApiResponse(200, staff, "Staff Data fetched."));
    }
    const staff = await Staff.find({ office: req.office._id }).populate("category", "name -_id").lean();
    return res.json(new ApiResponse(200, staff, "Staff Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getOfficeDetails = asyncHandler(async (req, res) => {
  const officeId = req.office;

  try {
    const office = await Office.findById(officeId).select("-_id -is_active -edited_by -__v -createdAt -updatedAt");
    return res.json(new ApiResponse(200, office, "Office Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getNotice = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    let currentDate = new Date();
    if (id) {
      const notice = await Notice.find({ _id: id, office: req.office });
      return res.json(new ApiResponse(200, notice, "Notice Data fetched."));
    }

    const notice = await Notice.find({ office: req.office, start_date: { $lte: currentDate }, expiry_date: { $gte: currentDate } })
      .sort("-start_date")
      .lean();
    return res.json(new ApiResponse(200, notice, "Notice Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getFaq = asyncHandler(async (req, res) => {
  try {
    const faq = await Faq.find({ office: req.office });
    return res.json(new ApiResponse(200, faq, "Faq Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const postContactUs = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    const contactUs = await CantactUs.create({ office: req.office, name, email, phone, message });
    return res.status(201).json(new ApiResponse(201, contactUs, "Contact Us Data Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getAds = asyncHandler(async (req, res) => {
  try {
    const ads = await Ads.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, ads, "Ads Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const postGrievance = asyncHandler(async (req, res) => {
  const { name, email, phone, location, message } = req.body;

  try {
    const grievance = await Grievance.create({ office: req.office, name, email, phone, location, message, file: req.file?.path });
    return res.status(201).json(new ApiResponse(201, grievance, "Grievance Data Added Successfully!"));
  } catch (error) {
    req.file && deleteFile(req.file?.path);
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getActivity = asyncHandler(async (req, res) => {
  try {
    const activity = await Activity.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, activity, "Activity Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getPeople = asyncHandler(async (req, res) => {
  try {
    const people = await People.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, people, "People Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getVideos = asyncHandler(async (req, res) => {
  try {
    const videos = await VideoGallery.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, videos, "Videos Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const postEnquiry = asyncHandler(async (req, res) => {
  req.body.office = req.office;

  try {
    const enquiry = await Enquiry.create(req.body);
    return res.status(201).json(new ApiResponse(201, enquiry, "Enquiry Data Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getPackage = asyncHandler(async (req, res) => {
  try {
    const packageData = await Package.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, packageData, "Package Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getBank = asyncHandler(async (req, res) => {
  try {
    const banks = await Bank.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, banks, "Bank Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Internal Server Error", error.message));
  }
});

export const getHeadings = asyncHandler(async (req, res) => {
  try {
    const headings = await Heading.findOne({ office: req.office }).select("-office").lean();
    return res.json(new ApiResponse(200, headings, "Headings Data fetched."));
  } catch (error) {}
});

export const getUsefulLinks = asyncHandler(async (req, res) => {
  try {
    const usefulLinks = await UsefulLink.find({ office: req.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, usefulLinks, "Useful Links Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Internal Server Error", error.message));
  }
});

export const getCounter = asyncHandler(async (req, res) => {
  try {
    const counter = await Counter.findOne({ office: req.office }).select("-office").lean();
    return res.json(new ApiResponse(200, counter, "Counter Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Internal Server Error", error.message));
  }
});
