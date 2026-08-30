import axios from "axios";

export const sendSms = async (mobile, message, templateId) => {
  try {
    const { data } = await axios.get("http://text.mboxsolution.com/sms-panel/api/http/index.php", {
      params: {
        username: process.env.SMS_USERNAME,
        apikey: process.env.SMS_API_KEY,
        apirequest: "Text",
        sender: process.env.SMS_SENDER_ID,
        mobile,
        message,
        route: "TRANS",
        TemplateID: templateId,
        format: "JSON",
      },
    });
    return data;
  } catch (error) {
    console.error("SMS sending failed:", error.message);
    return null;
  }
};