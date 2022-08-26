const bcrypt = require("bcrypt");
const User = require("../models/Users");
const { userSchema } = require("./../middleware/validation/user");
const handleNewUser = async (req, res) => {
  const {
    fullName,
    screenName,
    email,
    password,
    professionalCategory,
    professionalTitle,
  } = req.body;
  if (
    !fullName ||
    !screenName ||
    !email ||
    !password ||
    !professionalCategory ||
    !professionalTitle
  )
    return res.status(400).json({ message: "All fields are required" });

  try {
    const validation = await userSchema.validateAsync(req.body);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }

  // check for duplicate usernames in database
  const duplicate = await User.exists({ email: email });
  console.log(duplicate);
  if (duplicate) return res.sendStatus(409); //Conflict
  try {
    //   encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // store the new user

    const user = await User.create({
      name: fullName,
      screenName: screenName,
      email: email,
      password: hashedPassword,
      professionalTitle: professionalTitle,
      professionalCategory: professionalCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(user);
    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { handleNewUser };
