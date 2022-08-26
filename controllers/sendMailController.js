const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;
require("dotenv").config();

const myOAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

myOAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendMail = async (email, subject, text, html) => {
  //   const accessToken = await myOAuth2Client.getAccessToken();
  // console.log(accessToken);
  //   const transport = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       type: "OAuth2",
  //       user: "mubashirarif4770@gmail.com", //your gmail account you used to set the project up in google cloud console"
  //       clientId: process.env.CLIENT_ID,
  //       clientSecret: process.env.CLIENT_SECRET,
  //       refreshToken: process.env.REFRESH_TOKEN,
  //       accessToken: accessToken, //access token variable we defined earlier
  //     },
  //   });
  //   try {
  //     const mailOptions = {
  //       from: "COUNTDOWN REALESTATE WEBSITE <mubashirarif4770@gmail.com>",
  //       to: email,
  //       subject: subject,
  //       text: text,
  //       html: html,
  //     };
  //     const result = await transport.sendMail(mailOptions);
  //     return result;
  //   } catch (e) {
  //     console.log(e.message);
  //   }
};

const transporter = (email, password) =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

const sendEmail = async ({ from, to, subject, text, template, cc = null }) => {
  try {
    if (!to) {
      console.log(`user doesn't have email associated with his account`);
      return;
    }

    // let emailer = transporter(
    //   "ghazanfarmalik345@gmail.com",
    //   "tljbhfnlsgmsvrxa"
    // );

    // let emailer = transporter(
    //   "kenil201446@gmail.com",
    //   "ljanyzaefamhhocp"
    // );
    let emailer = transporter(
      "gulzaibshabbir786@gmail.com",
      "hanwtnkkcxwkckcd"
    );

    var mailOptions = {
      from: '"Property" <' + to + ">",
      to,
      subject,
      // text: "Hello text",
      html: template,
    };
    emailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("error sending mail", err);
      } else {
        console.log(`email sent successfully at ${to}`);
      }
    });
  } catch (error) {}
};

module.exports = { sendMail, sendEmail };
