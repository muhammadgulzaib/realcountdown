const bcrypt = require("bcrypt");
const {
  Agent,
  Seller,
  Admin,
  PromotionalMessage,
  Bid,
  Buyer,
  Log,
  ReferralAgreement,
} = require("../models/Users");
const url = require("url");
const { EmailTemplate } = require("./EmailTemplate");
const { sendMail, sendEmail } = require("./sendMailController");
const {
  agentSchemaStepOne,
  agentSchemaStepTwo,
  agentSchemaStepThree,
  agentSchemaStepFour,
} = require("./../middleware/validation/user");
const {
  updateAgentCredentials,
  updatePassword,
} = require("./../middleware/validation/updateUser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sendData } = require("./helperFunction");
const path = require("path");
const { Chat } = require("./Chat");
const { date } = require("joi");
const { contentSecurityPolicy } = require("helmet");
const { log } = require("console");

// APIs here
const registerAgentStepOne = async (req, res) => {
  const {
    name,
    screenName,
    email,
    password,
    professionalCategory,
    professionalTitle,
    latitude,
    longitude
  } = req.body;

  if (
    !name ||
    !screenName ||
    !email ||
    !password ||
    !professionalCategory ||
    !professionalTitle
  ) {
    req.flash('formData',req.body);
    req.flash('error',"All fields are required!");
    return res.redirect('/agent/register/step1');
  }

  try {
    await agentSchemaStepOne.validateAsync(req.body);
  } catch (e) {
    req.flash('formData',req.body);
    req.flash('error',e.message);
    return res.redirect('/agent/register/step1');
  }

  // check for duplicate usernames in database
  const duplicate = await Agent.exists({ email: email });

  if (duplicate){
    req.flash('formData',req.body);
    req.flash('error','Another user with same email exists');
    return res.redirect('/agent/register/step1');
  }

  try {
    //   encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // store the new user

    const user = await Agent.create({
      name: name,
      screenName: screenName,
      email: email,
      password: hashedPassword,
      professionalTitle: professionalTitle,
      professionalCategory: professionalCategory,
      status: "not decided",
      createdAt: new Date(),
      updatedAt: new Date(),
      latitude,
      longitude
    });
    req.flash('success','Step 1 completed!');
    return res.redirect(
      url.format({
        pathname: "/agent/register/step2",
        query: {
          email: (await Agent.findOne({ email })).email,
        },
      })
    );
  } catch (err) {
    req.flash('formData',req.body);
    req.flash('error',err.message);
    return res.redirect('/agent/register/step1');
  }
};
const registerAgentStepOneWithEmailAndPassword = async (req, res) => {
  console.log("hello world frpom email and password");
  const {
    name,
    screenName,
    email,
    password,
    professionalCategory,
    professionalTitle,
  } = req.body;

  if (
    !name ||
    !screenName ||
    !email ||
    !password ||
    !professionalCategory ||
    !professionalTitle
  ) {
    req.flash('formData',req.body);
    req.flash('error',"All fields are required!");
    return res.redirect('/agent/register/step1');
  }

  try {
    await agentSchemaStepOne.validateAsync(req.body);
  } catch (e) {
    req.flash('formData',req.body);
    req.flash('error',e.message);
    return res.redirect('/agent/register/step1');
  }

  // check for duplicate usernames in database
  const duplicate = await Agent.exists({ email: email });

  if (duplicate) {
    req.flash('formData',req.body);
    req.flash('error','Another user with same email exists');
    return res.redirect('/agent/register/step1');
  }

  try {
    //   encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // store the new user

    const user = await Agent.create({
      name: name,
      screenName: screenName,
      email: email,
      password: hashedPassword,
      professionalTitle: professionalTitle,
      professionalCategory: professionalCategory,
      status: "not decided",
      invited: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    req.flash('success','Step 1 completed!');
    return res.redirect(
      url.format({
        pathname: "/agent/register/step2",
        query: {
          email: (await Agent.findOne({ email })).email,
        },
      })
    );
  } catch (err) {
    req.flash('formData',req.body);
    req.flash('error',err.message);
    return res.redirect('/agent/register/step1');
  }
};
const registerAgentStepTwo = async (req, res) => {
  const {
    email,
    city,
    timeZone,
    brokerageAddress,
    primaryPhone,
    brokeragePhone,
  } = req.body;
  console.log(req.body);
  if (
    !email ||
    !city ||
    !timeZone ||
    !brokerageAddress ||
    !primaryPhone ||
    !brokeragePhone
  ) {
    req.flash('formData',req.body);
    req.flash('error',"All fields are required!");
    return res.redirect("/agent/register/step2?email=" + (await Agent.findOne({ email })).email);
  }

  try {
    await agentSchemaStepTwo.validateAsync(req.body);
  } catch (e) {
    req.flash('formData',req.body);
    req.flash('error',e.message);
    return res.redirect("/agent/register/step2?email=" + (await Agent.findOne({ email })).email);
  }

  try {
    const user = await Agent.updateOne(
      { email: email },
      {
        city,
        timeZone,
        brokerageAddress,
        primaryPhone,
        brokeragePhone,
      }
    );
    req.flash('success','Step 2 completed!');
    return res.redirect(
      url.format({
        pathname: "/agent/register/step3",
        query: {
          email: (await Agent.findOne({ email })).email,
        },
      })
    );
  } catch (err) {
    req.flash('formData',req.body);
    req.flash('error',err.message);
    return res.redirect("/agent/register/step2?email=" + (await Agent.findOne({ email })).email);
  }
};
const registerAgentStepThree = async (req, res) => {  
  let {
    email,
    state,
    zipCode,
    description,
    license,
    serviceAreas,
    commision,
    option,
  } = req.body;
  if (option === "Yes" && commision <= 3) {
    commision = parseInt(commision);
  } else {
    commision = Number("3");
  }

  if (
    !email ||
    !state ||
    !zipCode ||
    !description ||
    !license ||
    !serviceAreas ||
    !commision
  ) {
    req.flash('formData',req.body);
    req.flash('error',"All fields are required!");
    return res.redirect("/agent/register/step3?email=" + (await Agent.findOne({ email })).email);
  }

  try {
    await agentSchemaStepThree.validateAsync({
      email,
      state,
      zipCode,
      description,
      license,
      serviceAreas,
      commision,
      option,
    });
  } catch (e) {
    req.flash('formData',req.body);
    req.flash('error',e.message);
    return res.redirect("/agent/register/step3?email=" + (await Agent.findOne({ email })).email);
  }

  try {
    const user = await Agent.updateOne(
      { email: email },
      {
        state,
        zipCode,
        description,
        license,
        serviceAreas,
        commision,
      }
    );
    req.flash('success','Step 3 completed!');
    return res.redirect(
      url.format({
        pathname: "/agent/register/step4",
        query: {
          email: (await Agent.findOne({ email })).email,
        },
      })
    );
  } catch (err) {
    req.flash('formData',req.body);
    req.flash('error',err.message);
    return res.redirect("/agent/register/step3?email=" + (await Agent.findOne({ email })).email);
  }
};
const registerAgentStepFour = async (req, res) => {
  const { email, reviewOne, reviewTwo, reviewThree } = req.body;

  if (!email || !reviewOne || !reviewTwo || !reviewThree) {
    req.flash('formData',req.body);
    req.flash('error',"All fields are required!");
    return res.redirect("/agent/register/step4?email=" + (await Agent.findOne({ email })).email);
  }

  try {
    await agentSchemaStepFour.validateAsync(req.body);
  } catch (e) {
    req.flash('formData',req.body);
    req.flash('error',e.message);
    return res.redirect("/agent/register/step4?email=" + (await Agent.findOne({ email })).email);
  }

  try {
    const user = await Agent.updateOne(
      { email: email },
      {
        reviewOne,
        reviewTwo,
        reviewThree,
        completed: "Completed",
      }
    );
    const agent = await Agent.findOne({ email: email });
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Agent Registered",
      template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}table, td{border: 1px solid black; border-collapse: collapse;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span> <h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3> </span> </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"> <b>New Agent Registered</b> </h5> <p>Dear Admin,</p><br/> <p> New agent has been registered, Please review there request and update the status. Below are the details: </p><table style="width: 60%;"> <tbody> <tr> <td>Name</td><td>${agent.name}</td></tr><tr> <td>Screen Name</td><td>${agent.screenName}</td></tr><tr> <td>Professional Category</td><td>${agent.professionalCategory}</td></tr><tr> <td>Professional Title</td><td>${agent.professionalTitle}</td></tr><tr> <td>Email</td><td>${agent.email}</td></tr><tr> <td>Phone</td><td>${agent.primaryPhone}</td></tr><tr> <td>State</td><td>${agent.state}</td></tr><tr> <td>City</td><td>${agent.city}</td></tr><tr> <td>Commision</td><td>${agent.commision}</td></tr><tr> <td>Brokerage Address</td><td>${agent.brokerageAddress}</td></tr><tr> <td>Brokerage Phone</td><td>${agent.brokeragePhone}</td></tr><tr> <td>Timezone</td><td>${agent.timeZone}</td></tr><tr> <td>Description</td><td>${agent.description}</td></tr><tr> <td>Date</td><td>${agent.createdAt}</td></tr></tbody> </table> <br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
    });
    await sendEmail({
      to: email,
      subject: "You Registration Was Successfull",
      template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Registration Completed</b></h5> <p>Dear ${agent.name},</p><br/> <p> You are successfully resgisterd as agent, Please wait for 24 hours for the admin to check your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
    });
    req.flash('success','Step 4 completed!');
    return res.redirect(`/agent/register-plan/${agent._id}`);
  } catch (err) {
    console.log(err.message);
    req.flash('formData',req.body);
    req.flash('error',err.message);
    return res.redirect("/agent/register/step4?email=" + (await Agent.findOne({ email })).email);
  }
};
const loginAgent = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('formData',req.body);
    req.flash('error',"Please provide email and password!");
    return res.redirect('/agent/');
  }
  let foundUser = await Agent.findOne({ email: email });
  if (!foundUser) {
    req.flash('error',"Account not found!");
    return res.redirect('/agent'); //Unauthorized
  } 

  //   Evaluate password
  const completed = (await Agent.findOne({ email: email })).completed;
  if (completed !== "Completed") {
    await Agent.deleteOne({ email: email });
    req.flash('error',"Unauthorized!");
    return res.redirect('/agent'); //Unauthorized
  }
  const match = await bcrypt.compare(password, foundUser.password);

  if (match && foundUser.status == "approved") {
    req.session.user = email;
    req.session.name = (await Agent.findOne({ email })).name;
    req.session.role = "agent";
    req.flash('success', 'Logged in successfully!');
    return res.redirect("/agent/main");
  } else if(match && foundUser.status !== "approved"){
    return res.render("errorpages/not-approved");
  } else {
    req.flash('formData',req.body);
    req.flash('error',"Invalid password!");
    return res.redirect('/agent/');
  }
};

const acceptBid = async (req, res) => {
  const { id, propertyID } = req.params;
  if (req.session.user && req.session.role == "agent") {
    let seller = await Seller.findOne({
      _id: id,
    });
    const sellerProp = await Seller.findOne(
      { _id: id, "properties._id": propertyID },
      "properties.$"
    );
    console.log(req.params, "=============");
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      await Bid.updateOne(
        {
          userId: id,
          agentId: agent._id,
          bidOnProperty: propertyID,
        },
        {
          $set: { status: "Accepted" },
        }
      );
      await sendEmail({
        to: seller.email,
        subject: "Invitation accepted",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation Accepted</b></h5> <p>Dear ${seller.name},</p><br/> <p> Your Invitation for property: <strong>${sellerProp.properties[0].propertyName}</strong> has been accepted by ${agent.name}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Agent Accepted seller invitaion {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Invitation accepted successfully!');
      return res.redirect("/agent/main");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/agent')
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};
const rejectBid = async (req, res) => {
  const { id, propertyID } = req.params;
  if (req.session.user && req.session.role == "agent") {
    let seller = await Seller.findOne({
      _id: id
    });
    const sellerProp = await Seller.findOne(
      { _id: id, "properties._id": propertyID },
      "properties.$"
    );
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      console.log(req.params, "==============");
      await Bid.updateOne(
        {
          userId: id,
          agentId: agent._id,
          bidOnProperty: propertyID,
        },
        {
          $set: { status: "Rejected" },
        }
      );
      await sendEmail({
        to: seller.email,
        subject: "Bid rejected",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation Rejected</b></h5> <p>Dear ${seller.name},</p><br/> <p> Your Invitation for property: <strong>${sellerProp.properties[0].propertyName}</strong> has been rejected by ${agent.name}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Agent rejected seller invitation {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Invitation rejected!');
      return res.redirect("/agent/main");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/agent');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};

const acceptBuyerBid = async (req, res) => {
  const { id, propertyID } = req.params;
  if (req.session.user && req.session.role == "agent") {
    let buyer = await Buyer.findOne({
      _id: id
    });
    const buyerProp = await Buyer.findOne(
      { _id: id, "properties._id": propertyID },
      "properties.$"
    );
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      await Bid.updateOne(
        {
          userId: id,
          agentId: agent._id,
          bidOnProperty: propertyID,
        },
        {
          $set: { status: "Accepted" },
        }
      );
      await sendEmail({
        to: buyer.email,
        subject: "Invitation accepted",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation Accepted</b></h5> <p>Dear ${buyer.name},</p><br/> <p> Your Invitation for property: <strong>${buyerProp.properties[0].area}</strong> has been accepted by ${agent.name}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Agent Accepted buyer invitaion {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Invitation accepted!');
      return res.redirect("/agent/main");
    } catch (err) {
      console.log(err);
      req.flash('error',err.message);
      return res.redirect('/agent');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};
const rejectBuyerBid = async (req, res) => {
  const { id, propertyID } = req.params;
  if (req.session.user && req.session.role == "agent") {
    let buyer = await Buyer.findOne({
      _id: id
    });
    const buyerProp = await Buyer.findOne(
      { _id: id, "properties._id": propertyID },
      "properties.$"
    );
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      console.log(req.params, "==============");
      await Bid.updateOne(
        {
          userId: id,
          agentId: agent._id,
          bidOnProperty: propertyID,
        },
        {
          $set: { status: "Rejected" },
        }
      );
      await sendEmail({
        to: buyer.email,
        subject: "Bid rejected",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation Rejected</b></h5> <p>Dear ${buyer.name},</p><br/> <p> Your Invitation for property: <strong>${buyerProp.properties[0].area}</strong> has been rejected by ${agent.name}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Agent rejected buyer invitation {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Invitation rejected!');
      return res.redirect("/agent/main");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect("/agent/");
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");

  }
};

const handleLogout = async (req, res) => {
  if (req.session.user) {
    req.session.destroy(function (err) {
      if (err) {
        req.flash('error',"Something went wrong!");
        return res.redirect('/agent/main');
      } else {
        return res.redirect("/agent/");
      }
    });
  } else {
    return res.redirect("/agent/");
  }
};

// const handleRefreshToken = async (req, res) => {
//   const cookies = req.cookies;
//   if (!cookies?.jwt) return res.sendStatus(401);
//   const refreshToken = cookies.jwt;

//   const foundUser = await Agent.exists({ refreshToken: refreshToken });
//   const foundUserCreds = await Agent.findOne({ refreshToken });

//   if (!foundUser) return res.sendStatus(403); //Forbidden
//   //   Evaluate jwt

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
//     if (err || foundUserCreds.email !== decoded.email)
//       return res.sendStatus(403);
//     const accessToken = jwt.sign(
//       {
//         email: decoded.email,
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "30s" }
//     );
//     res.json({ accessToken });
//   });
// };
const updateProfile = async (req, res) => {
  const { name, email, brokeragePhone, commision } = req.body;
  console.log(brokeragePhone);
  if (!brokeragePhone || !commision) {
    req.flash('error','All Fields are required');
    return res.redirect('/agent/edit-profile');
  }
  try {
    await updateAgentCredentials.validateAsync(req.body);
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/agent/edit-profile');
  }
  try {
    await Agent.updateOne(
      { email: req.session.user },
      {
        brokeragePhone,
        commision,
        updatedAt: new Date(),
      }
    );
    req.flash('success','Profile details updated!');
    res.redirect("/agent/edit-profile");
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/agent/edit-profile');
  }
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  console.log(password);
  if (!password) {
    req.flash('error','Password required!');
    return res.redirect('/agent/edit-profile');
  }
  try {
    await updatePassword.validateAsync(req.body);
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/agent/edit-profile');
  }
  try {
    const pwd = await bcrypt.hash(password, 10);
    await Agent.updateOne(
      { email: req.session.user },
      {
        pwd,
      }
    );
    req.flash('success','Profile details updated!');
    res.redirect("/agent/edit-profile");
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/agent/edit-profile');
  }
};
const changeProfilePicture = async (req, res) => {
  const { profilePicture } = req.body;
  if (req.session.user && req.session.role == "agent") {
    img = path.join(
      "/",
      profilePicture.split("/").at(-2),
      profilePicture.split("/").at(-1)
    );
    try {
      const data = await Agent.updateOne(
        { email: req.session.user },
        {
          profilePicture: img,
        }
      );
      req.flash('success','Profile image updated!');
      return res.redirect("/agent/edit-profile");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect("/agent/edit-profile");
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect('/agent');
  }
};
const saveCharityDetails = async (req, res) => {
  //charity implementation here
  const { id } = req.params;
  const { charity_name, charity_name_input } = req.body;
  try {
    if (charity_name_input === "") {
      await Agent.updateOne(
        { email: req.session.user },
        {
          "charity.firm": charity_name,
          donation: "10$",
        }
      );
    } else {
      await Agent.updateOne(
        { email: req.session.user },
        {
          "charity.firm": charity_name_input,
          donation: "10$",
        }
      );
    }
    req.flash('success','Donation updated!');
    if (id == 1) {
      return res.status(200).redirect("/agent/seller-countdown");
    } else if (id == 2) {
      return res.status(200).redirect("/agent/buyer-countdown");
    } else {
      return res.redirect("/agent/");
    }
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/agent/charity' + id);
  }
};
const bidForProperty = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { id, uid } = req.params;
    const { screenName, profilePicture, commision, id: agentId } = req.body;
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      //save the bid
      const seller = await Seller.findOne(
        { _id: uid, "properties._id": id },
        "properties.$"
      );
      const sellerDetail = await Seller.findOne({ _id: uid });

      const exist = await Bid.exists({
        agentId: agentId,
        userId: uid,
        bidOnProperty: id,
      });
      if (!exist) {
        if(!agent.countDownBidBalance || (agent.countDownBidBalance && agent.countDownBidBalance <= 0)){
          req.flash('error', 'Your bids limit exhausted, please buy another package!');
          return res.redirect('/agent/payment/1'); 
        }
        const bidCreated = await Bid.create({
          role: "Seller",
          agentId: agentId,
          userId: uid,
          bidOnProperty: id,
          agentProfilePicture: profilePicture,
          screenName: screenName,
          commision: commision,
          status: "Waiting",
          bidOverAt: seller.properties[0].countdownOverAt,
        });
        if(bidCreated){
          req.flash('success','Bid successfully created!');
          await Agent.updateOne({_id: agent._id},{
            $inc:{countDownBidBalance: -1}
          })
          await sendEmail({
            to: sellerDetail.email,
            subject: "Bid on property",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid on property</b></h5> <p>Dear ${sellerDetail.name},</p><br/> <p> ${agent.name}has bid on your property ${seller.properties[0].propertyName}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        }
      } else {
        const bid = await Bid.findOne({
          agentId: agentId,
          userId: uid,
          bidOnProperty: id,
        });
        if (bid.status === "Rejected") {
          await Bid.updateOne({
            agentId: agentId,
            userId: uid,
            bidOnProperty: id,
          },{
            $set:{
              screenName: screenName,
              commision: commision,
              status: "Waiting",
              bidOverAt: seller.properties[0].countdownOverAt,
            }
          })
          req.flash('success','Bid successfully created!');
          await sendEmail({
            to: sellerDetail.email,
            subject: "Bid on property",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid on property</b></h5> <p>Dear ${sellerDetail.name},</p><br/> <p> ${agent.name} has rebid on your property ${seller.properties[0].propertyName}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        } else if(bid.status === "Waiting") {
          req.flash('error', "You have already placed a bid. Please wait for the Seller's response.");
          return res.redirect("/agent/seller-countdown");
        }
      }
      return res.redirect("/agent/seller-countdown");
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect("/agent/");
    }
  } else {
    req.flash('error', 'Please login!');
    return res.redirect("/agent/");
  }
};

const updateBid = async (req, res) => {
  const { commision, id } = req.body;
  try {
    const data = await Agent.updateOne({ _id: id }, { commision: commision });
    return res.redirect("/agent/seller-countdown");
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/agent/charity');
  }
};
const chatWithAdmin = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { message } = req.body;
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      const agentId = agent._id;
      const admin = await Admin.findOne({});
      const adminId = admin._id;

      Chat(message, agentId, adminId, agentId)
        .then((data) => {
          sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "Chat notification",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear Admin,</p><br/> <p> You have received a chat message from ${agent.name}, with below details: </p><br><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
          return res.redirect("/agent/admin-chat");
        })
        .catch((err) => {
          {
            req.flash('error',err.message);
            return res.redirect('/agent/charity');
          }
        });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/agent/admin-chat');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};

const chatWithParticularRole = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    //sellerId
    const { id, state } = req.params;
    //message
    const { message } = req.body;
    const agent = await Agent.findOne({ email: req.session.user });
    let user;
    if(state == 1){
      user = await Seller.findOne({_id: id});
    } else {
      user = await Buyer.findOne({_id: id});
    }
    const agentId = agent._id;
    try {
      await Chat(message, id, agentId, agentId);
      // await sendEmail({
      //   to: user.email,
      //   subject: `Chat notification`,
      //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear ${user.name},</p><br/> <p> You have received a chat message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      // });
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Chat request`,
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has sent a chat message to ${user.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      req.flash('success','Message sent successfully!')
      if (state == 1) {
        return res.redirect(`/agent/chat/${id}/1`);
      } else if (state == 2) {
        return res.redirect(`/agent/chat/${id}/2`);
      }
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect(`/agent/chat/${id}/${state}`);
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};

// helper function
const findSellerPropertyCoundown = async (seller, id) => {
  return new Promise((resolve, reject) => {
    seller.bids.forEach((bid) => {
      bid?.propertyBelongsTo?.properties.forEach((property) => {
        resolve(property.countdownOverAt);
      });
    });
  });
};

const removePropertyIfNull = async (seller, _id) => {
  return new Promise((resolve) => {
    const arr = seller.bids.filter((prop) => prop.propertyBelongsTo !== _id);
    resolve(arr);
  });
};
const chatSeller = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    try {
      //sellerId
      const { id } = req.params;
      const { state } = req.params;
      //message
      const { message } = req.body;
      const agent = await Agent.findOne({ email: req.session.user });
      const agentId = agent._id;
      let user;
      if(state == 1){
        user = await Seller.findOne({_id: id});
      } else {
        user = await Buyer.findOne({_id: id});
      }
      try {
        await Chat(message, id, agentId, agentId);
        // await sendEmail({
        //   to: user.email,
        //   subject: `Chat notification`,
        //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear ${user.name},</p><br/> <p> You have received a chat message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        // });
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `Chat request`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has sent a chat message to ${user.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        req.flash('success','Message sent successfully!')
        if (state == 2) {
          return res.redirect(`/agent/buyer-chat`);
        } else {
          return res.redirect(`/agent/seller-chat`);
        }
      } catch (err) {
        if (state == 2) {
          req.flash('error',err.message);
          return redirect('/agent/buyer-chat');
        } else {
          req.flash('error',err.message);
          return redirect('/agent/seller-chat');
        }
      }
    } catch (err) {
      const { state } = req.params;
      if (state == 2) {
        req.flash('error',err.message);
        return redirect('/agent/buyer-chat');
      } else {
        req.flash('error',err.message);
        return redirect('/agent/seller-chat');
      }
    }
  } else {
    req.flash('error','Please login!');
    res.redirect("/agent/");
  }
};
const setPromotionalMessage = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { message } = req.body;
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      await PromotionalMessage.create({
        message,
        agentId: agent._id,
      });
      req.flash('success','Promotional message added!')
      return res.redirect("/agent/promotional-messages");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/agent/promotional-messages');
    }
  } else {
    req.flash('error','Please login!');
    res.redirect("/agent/");
  }
};
const setCharityBuyer = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    const { charityLocation } = req.body;
    try {
      await Agent.updateOne(
        { email: req.session.user },
        {
          $set: {
            "promotionalMessagesBuyer.charityLocation": charityLocation,
          },
        }
      );
      req.flash('success','Charity updated!');
      return res.redirect(`/agent/buyer-listing/${id}`);
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect(`/agent/charity-buyer/${id}`);
    }
  } else {
    req.flash('error', 'Please login!');
    return res.redirect("/agent/");
  }
};
const setCharitySeller = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    console.log(id);
    const { charityLocation } = req.body;
    try {
      await Agent.updateOne(
        { email: req.session.user },
        {
          $set: {
            "promotionalMessagesSeller.charityLocation": charityLocation,
          },
        }
      );
      req.flash('success','Charity updated!');
      return res.redirect(`/agent/seller-listing/${id}`);
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect(`/agent/charity-seller/${id}`);
    }
  } else {
    req.flash('error', 'Please login!');
    res.redirect("/agent/");
  }
};
const sendPromotionalMessage = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    try {
      const { checked } = req.body;
      const total = 0;
      total = Array.isArray(checked) ? checked.length : 1;
      const messages = await PromotionalMessage.find({});
      await PromotionalMessage.updateOne(
        { agentId: id },
        { $set: { count: messages.count + total } }
      );
      if (Array.isArray(checked)) {
        // checked.forEach(id=>{
        //     const data = await Buyer.findOne({_id:id})
        //     data.promotionalMessages.push({
        //     })
        // })
      }
    } catch (err) {
      return res.redirect("/agent/");
    }
  }
};
const setBuyerListing = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    const { checked } = req.body;
    const totalMessages = Array.isArray(checked) ? checked.length : 1;
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      const availableMessages = agent?.promotionalMessagePlan?.messages || 0;
      if(availableMessages === 0){
        req.flash('error',`You have no available messages left, please buy another plan!`);
        return res.redirect(`/agent/payment-buyer/${id}`);
      }
      if((availableMessages != 0) && (availableMessages < totalMessages)){
        req.flash('error',`You have only ${availableMessages} message available!`);
        return res.redirect(`/agent/buyer-listing/${id}`);
      }
      const count = await PromotionalMessage.findOne({
        agentId: agent._id,
      });
      const message = await PromotionalMessage.findOne({ _id: id });
      if (Array.isArray(checked)) {
        checked.forEach(async (person) => {
          const buyer = await Buyer.findOne({ _id: person });
          buyer.promotionalMessages.push({
            agentId: agent._id,
            message: message.message,
            approve: false,
          });
          buyer.promotionalBalance = buyer.promotionalBalance ? buyer.promotionalBalance + 1 : 1;
          await buyer.save();
          // await sendEmail({
          //   to: user.email,
          //   subject: `Promotional message received`,
          //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Prmotional message</b></h5> <p>Dear ${buyer.name},</p><br/> <p> You have received a promotional message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message.message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          // });
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `Promotional message request`,
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has sent a promotional message to ${buyer.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message.message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        });
        const updateMessageCount = await Agent.updateOne({
          _id: agent._id
        }, {
          $inc: {
            'promotionalMessagePlan.mPromotionalessages': -totalMessages
          }
        })
        if(updateMessageCount){
          req.flash('success',`Promotional message sent successfully!`);
          return res.redirect(`/agent/promotional-messages`);
        }
      } else {
        const buyer = await Buyer.findOne({ _id: checked });
        buyer.promotionalMessages.push({
          agentId: agent._id,
          message: message.message,
          approve: false,
        });
        buyer.promotionalBalance = buyer.promotionalBalance ? buyer.promotionalBalance + 1 : 1;
        await buyer.save();
        // await sendEmail({
        //   to: user.email,
        //   subject: `Promotional message received`,
        //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Prmotional message</b></h5> <p>Dear ${buyer.name},</p><br/> <p> You have received a promotional message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message.message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        // });
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `Promotional message request`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has sent a promotional message to ${buyer.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message.message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        const updateMessageCount = await Agent.updateOne({
          _id: agent._id
        }, {
          $inc: {
            'promotionalMessagePlan.messages': -totalMessages
          }
        })
        if(updateMessageCount){
          req.flash('success',`Promotional message sent successfully!`);
          return res.redirect(`/agent/promotional-messages`);
        }
      }
    } catch (err) {
      req.flash('error',err.reason);
      return res.redirect("/agent/");
    }
  } else {
    req.flash('error',`Please login!`);
    return res.redirect("/agent/");
  }
};
const setSellerListing = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    const { checked } = req.body;
    const totalMessages = Array.isArray(checked) ? checked.length : 1;
    try {
      const agent = await Agent.findOne({ email: req.session.user });
      const availableMessages = agent?.promotionalMessagePlan?.messages || 0;
      if(availableMessages === 0){
        req.flash('error',`You have no available messages left, please buy another plan!`);
        return res.redirect(`/agent/payment-seller/${id}`);
      }
      if((availableMessages != 0) && (availableMessages < totalMessages)){
        req.flash('error',`You have only ${availableMessages} message available!`);
        return res.redirect(`/agent/seller-listing/${id}`);
      }
      const count = await PromotionalMessage.findOne({
        agentId: agent._id,
      });
      const message = await PromotionalMessage.findOne({ _id: id });
      if (Array.isArray(checked)) {
        checked.forEach(async (person) => {
          console.log(person);
          const seller = await Seller.findOne({ _id: person });
          seller.promotionalMessages.push({
            agentId: agent._id,
            message: message.message,
            approve: false,
          });
          seller.promotionalBalance = seller.promotionalBalance ? seller.promotionalBalance + 1 : 1;
          await seller.save();
          // await sendEmail({
          //   to: user.email,
          //   subject: `Promotional message received`,
          //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Prmotional message</b></h5> <p>Dear ${seller.name},</p><br/> <p> You have received a promotional message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message.message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          // });
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `Promotional message request`,
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has sent a promotional message to ${seller.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message.message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        });
        const updateMessageCount = await Agent.updateOne({
          _id: agent._id
        }, {
          $inc: {
            'promotionalMessagePlan.messages': -totalMessages
          }
        })
        if(updateMessageCount){
          req.flash('success',`Promotional message sent successfully!`);
          return res.redirect(`/agent/promotional-messages`);
        }
      } else {
        const seller = await Seller.findOne({ _id: checked });
        seller.promotionalMessages.push({
          agentId: agent._id,
          message: message.message,
          approve: false,
        });
        seller.promotionalBalance = seller.promotionalBalance ? seller.promotionalBalance + 1 : 1;
        await seller.save();
        // await sendEmail({
        //   to: seller.email,
        //   subject: `Promotional message received`,
        //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Prmotional message</b></h5> <p>Dear ${seller.name},</p><br/> <p> You have received a promotional message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message.message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        // });
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `Promotional message request`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has sent a promotional message to ${seller.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message.message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        const updateMessageCount = await Agent.updateOne({
          _id: agent._id
        }, {
          $inc: {
            'promotionalMessagePlan.messages': -totalMessages
          }
        })
        if(updateMessageCount){
          req.flash('success',`Promotional message sent successfully!`);
          return res.redirect(`/agent/promotional-messages`);
        }
      }
    } catch (err) {
      req.flash('error',err.reason);
      return res.redirect("/agent/promotional-messages");
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect('/agent')
  }
};
const updateBuyerBid = async (req, res) => {
  const { id } = req.params;
  if (req.session.user && req.session.role == "agent") {
  } else {
    return res.redirect("/agent/");
  }
};
const bidOnProperty = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { id, uid } = req.params;

    try {
      const agent = await Agent.findOne({ email: req.session.user });
      //save the bid
      const { screenName, profilePicture, commision, id: agentId } = req.body;
      const buyer = await Buyer.findOne(
        { _id: uid, "properties._id": id },
        "properties.$"
      );

      const buyerDetails = await Buyer.findOne({_id: uid});

      const exist = await Bid.findOne({
        agentId: agentId,
        userId: uid,
        bidOnProperty: id,
      }).count();

      if (exist == 0) {
        if(!agent.countDownBidBalance || (agent.countDownBidBalance && agent.countDownBidBalance <= 0)){
          req.flash('error', 'Your bids limit exhausted, please buy another package!');
          return res.redirect('/agent/payment/2'); 
        }
        const bidCreated = await Bid.create({
          role: "Buyer",
          agentId: agentId,
          userId: uid,
          bidOnProperty: id,
          agentProfilePicture: profilePicture,
          screenName: screenName,
          commision: commision,
          status: "Waiting",
          bidOverAt: buyer.properties[0].countdownOverAt,
        });
        if(bidCreated){
          req.flash('success','Bid created successfully!');
          await Agent.updateOne({_id: agent._id},{
            $inc:{countDownBidBalance: -1}
          })
          await sendEmail({
            to: buyerDetails.email,
            subject: "Bid on property",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid on property</b></h5> <p>Dear ${buyerDetails.name},</p><br/> <p> ${agent.name} has bid on your property ${buyer.properties[0].area}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        }
      } else if (exist == 1) {
        const bid = await Bid.findOne({
          agentId: agentId,
          userId: uid,
          bidOnProperty: id,
        });

        if (bid.status === "Rejected") {
          await Bid.updateOne({
            agentId: agentId,
            userId: uid,
            bidOnProperty: id,
          },{
            $set:{
              screenName: screenName,
              commision: commision,
              status: "Waiting",
              bidOverAt: buyer.properties[0].countdownOverAt,
            }
          })
          req.flash('success','Bid created successfully!');
          await sendEmail({
            to: buyerDetails.email,
            subject: "Bid on property",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid on property</b></h5> <p>Dear ${buyerDetails.name},</p><br/> <p> ${agent.name} has rebid on your property ${buyer.properties[0].area}</p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        } else if(bid.status === "Waiting") {
          req.flash('error', "You have already placed a bid. Please wait for the Buyer's response.");
          return res.redirect("/agent/buyer-countdown");
        }
      }
      return res.redirect("/agent/buyer-countdown");
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect("/agent/");
    }
  } else {
    req.flash('error', 'Please login!');
    return res.redirect("/agent/");
  }
};
const rebid = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    try {
      const { uid, aid, pid } = req.params;
      const { commision } = req.body;
      const bid = await Bid.findOne({
        userId: uid,
        agentId: aid,
        bidOnProperty: pid,
      });

      const exists = await Bid.exists({
        userId: uid,
        agentId: aid,
        bidOnProperty: pid,
        status: "Rejected",
      });

      if (exists) {
        await Bid.updateOne({
          userId: uid,
          agentId: aid,
          bidOnProperty: pid,
          status: "Rejected",
        },{
          $set:{
            commision,
            status: "Waiting"
          }
        });
        req.flash('success','Rebid successfully!');
        return res.redirect("/agent/rejected-bids");
      }
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/buyer');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};
const inviteOnSuccess = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { uid, state } = req.params;
    const agent = await Agent.findOne({ email: req.session.user });
    try {
      if (state == 1) {
        const user = await Seller.findOne({ _id: uid });
        await sendEmail({
          to: user.email,
          subject: "Invitation to strengthen agent, seller relationship",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${user.name},</p><br/> <p> Upon successfull deal on your property, ${agent.name} invite you to carry this trust forward. Looking forward to great future. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
      } else if (state == 2) {
        const user = await Buyer.findOne({ _id: uid });
        await sendEmail({
          to: user.email,
          subject: "Invitation to strengthen agent, buyer relationship",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${user.name},</p><br/> <p> Upon successfull deal on your property, ${agent.name} invite you to carry this trust forward. Looking forward to great future. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
      }
      req.flash('success','Invitation sent!');
      return res.redirect("/agent/successfull-bids");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect("/agent/successfull-bids");
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};
const reactToReferralAgreement = async (req, res) => {
  const { aid } = req.params;
  console.log(aid);
  const { brokerB, dateBrokerB, status } = req.body;
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    try {
      await ReferralAgreement.updateOne(
        { _id: aid },
        {
          $set: {
            brokerB,
            dateBrokerB,
            status: status === "on" ? "Accepted" : "Rejected",
          },
        }
      );
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Referral agreement ${status === "on" ? "accepted" : "rejected"}`,
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Referral Agreement</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has ${status === "on" ? "accepted" : "rejected"} referral agreement. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      if(status === "on"){
        req.flash('success', 'Agreement accepted!');
      } else {
        req.flash('success', 'Agreement rejected!');
      }
      return res.redirect("/agent/referral-agreement");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect("/agent/referral-agreement");
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/agent/");
  }
};
const stripe = require("stripe")(
  "sk_test_51Kze91K4WqwChaQkcFIRs6OGhdTLyUa0jMXFKcJgsa7Vw3P5W4rnlK16RrEfxSysOLQ0NYONqXx8M6pRnOhxFuID003VviyN4Z"
);

const getPayment = async (req, res) => {
  try {
    const { product, success_url, cancel_url } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: product.amount * 100,
          },

          quantity: product.quantity,
        },
      ],
      metadata: {
        planName:  product.name,
        messages: product.messages
      },
      mode: "payment",
      success_url: "http://localhost:3500/" + success_url,
      cancel_url: "http://localhost:3500/" + cancel_url,
    });
    res.json({ id: session.id });
  } catch (e) {
    res.json(e);
  }
};

const promotionPlanPurchased = async (req,res) => {
  if (req.session.user && req.session.role == "agent") {
    const { planName, planPrice, messages, messageId, messageRole } = req.query;
    try{
      if(!messages || !planName || !planPrice || !messageId){
        throw new Error('Please provide all details!');
      }
      const agent = await Agent.findOne({ email: req.session.user });

      if(!agent){
        throw new Error('Agent not found!');
      }
  
      const updateAgent = await Agent.updateOne({
        _id: agent._id
      },{
        $set:{
          'promotionalMessagePlan.price': planPrice,
          'promotionalMessagePlan.name': planName,
          'promotionalMessagePlan.messages': messages
        }
      })
  
      if(updateAgent){
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "Promotional plan purchased",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Plan purchased by agent</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has purchased a promotional plan with below details: </p><br><p>Plan name: <strong>${planName}</strong></p><p>Messages: <strong>${messages}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        req.flash('success', 'Plan purchased successfully!');
        if(messageRole === 'Seller'){
          return res.redirect(`/agent/charity-seller/${messageId}`)
        } else {
          return res.redirect(`/agent/charity-buyer/${messageId}`)
        }
      } else {
        throw new Error('Something went wrong!');
      }
    } catch(e){
      req.flash('error', e.message);
      if(messageRole === 'Seller'){
        return res.redirect(`/agent/payment-seller/${messageId}`)
      } else {
        return res.redirect(`/agent/payment-buyer/${messageId}`)
      }
    }
  } else {
    req.flash('error', 'Please login!');
    return res.redirect('/agent')
  }

}

const setRegistrationPayment = async (req, res) => {
  try {
    const { product, success_url , agentId, cancel_url } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: product.amount * 100,
          },

          quantity: product.quantity,
        }
      ],
      metadata: {
        purchaseType: 'agentRegistration',
        planName: product.name,
        agentId: agentId
      },
      mode: "payment",
      success_url: "http://localhost:3500/" + success_url,
      cancel_url: "http://localhost:3500/" + cancel_url,
    });
    console.log(session);
    res.json({ id: session.id });
  } catch (e) {
    res.json(e);
  }
};

const registrationPlanPurchased = async (req,res) => {
  const { agentId, planName } = req.query;
  try{
    if(!agentId || !planName){
      throw new Error('Please provide Plan name and Agent id!');
    }
    const agent = await Agent.findOne({
      _id: agentId
    });
    if(!agent){
      throw new Error('Agent not found!');
    }
    const updateAgent = await Agent.updateOne({
      _id: agentId
    },{
      $set:{
        registrationPlan: planName
      }
    })
    if(updateAgent){
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "Registration plan purchased",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Plan purchased by agent</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has purchased a registration plan with below details: </p><br><p>Plan name: <strong>${planName}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      req.flash('success', 'Please wait for 24 hours for the admin to review your details!');
      res.redirect(`/agent/register-charity/${agentId}`)
    } else {
      throw new Error('Something went wrong!');
    }
  } catch(e){
    req.flash('error', e.message);
    if(agentId){
      res.redirect(`/agent/register-plan/${agentId}`)
    } else {
      res.redirect(`/agent`)
    }
  }

}

const setCountDownPayment = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    try {
      const { product, success_url, cancel_url } = req.body;
      const agent = await Agent.findOne({ email: req.session.user });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
              },
              unit_amount: product.amount * 100,
            },
  
            quantity: product.quantity,
          }
        ],
        metadata: {
          purchaseType: 'countDownPackage',
          planName: product.name,
          totalBids: product.bids,
          agentId: agent._id
        },
        mode: "payment",
        success_url: "http://localhost:3500/" + success_url,
        cancel_url: "http://localhost:3500//" + cancel_url,
      });
      res.json({ id: session.id });
    } catch (e) {
      res.json(e);
    }
  } else {
    res.redirect('/agent')
  }
};

const countDownPlanPurchased = async (req,res) => {
  if (req.session.user && req.session.role == "agent") {
    const { planName, bids, sellerBuyerId } = req.query;
    try{
      if(!bids || !planName){
        throw new Error('Please provide plan details!');
      }
      const agent = await Agent.findOne({ email: req.session.user });

      if(!agent){
        throw new Error('Agent not found!');
      }

      const updateAgent = await Agent.updateOne({
        _id: agent._id
      },{
        $set:{
          countDownPlan: planName,
          countDownBidBalance: bids
        }
      })
      
      if(updateAgent){
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "Countdown plan purchased",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Plan purchased by agent</b></h5> <p>Dear admin,</p><br/> <p> ${agent.name} has purchased a countdown plan with below details: </p><br><p>Plan name: <strong>${planName}</strong></p><p>Bids: <strong>${bids}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        req.flash('success','Plan purchased successfully!');
        return res.redirect(`/agent/charity/${sellerBuyerId}`)
      } else {
        throw new Error('Something went wrong!');
      }
    } catch(e){
      req.flash('error', e.message);
      return res.redirect(`/agent/payment/${sellerBuyerId}`)
    }
  } else {
    req.flash('error', 'Please login!');
    res.redirect('/agent')
  }


}

module.exports = {
  updateProfile,
  registerAgentStepOne,
  registerAgentStepTwo,
  registerAgentStepThree,
  registerAgentStepFour,
  loginAgent,
  acceptBid,
  rejectBid,
  handleLogout,
  changePassword,
  changeProfilePicture,
  saveCharityDetails,
  bidForProperty,
  updateBid,
  chatWithAdmin,
  chatWithParticularRole,
  chatSeller,
  setPromotionalMessage,
  setCharityBuyer,
  setCharitySeller,
  sendPromotionalMessage,
  setBuyerListing,
  setSellerListing,
  registerAgentStepOneWithEmailAndPassword,
  bidOnProperty,
  rebid,
  inviteOnSuccess,
  reactToReferralAgreement,
  getPayment,
  acceptBuyerBid,
  rejectBuyerBid,
  setRegistrationPayment,
  registrationPlanPurchased,
  setCountDownPayment,
  countDownPlanPurchased,
  promotionPlanPurchased
};
