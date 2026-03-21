const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const Group = require("../models/group");
const {
  isLoggedIn,
  isGroupMember,
  isMessageAuthorOrAdmin,
} = require("../middleware");
const wrapAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/:groupId/messages",
  isLoggedIn,
  isGroupMember,
  wrapAsync(async (req, res) => {
    const content = (req.body.content || "").trim();
    if (!content) {
      req.flash("error", "Message content is required");
      return res.redirect(`/groups/${req.params.groupId}`);
    }
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      req.flash("error", "Group not found");
      return res.redirect("/groups");
    }
    const msg = new Message({
      content,
      author: req.user._id,
      group: group._id,
    });
    await msg.save();
    req.flash("success", "Message posted");
    res.redirect(`/groups/${group._id}`);
  }),
);

router.post(
  "/:groupId/messages/:messageId/edit",
  isLoggedIn,
  isMessageAuthorOrAdmin,
  wrapAsync(async (req, res) => {
    const content = (req.body.content || "").trim();
    if (!content) {
      req.flash("error", "Message content is required");
      return res.redirect(`/groups/${req.params.groupId}`);
    }
    await Message.findByIdAndUpdate(req.params.messageId, { content });
    req.flash("success", "Message updated");
    res.redirect(`/groups/${req.params.groupId}`);
  }),
);

router.post(
  "/:groupId/messages/:messageId/delete",
  isLoggedIn,
  isMessageAuthorOrAdmin,
  wrapAsync(async (req, res) => {
    await Message.findByIdAndDelete(req.params.messageId);
    req.flash("success", "Message deleted");
    res.redirect(`/groups/${req.params.groupId}`);
  }),
);

router.put(
  "/:groupId/messages/:messageId",
  isLoggedIn,
  isMessageAuthorOrAdmin,
  wrapAsync(async (req, res) => {
    const content = (req.body.content || "").trim();
    if (!content) {
      req.flash("error", "Message content is required");
      return res.redirect(`/groups/${req.params.groupId}`);
    }
    await Message.findByIdAndUpdate(req.params.messageId, { content });
    req.flash("success", "Message updated");
    res.redirect(`/groups/${req.params.groupId}`);
  }),
);

router.delete(
  "/:groupId/messages/:messageId",
  isLoggedIn,
  isMessageAuthorOrAdmin,
  wrapAsync(async (req, res) => {
    await Message.findByIdAndDelete(req.params.messageId);
    req.flash("success", "Message deleted");
    res.redirect(`/groups/${req.params.groupId}`);
  }),
);

module.exports = router;
