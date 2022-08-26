const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;
require("dotenv").config();

const myOAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
myOAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendMail = async (email, subject, text, html) => {
  const accessToken = await myOAuth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "mubashirarif4770@gmail.com", //your gmail account you used to set the project up in google cloud console"
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken, //access token variable we defined earlier
    },
  });
  try {
    const mailOptions = {
      from: "REALESTATE <mubashirarif4770@gmail.com>",
      to: email,
      subject: subject,
      text: text,
      html: html,
    };

    const result = await transport.sendMail(mailOptions);
    console.log(result);
    return result;
  } catch (e) {
    console.log(e);
  }
};

module.exports = { sendMail };
