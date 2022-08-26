const express = require("express");
const router = express.Router();
const path = require("path");

router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});
// router.get("^/$|/index(.html)?", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "views", "index.html"));
// });
// router.get("^/$|/index(.html)?", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "views", "index.html"));
// });

// router.get("/", (req, res) => {
//   res.render('agent/index')
// });

module.exports = router;
