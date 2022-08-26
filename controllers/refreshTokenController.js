const req = require("express/lib/request");
const jwt = require("jsonwebtoken");
const User = require("./../models/Users");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.exists({ refreshToken: refreshToken });
  const foundUserCreds = await User.findOne({ refreshToken });

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

module.exports = { handleRefreshToken };
