require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const server = require('http').createServer(app);
const flash = require('connect-flash');
// errorLogger & eventLogger
const errorHandler = require("./middleware/errorHandler");
const { logger } = require("./middleware/logEvent");
const corsOptions = require("./config/corsOptions");
const io = require('socket.io')(server, {cors: {origin: "*"}})
const users = new Set();
// views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
// set static folder
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost/real_estate", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.on("connected", () => {
//   console.log("Mongoose is connected");
// });
// Database Connection
const username = encodeURIComponent(process.env.UsernameDB);
const password = encodeURIComponent(process.env.PasswordDB);
const cluster = process.env.ClusterDB;
const uri = `mongodb://${username}:${password}@${cluster}/real_estate?ssl=true&replicaSet=atlas-plpr6q-shard-0&authSource=admin&retryWrites=true&w=majority`;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log("Database connection failed. exiting now...");
    console.error(err);
    process.exit(1);
  });


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(function (req, res, next) {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.formData = req.flash('formData');
  next();
});

app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/", express.static(path.join(__dirname, "/assets")));

app.use(logger);

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(morgan("dev"));

// app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Resource-Policy")
  res.removeHeader("Cross-Origin-Embedder-Policy")
  next()
})
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());
// PORT
const PORT = process.env.PORT || 3500;


app.use("/", require("./routes/root"));
app.use("/admin", require("./routes/api/admin"));
app.use("/buyer", require("./routes/api/buyers"));
app.use("/agent", require("./routes/api/agents"));
app.use("/seller", require("./routes/api/sellers"));
app.use("/forgot-password", require("./routes/forgotPassword"));
// app.all("*|^/error$(.html)?", (req, res) => {
//   res.status(404);
//   if (req.accepts("html")) {
//     res.sendFile(path.join(__dirname, "views", "errorpages", "404.html"));
//   } else if (req.accepts("json")) {
//     res.json({ error: "404 Not Found" });
//   } else {
//     res.type("txt").send("404 Not found");
//   }
// });
app.use(errorHandler);
server.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
io.on("connection", (socket)=>{
  console.log('User connected - '+socket.id)
    socket.on('join', (data)=>{
      console.log(data)
      socket.broadcast.emit('join', data);
    })
})
const sendUsers = (req, res, next)=>{
  res.locals.users = users;
  next()
}
app.use("/agent" , sendUsers, require("./routes/api/agents"));
