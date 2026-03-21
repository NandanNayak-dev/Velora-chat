const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const User = require("../models/user");
const { isLoggedIn, isGroupAdmin, isGroupMember } = require("../middleware");
const wrapAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

async function loadUserGroups(userId) {
  return Group.find({
    $or: [{ admin: userId }, { members: userId }],
  })
    .populate("admin")
    .sort({ name: 1 });
}

router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
  const groups = await loadUserGroups(req.user._id);
  res.render("groups/index", { groups });
}));

router.get("/new", isLoggedIn, (req, res) => {
  res.render("groups/new");
});

router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) {
    req.flash("error", "Group name is required");
    return res.redirect("/groups/new");
  }
  const token = Group.generateToken();
  const group = new Group({
    name,
    token,
    admin: req.user._id,
    members: [req.user._id],
  });
  await group.save();
  req.user.groups.push(group._id);
  await req.user.save();
  req.flash("success", "Group created");
  res.redirect(`/groups/${group._id}`);
}));

router.post("/join", isLoggedIn, wrapAsync(async (req, res) => {
  const token = (req.body.token || "").trim();
  if (!token) {
    req.flash("error", "Group token is required");
    return res.redirect("/groups");
  }
  const group = await Group.findOne({ token });
  if (!group) {
    req.flash("error", "Invalid token");
    return res.redirect("/groups");
  }
  if (
    group.members.some((member) => member.equals(req.user._id)) ||
    group.admin.equals(req.user._id)
  ) {
    req.flash("error", "You are already a member");
    return res.redirect(`/groups/${group._id}`);
  }
  group.members.push(req.user._id);
  await group.save();
  req.user.groups.push(group._id);
  await req.user.save();
  req.flash("success", `Joined ${group.name}`);
  res.redirect(`/groups/${group._id}`);
}));

router.get("/:id", isLoggedIn, isGroupMember, wrapAsync(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate("admin")
    .populate("members");
  if (!group) {
    req.flash("error", "Group not found");
    return res.redirect("/groups");
  }
  const Message = require("../models/message");
  const messages = await Message.find({ group: group._id })
    .populate("author")
    .sort("createdAt");
  const groups = await loadUserGroups(req.user._id);
  res.render("groups/show", { group, groups, messages });
}));

router.post("/:id/leave", isLoggedIn, isGroupMember, wrapAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    req.flash("error", "Group not found");
    return res.redirect("/groups");
  }

  if (group.admin.equals(req.user._id)) {
    req.flash("error", "Group admins cannot leave their own group");
    return res.redirect(`/groups/${group._id}`);
  }

  group.members = group.members.filter((member) => !member.equals(req.user._id));
  await group.save();

  req.user.groups = req.user.groups.filter((groupId) => !groupId.equals(group._id));
  await req.user.save();

  req.flash("success", `You left ${group.name}`);
  res.redirect("/groups");
}));

router.post(
  "/:id/remove-member",
  isLoggedIn,
  isGroupAdmin,
  wrapAsync(async (req, res) => {
    const { memberId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
      req.flash("error", "Group not found");
      return res.redirect("/groups");
    }
    group.members = group.members.filter((m) => !m.equals(memberId));
    await group.save();
    const user = await User.findById(memberId);
    if (user) {
      user.groups = user.groups.filter((g) => !g.equals(group._id));
      await user.save();
    }
    req.flash("success", "Member removed");
    res.redirect(`/groups/${group._id}`);
  }),
);

router.post(
  "/:id/generate-token",
  isLoggedIn,
  isGroupAdmin,
  wrapAsync(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group) {
      req.flash("error", "Group not found");
      return res.redirect("/groups");
    }
    group.token = Group.generateToken();
    await group.save();
    req.flash("success", "New token generated");
    res.redirect(`/groups/${group._id}`);
  }),
);

module.exports = router;
