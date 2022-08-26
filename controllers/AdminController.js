const bcrypt = require("bcrypt");
const {
  Admin,
  Agent,
  Message,
  Seller,
  Buyer,
  InvitedAgent,
  ReferralAgreement,
  Log,
  PromotionalMessage,
} = require("../models/Users");
const { sendData } = require("./helperFunction");
const jwt = require("jsonwebtoken");
const { sendMail, sendEmail } = require("./sendMailController");
require("dotenv").config();
const { updatePassword } = require("../middleware/validation/updateUser");
const { Chat } = require("./Chat");
const { el } = require("date-fns/locale");
const { dataflow } = require("googleapis/build/src/apis/dataflow");

const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email and Password are required!");
    return res.redirect("/admin/edit-profile");
  }
  // check for duplicate usernames in database
  const duplicate = await Admin.exists({ email: email });

  if (duplicate) {
    req.flash("error", "Account with this email already exists!");
    return res.redirect("/admin/edit-profile");
  }
  //Conflict
  try {
    //   encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // store the new user

    const user = await Admin.create({
      email: email,
      password: hashedPassword,
      name: name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    req.flash("success", "Account created successfully!");
    return res.redirect("/admin/edit-profile");
  } catch (err) {
    req.flash("err", err.message);
    return res.redirect("/admin/edit-profile");
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash("formData", req.body);
    req.flash("error", "Please provide email and password!");
    return res.redirect("/admin/");
  }

  let foundUser = await Admin.findOne({ email: email });

  if (!foundUser) {
    req.flash("error", "Account not found!");
    return res.redirect("/admin/");
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    await Log.create({
      text: `Admin Logged In`,
      date: new Date(),
    });
    req.session.user = email;
    req.session.name = (await Admin.findOne({ email: email })).name;
    req.session.role = "admin";
    req.session.image = (await Admin.findOne({ email: email })).profilePic;
    req.flash("success", "Logged in sucessfully!");
    return res.redirect("/admin/main");
  } else {
    req.flash("formData", req.body);
    req.flash("error", "Invalid password!");
    return res.redirect("/admin/");
  }
};
const handleLogout = async (req, res) => {
  if (req.session.user) {
    await Log.create({
      text: `Admin Logged out`,
      date: new Date(),
    });
    req.session.destroy(function (err) {
      if (err) {
        req.flash("error", "Something went wrong!");
        return res.redirect("/admin/main");
      } else {
        return res.redirect("/admin/");
      }
    });
  } else {
    return res.redirect("/admin/");
  }
};

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await Admin.exists({ refreshToken: refreshToken });
  const foundUserCreds = await Admin.findOne({ refreshToken });

  if (!foundUser) return res.sendStatus(403); //Forbidden
  //   Evaluate jwt

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUserCreds.email !== decoded.email)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      {
        email: decoded.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
};
// const deleteAgent = async (req, res) => {
//     if (req.query.id) {
//         try {
//             await Agent.deleteOne({ _id: req.query.id });

//             res.redirect('/admin/main');
//         } catch (e) {
//             return res.render('errorpages/404', {
//                 status: 500,
//                 error: 'Internal Server Error',
//                 message: e.message,
//                 url: '/admin/main',
//             });
//         }
//     }
// };
const approveAgent = async (req, res) => {
  const id = req.query.id;
  try {
    const user = await Agent.updateOne(
      { _id: id },
      {
        status: "approved",
      }
    );
    await Log.create({
      text: `Approved Agent  - Admin`,
      date: new Date(),
    });
    req.flash("success", "Agent approved!");
    return res.redirect("/admin/main");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/admin/main");
  }
};
const disapproveAgent = async (req, res) => {
  const id = req.query.id;
  try {
    const user = await Agent.updateOne(
      { _id: id },
      {
        status: "disapproved",
      }
    );
    await Log.create({
      text: `Disapproved Agent  - Admin`,
      date: new Date(),
    });
    req.flash("success", "Agent disapproved!");
    res.redirect("/admin/main");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/admin/main");
  }
};
const changePassword = async (req, res) => {
  const image = req.body.imagePath.split("/");
  const imageName = image[image.length - 1];
  const { password } = req.body;
  if (password && image) {
    try {
      await updatePassword.validateAsync({ password });
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/admin/edit-profile");
    }
    try {
      const pwd = await bcrypt.hash(password, 10);
      await Admin.updateOne(
        { email: req.session.user },
        {
          password: pwd,
        }
      );
      req.flash("success", "Profile updated!");
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/admin/edit-profile");
    }
  }
  if (image) {
    try {
      const data = await Admin.updateOne(
        { email: req.session.user },
        {
          profilePicture: `/images/${imageName}`,
        }
      );
      req.flash("success", "Profile updated!");
      return res.redirect("/admin/edit-profile");
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/admin/edit-profile");
    }
  }
};
const editProfileCredentials = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    req.flash("error", "Name is required!");
    return res.redirect("/admin/edit-profile");
  }
  try {
    const user = await Admin.updateOne(
      { email: req.session.user },
      {
        name,
      }
    );
    await Log.create({
      text: `Edit profile  - Admin`,
      date: new Date(),
    });
    req.flash("success", "Profile updated!");
    return res.redirect("/admin/edit-profile");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/admin/edit-profile");
  }
};
const replyMessage = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { message } = req.body;
    const { id } = req.params;
    let user;
    const seller = await Seller.findOne({ _id: id });
    const buyer = await Buyer.findOne({ _id: id });
    user = seller || buyer;
    try {
      const admin = await Admin.findOne({ email: req.session.user });
      await Chat(message, id, admin._id, admin._id);
      await sendEmail({
        to: user.email,
        subject: `Chat notification`,
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear ${user.name},</p><br/> <p> You have received a chat message from admin, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      req.flash("success", "Message sent!");
      return res.redirect("/admin/chat-seller");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/chat-seller");
    }
  }
};
// Message functionality
const replyMessageAgent = async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;
  try {
    const admin = await Admin.findOne({ email: req.session.user });
    const user = await Agent.findOne({ _id: id });
    await Chat(message, id, admin._id, admin._id);
    await sendEmail({
      to: user.email,
      subject: `Chat notification`,
      template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear ${user.name},</p><br/> <p> You have received a chat message from admin, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
    });
    await Log.create({
      text: `Replied to agent message - Admin`,
      date: new Date(),
    });
    req.flash("success", "Message sent!");
    return res.redirect("/admin/chat-agent");
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/admin/chat-agent");
  }
};

//Edit Seller
const editSellerDetails = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      const { name, email, phone, address, zipCode, license, city, state } =
        req.body;

      const { id } = req.params;
      await Log.create({
        text: `Edit Seller Details  - Admin`,
        date: new Date(),
      });
      await Seller.updateOne(
        { _id: id },
        { $set: { name, email, phone, address, zipCode, license, city, state } }
      );
      req.flash("success", "Seller details updated!");
      return res.redirect("/admin/seller-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/seller-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const deleteSeller = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { id } = req.params;
    try {
      await Log.create({
        text: `Deleted Seller - Admin`,
        date: new Date(),
      });
      await Seller.deleteOne({ _id: id });
      req.flash("success", "Seller deleted!");
      return res.redirect("/admin/seller-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/seller-review");
    }
  } else {
    req.flash("error", "Please login!");
    res.redirect("/admin/");
  }
};
const unapproveSeller = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { id } = req.params;
    try {
      await Seller.updateOne(
        { _id: id },
        {
          $set: {
            status: "disapproved",
          },
        }
      );
      req.flash("success", "Seller unapproved!");
      return res.redirect("/admin/seller-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/seller-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const editBuyerDetails = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { id } = req.params;

    const { name, email, phone, address, zipCode, license, city, state } =
      req.body;

    try {
      await Buyer.updateOne(
        { _id: id },
        { $set: { name, email, phone, address, zipCode, license, city, state } }
      );
      await Log.create({
        text: `Edit Buyer Details  - Admin`,
        date: new Date(),
      });
      req.flash("success", "Buyer details updated!");
      return res.redirect("/admin/buyer-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/buyer-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const  viewMessageSeller = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { senderOne,senderTwo} = req.params;
    try {
     await Message.updateOne({ senderOne,senderTwo },  { $set:{'viewMessage':true} })
      await Log.create({
        text: `Message View  - Admin`,
        date: new Date(),
      });
      req.flash("success", "Message Unread!");
     
    return res.redirect("/admin/agent-to-seller-message");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const  viewMessageBuyer = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { senderOne,senderTwo} = req.params;
    try {
     await Message.updateOne({ senderOne,senderTwo },  { $set:{'viewMessage':true} })
      await Log.create({
        text: `Message View  - Admin`,
        date: new Date(),
      });
      req.flash("success", "Message Unread!");
     
    return res.redirect("/admin/agent-to-buyer-message");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const deleteBuyer = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      await Log.create({
        text: `Deleted Buyer  - Admin`,
        date: new Date(),
      });
      await Buyer.deleteOne({ _id: id });
      req.flash("success", "Buyer deleted!");
      return res.redirect("/admin/buyer-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/buyer-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const unapproveBuyer = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { id } = req.params;
    try {
      await Buyer.updateOne(
        { _id: id },
        {
          $set: {
            status: "disapproved",
          },
        }
      );

      await Log.create({
        text: `Disapproved Buyer - Admin`,
        date: new Date(),
      });
      req.flash("success", "Buyer unapproved!");
      return res.redirect("/admin/buyer-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/buyer-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const editAgentDetails = async (req, res) => {
  console.log(req.body, req.params);
  if (req.session.user && req.session.role == "admin") {
    const { id } = req.params;
    const {
      name,
      email,
      screenName,
      password,
      professionalCategory,
      professionalTitle,
      license,
      city,
      timeZone,
      brokerageAddress,
      primaryPhone,
      brokeragePhone,
      state,
      zipCode,
      description,
      serviceAreas
    } = req.body;
    try {
      await Agent.updateOne(
        { _id: id },
        { $set: {name,
            email,
            screenName,
            password,
            professionalCategory,
            professionalTitle,
            license,
            city,
            timeZone,
            brokerageAddress,
            primaryPhone,
            brokeragePhone,
            state,
            zipCode,
            description,
            serviceAreas } }
      );

      await Log.create({
        text: `Updated Agent Details - Admin`,
        date: new Date(),
      });
      req.flash("success", "Agent details updated!");
      return res.redirect("/admin/agent-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/agent-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const deleteAgent = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      await Log.create({
        text: `Deleted Agent - Admin`,
        date: new Date(),
      });
      await Agent.deleteOne({ _id: id });
      req.flash("success", "Agent deleted successfully!");
      return res.redirect("/admin/agent-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/agent-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const unapproveAgent = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { id } = req.params;
    try {
      await Agent.updateOne(
        { _id: id },
        {
          $set: {
            status: "disapproved",
          },
        }
      );
      req.flash("success", "Agent unapproved successfully!");
      return res.redirect("/admin/agent-review");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/agent-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const upproveRole = async (req, res) => {
  if (req.session.user && req.session.role === "admin") {
    try {
      const { role } = req.params;
      if (role == 1) {
        const { id } = req.params;
        const user = await Agent.findOne({ _id: id });
        await Agent.updateOne(
          { _id: id },
          {
            $set: { status: "approved" },
          }
        );
        await sendEmail({
          to: user.email,
          subject: "Registration request approved",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Approved Agent  - Admin`,
          date: new Date(),
        });
        req.flash("success", "Agent approved!");
        return res.redirect("/admin/main");
      } else if (role == 2) {
        const { id } = req.params;
        const user = await Seller.findOne({ _id: id });
        await Seller.updateOne(
          { _id: id },
          {
            $set: {
              status: "approved",
            },
          }
        );
        await sendEmail({
          to: user.email,
          subject: "Registration request approved",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Approved Seller - Admin`,
          date: new Date(),
        });
        req.flash("success", "Seller approved!");
        return res.redirect("/admin/main");
      } else if (role == 3) {
        const { id } = req.params;
        const user = await Buyer.findOne({ _id: id });
        await Buyer.updateOne(
          { _id: id },
          {
            $set: { status: "approved" },
          }
        );
        await sendEmail({
          to: user.email,
          subject: "Registration request approved",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Approved Buyer - Admin`,
          date: new Date(),
        });
        req.flash("success", "Buyer approved!");
        return res.redirect("/admin/main");
      }
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/main");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const deleteRole = async (req, res) => {
  const { id, role } = req.params;
  if (req.session.user && req.session.role === "admin") {
    try {
      if (role == 1) {
        const user = await Agent.findOne({ _id: id });
        await sendEmail({
          to: user.email,
          subject: "Registration request deleted",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Dissaproved Agent  - Admin`,
          date: new Date(),
        });
        await Agent.deleteOne({ _id: id });
        req.flash("success", "Agent deleted!");
        return res.redirect("/admin/main");
      } else if (role == 2) {
        const user = await Seller.findOne({ _id: id });
        await sendEmail({
          to: user.email,
          subject: "Registration request deleted",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Dissaproved Seller - Admin`,
          date: new Date(),
        });
        await Seller.deleteOne({ _id: id });
        req.flash("success", "Seller deleted!");
        return res.redirect("/admin/main");
      } else if (role == 3) {
        const user = await Buyer.findOne({ _id: id });
        await sendEmail({
          to: user.email,
          subject: "Registration request deleted",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Dissaproved Buyer - Admin`,
          date: new Date(),
        });
        await Buyer.deleteOne({ _id: id });
        req.flash("success", "Buyer deleted!");
        return res.redirect("/admin/main");
      }
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/main");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const disapproveRole = async (req, res) => {
  const { id, role } = req.params;
  if (req.session.user && req.session.role === "admin") {
    try {
      if (role == 1) {
        //Agent
        const user = await Buyer.findOne({ _id: id });
        await Agent.updateOne(
          { _id: id },
          {
            $set: { status: "disapproved" },
          }
        );
        await sendEmail({
          to: user.email,
          subject: "Registration request disapproved",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Admin has disapproved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Dissaproved Agent - Admin`,
          date: new Date(),
        });
        req.flash("success", "Agent unapproved!");
        return res.redirect("/admin/main");
      } else if (role == 2) {
        const user = await Seller.findOne({ _id: id });
        await Seller.updateOne(
          { _id: id },
          {
            $set: { status: "disapproved" },
          }
        );
        await sendEmail({
          to: user.email,
          subject: "Registration request disapproved",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Admin has disapproved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Dissaproved Seller  - Admin`,
          date: new Date(),
        });
        req.flash("success", "Seller unapproved!");
        return res.redirect("/admin/main");
      } else if (role == 3) {
        const user = await Buyer.findOne({ _id: id });
        await Buyer.updateOne(
          { _id: id },
          {
            $set: { status: "disapproved" },
          }
        );
        await sendEmail({
          to: user.email,
          subject: "Registration request disapproved",
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Admin has disapproved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Dissaproved Buyer - Admin`,
          date: new Date(),
        });
        req.flash("success", "Buyer unapproved!");
        return res.redirect("/admin/main");
      }
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/main");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const editOrApproveMessageAgentToSeller = async (req, res) => {

  if (req.session.user && req.session.role == "admin") {
    const { messageId, state } = req.params;
    const { message, approve } = req.body;
    try {
      if (approve == "Edit") {
        await Message.updateOne(
          {
            "chat._id": messageId,
          },
          {
            $set: {
              "chat.$.message": message,
              "viewMessage":true
            },
          }
        );
        await Log.create({
          text: `Edit chat message  - Admin`,
          date: new Date(),
        });
      } else if (approve == "Approve") {
        await Message.updateOne(
          {
            "chat._id": messageId,
          },
          {
            $set: {
              "chat.$.approved": true,
              "viewMessage":true
            },
          }
        );
        const messageDetail = await Message.findOne(
          {
            "chat._id": messageId,
          },
          { "chat.$": 1, senderOne: 1, senderTwo: 1 }
        );
        const receiverId = [messageDetail.senderOne, messageDetail.senderTwo];
    console.log('receiverId',receiverId)
        
        const senderId = messageDetail.chat[0].senderId;
        const isAgentSender = await Agent.exists({ _id: senderId });
        let receiver, sender;
        if (isAgentSender) {
          if (state == 1) {
            receiver = await Seller.findOne({ _id: receiverId });
          } else if (state == 2) {
            receiver = await Buyer.findOne({ _id: receiverId });
          }
          sender = await Agent.findOne({ _id: senderId });
        } else {
          console.log(state);
          if (state == 1) {
            sender = await Seller.findOne({ _id: senderId });
          } else if (state == 2) {
            sender = await Buyer.findOne({ _id: senderId });
          }
          receiver = await Agent.findOne({ _id: receiverId });
        }

        console.log(sender);

        await Log.create({
          text: `Approved chat message  - Admin`,
          date: new Date(),
        });

        await sendEmail({
          to: receiver.email,
          subject: `Chat notification`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear ${receiver.name},</p><br/> <p> You have received a chat message from ${sender.name}, with below details: </p><p class="text-center">Message: ${messageDetail.chat[0].message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
      }
      req.flash("success", "Message updated successfully!");
      if (state == 1) {
        return res.redirect("/admin/agent-to-seller-message");
      } else if (state == 2) {
        return res.redirect("/admin/agent-to-buyer-message");
      } else {
        return res.redirect("/admin/main");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/admin/agent-review");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const setInviteAgent = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    // TODO: later implement phone and company name
    const { name, email, phone, company_name } = req.body;
    try {
      await InvitedAgent.create({
        name,
        brokeragePhone: phone,
        email,
        companyName: company_name,
      });
      await sendEmail({
        to: email,
        subject: "Invitation To Agent",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${name},</p><br/> <p> We hope you are fine. We are inviting you to experience our website. We are sure you will love our platform. </p><p class="text-center">Complete Registeration <a href="${process.env.REGISTER_URL}/step1/${email}/${name}"> <strong>here</strong></a></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Invited an agent.details : ${name} - Admin`,
        date: new Date(),
      });
      req.flash("success", "Invitation sent!");
      return res.redirect("/admin/create-agent-profile");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/create-agent-profile");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const editPromotionalMessage = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      //message id
      const { id, buyerId } = req.params;
      const { action, message } = req.body;
      const buyerPromMessage = await Buyer.findOne(
        { _id: buyerId, "promotionalMessages._id": id },
        "promotionalMessages.$"
      );
      if (!buyerPromMessage) {
        req.flash("error", "Promotional message not found!");
        return res.redirect("/admin/promotional-agent-to-buyer-message");
      }
      const agent = await Agent.findOne({
        id: buyerPromMessage?.promotionalMessages[0]?.agentId,
      });
      if (action == "Edit") {
        await Buyer.updateOne(
          { _id: buyerId, "promotionalMessages._id": id },
          { $set: { "promotionalMessages.$.message": message } }
        );
        const buyer = await Buyer.findOne({ _id: buyerId });
        await Log.create({
          text: `Edit promotional message sent by buyer, details - name : ${buyer?.name} - Admin`,
          date: new Date(),
        });
        req.flash("success", "Message updated!");
        return res.redirect("/admin/promotional-agent-to-buyer-message");
      } else if (action == "Approve") {
        await Buyer.updateOne(
          { _id: buyerId, "promotionalMessages._id": id },
          { $set: { "promotionalMessages.$.approve": true } }
        );
        const buyer = await Buyer.findOne({ _id: buyerId });
        await sendEmail({
          to: buyer.email,
          subject: `Promotional message received`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Prmotional message</b></h5> <p>Dear ${buyer.name},</p><br/> <p> You have received a promotional message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Approved promotional message sent by buyer, details -name : ${buyer?.name} - Admin`,
          date: new Date(),
        });
        req.flash("success", "Message approved!");
        return res.redirect("/admin/promotional-agent-to-buyer-message");
      } else {
        return res.redirect("/admin/promotional-agent-to-buyer-message");
      }
    } catch (err) {
      res.render(
        "errorpages/404",
        sendData(
          500,
          "Internal Server Error",
          err.message,
          "/admin/create-agent-profile"
        )
      );
    }
  } else {
    return res.redirect("/admin/");
  }
};
const editPromotionalMessageSeller = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      //message id
      const { id, sellerId } = req.params;
      const { action, message } = req.body;
      const sellerPromMessage = await Seller.findOne(
        { _id: sellerId, "promotionalMessages._id": id },
        "promotionalMessages.$"
      );
      if (!sellerPromMessage) {
        req.flash("error", "Promotional message not found!");
        return res.redirect("/admin/promotional-agent-to-seller-message");
      }
      const agent = await Agent.findOne({
        id: sellerPromMessage?.promotionalMessages[0]?.agentId,
      });
      if (action == "Edit") {
        await Seller.updateOne(
          { _id: sellerId, "promotionalMessages._id": id },
          { $set: { "promotionalMessages.$.message": message } }
        );
        const seller = await Seller.findOne({ _id: sellerId });
        await Log.create({
          text: `Edit promotional message sent by seller, details - name : ${seller.name} - Admin`,
          date: new Date(),
        });
        req.flash("success", "Message updated!");
        return res.redirect("/admin/promotional-agent-to-seller-message");
      } else if (action == "Approve") {
        await Seller.updateOne(
          { _id: sellerId, "promotionalMessages._id": id },
          { $set: { "promotionalMessages.$.approve": true } }
        );
        const seller = await Seller.findOne({ _id: sellerId });
        await sendEmail({
          to: seller.email,
          subject: `Promotional message received`,
          template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Prmotional message</b></h5> <p>Dear ${seller.name},</p><br/> <p> You have received a promotional message from ${agent.name}, with below details: </p><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
        });
        await Log.create({
          text: `Approved promotional message sent by seller, details - name : ${seller.name} - Admin`,
          date: new Date(),
        });
        req.flash("success", "Message approved!");
        return res.redirect("/admin/promotional-agent-to-seller-message");
      } else {
        return res.redirect("/admin/promotional-agent-to-seller-message");
      }
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/promotional-agent-to-seller-message");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const editAgent = async (req, res) => {
  if (req.session.user && req.session.role === "admin") {
    try {
      const { agentId } = req.params;
      const {
        name,
        professionalCategory,
        professionalTitle,
        license,
        city,
        timeZone,
        brokerageAddress,
        brokeragePhone,
        serviceAreas,
        state,
        reviewOne,
        reviewTwo,
        reviewThree,
        description,
      } = req.body;
      await Agent.updateOne(
        { _id: agentId },
        {
          $set: {
            name,
            professionalCategory,
            professionalTitle,
            license,
            city,
            timeZone,
            brokerageAddress,
            brokeragePhone,
            serviceAreas,
            state,
            reviewOne,
            reviewTwo,
            reviewThree,
            description,
          },
        }
      );
      const agent = await Agent.findOne({ _id: agentId });
      await sendEmail({
        to: user.email,
        subject: "Details updated by admin",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Details updated</b></h5> <p>Dear ${agent.name},</p><br/> <p> Admin has updated your profile details. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Edit agent details, name : ${agent.name} - Admin`,
        date: new Date(),
      });
      req.flash("success", "Agent details updated!");
      return res.redirect("/admin/invited-agent");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/invited-agent");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const approveAgentInvited = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      const { id } = req.params;
      await Agent.updateOne(
        { _id: id },
        //disapproved', 'approved'
        { $set: { status: "approved" } }
      );
      const user = await Agent.findOne({ _id: id });
      await sendEmail({
        to: user.email,
        subject: "Registration approved",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Congratulations, Admin has approved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Approved Invited Agent, name : ${user.name} - Admin`,
        date: new Date(),
      });
      req.flash("success", "Registration approved!");
      return res.redirect("/admin/invited-agent");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/invited-agent");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const disapproveAgentInvited = async (req, res) => {
  if (req.session.user && req.session.role === "admin") {
    try {
      const { id } = req.params;
      await Agent.updateOne({ _id: id }, { $set: { status: "disapproved" } });
      const user = await Agent.findOne({ _id: id });
      await sendEmail({
        to: user.email,
        subject: "Registration disapproved",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Account approved</b></h5> <p>Dear ${user.name},</p><br/> <p> Admin has disapproved your registration request. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Disapproved Invited Agent, name : ${user.name} - Admin`,
        date: new Date(),
      });
      req.flash("success", "Registration disapproved!");
      return res.redirect("/admin/invited-agent");
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/invited-agent");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
// brokerAId: mongoose.Schema.Types.ObjectId,
//     brokerBId: mongoose.Schema.Types.ObjectId,
//     price: String,
//     percentage: String,
//     brokerA: String,
//     dateBrokerA:String,
//     brokerB: String,
//     dateBrokerB: String
const sendReferralAgreement = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    try {
      const admin = await Admin.findOne({ email: req.session.user });
      const { id, pid, state, uid, bid } = req.params;
      const {
        brokerA,
        brokerB,
        dateBrokerA,
        dateBrokerB,
        price,
        pgp,
        pfc,
        plc,
        psc,
        other,
        additionalTerms,
      } = req.body;
      let percentage;
      let type;
      if (
        (price !== "" || price !== "$") &&
        pgp == "" &&
        pfc == "" &&
        plc == "" &&
        psc == "" &&
        other == ""
      ) {
        type = "amount";
        percentage = price + "$";
      } else if (
        pgp !== "" &&
        price == "" &&
        pfc == "" &&
        plc == "" &&
        psc == "" &&
        other == ""
      ) {
        type = "pgp";
        percentage = pgp + "%";
      } else if (
        pfc !== "" &&
        price == "" &&
        pgp == "" &&
        plc == "" &&
        psc == "" &&
        other == ""
      ) {
        type = "pfc";
        percentage = pfc + "%";
      } else if (
        plc !== "" &&
        price == "" &&
        pgp == "" &&
        pfc == "" &&
        psc == "" &&
        other == ""
      ) {
        type = "plc";
        percentage = plc + "%";
      } else if (
        psc !== "" &&
        price == "" &&
        pgp == "" &&
        pfc == "" &&
        plc == "" &&
        other == ""
      ) {
        type = "psc";
        percentage = psc + "%";
      } else if (
        other !== "" &&
        price == "" &&
        pgp == "" &&
        pfc == "" &&
        psc == "" &&
        plc == ""
      ) {
        type = "other";
        percentage = other;
      } else {
        req.flash("error", "Please agree to one of 6 points!");
        return res.redirect("/admin/main");
      }
      const user = await Agent.findOne({
        _id: id,
      });

      if (!percentage) {
        req.flash("error", "All fields are required!");
        return res.redirect("/admin/main");
      }

      await ReferralAgreement.create({
        brokerAId: admin._id,
        brokerBId: id,
        propertyId: pid,
        bidId: bid,
        userId: uid,
        role: state == 2 ? "Seller" : "Buyer",
        brokerA,
        brokerB,
        dateBrokerA,
        dateBrokerB,
        percentage,
        additionalTerms,
        type,
      });
      await sendEmail({
        to: user.email,
        subject: "Referral Agreement",
        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Referral Agreement</b></h5> <p>Dear ${user.name},</p><br/> <p> Admin sent you a referral agreement, Please review and fill. Regards Countdown </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `Referral agreement sent - Admin`,
        date: new Date(),
      });
      req.flash("success", "Referral agreement sent!");
      if (state == 1) {
        return res.redirect("/admin/referral-agreement-agent-to-buyer");
      } else if (state == 2) {
        return res.redirect("/admin/referral-agreement-agent-to-seller");
      } else {
        return res.redirect("/admin/main");
      }
    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/main");
    }
  } else {
    req.flash("error", "Please login!");
    return res.redirect("/admin/");
  }
};
const deleteNotification = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    const { mid } = req.params;
    await Log.create({
      text: `Deleted a Log - Admin`,
      date: new Date(),
    });
    await Log.deleteOne({ _id: mid });
    req.flash("success", "Notification deleted!");
    return res.redirect("/admin/customize-notification");
  } else {
    return res.redirect("/admin/");
  }
};
const deleteAllNotification = async (req, res) => {
  if (req.session.user && req.session.role == "admin") {
    await Log.deleteMany({});

    await Log.create({
      text: `Deleted all previous logs - Admin`,
      date: new Date(),
    });
    req.flash("success", "All notifications deleted!");
    return res.redirect("/admin/customize-notification");
  } else {
    return res.redirect("/admin/");
  }
};

module.exports = {
  replyMessage,
  viewMessageSeller,
  viewMessageBuyer,
  approveAgent,
  disapproveAgent,
  deleteAgent,
  registerAdmin,
  loginAdmin,
  handleLogout,
  changePassword,
  editProfileCredentials,
  replyMessageAgent,
  editSellerDetails,
  deleteSeller,
  unapproveSeller,
  editBuyerDetails,
  deleteBuyer,
  unapproveBuyer,
  editAgentDetails,
  unapproveAgent,
  upproveRole,
  deleteRole,
  disapproveRole,
  editOrApproveMessageAgentToSeller,
  setInviteAgent,
  editPromotionalMessage,
  editPromotionalMessageSeller,
  editAgent,
  approveAgentInvited,
  disapproveAgentInvited,
  sendReferralAgreement,
  deleteNotification,
  deleteAllNotification,
};
