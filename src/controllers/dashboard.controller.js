import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Office } from "../models/office.model.js";
import { AboutUs } from "../models/about_us.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Service } from "../models/service.model.js";
import { Category } from "../models/category.model.js";
import { Staff } from "../models/staff.model.js";
import { Gallery } from "../models/gallery.model.js";
import { Notice } from "../models/notice.model.js";
import { Faq } from "../models/faq.model.js";
import { CantactUs } from "../models/contact_us.model.js";
import { Ads } from "../models/ads.model.js";
import { Social } from "../models/social.model.js";
import { Grievance } from "../models/grievance.model.js";
import { Activity } from "../models/activity.model.js";
import { People } from "../models/people.model.js";
import { VideoGallery } from "../models/video_gallery.model.js";
import { Package } from "../models/package.model.js";
import { Bank } from "../models/bank.model.js";
import { Enquiry } from "../models/enquiry.model.js";
import { UsefulLink } from "../models/usefullink.model.js";
import { Counter } from "../models/counter.model.js";
import { Job } from "../models/job.model.js";
import { Recruitment } from "../models/recruitment.model.js";
import { uploadToR2, deleteFromR2 } from "../utils/r2Uploader.js";
import deleteFile from "../utils/DeleteFile.js";
import path from "path";

export const index = asyncHandler((req, res) => {
  return res.json(new ApiResponse(200, { user: req.user }, "Welcome to Dashboard"));
});

export const listOffices = asyncHandler(async (req, res) => {
  try {
    const officeData = await Office.findOne({ _id: req.user?.office, is_active: true }).select("-_id -is_active").lean();
    return res.json(new ApiResponse(200, officeData, "Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addOffice = asyncHandler((req, res) => {
  req.body.edited_by = req.user._id;

  Office.create(req.body)
    .then((newOffice) => {
      return res.status(201).json(new ApiResponse(201, newOffice, "Office Data Added Successfully!"));
    })
    .catch((error) => {
      return res.json(new ApiError(500, "Failed to Add Office into Database", error.message));
    });
});

//TODO: R2 implementation
export const updateOffice = asyncHandler(async (req, res) => {
  const oldOffice = await Office.findOne({ _id: req.user?.office, is_active: true });
  if (!oldOffice) {
    // Deleting the uploaded file
    for (const file in req.files) {
      let filePath = req.files[file][0].path;
      deleteFile(filePath);
    }
    return res.json(new ApiError(404, "Office not Found.", "Office not found or not Active."));
  }
  // Get the new file path if new files were uploaded
  if (Object.entries(req.files).length > 0) {
    //As req.files is an object
    let { logo, logo_alt, notification_bg_iamge, activity_bg_iamge } = req.files;
    // Checking Uploaded Files or Setting the old file path
    logo_alt ? (req.body.logo_alt = logo_alt[0].path) : (req.body.logo_alt = oldOffice.logo_alt);
    logo ? (req.body.logo = logo[0].path) : (req.body.logo = oldOffice.logo);
    notification_bg_iamge ? (req.body.notification_bg_iamge = notification_bg_iamge[0].path) : (req.body.notification_bg_iamge = oldOffice.notification_bg_iamge);
    activity_bg_iamge ? (req.body.activity_bg_iamge = activity_bg_iamge[0].path) : (req.body.activity_bg_iamge = oldOffice.activity_bg_iamge);
  } else {
    req.body.logo_alt = oldOffice.logo_alt;
    req.body.logo = oldOffice.logo;
    req.body.notification_bg_iamge = oldOffice.notification_bg_iamge;
    req.body.activity_bg_iamge = oldOffice.activity_bg_iamge;
  }

  try {
    req.body.edited_by = req.user?._id;
    const updatedOffice = await Office.findByIdAndUpdate(
      req.user?.office,
      {
        landmark: req.body.landmark,
        mobile: req.body.mobile,
        mobile_alt: req.body.mobile_alt,
        whatsapp: req.body.whatsapp,
        landline: req.body.landline,
        email: req.body.email,
        // banner: req.body.banner,
        logo: req.body.logo,
        logo_alt: req.body.logo_alt,
        notification_bg_iamge: req.body.notification_bg_iamge,
        activity_bg_iamge: req.body.activity_bg_iamge,
        edited_by: req.body.edited_by,
      },
      { new: true }
    );
    // Delete the old files only if new files were uploaded
    if (req.files) {
      if (req.files.logo_alt && oldOffice.logo_alt) {
        deleteFile(oldOffice.logo_alt);
      }
      if (req.files.logo && oldOffice.logo) {
        deleteFile(oldOffice.logo);
      }
      if (req.files.notification_bg_iamge && oldOffice.notification_bg_iamge) {
        deleteFile(oldOffice.notification_bg_iamge);
      }
      if (req.files.activity_bg_iamge && oldOffice.activity_bg_iamge) {
        deleteFile(oldOffice.activity_bg_iamge);
      }
    }
    return res.json(new ApiResponse(200, updatedOffice, "Office data updated!"));
  } catch (error) {
    // Delete the uploaded files
    for (const file in req.files) {
      let filePath = req.files[file][0].path;
      deleteFile(filePath);
    }
    return res.status(500).json(new ApiError(500, "Internal server error", error.message));
  }
});

export const deleteOffice = asyncHandler((req, res) => {
  Office.findByIdAndDelete(req.params.id)
    .then(() => {
      return res.json(new ApiResponse(200, {}, "Office Deleted!"));
    })
    .catch((error) => {
      return res.json(new ApiError(500, "Can not Delete the Office", error.message));
    });
});

export const listAbouts = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allAbouts = await AboutUs.find({ office });
    return res.json(new ApiResponse(200, allAbouts, "Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateAbout = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;

  try {
    const oldAbout = await AboutUs.findOne({ office: req.body.office });
    if (req.file) {
      const fileName = `office-management/about-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.image = fileUrl;
    }
    if (oldAbout) {
      const newAbout = await AboutUs.findOneAndUpdate(oldAbout._id, req.body, { new: true });
      return res.json(new ApiResponse(200, newAbout, "About Us Updated!"));
    } else {
      const newAbout = await AboutUs.create(req.body);
      return res.status(201).json(new ApiResponse(201, newAbout, "About Us Added Successfully!"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error", error.message));
  }
});

export const deleteAbout = asyncHandler((req, res) => {
  AboutUs.findByIdAndDelete(req.params.id)
    .then((about) => {
      about.image && deleteFromR2(about.image);
      return res.json(new ApiResponse(200, {}, "About Us Deleted!"));
    })
    .catch((error) => {
      return res.json(new ApiError(500, "Can not Delete the About Us", error.message));
    });
});

export const addBanner = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(new ApiError(400, "Invalid File", "Please upload a valid file."));
    }
    const office = await Office.findById(req.user?.office).select("banner");
    const filename = `office-management/banner-${office._id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const fileUrl = await uploadToR2(req.file.buffer, filename, req.file.mimetype);
    office.banner.push(fileUrl);
    await office.save();

    return res.status(201).json(new ApiResponse(201, office, "Banner Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteBanner = asyncHandler(async (req, res) => {
  try {
    const { index } = req.params;
    const office = await Office.findById(req.user?.office).select("banner");

    // Check if index is valid
    if (index < 0 || index >= office.banner.length) {
      return res.status(400).json(new ApiError(400, "Invalid File Index", "Please provide a valid index."));
    }
    let filePath = office.banner[index];
    office.banner.splice(index, 1);
    await office.save();
    deleteFromR2(filePath); //Deleting the file from R2

    return res.json(new ApiResponse(200, office, "Banner Deleted Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addVideoBanner = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(new ApiError(400, "Invalid File", "Please upload a valid file."));
    }
    const office = await Office.findById(req.user?.office);
    const oldVideo = office.video_banner;

    const fileName = `office-management/video-${office._id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const fileUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
    office.video_banner = fileUrl;
    await office.save();
    oldVideo && deleteFromR2(oldVideo);
    return res.status(201).json(new ApiResponse(201, office, "Video Banner Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listSocials = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const links = await Social.findOne({ office }).lean();

    return res.json(new ApiResponse(200, links, "Social Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addSocial = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  req.body.edited_by = req.user._id;
  try {
    let social = await Social.findOne({ office });
    //creating a new doc or updating the old one
    if (!social) {
      social = await Social.create({ ...req.body, office });
    } else {
      social = await Social.findOneAndUpdate({ office: office }, req.body, { new: true });
    }

    return res.status(201).json(new ApiResponse(201, social, "Social Link Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listServices = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allServices = await Service.find({ office }).sort({ updatedAt: -1 }).lean();
    return res.json(new ApiResponse(200, allServices, "Service Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addService = asyncHandler((req, res) => {
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;

  Service.create(req.body)
    .then((newService) => {
      return res.status(201).json(new ApiResponse(201, newService, "Service Added Successfully!"));
    })
    .catch((error) => {
      return res.status(500).json(new ApiError(500, "Failed to Add Service into Database", error.message));
    });
});

export const updateService = asyncHandler((req, res) => {
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;

  Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedService) => {
      return res.json(new ApiResponse(200, updatedService, "Service Data Updated!"));
    })
    .catch((error) => {
      return res.status(500).json(new ApiError(500, "Can not Update the Service", error.message));
    });
});

export const deleteService = asyncHandler((req, res) => {
  Service.findByIdAndDelete(req.params.id)
    .then(() => {
      return res.json(new ApiResponse(200, {}, "Service Deleted!"));
    })
    .catch((error) => {
      return res.status(500).json(new ApiError(500, "Can not Delete the Service", error.message));
    });
});

export const listCategory = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allCategories = await Category.find({ office }).sort({ updatedAt: -1 }).lean();
    return res.json(new ApiResponse(200, allCategories, "Category Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addCategory = asyncHandler(async (req, res) => {
  req.body.office = req.user?.office;
  try {
    const newCategory = await Category.create(req.body);
    return res.status(201).json(new ApiResponse(201, newCategory, "Category Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  req.body.office = req.user?.office;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(new ApiResponse(200, updatedCategory, "Category Data Updated!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, {}, "Category Deleted!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listStaffs = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allStaffs = await Staff.find({ office }).populate("category", "name").sort({ updatedAt: -1 }).lean();
    return res.json(new ApiResponse(200, allStaffs, "All Staff Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addStaff = asyncHandler(async (req, res) => {
  let category = await Category.findOne({ _id: req.body.category });
  if (!category) {
    return res.status(404).json(new ApiError(404, "Not Found!", "Office or Category Not Found!"));
  }

  if (req.file) {
    const fileName = `office-management/avatar-${Date.now()}${path.extname(req.file.originalname)}`;
    const fileUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
    req.body.avatar = fileUrl;
  }
  req.body.office = req.user?.office;
  req.body.edited_by = req.user._id;

  try {
    const newStaff = await Staff.create(req.body);
    return res.status(201).json(new ApiResponse(201, newStaff, "Staff Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Failed to Add Staff into Database", error.message));
  }
});

export const updateStaff = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(404).json(new ApiError(404, "Not Found!", "Office or Category Not Found!"));
  }
  const oldStaff = await Staff.findById(req.params.id);
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;
  if (req.file) {
    const fileName = `office-management/avatar-${Date.now()}${path.extname(req.file.originalname)}`;
    const fileUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
    req.body.avatar = fileUrl;
  }

  try {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.file && deleteFromR2(oldStaff.avatar);
    return res.json(new ApiResponse(200, updatedStaff, "Staff Data Updated!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Can not Update the Staff Data", error.message));
  }
});

export const deleteStaff = asyncHandler((req, res) => {
  Staff.findByIdAndDelete(req.params.id)
    .then((staff) => {
      staff?.avatar && deleteFromR2(staff.avatar);
      return res.json(new ApiResponse(200, {}, "Staff Deleted!"));
    })
    .catch((error) => {
      return res.status(500).json(new ApiError(500, "Can not Delete the Staff", error.message));
    });
});

export const listGallery = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allGallery = await Gallery.find({ office }).sort({ updatedAt: -1 }).lean();
    return res.json(new ApiResponse(200, allGallery, "Gallery Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addGallery = asyncHandler(async (req, res) => {
  try {
    req.body.edited_by = req.user._id;
    req.body.office = req.user?.office;
    if (req.file) {
      const fileName = `office-management/gallery-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.image = fileUrl;
    }

    const newGallery = await Gallery.create(req.body);
    return res.status(201).json(new ApiResponse(201, newGallery, "Gallery Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Failed to Add Gallery into Database", error.message));
  }
});

export const updateGallery = asyncHandler(async (req, res) => {
  try {
    req.body.edited_by = req.user._id;
    req.body.office = req.user?.office;

    const oldGallery = await Gallery.findById(req.params.id);
    if (req.file) {
      const fileName = `office-management/gallery-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.image = fileUrl;
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.file && deleteFromR2(oldGallery.image);
    return res.json(new ApiResponse(200, updatedGallery, "Gallery Data Updated!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Can not Update the Gallery Data", error.message));
  }
});

export const deleteGallery = asyncHandler((req, res) => {
  Gallery.findByIdAndDelete(req.params.id)
    .then((gallery) => {
      gallery?.image && deleteFromR2(gallery.image);
      return res.json(new ApiResponse(200, {}, "Gallery Deleted!"));
    })
    .catch((error) => {
      return res.status(500).json(new ApiError(500, "Can not Delete the Gallery", error.message));
    });
});

export const listNotice = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allNotices = await Notice.find({ office }).sort({ updatedAt: -1 }).lean();
    return res.json(new ApiResponse(200, allNotices, "Notices Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addNotice = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user?._id;
  req.body.office = req.user?.office;

  let office = await Office.findById(req.body.office);
  if (!office) {
    return res.status(404).json(new ApiError(404, "", "Office Not Found!"));
  }

  try {
    if (req.file) {
      const fileName = `office-management/notice-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.link = fileurl;
    }
    const newNotice = await Notice.create(req.body);
    return res.status(201).json(new ApiResponse(201, newNotice, "Notice Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateNotice = asyncHandler(async (req, res) => {
  let office = await Office.findById(req.user?.office);
  let oldNotice = await Notice.findById(req.params.id);
  if (!office || !oldNotice) {
    return res.status(404).json(new ApiError(404, "Not Found", "Office or Notice Not Found!"));
  }

  req.body.edited_by = req.user?._id;
  req.body.office = req.user?.office;

  try {
    if (req.file) {
      const fileName = `office-management/notice-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.link = fileurl;
    }
    const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.file && deleteFromR2(oldNotice.link);
    return res.json(new ApiResponse(200, updatedNotice, "Notice Data Updated!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Can not Update the Notice Data", error.message));
  }
});

export const deleteNotice = asyncHandler((req, res) => {
  Notice.findByIdAndDelete(req.params.id)
    .then((notice) => {
      notice?.link && deleteFromR2(notice.link);
      return res.json(new ApiResponse(200, {}, "Notice Deleted!"));
    })
    .catch((error) => {
      return res.status(500).json(new ApiError(500, "Can not Delete the Notice", error.message));
    });
});

export const listFaq = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allFaq = await Faq.find({ office });
    return res.json(new ApiResponse(200, allFaq, "Faq Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addFaq = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user?._id;
  req.body.office = req.user?.office;

  try {
    const newFaq = await Faq.create(req.body);
    return res.status(201).json(new ApiResponse(201, newFaq, "Faq Added Successfully!"));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateFaq = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user?._id;
  req.body.office = req.user?.office;

  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(new ApiResponse(200, updatedFaq, "Faq Updated Successfully!"));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteFaq = asyncHandler(async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, {}, "Faq Deleted Successfully!"));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listContactUs = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allContactUs = await CantactUs.find({ office }).lean();
    return res.json(new ApiResponse(200, allContactUs, "Contact Us Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateContactUs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contactUs = await CantactUs.findById(id);

  try {
    contactUs.status = req.body.status;
    contactUs.remarks = req.body.remarks;
    contactUs.save();
    return res.json(new ApiResponse(200, contactUs, "Contact Us Data Updated Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteContactUs = asyncHandler(async (req, res) => {
  try {
    await CantactUs.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, {}, "Contact Us Deleted Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listAds = asyncHandler(async (req, res) => {
  try {
    const ads = await Ads.find({ office: req.user?.office }).select("-office").sort("-createdAt").lean();
    return res.json(new ApiResponse(200, ads, "Ads Data fetched."));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addAds = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user?._id;
  req.body.office = req.user?.office;

  try {
    if (req.file) {
      const fileName = `office-management/ads-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.image = fileurl;
    }
    const newAd = await Ads.create(req.body);
    return res.status(201).json(new ApiResponse(201, newAd, "Ads Added Successfully!"));
  } catch (error) {
    req.file && deleteFile(req.file?.path);
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteAds = asyncHandler(async (req, res) => {
  try {
    const ad = await Ads.findByIdAndDelete(req.params.id);
    ad?.image && deleteFromR2(ad.image);
    return res.json(new ApiResponse(200, {}, "Ads Deleted Successfully!"));
  } catch (error) {
    return res.json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listGrievances = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allGrievances = await Grievance.find({ office }).sort({ updatedAt: -1 }).lean();
    return res.json(new ApiResponse(200, allGrievances, "Grievances Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const upadateGrievance = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOne({ _id: req.params.id, office: req.user?.office });

  try {
    grievance.status = req.body.status;
    grievance.remarks = req.body.remarks;
    grievance.save();
    return res.json(new ApiResponse(200, grievance, "Grievance Data Updated Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteGrievance = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOneAndDelete({ _id: req.params.id, office: req.user?.office });
  grievance.file && deleteFile(grievance.file);
  return res.json(new ApiResponse(200, {}, "Grievance Deleted Successfully!"));
});

export const listActivity = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allActivity = await Activity.find({ office }).sort({ createdAt: -1 }).lean();
    return res.json(new ApiResponse(200, allActivity, "Activity Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addActivity = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;
  if (req.file) {
    const fileName = `office-management/activity-${Date.now()}${path.extname(req.file.originalname)}`;
    const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
    req.body.image = fileurl;
  }

  try {
    const newActivity = await Activity.create(req.body);
    return res.status(201).json(new ApiResponse(201, newActivity, "Activity Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const editActivity = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  try {
    const oldActivity = await Activity.findOne({ _id: req.params.id, office: req.user?.office });
    if (!oldActivity) {
      return res.status(404).json(new ApiError(404, "Not Found", "Activity not found"));
    }
    if (req.file) {
      const fileName = `office-management/activity-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.image = fileurl;
    }

    const newActivity = await Activity.findOneAndUpdate(oldActivity._id, req.body, { new: true });
    req.file && deleteFromR2(oldActivity.image);

    return res.json(new ApiResponse(200, newActivity, "Activity Updated Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOneAndDelete({ _id: req.params.id, office: req.user?.office });
  activity?.image && deleteFromR2(activity.image);
  return res.json(new ApiResponse(200, {}, "Activity Deleted Successfully!"));
});

export const listPeoples = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allPeoples = await People.find({ office }).lean();
    return res.json(new ApiResponse(200, allPeoples, "Peoples Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

//TODO: R2 implementation
export const addPeople = asyncHandler(async (req, res) => {
  req.body.office = req.user?.office;
  if (req.file) {
    req.body.image = req.file.path;
  }

  try {
    const newPeople = await People.create(req.body);
    return res.status(201).json(new ApiResponse(201, newPeople, "People Added Successfully!"));
  } catch (error) {
    req.file && deleteFile(req.file.path);
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

//TODO: R2 implementation
export const editPeople = asyncHandler(async (req, res) => {
  try {
    const oldPeople = await People.findOne({ _id: req.params.id, office: req.user?.office });

    if (!oldPeople) {
      return res.status(404).json(new ApiError(404, "Not Found", "People not found"));
    }

    if (req.file) {
      req.body.image = req.file.path;
    }

    const newPeople = await People.findOneAndUpdate(oldPeople._id, req.body, { new: true });
    req.file && deleteFile(oldPeople.image);

    return res.json(new ApiResponse(200, newPeople, "Activity Updated Successfully!"));
  } catch (error) {
    req.file && deleteFile(req.file.path);
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deletePeople = asyncHandler(async (req, res) => {
  const people = await People.findOneAndDelete({ _id: req.params.id, office: req.user?.office });
  people.image && deleteFile(people.image);
  return res.json(new ApiResponse(200, {}, "People Deleted Successfully!"));
});

export const listVideos = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allVideos = await VideoGallery.find({ office }).sort("-createdAt").lean();
    return res.json(new ApiResponse(200, allVideos, "Videos Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

//TODO: R2 implementation
export const addVideo = asyncHandler(async (req, res) => {
  req.body.office = req.user?.office;

  try {
    const newVideo = await VideoGallery.create(req.body);
    return res.status(201).json(new ApiResponse(201, newVideo, "Video Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await VideoGallery.findOneAndDelete({ _id: req.params.id, office: req.user?.office });
  return res.json(new ApiResponse(200, {}, "Video Deleted Successfully!"));
});

export const listBanks = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allBanks = await Bank.find({ office }).sort("-createdAt").lean();
    return res.json(new ApiResponse(200, allBanks, "Bank Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

//TODO: R2 implementation
export const addBank = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;

  if (req.file) {
    req.body.qr = req.file.path;
  }

  try {
    const newBank = await Bank.create(req.body);
    return res.status(201).json(new ApiResponse(201, newBank, "Activity Added Successfully!"));
  } catch (error) {
    req.file && deleteFile(req.file.path);
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

//TODO: R2 implementation
export const editBank = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  try {
    const oldBank = await Bank.findOne({ _id: req.params.id, office: req.user?.office });

    if (!oldBank) {
      return res.status(404).json(new ApiError(404, "Not Found", "Bank not found"));
    }

    if (req.file) {
      req.body.qr = req.file.path;
    }

    const newBank = await Bank.findOneAndUpdate(oldBank._id, req.body, { new: true });
    req.file && deleteFile(oldBank.qr);

    return res.json(new ApiResponse(200, newBank, "Bank Updated Successfully!"));
  } catch (error) {
    req.file && deleteFile(req.file.path);
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteBank = asyncHandler(async (req, res) => {
  const bank = await Bank.findOneAndDelete({ _id: req.params.id, office: req.user?.office });
  bank.qr && deleteFile(bank.qr);
  return res.json(new ApiResponse(200, {}, "Bank Deleted Successfully!"));
});

export const listPackages = asyncHandler(async (req, res) => {
  const office = req.user?.office;
  try {
    const allPackages = await Package.find({ office }).sort("-createdAt").lean();
    return res.json(new ApiResponse(200, allPackages, "Package Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addPackage = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  req.body.office = req.user?.office;
  if (req.file) {
    const fileName = `office-management/package-${Date.now()}${path.extname(req.file.originalname)}`;
    const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
    req.body.image = fileurl;
  }

  try {
    const newPackage = await Package.create(req.body);
    return res.status(201).json(new ApiResponse(201, newPackage, "Package Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const editPackage = asyncHandler(async (req, res) => {
  req.body.edited_by = req.user._id;
  try {
    const oldPackage = await Package.findOne({ _id: req.params.id, office: req.user?.office });

    if (!oldPackage) {
      return res.status(404).json(new ApiError(404, "Not Found", "Package not found"));
    }
    if (req.file) {
      const fileName = `office-management/package-${Date.now()}${path.extname(req.file.originalname)}`;
      const fileurl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);
      req.body.image = fileurl;
    }

    const newPackage = await Package.findOneAndUpdate(oldPackage._id, req.body, { new: true });
    req.file && deleteFromR2(oldPackage.image);

    return res.json(new ApiResponse(200, newPackage, "Bank Updated Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deletePackage = asyncHandler(async (req, res) => {
  const dpackage = await Package.findOneAndDelete({ _id: req.params.id, office: req.user?.office });
  dpackage?.image && deleteFromR2(dpackage.image);
  return res.json(new ApiResponse(200, {}, "Package Deleted Successfully!"));
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const office = req.user?.office;

  try {
    const allEnquiries = await Enquiry.find({ office }).populate("package").sort("-updatedAt").lean();
    return res.json(new ApiResponse(200, allEnquiries, "Enquiry Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const enquiry = await Enquiry.findById(id);

  try {
    enquiry.status = req.body.status;
    enquiry.remarks = req.body.remarks;
    enquiry.save();
    return res.json(new ApiResponse(200, enquiry, "Enquiry Data Updated Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, {}, "Enquiry Deleted Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listUseFulLinks = asyncHandler(async (req, res) => {
  try {
    const links = await UsefulLink.find({ office: req.user?.office }).sort("-createdAt").lean();
    return res.json(new ApiResponse(200, links, "Links Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const createUsefulLinks = asyncHandler(async (req, res) => {
  try {
    const newLinks = await UsefulLink.create({ ...req.body, office: req.user?.office });
    return res.status(201).json(new ApiResponse(201, newLinks, "Links Added Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateUsefulLinks = asyncHandler(async (req, res) => {
  try {
    const oldLinks = await UsefulLink.findOne({ _id: req.params.id, office: req.user?.office });
    if (!oldLinks) {
      return res.status(404).json(new ApiError(404, "Not Found", "Links not found"));
    }
    const newLinks = await UsefulLink.findOneAndUpdate(oldLinks._id, req.body, { new: true });
    return res.json(new ApiResponse(200, newLinks, "Links Updated Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteUsefulLinks = asyncHandler(async (req, res) => {
  try {
    await UsefulLink.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, {}, "Links Deleted Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const listCounter = asyncHandler(async (req, res) => {
  try {
    const counters = await Counter.findOne({ office: req.user?.office }).lean();
    return res.json(new ApiResponse(200, counters, "Counter Data fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const createCounter = asyncHandler(async (req, res) => {
  const { text, value } = req.body;
  const office = req.user?.office;

  try {
    let counter = await Counter.findOne({ office: office });

    if (!counter) {
      counter = new Counter({
        office: office,
        counter: [{ text, value }],
      });
      // Save the new counter to the database if it doesn't exist
      const createdCounter = await counter.save();
      return res.status(201).json(new ApiResponse(201, createdCounter, "Counter Created Successfully!"));
    }

    // Check if the counter already has 4 items
    // if (counter.counter.length >= 4) {
    //   return res.status(400).json(new ApiError(400, "Counter Limit Exceeded", "You can only add 4 items to the counter."));
    // }
    counter.counter.push({ text, value });
    const updatedCounter = await counter.save();
    res.status(201).json(new ApiResponse(201, updatedCounter, "Counter Created Successfully!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateCounter = asyncHandler(async (req, res) => {
  try {
    const { counterItemId } = req.params;
    const { text, value } = req.body;

    // Find the counter and update the specific counter item
    const updatedCounter = await Counter.findOneAndUpdate(
      { office: req.user?.office, "counter._id": counterItemId },
      {
        $set: {
          "counter.$.text": text,
          "counter.$.value": value,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedCounter) {
      return res.status(404).json(new ApiError(404, "Not Found", "Counter not found"));
    }

    res.status(200).json(new ApiResponse(200, updatedCounter, "Counter Updated Successfully!"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteCounter = asyncHandler(async (req, res) => {
  try {
    const { counterItemId } = req.params;
    const deletedCounter = await Counter.findOneAndUpdate(
      { office: req.user?.office },
      {
        $pull: {
          counter: { _id: counterItemId },
        },
      },
      { new: true }
    );

    if (!deletedCounter) {
      return res.status(404).json(new ApiResponse(404, "Not Found", "Counter not found"));
    }
    return res.json(new ApiResponse(200, deletedCounter, "Counter Deleted Successfully!"));
  } catch {
    return res.status(500).json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const addJob = asyncHandler(async (req, res) => {
  try {
    const officeId = req.user?.office;

    if (!officeId) {
      return res
        .status(400)
        .json(new ApiError(400, "Office not found", "Authenticated user does not have an office assigned."));
    }

    const { office, ...jobBody } = req.body;

    const job = await Job.create({
      ...jobBody,
      office: officeId,
    });

    return res.json(
      new ApiResponse(201, job, "Job Created Successfully!")
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const jobList = asyncHandler(async (req, res) => {
  try {

    const jobs = await Job.find({
      office: req.user?.office,
    }).sort({ createdAt: -1 });

    return res.json(
      new ApiResponse(200, jobs, "Job List Fetched Successfully!")
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const singleJob = asyncHandler(async (req, res) => {
  try {

    const { jobId } = req.params;

    const job = await Job.findOne({
      _id: jobId,
      office: req.user?.office,
    });

    if (!job) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Not Found", "Job not found"));
    }

    return res.json(
      new ApiResponse(200, job, "Job Details Fetched Successfully!")
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const updateJob = asyncHandler(async (req, res) => {
  try {

    const { jobId } = req.params;

    const updatedJob = await Job.findOneAndUpdate(
      {
        _id: jobId,
        office: req.user?.office,
      },
      req.body,
      { new: true }
    );

    if (!updatedJob) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Not Found", "Job not found"));
    }

    return res.json(
      new ApiResponse(200, updatedJob, "Job Updated Successfully!")
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteJob = asyncHandler(async (req, res) => {
  try {

    const { jobId } = req.params;

    const deletedJob = await Job.findOneAndDelete({
      _id: jobId,
      office: req.user?.office,
    });

    if (!deletedJob) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Not Found", "Job not found"));
    }

    return res.json(
      new ApiResponse(200, deletedJob, "Job Deleted Successfully!")
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const getAllApplications = asyncHandler(async (req, res) => {
  try {

    const applications = await Recruitment.find({
      office: req.user?.office
    })
      .populate("jobId", "jobTitle jobType")
      .sort({ createdAt: -1 });

    const formattedApplications = applications.map((app) => ({
      _id: app._id,
      name: app.name,
      contactNo: app.contactNo,
      gender: app.gender,
      experienceInYears: app.experienceInYears,
      education: app.education,
      status: app.status,
      appliedAt: app.createdAt,

      jobTitle: app.jobId?.jobTitle,
      jobType: app.jobId?.jobType,

      // Already full CDN URL saved in DB
      image: app.image || null,
      cv: app.cv || null
    }));

    return res.json(
      new ApiResponse(
        200,
        formattedApplications,
        "Applications fetched successfully!"
      )
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const changeApplicationStatus = asyncHandler(async (req, res) => {
  try {

    const applicationId = req.params?.applicationId || req.params?.id;
    const { status } = req.body;

    if (!applicationId) {
      return res
        .status(400)
        .json(new ApiError(400, "Bad Request", "Application id is required."));
    }

    const updatedApplication = await Recruitment.findOneAndUpdate(
      {
        _id: applicationId,
        office: req.user?.office
      },
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Not Found", "Application not found"));
    }

    return res.json(
      new ApiResponse(
        200,
        updatedApplication,
        "Application status updated successfully!"
      )
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});

export const deleteApplication = asyncHandler(async (req, res) => {
  try {

    const applicationId = req.params?.applicationId || req.params?.id;

    if (!applicationId) {
      return res
        .status(400)
        .json(new ApiError(400, "Bad Request", "Application id is required."));
    }

    const deletedApplication = await Recruitment.findOneAndDelete({
      _id: applicationId,
      office: req.user?.office
    });

    if (!deletedApplication) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Not Found", "Application not found"));
    }

    return res.json(
      new ApiResponse(
        200,
        deletedApplication,
        "Application deleted successfully!"
      )
    );

  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error.message));
  }
});



