import { Office } from "../models/office.model.js";
import { User } from "../models/user.model.js";
import { Heading } from "../models/heading.model.js";
import deleteFile from "../utils/DeleteFile.js";
import jwt from "jsonwebtoken";

export const Login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user || !user.isActive) {
      console.log("User not found or inactive");
      return res.redirect("/admin/login");
    }
    const isPasswordCorrect = user.isPasswordCorrect(req.body.password);
    if (!isPasswordCorrect) {
      console.log("Incorrect password");
      return res.redirect("/admin/login");
    }

    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 600,
    });

    res
      .cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
      })
      .redirect("/admin/offices");
  } catch (error) {
    console.log(error);
    res.redirect(500, "/admin/login");
  }
};

export const Logout = (req, res) => {
  res.clearCookie("adminToken").redirect("/admin/login");
};

export const Offices = async (req, res) => {
  const offices = await Office.find();
  res.render("pages/offices", { offices });
};

export const addOffice = async (req, res) => {
  if (req.method === "POST") {
    try {
      const newOffice = await Office.create(req.body);
      return res.redirect(`/admin/office/info/${newOffice._id}`);
    } catch (error) {
      return res.render("pages/addOffice", { error: error.message });
    }
  }
  return res.render("pages/addOffice", { error: null });
};

export const officeInfo = async (req, res) => {
  const office = await Office.findById(req.params.id);
  res.render("pages/officeInfo", { office });
};

export const editOffice = async (req, res) => {
  const office = await Office.findById(req.params.id);
  res.render("pages/editOffice", { office, error: null });
};

export const updateOffice = async (req, res) => {
  try {
    if (req.body.is_active === "true") req.body.is_active = true;
    if (req.body.is_active === "false") req.body.is_active = false;

    const office = await Office.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/admin/office/info/${office._id}`);
  } catch (error) {
    return res.render("pages/editOffice", { error: error.message });
  }
};

export const deleteOffice = async (req, res) => {
  await Office.findByIdAndDelete(req.params.id);
  res.redirect("/admin/offices");
};

export const users = async (req, res) => {
  const users = await User.find({}).populate("office");
  res.render("pages/users", { users });
};

export const addUser = async (req, res) => {
  const allOffices = await Office.find();
  if (req.method === "POST") {
    try {
      await User.create(req.body);
      return res.redirect("/admin/users");
    } catch (error) {
      return res.render("pages/addUser", { allOffices, error: error.message });
    }
  }

  res.render("pages/addUser", { allOffices, error: null });
};

export const editUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate("office");
  if (req.method === "POST") {
    try {
      if (req.body.isActive === "true") req.body.isActive = true;
      if (req.body.isActive === "false") req.body.isActive = false;

      await User.findByIdAndUpdate(req.params.id, req.body);
      return res.redirect("/admin/users");
    } catch (error) {
      return res.render("pages/editUser", { user, error: error.message });
    }
  }

  res.render("pages/editUser", { user, error: null });
};

export const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("password");
    user.password = req.body.password;
    await user.save();
    res.redirect("/admin/users");
  } catch (error) {
    return res.render("pages/editUser", { error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin/users");
};

export const editSectionHeaders = async (req, res) => {
  try {
    const heading = await Heading.findOne({ office: req.params.id });
    res.render("pages/editSectionHeadings", { headings: heading || { office: req.params.id }, error: null });
  } catch (error) {
    res.render("pages/editSectionHeadings", { headings: { office: req.params.id }, error: error.message });
  }
};

export const updateSectionHeaders = async (req, res) => {
  try {
    await Heading.findOneAndUpdate({ office: req.params.id }, req.body, { upsert: true, new: true, runValidators: true });
    res.redirect("/admin/office/edit/headings/" + req.params.id);
  } catch (error) {
    return res.render("pages/editSectionHeadings", { headings: { ...req.body, office: req.params.id }, error: error.message });
  }
};

export const editBackgrounds = async (req, res) => {
  try {
    const heading = await Heading.findOne({ office: req.params.id });
    res.render("pages/editBackgrounds", { headings: heading || { office: req.params.id }, error: null });
  } catch (error) {
    res.render("pages/editBackgrounds", { headings: { office: req.params.id }, error: error.message });
  }
};

export const updateBackgrounds = async (req, res) => {
  try {
    if (req.files.headerImage) {
      req.body.headerImage = req.files.headerImage[0].path;
    }

    if (req.files.footerImage) {
      req.body.footerImage = req.files.footerImage[0].path;
    }

    const heading = await Heading.findOneAndUpdate({ office: req.params.id }, req.body, { upsert: true, runValidators: true });

    req.files.headerImage && deleteFile(heading.headerImage);
    req.files.footerImage && deleteFile(heading.footerImage);

    res.redirect("/admin/office/edit/backgrounds/" + req.params.id);
  } catch (error) {
    // Clean up any uploaded files in case of an error
    if (req.files) {
      req.files.headerImage && deleteFile(req.files.headerImage[0].path);
      req.files.footerImage && deleteFile(req.files.footerImage[0].path);
    }
    return res.render("pages/editBackgrounds", {
      headings: { ...req.body, office: req.params.id },
      error: error.message,
    });
  }
};
