const bcrypt = require("bcrypt");
const {
  Seller,
  Admin,
  Message,
  Agent,
  Bid,
  Log,
  BankDetail,
} = require("../models/Users");
const { sellerSchema } = require("./../middleware/validation/user");
const { updatePassword } = require("./../middleware/validation/updateUser");
const { Chat } = require("./Chat");
const addHours = require("date-fns/addHours");
const {
  propertySchema,
  propertySchemaForEdit,
} = require("./../middleware/validation/validations");
const req = require("express/lib/request");
const { v4: uuidv4 } = require("uuid");
const { sendData } = require("./helperFunction");
const { EmailTemplateSeller } = require("./EmailTemplate");
const { sendMail, sendEmail } = require("./sendMailController");

const registerSeller = async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    zipCode,
    license,
    password,
    city,
    state,
    latitude,
    longitude
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !password ||
    !address ||
    !zipCode ||
    !license ||
    !city ||
    !state
  ) {
    req.flash('formData',req.body);
    req.flash('error',"All fields are required!");
    return res.redirect('/seller/register');
  }
  try {
    await sellerSchema.validateAsync(req.body);
  } catch (e) {
    req.flash('formData',req.body);
    req.flash('error',e.message);
    return res.redirect('/seller/register');
  }

  // check for duplicate usernames in database
  const duplicate = await Seller.exists({ email: email });

  if (duplicate) {
    req.flash('formData',req.body);
    req.flash('error','Account with this email already exists');
    return res.redirect('/seller/register');
  }

  try {
    //   encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // store the new user
    const user = await Seller.create({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
      address: address,
      zipCode: zipCode,
      license: license,
      status: "not decided",
      profilePicture: "",
      state,
      city,
      createdAt: new Date(),
      updatedAt: new Date(),
      latitude,
      longitude
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Seller Registered", 
      template:
        `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}table, td{border: 1px solid black; border-collapse: collapse;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span> <h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3> </span> </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"> <b>New Seller Registered</b> </h5> <p>Dear Admin,</p><br/> <p> New seller has been registered with below details: </p><table style="width: 60%;"> <tbody> <tr> <td>Name</td><td>${user.name}</td></tr><tr> <td>Email</td><td>${user.email}</td></tr><tr> <td>Phone</td><td>${user.phone}</td></tr><tr> <td>State</td><td>${user.state}</td></tr><tr> <td>City</td><td>${user.city}</td></tr><tr> <td>Address</td><td>${user.address}</td></tr><tr> <td>Zipcode</td><td>${user.zipCode}</td></tr><tr> <td>License</td><td>${user.license}</td></tr></tbody> </table> <br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
    });
    await sendEmail({
      to: user.email,
      subject: "Your Registration was successfull",
      template:
        `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Registration Successful</b></h5> <p>Dear ${user.name},</p><br/> <p> You have successfully registered as seller, wait 24 to 48 hours for approval </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
    });
    await Log.create({
      text: `New Seller Registered {email : ${email}}`,
      date: new Date(),
    });
    req.flash('success',' You have successfully registered as seller, please wait 24 hours for approval!');
    return res.redirect("/seller/");
  } catch (err) {
    req.flash('error',err.message);
    return res.redirect('/seller/register');
  }
};
const handleLogout = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    req.session.destroy(function (err) {
      if (err){
        req.flash('error',"Something went wrong!");
        res.redirect('/seller/main');
      } else {
        return res.redirect("/seller/");
      }
    });
  } else {
    return res.redirect("/seller/");
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('formData',req.body);
    req.flash('error',"Please provide email and password!");
    return res.redirect('/seller/');
  }

  let foundUser = await Seller.findOne({ email: email });

  if (!foundUser) {
    req.flash('error',"Account not found!");
    return res.redirect('/seller/register')
  }

  //   Evaluate password
  const match = await bcrypt.compare(password, foundUser.password);

  if (match && foundUser.status == "approved") {
    req.session.user = email;
    req.session.name = (await Seller.findOne({ email: email })).name;
    req.session.image = (await Seller.findOne({ email: email })).profilePicture;
    req.session.role = "seller";
    await Log.create({
      text: `Seller Logged in {email : ${email}}`,
      date: new Date(),
    });
    req.flash('success',"Logged in sucessfully!");
    return res.redirect("/seller/main");
  } else if(match && foundUser.status !== "approved"){
    return res.render("errorpages/not-approved");
  } else {
    req.flash('formData',req.body);
    req.flash('error',"Invalid password!");
    return res.redirect('/seller/');
  }
};
const editProfileCredentials = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const { name, phone } = req.body;
    if (name.length <= 3 || name.length >= 25) {
      req.flash('error',"Name must be of length between 3 and 25!");
      return res.redirect('/seller/edit-profile');
    } else if (phone.length < 8 || phone.length > 13) {
      req.flash('error',"Phone number must be of length between 8 and 13");
      return res.redirect('/seller/edit-profile');
    } else {
      try {
        await Seller.updateOne(
          { email: req.session.user },
          {
            name,
            phone,
          }
        );
        await Log.create({
          text: `Seller Updated his profile {email : ${req.session.user}}`,
          date: new Date(),
        });
        req.flash('success',"Profile updated successfully!");
        res.redirect("/seller/edit-profile");
      } catch (e) {
        return res.render(
          "errorpages/404",
          sendData(500, "Internal Server Error", e.message, "/seller/")
        );
      }
    }
  } else {
    req.flash('error',"Please login!");
    return res.redirect('/seller/');
  }
};
const changePassword = async (req, res) => {
  const { password, image } = req.body;
  if (!password || !image) {
    req.flash('error','Password and image is required!');
    return res.redirect('/seller/edit-profile');
  }
  try {
    await updatePassword.validateAsync({ password });
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/seller/edit-profile');
  }
  try {
    const pwd = await bcrypt.hash(password, 10);
    await Seller.updateOne(
      { email: req.session.user },
      {
        password: pwd,
        profilePicture: image,
      }
    );
    await Log.create({
      text: `Seller Updated his password {email : ${req.session.user}}`,
      date: new Date(),
    });
    req.flash('success','Password updated!');
    return res.redirect("/seller/edit-profile");
  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('/seller/edit-profile');
  }
};
const addProperty = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const {
      propertyName,
      propertyAddress,
      mailingAddress,
      phone,
      zipCode,
      listedByBooker,
      agreeToTerms,
      listedForAgent,
    } = req.body;
    const uuid = uuidv4();
    if (agreeToTerms !== "on") {
      req.flash('error','Please agree to our policies!');
      return res.redirect('/seller/add-property');
    }
    const listedByAnotherBroker = listedByBooker === "on" ? true : false;
    const listForOpenBid = listedForAgent ? true : false;
    try {
      await propertySchema.validateAsync({
        propertyName,
        propertyAddress,
        mailingAddress,
        phone,
        zipCode,
        listForOpenBid,
      });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/add-property');
    }
    try {
      Seller.findOne({ email: req.session.user }).then((data) => {
        data.properties.push({
          propertyName,
          propertyAddress,
          mailingAddress,
          phone,
          zipCode,
          agreeToTerms: true,
          listedByAnotherBroker,
          listForOpenBid,
          countdown: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const property = data.properties[data.properties.length - 1]._id;
        data.save().then(async function () {
          req.flash('success','Property added!');
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "Add Property",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Add Property</b></h5> <p>Dear admin,</p><br/> <p> ${data.name} has added a new property. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
          if (!listForOpenBid) {
            await Log.create({
              text: `Seller added a property {email : ${req.session.user}}`,
              date: new Date(),
            });
            return res.redirect("/seller/add-property");
          }
          await Log.create({
            text: `Seller added a property {email : ${req.session.user}}`,
            date: new Date(),
          });
          return res.redirect("/seller/countdown?id=" + property);
        });
      });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/add-property');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect('/seller/add-property');
  }
};
const editCountDown = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const { id } = req.query;
    const { timeCountdown } = req.body;

    const time = timeCountdown.split(" ")[0];
    try {
      await Seller.updateOne(
        { "properties._id": id },
        {
          $set: {
            "properties.$.countdown": time,
            "properties.$.updatedAt": new Date(),
            "properties.$.isOver": false,
          },
        }
      );
      await Log.create({
        text: `Seller edited countdown for one of his property {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Countdown updated successfully!')
      res.redirect("/seller/countdown?id=" + id);
    } catch (err) {
      req.flash('error',err.message)
      return res.redirect('/seller/countdown');
    }
  } else {
    req.flash('error',"Please login!");
    return res.redirect("/seller/");
  }
};
const editPropertyDetails = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const {
      propertyName,
      propertyAddress,
      mailingAddress,
      phone,
      zipCode,
      property_id,
    } = req.body;
    try {
      await propertySchemaForEdit.validateAsync({
        propertyName,
        propertyAddress,
        mailingAddress,
        phone,
        zipCode,
      });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/add-property');
    }
    try {
      await Seller.updateOne(
        { "properties._id": property_id },
        {
          $set: {
            "properties.$.propertyName": propertyName,
            "properties.$.propertyAddress": propertyAddress,
            "properties.$.mailingAddress": mailingAddress,
            "properties.$.phone": phone,
            "properties.$.zipCode": zipCode,
          },
        }
      );
      await Log.create({
        text: `Seller edited property details {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Property updated successfully!')
      res.redirect("/seller/saved-properties");
    } catch (err) {}
  } else {
    req.flash('error',"Please login!");
    return res.redirect("/seller/");
  }
};
const startCountDown = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { id } = req.query;
    const as = await Seller.findOne({
      "properties._id": id,
    });
    const property = as.properties.filter((property) => property._id == id);
    try {
      await Seller.updateOne(
        { "properties._id": id },
        {
          $set: {
            "properties.$.countdownOverAt": addHours(
              new Date(),
              parseInt(property[0].countdown)
            ),
            "properties.$.updatedAt": new Date(),
            "properties.$.isOver": false,
          },
        }
      );
      await Log.create({
        text: `Seller started countdown for his property {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Countdown started!');
      res.redirect("/seller/countdown?id=" + id);
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/countdown');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/seller/");
  }
};

const acceptBid = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { id, propertyID } = req.params;
    let agent = await Agent.findOne({
      _id: id,
    });
    console.log(req.params, "=============");
    try {
      const seller = await Seller.findOne({ email: req.session.user });
      const sellerProperty = await Seller.findOne({'properties._id':propertyID}, 'properties.$');
      const exists = await Bid.exists({
        userId: seller._id,
        bidOnProperty: propertyID,
        status: "Accepted",
      });
      if (exists) {
        const prevBidder = await Bid.findOne({
          userId: seller._id,
          bidOnProperty: propertyID,
          status: "Accepted",
        });
        await Bid.updateOne(
          { agentId: prevBidder.agentId, bidOnProperty: propertyID },
          { $set: { status: "Canceled" } }
        );
        await sendEmail({
          to: agent.email,
          subject: "Bid cancelled",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Cancelled</b></h5> <p>Dear ${agent.name},</p><br/> <p> Your bid on property ${sellerProperty?.properties[0]?.propertyName} is cancelled. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
      }
      await Bid.updateOne(
        { agentId: id, bidOnProperty: propertyID },
        { $set: { status: "Accepted" } }
      );
      await Bid.updateOne(
        {
          userId: seller._id,
          agentId: id,
          bidOnProperty: propertyID,
        },
        {
          $set: { status: "Accepted" },
        }
      );
      await sendEmail({
        to: agent.email,
        subject: "Bid accepted",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Accepted</b></h5> <p>Dear ${agent.name},</p><br/> <p> Your bid on property ${sellerProperty?.properties[0]?.propertyName} is accepted. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Seller Accepted agent bid {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Bid accepted successfully!');
      return res.redirect("/seller/main");
    } catch (err) {
      req.flash('error',err.message);
      return req.redirect('/seller/');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/seller/");
  }
};
const rejectBid = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { id, propertyID } = req.params;
    let agent = await Agent.findOne({
      _id: id,
    });
    try {
      const seller = await Seller.findOne({ email: req.session.user });
      const sellerProperty = await Seller.findOne({'properties._id':propertyID}, 'properties.$');
      console.log(req.params, "==============");
      const updated = await Bid.updateOne(
        {
          userId: seller._id,
          agentId: id,
          bidOnProperty: propertyID,
          status: 'Waiting'
        },
        {
          $set: { status: "Rejected" },
        }
      );
      await sendEmail({
        to: agent.email,
        subject: "Bid rejected",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Rejected</b></h5> <p>Dear ${agent.name},</p><br/> <p> Your bid on property <b>${sellerProperty?.properties[0]?.propertyName}</b> is rejected </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Seller rejected agent bid {email : ${req.session.user}}`,
        date: new Date(),
      });
      req.flash('success','Bid rejected successfully!');
      return res.redirect("/seller/main");
    } catch (err) {
      req.flash('error',err.message);
      return req.redirect('/seller/');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/seller/");
  }
};
const sendMessageToAdmin = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const { message } = req.body;
    const user = await Seller.findOne({ email: req.session.user });
    const userId = user._id;
    const admin = await Admin.findOne({});
    const adminId = admin._id;
    try {
      Chat(message, userId, adminId, userId)
        .then(async (data) => {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "Chat notification",
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear Admin,</p><br/> <p> You have received a chat message from ${user.name}, with below details: </p><br><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
          await Log.create({
            text: `Seller sent you message {email : ${req.session.user}}`,
            date: new Date(),
          });
          return res.redirect("/seller/admin-chat");
        })
        .catch((err) => {
          {
            req.flash('error',err.message);
            return res.redirect('/seller/admin-chat');
          }
        });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/countdown');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect('/seller');
  }
};

const chatWithAgent = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const { id } = req.params;
    console.log(id);
    const { message } = req.body;
    const user = await Seller.findOne({ email: req.session.user });
    const userId = user._id;
    const agent = await Agent.findOne({ _id: id });
    const agentId = agent._id;
    try {
      Chat(message, userId, agentId, userId)
        .then(async (data) => {
          // await sendEmail({
          //   to: agent.email,
          //   subject: `Chat notification`,
          //   template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear ${agent.name},</p><br/> <p> You have received a chat message from ${user.name}, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          // });
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `Chat request`,
            template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${user.name} has sent a chat message to ${agent.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
          await Log.create({
            text: `Seller sent agent a message {email : ${req.session.user}}`,
            date: new Date(),
          });
          req.flash('success','Message sent successfully!');
          return res.redirect("/seller/agent-chat");
        })
        .catch((err) => {
          {
            req.flash('error',err.message);
            return res.redirect('/seller/agent-chat');
          }
        });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/agent-chat');
    }
  } else {
    req.flash('error',"Please login!");
    return res.redirect('/seller/');
  }
};
const getStateListing = async (req, res) => {
  const { zipCode, commisionRate } = req.params;
  if (req.session.user && req.session.role == "seller") {
    try {
      const agents = await Agent.find({ commision: commisionRate });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/seller/agent-chat');
    }
  } else {
    req.flash('error','Please login!');
    return res.redirect("/seller/");
  }
};
const sendInvite = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { aid } = req.params;
    const {propertyId} = req.body;
    const seller = await Seller.findOne({ email: req.session.user });
    const sellerProperty = await Seller.findOne(
      { _id: seller._id, "properties._id": propertyId },
      "properties.$"
    );
    if(!sellerProperty){
      req.flash('error', 'Please select a property with active countdown!');
      return res.redirect('/seller/successfull-bids');
    }
    const agent = await Agent.findOne({ _id: aid });
    const exists = await Bid.exists({
      agentId: aid,
      userId: seller._id,
      bidOnProperty: propertyId
    });

    if(exists){
      const bid = await Bid.findOne({
        agentId: aid,
        userId: seller._id,
        bidOnProperty: propertyId
      });
      if(bid.status === 'Accepted'){
        req.flash('error', 'Already accepted for same agent and property!');
        return res.redirect('/seller/successfull-bids');
      } else if(bid.status === 'Waiting'){
        req.flash('error', 'Agent has already bid on this property, Please check the waiting bids!');
        return res.redirect('/seller/successfull-bids');
      } else if(bid.status === 'Invited'){
        req.flash('error', 'You have already invited this agent, Please wait for there response!');
        return res.redirect('/seller/successfull-bids');
      } else if(bid.status === 'Rejected') {
        await Bid.updateOne({_id: bid._id},{
          $set:{
            status: 'Invited'
          }
        })
        await sendEmail({
          to: agent.email,
          subject: `Invitation to carry on with the trust`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${seller.name} would like you to bid on their other property ${sellerProperty.properties[0].propertyName}, upon the completion of this deal. Would love to work together </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Seller sent invitation upon successfull deal {email : ${agent.email}}`,
          date: new Date(),
        });
        req.flash('success','Invitation sent!');
        return res.redirect("/seller/successfull-bids");
      }
      return res.redirect("/seller/successfull-bids");
    } else {
      await Bid.create({
        role: "Seller",
        agentId: agent._id,
        userId: seller._id,
        bidOnProperty: propertyId,
        agentProfilePicture: agent.profilePicture,
        screenName: agent.screenName,
        commision: agent.commision,
        status: "Invited",
        bidOverAt: sellerProperty.properties[0].countdownOverAt,
      })
      await sendEmail({
        to: agent.email,
        subject: `Invitation to carry on with the trust`,
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${seller.name} would like you to bid on their other property ${sellerProperty.properties[0].area}, upon the completion of this deal. Would love to work together </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Seller sent invitation upon successfull deal {email : ${agent.email}}`,
        date: new Date(),
      });
      req.flash('success','Invitation sent!');
      return res.redirect("/seller/successfull-bids");
    }
  } else {
    return res.redirect("/seller/");
  }
};

const sendInvitationToBid = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { aid, state } = req.params;
    const redirectLink = state == 1 ? "/seller/state-listing" : "/seller/country-listing"
    const {propertyId} = req.body;
    const seller = await Seller.findOne({ email: req.session.user });
    const sellerProperty = await Seller.findOne(
      { _id: seller._id, "properties._id": propertyId },
      "properties.$"
    );
    if(!sellerProperty){
      req.flash('error', 'Please select a property with active countdown!');
      return res.redirect(redirectLink);
    }
    const agent = await Agent.findOne({ _id: aid });
    const exists = await Bid.exists({
      agentId: aid,
      userId: seller._id,
      bidOnProperty: propertyId
    });
  
    if(exists){
      const bid = await Bid.findOne({
        agentId: aid,
        userId: seller._id,
        bidOnProperty: propertyId
      });
      if(bid.status === 'Accepted'){
        req.flash('error', 'Already accepted for same agent and property!');
        return res.redirect(redirectLink);
      } else if(bid.status === 'Waiting'){
        req.flash('error', 'Agent has already bid on this property, Please check the waiting bids!');
        return res.redirect(redirectLink);
      } else if(bid.status === 'Invited'){
        req.flash('error', 'You have already invited this agent, Please wait for there response!');
        return res.redirect(redirectLink);
      } else if(bid.status === 'Rejected') {
        await Bid.updateOne({_id: bid._id},{
          $set:{
            status: 'Invited'
          }
        })
        await sendEmail({
          to: agent.email,
          subject: `Invitation to carry on with the trust`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${seller.name} would like you to bid on their other property ${sellerProperty.properties[0].propertyName}, upon the completion of this deal. Would love to work together </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Seller sent invitation upon successfull deal {email : ${agent.email}}`,
          date: new Date(),
        });
        req.flash('success','Invitation sent!');
        return res.redirect(redirectLink);
      }
      return res.redirect(redirectLink);
    } else {
      await Bid.create({
        role: "Seller",
        agentId: agent._id,
        userId: seller._id,
        bidOnProperty: propertyId,
        agentProfilePicture: agent.profilePicture,
        screenName: agent.screenName,
        commision: agent.commision,
        status: "Invited",
        bidOverAt: sellerProperty.properties[0].countdownOverAt,
      })
      await sendEmail({
        to: agent.email,
        subject: `Invitation to carry on with the trust`,
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${seller.name} would like you to bid on their properties. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      req.flash('success','Invitation sent!');
      return res.redirect(redirectLink);
    }
  } else {
    return res.redirect("/seller/");
  }
};
const sendInviteToBidAgain = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { aid, pid } = req.params;
    const agent = await Agent.findOne({ _id: aid });
    const seller = await Seller.findOne({ email: req.session.user });
    console.log({
      agentId: aid,
      userId: seller._id,
      bidOnProperty: pid
    });
    const exists = await Bid.exists({
      agentId: aid,
      userId: seller._id,
      bidOnProperty: pid
    });
    if(exists){
      const bid = await Bid.findOne({
        agentId: aid,
        userId: seller._id,
        bidOnProperty: pid
      });
      if(bid.status === 'Waiting'){
        req.flash('error', 'Agent has already bid on this property, Please check the waiting bids!');
        res.redirect('/seller/rejected-bids');
      } else if(bid.status === 'Invited'){
        req.flash('error', 'You have already invited this agent, Please wait for there response!');
        res.redirect('/seller/rejected-bids');
      } else if(bid.status === 'Rejected') {
        const updateBid = await Bid.updateOne({_id: bid._id},{
          $set:{
            status: 'Invited'
          }
        })
        if(updateBid){
          const html = `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> I would like to invite you to become the agent for property Id : <strong>${pid}</strong> </p><p>Regards,</p><p>${seller.name}</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`;
          await sendEmail({
            to: agent.email,
            subject: `Invitation to carry on with the trust`,
            template: html,
          });
          await Log.create({
            text: `Seller sent invitation to rebid with less commision {email : ${seller.email}}`,
            date: new Date(),
          });
          req.flash('success', 'Invited successfully!');
        }
      }
      return res.redirect("/seller/rejected-bids");
    } else {
      return res.redirect("/seller/rejected-bids");
    }
  } else {
    req.flash('error', 'Please login!');
    return res.redirect("/seller/");
  }
};
const turnPromotionalMessages = async (req, res) => {
  if (req.session.user && req.session.role === "seller") {
    const { btn } = req.body;
    await Seller.updateOne(
      { email: req.session.user },
      {
        $set: { promotionalMessageState: btn === "yes" ? true : false },
      }
    );
    if(btn === "yes"){
      req.flash('success','Promotional messages turned on!')
    } else {
      req.flash('success','Promotional messages turned off!')
    }
    return res.redirect("/seller/promotional-messages");
  } else {
    req.flash('error','Please login!')
    return res.redirect("/seller/");
  }
};
const deletePromotionalMessages = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const seller = await Seller.findOne({ email: req.session.user });
    seller.promotionalMessages = [];
    await seller.save();
    req.flash('success','Promotional messages deleted successfully!');
    return res.redirect("/seller/promotional-messages");
  } else {
    req.flash('error','Please login!')
    return res.redirect("/seller/");
  }
};
const postAccountDetails = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { accountNumber, amount } = req.body;
    const seller = await Seller.findOne({ email: req.session.user });
    if(!seller.promotionalBalance || (seller.promotionalBalance < amount)){
      req.flash('error',`You have only \$${seller.promotionalBalance ? seller.promotionalBalance : 0} left to claim!`);
      return res.redirect("/seller/promotional-messages");
    }
    const exists = await BankDetail.exists({
      userId: seller._id,
    });
    const intAmount = parseInt(amount);
    if (exists) {
      await BankDetail.updateOne(
        { userId: seller._id },
        {
          $set: { accountNumber },
          $inc: {amount: intAmount}
        }
      );
      await Seller.updateOne({_id: seller._id},{$inc: {promotionalBalance: -intAmount}});
    } else {
      await BankDetail.create({
        userId: seller._id,
        accountNumber,
        amount: parseInt(intAmount),
        role: 'seller'
      });
      await Seller.updateOne({_id: seller._id},{$inc: {promotionalBalance: -intAmount}});
    }
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "Claim request",
      template:
        `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Claim request</b></h5> <p>Dear admin,</p><br/> <p> ${seller.name}has requested to claim ${amount}$ for promotional messages. </p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
    });
    req.flash('success','Account details updated!')
    return res.redirect("/seller/promotional-messages");
  } else {
    req.flash('error','Please login!')
    return res.redirect("/seller/");
  }
};
const deleteMessage = async (req, res) => {
  if (req.session.user && req.session.role == "seller") {
    const { mid } = req.params;
    const seller = await Seller.findOne({ email: req.session.user });

    seller.promotionalMessages = seller.promotionalMessages.filter(
      (message) => !message._id.equals(mid)
    );

    await seller.save();
    req.flash('success','Message deleted successfully!')
    return res.redirect("/seller/promotional-messages");
  } else {
    req.flash('error','Please login!')
    return res.redirect("/seller/");
  }
};
module.exports = {
  registerSeller,
  handleLogout,
  login,
  editProfileCredentials,
  changePassword,
  addProperty,
  editCountDown,
  editPropertyDetails,
  startCountDown,
  acceptBid,
  rejectBid,
  sendMessageToAdmin,
  chatWithAgent,
  getStateListing,
  sendInvite,
  sendInvitationToBid,
  sendInviteToBidAgain,
  turnPromotionalMessages,
  deletePromotionalMessages,
  postAccountDetails,
  deleteMessage,
};
