const mongoose = require("mongoose");
const {
  PropertySchema,
  ChatSchema,
  ReviewSchema,
  PromotionalMessageSchema,
  InvitedAgentSchema,
  agentBidSchema,
  ReferralAgreementSchema,
  LogSchema,
  BankDetailsSchema,
} = require("./OtherSchema");
//status: {
//     type: String,
//     enum: ['Accepted', 'Rejected', 'Waiting'],
//     default: 'Waiting',
// },
// agentBid: mongoose.Schema.Types.ObjectId,
// commision: String,
// screenName: String,
// profilePicture: String,
const bidSchema = new mongoose.Schema(
  {
    role: String,
    agentId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    bidOnProperty: mongoose.Schema.Types.ObjectId,
    agentProfilePicture: String,
    screenName: String,
    commision: String,
    status: {
      type: String,
      enum: ["Accepted", "Rejected", "Waiting", "Rebid", "Canceled", "Invited"],
      default: "Waiting",
    },
    bidOverAt: Date,
  },
  {
    timestamps: true,
  }
);

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
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
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  profilePicture: {
    type: String,
    default: "",
  },

  createdAt: Date,
  updatedAt: Date,
});

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  screenName: {
    type: String,
  },
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
  password: {
    type: String,
    required: true,
  },
  professionalCategory: {
    type: String,
  },
  professionalTitle: {
    type: String,
  },
  completed: {
    type: String,
    default: "",
  },
  createdAt: Date,
  updatedAt: Date,
  brokerageAddress: {
    type: String,
  },
  brokeragePhone: {
    type: String,
  },
  city: {
    type: String,
  },
  primaryPhone: {
    type: String,
  },
  timeZone: {
    type: String,
  },
  commision: {
    type: String,
  },
  zipCode: String,
  description: {
    type: String,
  },
  license: String,
  serviceAreas: String,
  state: String,
  reviewOne: String,
  reviewTwo: String,
  reviewThree: String,
  status: {
    type: String,

    validate: {
      validator: function (value) {
        return ["not decided", "disapproved", "approved"].indexOf(value) !== -1;
      },
      message: "Value must be one of not decided, disapproved, approved",
    },
  },
  role: {
    type: String,
    default: "agent",
  },
  profilePicture: {
    type: String,
    default: "",
  },
  charity: {
    firm: String,
    donation: {
      type: String,
      default: "10$",
    },
  },
  reviews: [
    {
      text: String,
      stars: Number,
    },
  ],
  companyName: String,
  promotionalMessagesBuyer: {
    charityLocation: String,
  },
  promotionalMessagesSeller: {
    charityLocation: String,
  },
  invited: {
    type: Boolean,
    default: false,
  },
  registrationPlan: String,
  registrationCharity: String,
  countDownPlan: String,
  countDownBidBalance: Number,
  promotionalMessagePlan: {
    price: Number,
    name: String,
    messages: Number
  },
  latitude: String,
  longitude: String
});
const sellerSchema = new mongoose.Schema({
  name: String,
  phone: String,
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
  address: String,
  zipCode: String,
  city: String,
  state: String,
  license: String,
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "seller",
  },
  status: {
    type: String,

    validate: {
      validator: function (value) {
        return ["not decided", "disapproved", "approved"].indexOf(value) !== -1;
      },
      message: "Value must be one of not decided, disapproved, approved",
    },
  },
  properties: [PropertySchema],
  promotionalMessages: [
    {
      agentName: String,
      agentId: mongoose.Schema.Types.ObjectId,
      message: String,
      approve: Boolean,
    },
  ],
  promotionalMessageState: {
    type: Boolean,
    default: false,
  },
  promotionalBalance: {
    type: Number,
    default: 0
  },
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date,
  latitude: String,
  longitude: String
});

const buyerSchema = new mongoose.Schema({
  name: String,
  phone: String,
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
  address: String,
  zipCode: String,
  city: String,
  state: String,
  license: String,
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "buyer",
  },
  status: {
    type: String,
    validate: {
      validator: function (value) {
        return ["not decided", "disapproved", "approved"].indexOf(value) !== -1;
      },
      message: "Value must be one of not decided, disapproved, approved",
    },
  },
  properties: [
    {
      area: String,
      addressLine: String,
      state: String,
      zipCode: String,
      check: String,
      countdownOverAt: Date,
      countdown: String,
      isOver: {
        type: Boolean,
        default: false,
      },
      updatetAt: Date,
    },
  ],
  profilePicture: String,
  promotionalMessages: [
    {
      agentName: String,
      agentId: mongoose.Schema.Types.ObjectId,
      message: String,
      approve: Boolean,
    },
  ],
  promotionalMessageState: {
    type: Boolean,
    default: false,
  },
  promotionalBalance: {
    type: Number,
    default: 0
  },
  createdAt: Date,
  updatedAt: Date,
  latitude: String,
  longitude: String
});
const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: Date,
});
RefreshTokenSchema.statics.createToken = async function (user) {
  let expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
  let _token = uuidv4();
  let _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime(),
  });
  console.log(_object);
  let refreshToken = await _object.save();
  return refreshToken.token;
};
RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
};

module.exports = {
  Agent: mongoose.model("Agent", agentSchema),
  Admin: mongoose.model("Admin", adminSchema),
  Seller: mongoose.model("Seller", sellerSchema),
  Buyer: mongoose.model("Buyer", buyerSchema),
  Message: mongoose.model("Message", ChatSchema),
  PromotionalMessage: mongoose.model(
    "PromotionalMessage",
    PromotionalMessageSchema
  ),
  InvitedAgent: mongoose.model("InvitedAgent", InvitedAgentSchema),
  Bid: mongoose.model("Bid", bidSchema),
  ReferralAgreement: mongoose.model(
    "ReferralAgreement",
    ReferralAgreementSchema
  ),
  Log: mongoose.model("Log", LogSchema),
  BankDetail: mongoose.model("BankDetail", BankDetailsSchema),
  RefreshToken: mongoose.model("RefreshToken", RefreshTokenSchema),
};
