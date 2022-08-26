const req = require("express/lib/request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Agent, Seller, Buyer } = require("./../models/Users");
const { userSchema } = require("./../middleware/validation/user");

const { NONAME } = require("dns");
const res = require("express/lib/response");

const handleLogin = async (req, res) => {
  const { email, password, type } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "email and password are required" });
  try {
    const result = await Ag;
  } catch (e) {}
  let foundUser;
  if (type === "agent") {
    foundUser = await Agent.findOne({ email: email });
  } else if (type === "seller") {
    foundUser = await Seller.findOne({ email: email });
  } else if (type === "buyer") {
    foundUser = await Buyer.findOne({ email: email });
  } else {
    res.sendStatus(404);
  }
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  //   Evaluate password
  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    //  create JWT
    const accessToken = jwt.sign(
      { email: foundUser.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // saving refresh token with current user
    if (type === "agent") {
      await Agent.updateOne({ email: email }, { refreshToken: refreshToken });
    } else if (type === "seller") {
      await Seller.updateOne({ email: email }, { refreshToken: refreshToken });
    } else if (type === "buyer") {
      await Buyer.updateOne({ email: email }, { refreshToken: refreshToken });
    } else {
      res.sendStatus(404);
    }

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
