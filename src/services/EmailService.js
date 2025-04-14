const nodemailer = require("nodemailer");
const ejs = require("ejs");
const env = require("../config/environment");

const sendEmailService = async (email, attached, template) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465, false for other ports
      // service: env.Email_Service,
      auth: {
        user: env.Email_UserName,
        pass: env.Email_PassWord,
      },
    });

    // Render template bằng EJS với dữ liệu
    const html = ejs.render(template, { attached });

    // Gửi email
    const info = await transporter.sendMail({
      from: `${attached.title} <${env.Email_UserName}>`, // Địa chỉ email người gửi
      to: email, // Địa chỉ email người nhận
      subject: attached.title, // Chủ đề email
      html: html, // Nội dung HTML của email
    });

    return info;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmailService;
