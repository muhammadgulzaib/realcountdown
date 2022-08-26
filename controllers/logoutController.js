const req = require("express/lib/request");
const User = require("../models/Users");

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.sendStatus(204); //No Content

  const refreshToken = cookies.jwt;
  //  if refresh token is in the DB
  const foundUser = await User.exists({ refreshToken: refreshToken });
  const foundUserCred = await User.findOne({ refreshToken });
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204);
  }
  // Delete refreshTokens in DB
  const otherUsers = await User.updateOne(
    { email: foundUserCred.email },
    { refreshToken: "" }
  );
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  }); //secures: true only serves on https! but on production
  res.sendStatus(204);
};

module.exports = { handleLogout };
