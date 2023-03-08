const AppError = require("../lib/AppError");
const Async = require("../lib/Async");
const User = require("../models/User");
const Users = require("../models/User");

exports.updateUser = Async(async function (req, res, next) {
  const { userId } = req.params;
  const currUser = req.user;

  if (userId !== currUser.id)
    return next(new AppError(403, "you are not authorized for this operation"));

  const updatedUser = await Users.findByIdAndUpdate(
    userId,
    { $set: req.body },
    { new: true }
  );

  if (!updatedUser) return next(new AppError(404, "user does not exists"));

  res.status(201).json(updatedUser);
});

exports.deleteUser = Async(async function (req, res, next) {
  const { userId } = req.params;
  const currUser = req.user;

  if (userId !== currUser.id)
    return next(new AppError(403, "you are not authorized for this operation"));

  const deletedUser = await Users.findByIdAndDelete(userId);

  if (!deletedUser) return next(new AppError(404, "user does not exists"));

  res.status(204).json({ deleteeed: true });
});

exports.getUser = Async(async function (req, res, next) {
  const { userId } = req.params;

  const user = await Users.findById(userId);

  if (!user) return next(new AppError(404, "user does not exists"));

  res.status(200).json(user);
});

exports.subscribeUser = Async(async function (req, res, next) {
  const { userId } = req.params;

  const currUser = req.user;

  if (userId === currUser.id)
    return next(
      new AppError(400, "invalid operation. you can't subscribe yourself")
    );

  await Users.findByIdAndUpdate(userId, {
    $inc: { subscribers: 1 },
  });

  await Users.findByIdAndUpdate(currUser.id, {
    $push: { subscribedUsers: userId },
  });

  res.status(201).json({ subscribed: true });
});

exports.unsubscribeUser = Async(async function (req, res, next) {
  const { userId } = req.params;

  const currUser = req.user;

  if (userId === currUser.id)
    return next(
      new AppError(400, "invalid operation. you can't subscribe yourself")
    );

  await Users.findByIdAndUpdate(userId, {
    $inc: { subscribers: -1 },
  });

  await Users.findByIdAndUpdate(currUser.id, {
    $pull: { subscribedUsers: userId },
  });

  res.status(204).json({ unsubscribed: true });
});

exports.saveVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;

  await User.findByIdAndUpdate(currUser.id, {
    $addToSet: { bookmarks: videoId },
  });

  res.status(201).json({ saved: true });
});

exports.unsaveVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;

  await User.findByIdAndUpdate(currUser.id, {
    $pull: { bookmarks: videoId },
  });

  res.status(201).json({ removed: true });
});

exports.getBookmarks = Async(async function (req, res, next) {
  const currUser = req.user;

  const bookmarks = await User.findById(currUser.id)
    .select("bookmarks")
    .populate({
      path: "bookmarks",
      select: "title thumbnail views createdAt user",
      populate: { path: "user", select:"username avatar" },
    });

  res.status(200).json(bookmarks);
});

exports.getBookmarksIds = Async(async function (req, res, next) {
  const currUser = req.user;

  const bookmarks = await User.findById(currUser.id).select("bookmarks");

  res.status(200).json(bookmarks);
});
