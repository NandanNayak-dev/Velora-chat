require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const messageRoutes = require("./routes/messages");

const app = express();

function wrapAsync(fn) {
  return function wrappedRoute(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/chatapp";
mongoose.set("bufferCommands", false);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "notagoodsecret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser(async (identifier, cb) => {
  try {
    let user = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier);
    }

    if (!user && typeof identifier === "string") {
      const normalizedIdentifier = identifier.trim().toLowerCase();
      user = await User.findOne({
        $or: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }],
      });
    }

    cb(null, user || false);
  } catch (err) {
    cb(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.locals.wrapAsync = wrapAsync;

app.use("/", authRoutes);
app.use("/groups", groupRoutes);
app.use("/groups", messageRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.use((req, res) => {
  res.status(404).render("index");
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  req.flash("error", err.message || "Something went wrong");
  const fallbackPath =
    req.originalUrl && req.originalUrl !== "/" ? req.originalUrl : "/";
  res.status(err.status || 500).redirect(fallbackPath);
});

const port = process.env.PORT || 8080;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });
