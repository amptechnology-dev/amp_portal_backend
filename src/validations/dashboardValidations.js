import * as yup from "yup";
import mongoose from "mongoose";

export const aboutSchema = yup.object({
  description: yup.string().max(2000, "Maximum 2000 characters allowed").required(),
  video: yup
    .string()
    .url("Please enter a valid url")
    .matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, { message: "Please enter a YouTube url.", excludeEmptyString: true }),
});

export const socialSchema = yup.object({
  facebook: yup.string().url("Please enter a valid url"),
  twitter: yup.string().url("Please enter a valid url"),
  linkedin: yup.string().url("Please enter a valid url"),
  instagram: yup.string().url("Please enter a valid url"),
  youtube: yup.string().url("Please enter a valid url"),
});

export const serviceSchema = yup.object({
  name: yup.string().required("Name of the service is required"),
  description: yup.string().max(250, "Maximum 250 characters allowed").required(),
  logo: yup.string(),
  url: yup.string().url("Please enter a valid url"),
});

export const staffSchema = yup.object({
  name: yup.string().required("Name of the staff is required."),
  age: yup.number("Please enter a valid age").max(90, "Age cannot be greater than 90.").min(18, "Age cannot be less than 18.").round(),
  gender: yup
    .string()
    // .required("Please choose a valid gender.")
    .matches(/(male|female|other)/, "Please choose a valid gender.")
    .lowercase(),
  email: yup.string().email("Please enter a valid email").trim(),
  // designation: yup.string().required("Please choose a valid designation"),
  mobile: yup
    .string()
    .matches(/^[2-9]{1}[0-9]{9}$/, "Please enter a valid mobile number")
    // .required("Mobile number is required")
    .trim(),
  mobile_alt: yup.string().matches(/^[2-9]{1}[0-9]{9}$/, "Please enter a valid mobile number"),
  category: yup
    .string()
    .required("Please choose a valid category")
    .test("is-objectid", "${path} is not a valid ObjectId", (value) => value === undefined || mongoose.Types.ObjectId.isValid(value)),
});

export const gallerySchema = yup.object({
  category: yup.string().max(100, "Maximum 100 characters allowed"),
  description: yup.string().max(500, "Maximum 500 characters allowed").required(),
});

export const noticeSchema = yup.object({
  title: yup.string().required("Notice Title is requred").max(150, "Notice title can be 150 charecters long.").trim(),
  // link: yup.string().url("Notice Link is not a valid Link.").trim(),
  start_date: yup.date().required("Start Date is required").typeError("Start Date is not a valid date."),
  expiry_date: yup.date().required("Expiry Date is required").typeError("Expiry Date is not a valid date.").min(yup.ref("start_date"), "Expiry Date must be after Start Date"),
});

export const faqSchema = yup.object({
  question: yup.string().required().max(250, "Maximum 250 characters allowed").trim(),
  answer: yup.string().required().trim(),
});

export const adsSchema = yup.object({
  title: yup.string().required().max(100, "Maximum 100 characters allowed").trim(),
  url: yup.string().url("Please enter a valid url").trim(),
});

export const activitySchema = yup.object({
  title: yup.string().required().max(100, "Maximum 100 characters allowed").trim(),
  description: yup.string().max(500, "Maximum 500 characters allowed").trim(),
});

export const packageSchema = yup.object({
  name: yup.string().required("Name is required").max(100, "Maximum 100 characters allowed").trim(),
  description: yup.string(),
  price: yup.number().required("Price is required").typeError("Price must be a number"),
  place: yup.string().required("Place is required").trim(),
  duration: yup.string().required("Duration is required"),
  persons: yup.number().required("Number of persons is required").typeError("Persons must be a number"),
  discount: yup.number().typeError("Discount must be a number"),
  left: yup.number().typeError("Left must be a number"),
});
