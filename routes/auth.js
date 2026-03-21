const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();
const wrapAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
  try {
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!username || !email || !password) {
      req.flash("error", "Username, email, and password are required");
      return res.redirect("/signup");
    }

    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      req.flash("error", "An account with that email already exists");
      return res.redirect("/signup");
    }

    const user = new User({ username, email });
    const registered = await User.register(user, password);
    req.login(registered, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome!");
      return res.redirect("/");
    });
  } catch (e) {
    if (e.name === "UserExistsError") {
      req.flash("error", "That username is already taken");
      return res.redirect("/signup");
    }
    if (e.code === 11000 && e.keyPattern && e.keyPattern.email) {
      req.flash("error", "An account with that email already exists");
      return res.redirect("/signup");
    }
    if (e.name === "ValidationError") {
      req.flash("error", "Please enter valid signup details");
      return res.redirect("/signup");
    }
    req.flash("error", e.message || "Signup failed. Please try again.");
    return res.redirect("/signup");
  }
}));

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", (req, res, next) => {
  const username = (req.body.username || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!username || !password) {
    req.flash("error", "Username or email and password are required");
    return res.redirect("/login");
  }

  req.body.username = username;

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      req.flash("error", "Login failed. Please try again.");
      return res.redirect("/login");
    }
    if (!user) {
      req.flash("error", (info && info.message) || "Invalid username, email, or password");
      return res.redirect("/login");
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        req.flash("error", "Could not start your session. Please try again.");
        return res.redirect("/login");
      }

      req.flash("success", "Welcome back");
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye");
    res.redirect("/");
  });
});

module.exports = router;
