const AppError = require("../lib/AppError");
const Async = require("../lib/Async");
const Comments = require("../models/Comments");
const Videos = require("../models/Video");

exports.addComment = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;
  const body = req.body;

  const newComment = await Comments.create({
    ...body,
    videoId,
    author: currUser.id,
  });

  await newComment.populate({ path: "author", select: "username avatar" });

  res.status(201).json(newComment);
});

exports.deleteComment = Async(async function (req, res, next) {
  const { videoId, commentId } = req.params;
  const currUser = req.user;

  const comment = await Comments.findById(commentId);
  const video = await Videos.findById(videoId);

  if (
    currUser.id !== video.user.toString() &&
    currUser.id !== comment.author.toString()
  )
    return next(new AppError(403, "you are not authorized for this operation"));

  const deletedComment = await Comments.findByIdAndDelete(commentId);

  if (!deletedComment)
    return next(new AppError(404, "comment does not exists"));

  res.status(204).json({ deleted: true });
});

exports.updateComment = Async(async function (req, res, next) {
  const { videoId, commentId } = req.params;
  const { description } = req.body;
  const currUser = req.user;

  const video = await Videos.findById(videoId);
  const comment = await Comments.findByIdAndUpdate(
    commentId,
    { description },
    { new: true }
  ).populate({
    path: "author",
    select: "username avatar",
  });
  console.log(comment.author._id);
  if (!video || !comment)
    return next(new AppError(404, "video or comment does not exists"));

  if (
    currUser.id !== video.user.toString() &&
    currUser.id !== comment.author._id.toString()
  )
    return next(
      new AppError(403, "😀you are not authorized for this operation")
    );

  res.status(201).json(comment);
});

exports.getComments = Async(async function (req, res, next) {
  const { videoId } = req.params;

  const comments = await Comments.find({ videoId })
    .populate({ path: "author", select: "username avatar" })
    .sort({ createdAt: -1 });

  res.status(200).json(comments);
});
