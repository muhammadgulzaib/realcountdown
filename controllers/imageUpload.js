// const multer = require("multer")
// const path = require("path")

// const storage = multer.diskStorage({
//     destination: '../assets/uploads/',
//     filename: function(req, res, cb){
//         cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     storage: storage,
// }).single('image');