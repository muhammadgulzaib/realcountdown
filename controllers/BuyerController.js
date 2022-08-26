const bcrypt = require('bcrypt');
const { Buyer, Admin, Bid, Agent, Log, BankDetail } = require('../models/Users');
const { sellerSchema } = require('./../middleware/validation/user');
const { EmailTemplateSeller } = require('./EmailTemplate');
const { sendMail, sendEmail } = require('./sendMailController');
const { sendData } = require('./helperFunction');
const { Chat } = require('./Chat');
const { v4: uuid } = require('uuid');
const addHours = require('date-fns/addHours');
const registerBuyer = async (req, res) => {
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
      return res.redirect('/buyer/register');
    }
    try {
      await sellerSchema.validateAsync(req.body);
    } catch (e) {
      req.flash('formData',req.body);
      req.flash('error',e.message);
      return res.redirect('/buyer/register');
    }
  
    // check for duplicate usernames in database
    const duplicate = await Buyer.exists({ email: email });
  
    if (duplicate) {
      req.flash('formData',req.body);
      req.flash('error','Account with this email already exists');
      return res.redirect('/buyer/register');
    }
  
    try {
      //   encrypt the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // store the new user
      const user = await Buyer.create({
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
        subject: "New Buyer Registered", 
        template:
          `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}table, td{border: 1px solid black; border-collapse: collapse;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span> <h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3> </span> </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"> <b>New buyer Registered</b> </h5> <p>Dear Admin,</p><br/> <p> New buyer has been registered with below details: </p><table style="width: 60%;"> <tbody> <tr> <td>Name</td><td>${user.name}</td></tr><tr> <td>Email</td><td>${user.email}</td></tr><tr> <td>Phone</td><td>${user.phone}</td></tr><tr> <td>State</td><td>${user.state}</td></tr><tr> <td>City</td><td>${user.city}</td></tr><tr> <td>Address</td><td>${user.address}</td></tr><tr> <td>Zipcode</td><td>${user.zipCode}</td></tr><tr> <td>License</td><td>${user.license}</td></tr></tbody> </table> <br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await sendEmail({
        to: user.email,
        subject: "Your Registration was successfull",
        template:
          `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Registration Successful</b></h5> <p>Dear ${user.name},</p><br/> <p> You have successfully registered as buyer, wait 24 to 48 hours for approval </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
      });
      await Log.create({
        text: `New buyer Registered {email : ${email}}`,
        date: new Date(),
      });
      req.flash('success',' You have successfully registered as buyer, please wait 24 hours for approval!');
      return res.redirect("/buyer/");
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/buyer/register');
    }
  };
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('formData',req.body);
        req.flash('error',"Please provide email and password!");
        return res.redirect('/buyer/register');
    }

    let foundUser = await Buyer.findOne({ email: email });

    if (!foundUser) {
        req.flash('error',"Account not found!");
        return res.redirect('/buyer/register')
    }

    //   Evaluate password
    const match = await bcrypt.compare(password, foundUser.password);

    if (match  && foundUser.status == 'approved') {
        req.session.user = email;
        req.session.name = (await Buyer.findOne({ email: email })).name;
        req.session.image = (
            await Buyer.findOne({ email: email })
        ).profilePicture;
        req.session.role = 'buyer';
        await Log.create({
            text: `Buyer Logged in {email: ${email}}`,
            date: new Date()
        })
        req.flash('success',"Logged in sucessfully!");
        return res.redirect('/buyer/main');
    }else if(match && foundUser.status !== "approved"){
        return res.render("errorpages/not-approved");
      } else {
        req.flash('formData',req.body);
        req.flash('error',"Invalid password!");
        return res.redirect('/buyer/');
      }


};
const handleLogout = async (req, res) => {
    if (req.session.user && req.session.role === 'buyer') {
        await Log.create({
            text: `Buyer Logged out {email: ${req.session.user}}`,
            date: new Date()
        })
        req.session.destroy(async function (err) {
            if (err) {
                req.flash('error',"Something went wrong!");
                return res.redirect('/buyer/main');
            } else {
                return res.redirect('/buyer/');
            } 
        });
    } else {
        return res.redirect('/buyer/');
    }
};

const addProperty = async (req, res) => {
    if (req.session.user && req.session.role == 'buyer') {
        try {
            const { area, addressLine, state, zipCode, checked } = req.body;
            if (!checked) {
                req.flash('error','Please agree terms and conditions!');
                return res.redirect('/buyer/add-property');
            }
            const buyer = await Buyer.findOne({ email: req.session.user });
            buyer.properties.push({
                addressLine,
                state,
                zipCode,
                area,
                checked,
            });
            await buyer.save();
            const propId = buyer.properties[buyer.properties.length - 1]._id;
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: "Add Property",
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Add Property</b></h5> <p>Dear admin,</p><br/> <p> ${buyer.name} has added a new property. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
              });
            await Log.create({
                text: `Buyer added his requested {email: ${req.session.user}}`,
                date: new Date()
            })
            req.flash('success','Property added successfully!');
            return res.redirect(`/buyer/start-countdown/${propId}`);
        } catch (err) {
            req.flash('error',err.message);
            return res.redirect('/buyer');
        }
    } 
    else
    req.flash('error','Please login!');
    return res.redirect('/buyer/');
};
const setCountdown = async (req, res) => {
    if (req.session.user && req.session.role == 'buyer') {
        try {
            const { id } = req.params;
            const { timeCountdown } = req.body;
            const time = timeCountdown.split(' ')[0];
            await Buyer.updateOne(
                {
                    'properties._id': id,
                },
                {
                    $set: {
                        'properties.$.countdown': time,
                        'properties.$.updatedAt': new Date(),
                        'properties.$.isOver': false,
                    },
                }
            );
            await Log.create({
                text: `Buyer set the countdown to his requested {email: ${req.session.user}}`,
                date: new Date()
            })
            return res.redirect(`/buyer/start-countdown/${id}`);
        } catch (err) {}
    } else 
    req.flash('error','Please login!')
    return res.redirect('/buyer/');
};
const chatAdmin = async (req, res) => {
    if (req.session.user && req.session.role === 'buyer') {
        const { message } = req.body;

        const user = await Buyer.findOne({ email: req.session.user });
        const userId = user._id;
        const admin = await Admin.findOne({});
        const adminId = admin._id;
        try {
            await Chat(message, userId, adminId, userId);
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: "Chat notification",
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat notification</b></h5> <p>Dear Admin,</p><br/> <p> You have received a chat message from ${user.name}, with below details: </p><br><p class="text-center">Message: ${message}</p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
            });
            await Log.create({
                text: `Buyer sent you message {email: ${req.session.user}}`,
                date: new Date()
            })
            return res.redirect('/buyer/chat-admin');
        } catch (err) {
            req.flash('error',err.message);
            return res.redirect('/buyer/chat-admin')
        }
    }
};
const startCountDown = async (req, res)=>{
    if (req.session.user && req.session.role == 'buyer') {
        const { id } = req.query;
        const as = await Buyer.findOne({
            'properties._id': id,
        });
        const property = as.properties.filter((property) => property._id == id);
        try {
            await Buyer.updateOne(
                { 'properties._id': id },
                {
                    $set: {
                        'properties.$.countdownOverAt': addHours(
                            new Date(),
                            parseInt(property[0].countdown)
                        ),
                        'properties.$.updatedAt': new Date(),
                        'properties.$.isOver': false,
                    },
                }
            );
            await Log.create({
                text: `Buyer started countdown {email: ${req.session.user}}`,
                date: new Date()
            })
            req.flash('success','Countdown started successfully!');
            res.redirect('/buyer/start-countdown/' + id);
        } catch (err) {
            req.flash('error',err.message);
            return res.redirect('/buyer/start-countdown/'+id);
        }
    } else {
        return res.redirect('/buyer/');
    }
}
const acceptBid = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {aid, pid} = req.params;
        try{
            const agent = await Agent.findOne({_id: aid});
            const buyer = await Buyer.findOne({email: req.session.user});
            const buyerProperty = await Buyer.findOne({'properties._id':pid}, 'properties.$');
            const exists = await Bid.exists({
                userId: buyer._id,
                bidOnProperty: pid,
                status: 'Accepted'
            })
            if(exists){
                const prevBidder = await Bid.findOne({
                    userId: buyer._id,
                    bidOnProperty: pid,
                    status: 'Accepted'
                })
                req.flash('error', 'Bid canceled as agent is already assigned to this property!');
                await Bid.updateOne({agentId: prevBidder.agentId, bidOnProperty: pid}, {$set: {status: 'Canceled'}})
                await sendEmail({
                    to: agent.email,
                    subject: "Bid cancelled",
                    template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Cancelled</b></h5> <p>Dear ${agent.name},</p><br/> <p> Your bid on property ${buyerProperty?.properties[0]?.area} is cancelled. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
                });
            } else {
                req.flash('success', 'Bid accepted!');
                await Bid.updateOne({agentId: aid, bidOnProperty: pid}, {$set: {status: 'Accepted'}})
                await sendEmail({
                    to: agent.email,
                    subject: "Bid accepted",
                    template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Accepted</b></h5> <p>Dear ${agent.name},</p><br/> <p> Your bid on property ${buyerProperty?.properties[0]?.area} is accepted. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
                });
                await Log.create({
                    text: `Buyer accepted bid {email: ${req.session.user}}`,
                    date: new Date()
                })
            }
            return res.redirect('/buyer/waiting-bids')
        }catch(err){
            req.flash('error',err.message);
            return res.redirect('/buyer/start-countdown/'+pid);
        }
    }else{
        req.flash('error','Please login!');
        return res.redirect('/buyer/')
    }
}
const rejectBid = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {aid, pid} = req.params;
        try{
            const agent = await Agent.findOne({_id: aid});
            const buyerProperty = await Buyer.findOne({'properties._id':pid}, 'properties.$');
            await Bid.updateOne({agentId: aid, bidOnProperty: pid}, {$set: {status: 'Rejected'}})
            await sendEmail({
                to: agent.email,
                subject: "Bid rejected",
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Bid Rejected</b></h5> <p>Dear ${agent.name},</p><br/> <p> Your bid on property <b>${buyerProperty?.properties[0]?.area} </b> is rejected </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
              });
            await Log.create({
                text: `Buyer rejected bid {email: ${req.session.user}}`,
                date: new Date()
            })
            req.flash('success', 'Bid rejected successfully!');
            return res.redirect('/buyer/waiting-bids')
        }catch(err){
            req.flash('error',err.message);
            return res.redirect('/buyer/start-countdown/'+id);
        }
    }else{
        req.flash('error','Please login!');
        return res.redirect('/buyer/')
    }
}
const chatAgent = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const { id } = req.params;

        const { message } = req.body;
        const user = await Buyer.findOne({ email: req.session.user });
        const userId = user._id;
        const agent = await Agent.findOne({ _id: id });
        const agentId = agent._id;
        try {
            Chat(message, userId, agentId, userId)
                .then(async (data) => {
                    await sendEmail({
                        to: process.env.ADMIN_EMAIL,
                        subject: `Chat request`,
                        template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Chat request</b></h5> <p>Dear admin,</p><br/> <p> ${user.name} has sent a chat message to ${agent.name}, please review the message and approve. Below are the details, </p><br><p>Message: <strong>${message}</strong></p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
                      });
                    await Log.create({
                        text: `Buyer messaged agent {email: ${req.session.user}}`,
                        date: new Date()
                    })
                    return res.redirect(`/buyer/chat-agent/${agentId}`);
                })
                .catch((err) => {
                    {
                        req.flash('error',err.message);
                        return res.redirect(`/buyer/chat-agent/${agentId}`);
                    }
                });
        } catch (err) {
            req.flash('error',err.message);
            return res.redirect(`/buyer/chat-agent/${agentId}`);
        }
    }
}
const sendInviteToBidAgain = async (req, res) => {
    if (req.session.user && req.session.role == "buyer") {
      const { aid, pid } = req.params;
      const agent = await Agent.findOne({ _id: aid });
      const buyer = await Buyer.findOne({ email: req.session.user });
      const buyerProperty = await Buyer.findOne({'properties._id':pid}, 'properties.$');
      const exists = await Bid.exists({
        agentId: aid,
        userId: buyer._id,
        bidOnProperty: pid
      });
      if(exists){
        const bid = await Bid.findOne({
          agentId: aid,
          userId: buyer._id,
          bidOnProperty: pid
        });
        if(bid.status === 'Waiting'){
          req.flash('error', 'Agent has already bid on this property, Please check the waiting bids!');
          res.redirect('/buyer/rejected-bids');
        } else if(bid.status === 'Invited'){
          req.flash('error', 'You have already invited this agent, Please wait for there response!');
          res.redirect('/buyer/rejected-bids');
        } else if(bid.status === 'Rejected') {
          const updateBid = await Bid.updateOne({_id: bid._id},{
            $set:{
              status: 'Invited'
            }
          })
          if(updateBid){
            req.flash('success', 'Invitation sent!');
            await sendEmail({
              to: agent.email,
              subject: `Invitation to carry on with the trust`,
              template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${buyer.name} has invited you to be their agent for property ${buyerProperty.properties[0].area}. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
            });
            await Log.create({
              text: `Buyer sent invitation to rebid with less commision {email : ${buyer.email}}`,
              date: new Date(),
            });
          }
        }
        return res.redirect("/buyer/rejected-bids");
      } else {
        return res.redirect("/buyer/rejected-bids");
      }
    } else {
      req.flash('error','Please login!')
      return res.redirect("/buyer/");
    }
  };
const sendInvitation = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {aid,state} = req.params;
        const redirectLink = state == 1 ? "/buyer/state-listing" : "/buyer/country-listing"
        const {propertyId} = req.body;
        const buyer = await Buyer.findOne({email: req.session.user})
        const buyerProperty = await Buyer.findOne(
            { _id: buyer._id, "properties._id": propertyId },
            "properties.$"
          );
        if(!buyerProperty){
          req.flash('error', 'Please select a property with active countdown!');
          return res.redirect('/buyer/successful-bids');
        }
        const agent = await Agent.findOne({_id: aid});
        const exists = await Bid.exists({
            agentId: aid,
            userId: buyer._id,
            bidOnProperty: propertyId
          });
        if(exists){
            const bid = await Bid.findOne({
              agentId: aid,
              userId: buyer._id,
              bidOnProperty: propertyId
            });
            if(bid.status === 'Accepted'){
              req.flash('error', 'Already accepted for same agent and property!');
              return res.redirect('/buyer/successful-bids');
            } else if(bid.status === 'Waiting'){
              req.flash('error', 'Agent has already bid on this property, Please check the waiting bids!');
              return res.redirect('/buyer/successful-bids');
            } else if(bid.status === 'Invited'){
              req.flash('error', 'You have already invited this agent, Please wait for there response!');
              return res.redirect('/buyer/successful-bids');
            } else if(bid.status === 'Rejected') {
              await Bid.updateOne({_id: bid._id},{
                $set:{
                  status: 'Invited'
                }
              })
              await sendEmail({
                to: agent.email,
                subject: `Invitation to carry on with the trust`,
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${buyer.name} would like you to bid on their other property ${buyerProperty.properties[0].area}, upon the completion of this deal. Would love to work together </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
              });
              await Log.create({
                text: `Buyer send invitation to agent on successfull deal {email: ${req.session.user}}`,
                date: new Date()
            })
                req.flash('success','Invitation sent!');
                return res.redirect('/buyer/successful-bids')
            }
            return res.redirect('/buyer/successful-bids')
        } else {
            await Bid.create({
              role: "Buyer",
              agentId: agent._id,
              userId: buyer._id,
              bidOnProperty: propertyId,
              agentProfilePicture: agent.profilePicture,
              screenName: agent.screenName,
              commision: agent.commision,
              status: "Invited",
              bidOverAt: buyerProperty.properties[0].countdownOverAt,
            })
            await sendEmail({
                to: agent.email,
                subject: `Invitation to carry on with the trust`,
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${buyer.name} would like you to bid on their offer. </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
            });
            req.flash('success','Invitation sent!');
            return res.redirect('/buyer/successful-bids')
          }
    }else{
        req.flash('error','Please login!');
        return res.redirect('/buyer/')
    }
}

const sendInviteOnSuccess = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {aid} = req.params;
        const {propertyId} = req.body;
        const buyer = await Buyer.findOne({email: req.session.user})
        const buyerProperty = await Buyer.findOne(
            { _id: buyer._id, "properties._id": propertyId },
            "properties.$"
          );
        if(!buyerProperty){
          req.flash('error', 'Please select a property with active countdown!');
          return res.redirect('/buyer/successful-bids');
        }
        const agent = await Agent.findOne({_id: aid});
        const exists = await Bid.exists({
            agentId: aid,
            userId: buyer._id,
            bidOnProperty: propertyId
          });
        if(exists){
            const bid = await Bid.findOne({
              agentId: aid,
              userId: buyer._id,
              bidOnProperty: propertyId
            });
            if(bid.status === 'Accepted'){
              req.flash('error', 'Already accepted for same agent and property!');
              return res.redirect('/buyer/successful-bids');
            } else if(bid.status === 'Waiting'){
              req.flash('error', 'Agent has already bid on this property, Please check the waiting bids!');
              return res.redirect('/buyer/successful-bids');
            } else if(bid.status === 'Invited'){
              req.flash('error', 'You have already invited this agent, Please wait for there response!');
              return res.redirect('/buyer/successful-bids');
            } else if(bid.status === 'Rejected') {
              await Bid.updateOne({_id: bid._id},{
                $set:{
                  status: 'Invited'
                }
              })
              await sendEmail({
                to: agent.email,
                subject: `Invitation to carry on with the trust`,
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${buyer.name} would like you to bid on their other property ${buyerProperty.properties[0].area}, upon the completion of this deal. Would love to work together </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
              });
              await Log.create({
                text: `Buyer send invitation to agent on successfull deal {email: ${req.session.user}}`,
                date: new Date()
            })
                req.flash('success','Invitation sent!');
                return res.redirect('/buyer/successful-bids')
            }
            return res.redirect('/buyer/successful-bids')
        } else {
            await Bid.create({
              role: "Buyer",
              agentId: agent._id,
              userId: buyer._id,
              bidOnProperty: propertyId,
              agentProfilePicture: agent.profilePicture,
              screenName: agent.screenName,
              commision: agent.commision,
              status: "Invited",
              bidOverAt: buyerProperty.properties[0].countdownOverAt,
            })
            await sendEmail({
                to: agent.email,
                subject: `Invitation to carry on with the trust`,
                template: `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Invitation</b></h5> <p>Dear ${agent.name},</p><br/> <p> ${buyer.name} would like you to bid on their other property ${buyerProperty.properties[0].area}, upon the completion of this deal. Would love to work together </p><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
            });
            await Log.create({
                text: `Buyer send invitation to agent on successfull deal {email: ${req.session.user}}`,
                date: new Date()
            })
            req.flash('success','Invitation sent!');
            return res.redirect('/buyer/successful-bids')
          }
    }else{
        req.flash('error','Please login!');
        return res.redirect('/buyer/')
    }
}
const editProfile = async (req, res)=>{
    if(req.session.role == 'buyer' && req.session.user){
        const {aid} = req.params
        const {name, phone} = req.body;
        await Buyer.updateOne( {_id: aid},{
            $set: {
                name,
                phone,
            }
        })
        await Log.create({
            text: `Buyer edit his profile {email: ${req.session.user}}`,
            date: new Date()
        })
        req.flash('success','Profile updated successfully!')
        return res.redirect('/buyer/edit-profile')
    }else{
        return res.redirect('/buyer/')
    }
}
const updatePassword = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {aid} = req.params;
        const {password, profilePicture} = req.body
        if(!password) {
            req.flash('error','Password cannot be empty!')
            return res.redirect('/buyer/edit-profile')
        }
        const hash = await bcrypt.hash(password, 10);
        await Buyer.updateOne({_id: aid}, {
            $set: {
                password: hash,
                profilePicture
            }
        })
        await Log.create({
            text: `Buyer updated his password {email: ${req.session.user}}`,
            date: new Date()
        })
        req.flash('success','Password updated successfully!')
        return res.redirect('/buyer/edit-profile')
    }else{
        return res.redirect('/buyer/')
    }
}
const turnPromotionalMessages = async (req, res)=>{
    if(req.session.user && req.session.role === 'buyer'){
        const {btn} = req.body

        await Buyer.updateOne({email: req.session.user}, {
            $set: {promotionalMessageState: btn === 'yes' ? true : false}
        })
        if(btn === "yes"){
            req.flash('success','Promotional messages turned on!')
          } else {
            req.flash('success','Promotional messages turned off!')
          }
        return res.redirect('/buyer/promotional-messages')
    }else{
        return res.redirect('/buyer/')
    }
}
const deletePromotionalMessages = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const buyer = await Buyer.findOne({email: req.session.user})
        buyer.promotionalMessages = []
        await buyer.save()
        req.flash('success','Promotional messages deleted successfully!');
        return res.redirect('/buyer/promotional-messages')
    }else{
        req.flash('error','Please login!');
        return res.redirect('/buyer/')
    }
}
const postAccountDetails = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {accountNumber, amount} = req.body
        const buyer = await Buyer.findOne({email: req.session.user})
        if(!buyer.promotionalBalance || (buyer.promotionalBalance < amount)){
            req.flash('error',`You have only \$${buyer.promotionalBalance ? buyer.promotionalBalance : 0} left to claim!`);
            return res.redirect("/buyer/promotional-messages");
          }
        const exists = await BankDetail.exists({
            userId: buyer._id
        })
        const intAmount = parseInt(amount);
        if(exists){
            await BankDetail.updateOne({userId: buyer._id},{
                $set: { accountNumber },
                $inc: {amount: intAmount}
            })
            await Buyer.updateOne({_id: buyer._id},{$inc: {promotionalBalance: -intAmount}});
        }else{
            await BankDetail.create({
                userId: buyer._id,
                accountNumber,
                amount,
                role: 'buyer'
            })
            await Buyer.updateOne({_id: buyer._id},{$inc: {promotionalBalance: -intAmount}});
        }
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "Claim request",
            template:
              `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"/> <style>.img-lgo{border-radius: 50%; height: 60px;}</style> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Countdown Page</title> </head> <body> <div class="card"> <div class="card-body"> <div class="container-fluid"> <div class="row"> <div class="col-md-12 bg-dark"> <span ><h3> <img class="img-lgo" src="/images/StandingCount (1).png" alt=""/> <i> <span class="pl-2 text-light">Real Countdown</span> </i> </h3></span > </div></div></div><div class="container-fluid"> <div class="row"> <div class="col-md-12"> <h5 class="text-center pt-3"><b>Claim request</b></h5> <p>Dear admin,</p><br/> <p> ${buyer.name}has requested to claim ${amount}$ for promotional messages. </p><br><p>Thank You,</p><p>RealCountdown Team</p><footer class="page-footer font-small blue bg-dark text-light"> <div class="footer-copyright text-center py-3"> <a href="https://mdbootstrap.com/"> RealCountdown.com</a><br>© 2021 Copyright: All Right Reserved. </div></footer> </div></div></div></div></div></body></html>`,
          });
        req.flash('success','Account details updated!')
        return res.redirect('/buyer/promotional-messages')
    }else{
        req.flash('error','Please login!')
        return res.redirect('/buyer/')
    }
}
const deleteMessage = async (req, res)=>{
    if(req.session.user && req.session.role == 'buyer'){
        const {mid} = req.params
        const buyer = await Buyer.findOne({email: req.session.user})

        buyer.promotionalMessages = buyer.promotionalMessages.filter(message=>!message._id.equals(mid))

        await buyer.save();
        req.flash('success','Message deleted successfully!')
        return res.redirect('/buyer/promotional-messages')
    }else{
        req.flash('error','Please login!')
        return res.redirect('/buyer/')
    }
}
module.exports = {
    registerBuyer,
    handleLogout,
    loginUser,
    addProperty,
    setCountdown,
    chatAdmin,
    chatAgent,
    startCountDown,
    acceptBid,
    rejectBid,
    sendInvitation,
    sendInviteOnSuccess,
    editProfile,
    updatePassword,
    turnPromotionalMessages,
    deletePromotionalMessages,
    postAccountDetails,
    deleteMessage,
    sendInviteToBidAgain
};
