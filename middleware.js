const Group = require("./models/group");
const Message = require("./models/message");

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash("error", "You must be signed in");
  res.redirect("/login");
};

module.exports.isGroupAdmin = async (req, res, next) => {
  const group = await Group.findById(req.params.id || req.params.groupId);
  if (!group) {
    req.flash("error", "Group not found");
    return res.redirect("/groups");
  }
  if (group.admin.equals(req.user._id) || req.user.isAdmin) return next();
  req.flash("error", "You must be group admin");
  res.redirect(`/groups/${group._id}`);
};

module.exports.isGroupMember = async (req, res, next) => {
  const group = await Group.findById(req.params.id || req.params.groupId);
  if (!group) {
    req.flash("error", "Group not found");
    return res.redirect("/groups");
  }
  const isMember =
    group.members.some((m) => m.equals(req.user._id)) ||
    group.admin.equals(req.user._id);
  if (isMember || req.user.isAdmin) return next();
  req.flash(
    "error",
    "You must be a member of this group to perform that action",
  );
  res.redirect("/groups");
};

module.exports.isMessageAuthorOrAdmin = async (req, res, next) => {
  const msg = await Message.findById(req.params.messageId || req.params.id);
  if (!msg) {
    req.flash("error", "Message not found");
    return res.redirect(`/groups/${req.params.groupId}`);
  }
  if (msg.author.equals(req.user._id) || req.user.isAdmin) return next();
  req.flash("error", "Not authorized");
  res.redirect(`/groups/${req.params.groupId}`);
};
