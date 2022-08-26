// Views Here
const {
  Agent,
  Admin,
  Seller,
  Message,
  PromotionalMessage,
  Buyer,
  Bid,
  ReferralAgreement,
  Log,
} = require("../models/Users");

const bcrypt = require("bcrypt");
const { sendData } = require("./helperFunction");
const { readMessage, readMessages } = require("./Chat");
const { bidForProperty } = require("./AgentController");
const { ieNoOpen } = require("helmet");

const showLoginPage = (req, res) => {
  if (!req.session.user) return res.render("agent/login");
  return res.redirect("/agent/main");
};
const showRegisterOne = (req, res) => {
  return res.render("agent/register");
};
const showRegisterOneWithEmailAndName = async (req, res) => {
  const { email, name } = req.params;
  return res.render("agent/register", {
    email,
    name,
  });
};
const showRegisterTwo = (req, res) => {
  return res.render("agent/register_1", {
    email: req.query.email,
  });
};
const showRegisterThree = (req, res) => {
  return res.render("agent/register_2", {
    email: req.query.email,
  });
};
const showRegisterFour = (req, res) => {
  console.log(req.query.email, "========================");
  return res.render("agent/register_3", {
    email: req.query.email,
  });
};
const setEmail = (req, res) => {
  return res.send({
    email: req.query,
  });
};
const getRegisterationPlans = async (req, res) => {
  const { id } = req.params;
  return res.render("agent/reg-CDpay", {
    id,
  });
};
const getRegisterCharity = async (req, res) => {
  const { id } = req.params;
  return res.render("agent/reg-charity", {
    id,
  });
};
const showIndexPage = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const sellersBids = await Bid.find({
      status: 'Invited',
      role: "Seller",
      agentId: agent._id,
    }).populate({
      path: "userId",
      model: "Seller",
    });
    const buyerBids = await Bid.find({
      status: "Invited",
      role: "Buyer",
      agentId: agent._id,
    }).populate({
      path: "userId",
      model: "Buyer",
    });
    return res.render("agent/index", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      sellersBids,
      buyerBids,
    });
  } else
    req.flash('error','Please login!')
};
const editProfile = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const userData = await Agent.findOne({ email: req.session.user });
    return res.render("agent/edit-profile", {
      name: userData.name,
      email: userData.email,
      number: userData.brokeragePhone,
      commision: userData.commision,
      profilePicture: userData.profilePicture,
    });
  }
  return res.redirect("/agent/");
};
const getPayment = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { id } = req.params;
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render("agent/CDpayment", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      id,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getCharity = async (req, res) => {
  const { id } = req.params;
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render(`agent/charity`, {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      id,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getSellerBidsPage = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { id } = req.params;
    const { zipCode , Name}=req.body;
    try {
      const agentMain = await Agent.findOne({ email: req.session.user });
      if(!agentMain.countDownPlan){
          req.flash('error', 'Please buy a package!');
          return res.redirect('/agent/payment/1'); 
      }
      if(agentMain.countDownPlan){
        if(!agentMain.countDownBidBalance || (agentMain.countDownBidBalance && agentMain.countDownBidBalance <= 0)){
          req.flash('error', 'Your bids limit exhausted, please buy another package!');
          return res.redirect('/agent/payment/1'); 
        }
      }
      var prop = [];
      if(Name)
      {
          if(zipCode){
            prop  = await Seller.find({ properties: { $ne: null } ,zipCode,name:{ $regex: '.*' + Name + '.*',$options: 'i' }});
             
          }else{
            prop  = await Seller.find({ properties: { $ne: null } ,name:{ $regex: '.*' + Name + '.*',$options: 'i' }});
             
          }

      }else {
        if(zipCode){
          prop  = await Seller.find({ properties: { $ne: null } ,zipCode});
           
        }else{
          prop  = await Seller.find({ properties: { $ne: null } });
           
        }
       
      }




      var properitesWithInTimeRange = [];
      for (let i = 0; i < prop.length; i++) {
        prop[i].properties.forEach((property) => {
          if (
            new Date(property.countdownOverAt).getTime() -
              new Date().getTime() >
            0
          ) {
            const arr = {
              user: {
                _id: prop[i]._id,
                name: prop[i].name,
                phone: prop[i].phone,
                email: prop[i].email,
                address: prop[i].address,
                zipCode: prop[i].zipCode,
                license: prop[i].license,
                password: prop[i].password,
                role: prop[i].role,
                status: prop[i].status,
              },
              property: property,
            };
            properitesWithInTimeRange.push(arr);
          }
        });
      }

      return res.render("agent/seller-countdown", {
        email: req.session.user,
        hover_id:id,
        name: req.session.name,
        properties: properitesWithInTimeRange,
        screenName: agentMain.screenName,
        commision: agentMain.commision,
        id: agentMain._id,
        profilePicture: agentMain.profilePicture,
      });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect("/agent/");
    }
  } else {
    return res.redirect("/agent/");
  }
};
const getBuyerBidsPage = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { zipCode , Name}=req.body;
    const { id } = req.params;
    console.log(zipCode , Name)
    console.log(req.body)
    const agentMain = await Agent.findOne({ email: req.session.user });
    if(!agentMain.countDownPlan){
      req.flash('error', 'Please buy a package!');
      return res.redirect('/agent/payment/2'); 
  }
  if(agentMain.countDownPlan){
    if(!agentMain.countDownBidBalance || (agentMain.countDownBidBalance && agentMain.countDownBidBalance <= 0)){
      req.flash('error', 'Your bids limit exhausted, please buy another package!');
      return res.redirect('/agent/payment/2'); 
    }
  }
  var prop = [];
  if(Name)
  {
      if(zipCode){
        prop  = await Buyer.find({ properties: { $ne: null } ,zipCode,name:{ $regex: '.*' + Name + '.*',$options: 'i' }});
         
      }else{
        prop  = await Buyer.find({ properties: { $ne: null } ,name:{ $regex: '.*' + Name + '.*',$options: 'i' }});
         
      }

  }else {
    if(zipCode){
      prop  = await Buyer.find({ properties: { $ne: null } ,zipCode});
       
    }else{
      prop  = await Buyer.find({ properties: { $ne: null } });
       
    }
   
  }
    var properitesWithInTimeRange = [];
    for (let i = 0; i < prop.length; i++) {
      prop[i].properties.forEach((property) => {
        if (
          new Date(property.countdownOverAt).getTime() - new Date().getTime() >
          0
        ) {
          const arr = {
            user: {
              _id: prop[i]._id,
              name: prop[i].name,
              phone: prop[i].phone,
              email: prop[i].email,
              address: prop[i].address,
              zipCode: prop[i].zipCode,
              license: prop[i].license,
              password: prop[i].password,
              role: prop[i].role,
              status: prop[i].status,
            },
            property: property,
          };
          properitesWithInTimeRange.push(arr);
        }
      });
    }

    return res.render("agent/save_data", {
      email: req.session.user,
      hover_id:id,
      name: req.session.name,
      properties: properitesWithInTimeRange,
      screenName: agentMain.screenName,
      commision: agentMain.commision,
      id: agentMain._id,
      profilePicture: agentMain.profilePicture,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getPropertyDetails = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const { id } = req.params;
    let propertyD = [];
    try {
      const data = await Seller.findOne(
        { "properties._id": id },
        "properties.$"
      );
      console.log(data);
      return res.render("agent/buyer", {
        email: req.session.user,
        name: req.session.name,
        property: propertyD,
        profilePicture: agent.profilePicture,
        data,
      });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/agent/seller-countdown')
    }
  } else {
    res.redirect("/agent/");
  }
};
const getPropertyDetailsBuyer = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const { id } = req.params;
    let propertyD = [];
    try {
      const data = await Buyer.findOne({ "property._id": id });

      data.properties.forEach((property) => {
        if (property["_id"] == id) {
          propertyD.push(property);
        }
      });
      return res.render("agent/buyer-details", {
        email: req.session.user,
        name: req.session.name,
        property: propertyD,
        profilePicture: agent.profilePicture,
        id: agent._id,
        hover_id:id,
        agent,
      });
    } catch (err) {
      req.flash('error',err.message);
      return res.redirect('/agent/buyer-countdown');
    }
  } else {
    res.redirect("/agent/");
  }
};
const getWaitingBids = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agentMain = await Agent.findOne({ email: req.session.user });
    console.log(agentMain);
    const waitingBids = await Bid.find({
      role: "Seller",
      status: "Waiting",
      agentId: agentMain._id,
      bidOverAt: { $gte: new Date() },
    })
      .populate({
        path: "userId",
        model: "Seller",
      })
      .populate({
        path: "agentId",
        model: "Agent",
      });
    console.log(waitingBids);
    return res.render("agent/waiting-bids", {
      email: req.session.user,
      name: req.session.name,
      screenName: agentMain.screenName,
      commision: agentMain.commision,
      id: agentMain._id,
      profilePicture: agentMain.profilePicture,
      agentMain,
      waitingBids,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const chatWithAdmin = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const agentId = agent._id;
    const admin = await Admin.findOne({});
    const adminId = admin._id;

    readMessages(agentId, adminId)
      .then((data) => {
        return res.render("agent/adminchat", {
          email: req.session.user,
          name: req.session.name,
          profilePicture: agent.profilePicture,
          messages: data,
          agentId,
          admin,
        });
      })
      .catch((err) => {
        req.flash('error',err.message);
        return res.redirect('/agent/seller-countdown');
      });
  } else {
    return res.redirect("/agent/");
  }
};
const chatWithSeller = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const messages = await Message.find({
      senderTwo: agent._id,
    }).populate({
      path: "senderOne",
      model: "Seller",
    });

    let filteredMessages = [];
    messages?.forEach((message) => {
      if (
        message?.senderOne?.role === "seller" &&
        typeof message?.senderOne !== "undefined"
      ) {
        filteredMessages.push(message);
      }
    });

    let filteredVisibleMessages = [];
    filteredMessages.forEach((message) => {
      message.chat.forEach((chat) => {
        if (chat.approved) {
          filteredVisibleMessages.push(chat);
        } else if (chat.senderId.equals(agent._id)) {
          filteredVisibleMessages.push(chat);
        }
      });

      message.chat = filteredVisibleMessages;
    });
    return res.render("agent/sellerchat", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      messages: filteredMessages,
      agentId: agent._id,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const chatWithBuyer = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const messages = await Message.find({
      senderTwo: agent._id,
    }).populate({
      path: "senderOne",
      model: "Buyer",
    });
    let filteredMessages = [];
    messages?.forEach((message) => {
      if (
        message?.senderOne?.role === "buyer" &&
        typeof message?.senderOne !== "undefined"
      ) {
        filteredMessages.push(message);
      }
    });

    let filteredVisibleMessages = [];
    filteredMessages.forEach((message) => {
      message.chat.forEach((chat) => {
        if (chat.approved) {
          filteredVisibleMessages.push(chat);
        } else if (chat.senderId.equals(agent._id)) {
          filteredVisibleMessages.push(chat);
        }
      });

      message.chat = filteredVisibleMessages;
    });
    return res.render("agent/buyerchat", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      messages: filteredMessages,
      agentId: agent._id,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const chatWithCurrentBid = async (req, res) => {
  const { id } = req.params;
  const seller = await Seller.findOne({ _id: id });
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render("agent/chats", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      seller,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getAcceptedBids = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const acceptedBidsSeller = await Bid.find({
      role: "Seller",
      status: "Accepted",
      agentId: agent._id,
    })
      .populate({
        path: "userId",
        model: "Seller",
      })
      .populate({
        path: "agentId",
        model: "Agent",
      });
    const acceptedBidsBuyer = await Bid.find({
        role: "Buyer",
        status: "Accepted",
        agentId: agent._id,
      })
        .populate({
          path: "userId",
          model: "Buyer",
        })
        .populate({
          path: "agentId",
          model: "Agent",
        });
    const acceptedBids = [...acceptedBidsSeller,...acceptedBidsBuyer]
    return res.render("agent/accepted-bids", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      acceptedBids,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getRejectedBids = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agentMain = await Agent.findOne({ email: req.session.user });
    const rejectedBids = await Bid.find({
      role: "Seller",
      status: "Rejected",
      agentId: agentMain._id,
    })
      .populate({
        path: "userId",
        model: "Seller",
      })
      .populate({
        path: "agentId",
        model: "Agent",
      });
    return res.render("agent/rejected-bids", {
      email: req.session.user,
      name: req.session.name,
      screenName: agentMain.screenName,
      commision: agentMain.commision,
      id: agentMain._id,
      profilePicture: agentMain.profilePicture,
      agentMain,
      rejectedBids,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const chatSeller = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render("agent/sellerchat", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getMyCountdown = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const sellerBids = await Bid.find({
      role: "Seller",
      agentId: agent._id,
      bidOverAt: { $gte: new Date() },
    })
      .populate({
        path: "userId",
        model: "Seller",
      })
      .populate({
        path: "agentId",
        model: "Agent",
      });

    const buyerBids = await Bid.find({
      role: "Buyer",
      agentId: agent._id,
      bidOverAt: { $gte: new Date() },
    })
      .populate({
        path: "userId",
        model: "Buyer",
      })
      .populate({
        path: "agentId",
        model: "Agent",
      });
    return res.render("agent/mycountdown", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      sellerBids,
      buyerBids,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getChatPage = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const { id, state } = req.params;

    const agent = await Agent.findOne({ email: req.session.user });
    let seller;
    if (state == 1) {
      seller = await Seller.findOne({ _id: id }, "profilePicture");
    } else if (state == 2) {
      seller = await Buyer.findOne({ _id: id }, "profilePicture");
    }
    // console.log(seller)
    const agentId = agent._id;
    let msg = await readMessages(id, agentId);
    let filteredVisibleMessages = [];
    if (!msg) {
      msg = {
        chat: [],
      };
      return res.render("agent/chats", {
        email: req.session.user,
        name: req.session.name,
        profilePicture: agent.profilePicture,
        sellerProfile: seller.profilePicture,
        sellerId: id,
        msg,
        state,
      });
    }
    msg.chat.forEach((chat) => {
      if (chat.approved) {
        filteredVisibleMessages.push(chat);
      } else if (chat.senderId.equals(agent._id)) {
        filteredVisibleMessages.push(chat);
      }
    });
    msg.chat = filteredVisibleMessages;
    return res.render("agent/chats", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      sellerProfile: seller.profilePicture,
      sellerId: id,
      msg,
      state,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getPromotionalMessage = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const proMessages = await PromotionalMessage.find({
      agentId: agent._id,
    });
    return res.render("agent/ProMessages", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      proMessages,
    });
  } else {
    res.redirect("/agent/");
  }
};
const getPaymentBuyer = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    return res.render("agent/PaymentSbuyer", {
      messageId: id,
    });
  } else {
    res.redirect("/agent/");
  }
};
const getPaymentSeller = async (req, res) => {
  const { id } = req.params;
  if (req.session.user && req.session.role === "agent") {
    return res.render("agent/CDpay-2", {
      messageId: id,
    });
  } else {
    res.redirect("/agent/");
  }
};
const getCharityBuyer = async (req, res) => {
  const { id } = req.params;
  if (req.session.user && req.session.role === "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render(`agent/chairty-4`, {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      messageId: id,
    });
  } else {
    res.redirect("/agent/");
  }
};
const getCharitySeller = async (req, res) => {
  const { id } = req.params;
  if (req.session.user && req.session.role === "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render(`agent/charity-3`, {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      messageId: id,
    });
  } else {
    res.redirect("/agent/");
  }
};
const getSellerListing = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    const {zipCode}=req.body;
    const agent = await Agent.findOne({ email: req.session.user });
    let sellers=[];
    if(!zipCode)
    sellers = await Seller.find({ promotionalMessageState: true });
    else
    sellers = await Seller.find({ promotionalMessageState: true ,zipCode});
    if(agent?.promotionalMessagePlan?.messages){
      return res.render("agent/SellerListnig", {
        email: req.session.user,
        name: req.session.name,
        profilePicture: agent.profilePicture,
        sellers,
        messageId: id,
        planDetails: agent.promotionalMessagePlan
      });
    } else {
      return res.redirect(`/agent/payment-seller/${id}`);
    }
  } else {
    res.redirect("/agent/");
  }
};
const getBuyerListing = async (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    const { id } = req.params;
    const {zipCode}=req.body;
    const agent = await Agent.findOne({ email: req.session.user });
    let buyers=[];
    if(!zipCode)
    buyers= await Buyer.find({ promotionalMessageState: true });
    else
     buyers = await Buyer.find({ promotionalMessageState: true ,zipCode});
    if(agent?.promotionalMessagePlan?.messages){
    return res.render("agent/BuyerListnig", {
      email: req.session.user,
      name: req.session.name,
      profilePicture: agent.profilePicture,
      buyers: buyers,
      messageId: id,
      planDetails: agent.promotionalMessagePlan
    });
    } else {
      return res.redirect(`/agent/payment-buyer/${id}`);
    }
  } else {
    res.redirect("/agent/");
  }
};
const saveCharityLocation = async (req, res) => {
  const { aid } = req.params;

  const { charity } = req.body;
  try {
    await Agent.updateOne(
      {
        _id: aid,
      },
      { $set: { registrationCharity: String(charity[0]) } }
    );

    req.flash('success','Charity updated!')
    return res.redirect(`/agent/`);
  } catch (err) {
    req.flash('error',err.message);
    return res.redirect(`/agent/register-charity/${id}`);
  }
};
const getSuccessfullBids = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const successfulBidsBuyer = await Bid.find({
      agentId: agent._id,
      status: "Accepted",
      role: "Buyer",
      bidOverAt: { $lte: new Date() },
    }).populate({
      path: "userId",
      model: "Buyer",
    });
    const successfulBidsSeller = await Bid.find({
      agentId: agent._id,
      status: "Accepted",
      role: "Seller",
      bidOverAt: { $lte: new Date() },
    }).populate({
      path: "userId",
      model: "Seller",
    });
    return res.render("agent/successful-bids", {
      email: agent.email,
      name: agent.name,
      profilePicture: agent.profilePicture,
      successfulBidsBuyer,
      successfulBidsSeller,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getReferralAgreement = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    const agreementsBuyer = await ReferralAgreement.find({
      brokerBId: agent._id,
      role: "Buyer",
    })
      .populate({
        path: "brokerBId",
        model: "Agent",
      })
      .populate({
        path: "bidId",
        model: "Bid",
      })
      .populate({
        path: "userId",
        model: "Buyer",
      });

    const agreementsSeller = await ReferralAgreement.find({
      brokerId: agent._id,
      role: "Seller",
      // status: "Waiting",
    })
      .populate({
        path: "brokerBId",
        model: "Agent",
      })
      .populate({
        path: "bidId",
        model: "Bid",
      })
      .populate({
        path: "userId",
        model: "Seller",
      });

    return res.render("agent/refferal-agreement", {
      email: agent.email,
      name: agent.name,
      profilePicture: agent.profilePicture,
      agreementsBuyer,
      agreementsSeller,
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getMap = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const {nameSearch, addressSearch, zipSearch} = req.query;
    const query = {};
    if(nameSearch?.trim() || addressSearch?.trim() || zipSearch?.trim()){
      query['$or'] = [];
        if(nameSearch?.trim()){
          query['$or'].push({name:{'$regex':nameSearch, '$options':'i'}}) 
        }
        if(addressSearch?.trim()){
          query['$or'].push({address:{'$regex':addressSearch, '$options':'i'}}) 
        }
        if(zipSearch?.trim()){
          query['$or'].push({zipCode:{'$regex':zipSearch, '$options':'i'}}) 
        }
    }
    const agent = await Agent.findOne({ email: req.session.user });
    const buyers = await Buyer.find(query).lean();
    const sellers =await Seller.find(query).lean();
    return res.render("agent/map", {
      email: agent.email,
      name: agent.name,
      profilePicture: agent.profilePicture,
      buyers,
      sellers
    });
  } else {
    return res.redirect("/agent/");
  }
};
const getPreferences = async (req, res) => {
  if (req.session.user && req.session.role == "agent") {
    const agent = await Agent.findOne({ email: req.session.user });
    return res.render("agent/preferences", {
      email: agent.email,
      name: agent.name,
      image: agent.profilePicture,
    });
  } else {
    return res.redirect("/agent/");
  }
};

module.exports = {
  editProfile,
  showIndexPage,
  setEmail,
  showRegisterOne,
  showLoginPage,
  showRegisterTwo,
  showRegisterThree,
  showRegisterFour,
  getPayment,
  getCharity,
  getSellerBidsPage,
  getPropertyDetails,
  getWaitingBids,
  chatWithAdmin,
  chatWithSeller,
  chatWithBuyer,
  chatWithCurrentBid,
  getAcceptedBids,
  chatSeller,
  getMyCountdown,
  getChatPage,
  getRejectedBids,
  getPromotionalMessage,
  getPaymentBuyer,
  getPaymentSeller,
  getCharityBuyer,
  getCharitySeller,
  getSellerListing,
  getBuyerListing,
  showRegisterOneWithEmailAndName,
  getBuyerBidsPage,
  getPropertyDetailsBuyer,
  getRegisterationPlans,
  getRegisterCharity,
  saveCharityLocation,
  getSuccessfullBids,
  getReferralAgreement,
  getMap,
  getPreferences,
};
