const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const agentBidSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Accepted", "Rejected", "Waiting", "Expired"],
    default: "Waiting",
  },
  agentBid: mongoose.Schema.Types.ObjectId,
  commision: String,
  screenName: String,
  profilePicture: String,
});
const PropertySchema = new Schema({
  propertyName: {
    type: String,
    required: true,
  },
  propertyAddress: {
    type: String,
    required: true,
  },
  mailingAddress: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    min: 8,
    max: 15,
    required: true,
  },
  zipCode: {
    type: String,
    min: 4,
    max: 32,
    required: true,
  },
  agreeToTerms: Boolean,
  listedByAnotherBroker: {
    type: Boolean,
  },
  listForOpenBid: Boolean,
  countdown: String,
  countdownOverAt: Date,
  isOver: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const ChatSchema = new mongoose.Schema({
  senderOne: mongoose.Schema.Types.ObjectId,
  senderTwo: mongoose.Schema.Types.ObjectId,
  propertyId: mongoose.Schema.Types.ObjectId,
  chat: [
    {
      senderId: mongoose.Schema.Types.ObjectId,
      message: String,
      sendAt: Date,
      approved: {
        type: Boolean,
        default: false,
      },
 
    },
    
  ],
  viewMessage: {
    type: Boolean,
    default: false,
  },
 
});
const PromotionalMessageSchema = new mongoose.Schema({
  key: String,
  agentId: mongoose.Schema.Types.ObjectId,
  message: String,
  count: String,
});
const ReviewSchema = new mongoose.Schema({
  sellerId: mongoose.Schema.Types.ObjectId,
});
const InvitedAgentSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: function (email) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: "Please enter a valid email",
    },
    required: [true, "Email required"],
  },
  phone: String,
  companyName: String,
});
const ReferralAgreementSchema = new mongoose.Schema({
  brokerAId: mongoose.Schema.Types.ObjectId,
  brokerBId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  propertyId: mongoose.Schema.Types.ObjectId,
  bidId: mongoose.Schema.Types.ObjectId,
  role: String,
  price: String,
  percentage: String,
  brokerA: String,
  dateBrokerA: String,
  brokerB: String,
  dateBrokerB: String,
  additionalTerms: String,
  type: String,
  status: {
    type: String,
    enum: ["Accepted", "Rejected", "Waiting"],
    default: "Waiting",
  },
});
const LogSchema = new mongoose.Schema({
  text: String,
  date: Date,
});
const BankDetailsSchema = new mongoose.Schema({
  accountNumber: String,
  amount: Number,
  userId: mongoose.Schema.Types.ObjectId,
  role: {
    type: String,
    enum: ["seller", "buyer"],
  },
  status: {
    type: String,
    enum: ["Accept", "Reject"],
    default: "Accept",
  },
});
module.exports = {
  PropertySchema,
  ChatSchema,
  ReviewSchema,
  PromotionalMessageSchema,
  InvitedAgentSchema,
  agentBidSchema,
  ReferralAgreementSchema,
  LogSchema,
  BankDetailsSchema,
};
