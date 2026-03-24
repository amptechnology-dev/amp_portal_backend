import * as yup from "yup";

export const officeSchemaValidation = yup.object({
  landmark: yup.string().max(150).trim(),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile must be 10 digits long")
    .required(),
  mobile_alt: yup.string().matches(/^[0-9]{10}$/, "Mobile Alternative must be 10 digits long"),
  whatsapp: yup.string().matches(/^[0-9]{10}$/, "Whatsapp no must be 10 digits long"),
  landline: yup.string(),
  email: yup.string().email("Not a valid email").required(),
  block: yup.string(),
  district: yup.string(),
  start_date: yup.date().typeError("Start Date is not a valid date."),
  fin_year: yup.string().max(9),
  office_id: yup.number(),
  address_url: yup.string().url(),
});
