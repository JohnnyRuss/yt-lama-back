const AppError = require("../lib/AppError");
const Async = require("../lib/Async");
const Videos = require("../models/Video");
const Users = require("../models/User");

exports.addVideo = Async(async function (req, res, next) {
  const currUser = req.user;

  const newVideo = new Videos({
    user: currUser.id,
    ...req.body,
  });

  await newVideo.save();

  await newVideo.populate({ path: "user", select: "avatar username" });

  res.status(201).json(newVideo);
});

exports.updateVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;

  const video = await Videos.findById(videoId);

  if (!video) return next(new AppError(404, "video does not exists"));
  else if (currUser.id !== video.user)
    return next(new AppError(401, "you are not authorized for this operation"));

  const updatedVideo = await Videos.findByIdAndUpdate(
    videoId,
    { $set: req.body },
    { new: true }
  );

  res.status(201).json(updatedVideo);
});

exports.addView = Async(async function (req, res, next) {
  const { videoId } = req.params;

  const video = await Videos.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) return next(new AppError(404, "video does not exists"));

  res.status(200).json({ vies: video.views });
});

exports.deleteVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;

  const video = await Videos.findById(videoId);

  if (!video) return next(new AppError(404, "video does not exists"));
  else if (currUser.id !== video.user.toString())
    return next(new AppError(401, "you are not authorized for this operation"));

  await video.delete();

  res.status(204).json({ deleted: true });
});

exports.getVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;

  const video = await Videos.findById(videoId).populate({
    path: "user",
    select: "username avatar _id subscribers",
  });

  if (!video) return next(new AppError(404, "video does not exists"));

  res.status(200).json(video);
});

exports.searchByTitle = Async(async function (req, res, next) {
  const { search } = req.query;

  const results = await Videos.find({
    title: { $regex: search, $options: "i" },
  }).select("title");

  res.status(200).json(results);
});

exports.searchVideos = Async(async function (req, res, next) {
  const { partial, full } = req.query;

  const requestedVideos = full
    ? await Videos.find({
        title: { $regex: full, $options: "i" },
      }).populate({ path: "user", select: "username avatar _id" })
    : [];

  const partuialsResults = partial
    ? await Videos.find({
        $and: [
          { title: { $regex: partial, $options: "i" } },
          { title: { $ne: full } },
        ],
      }).populate({ path: "user", select: "username avatar _id" })
    : [];

  res.status(200).json([...requestedVideos, ...partuialsResults]);
});

exports.getVideos = Async(async function (req, res, next) {
  const { search } = req.query;

  const videos = await Videos.find({
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ],
  }).populate({ path: "user", select: "username avatar _id" });

  res.status(200).json(videos);
});

exports.likeVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;

  const updatedVideo = await Videos.findByIdAndUpdate(
    videoId,
    { $addToSet: { likes: currUser.id }, $pull: { dislikes: currUser.id } },
    { new: true }
  );

  if (!updatedVideo) return next(new AppError(404, "video does not exists"));

  res.status(201).json({
    likes: updatedVideo.likes,
    dislikes: updatedVideo.dislikes,
  });
});

exports.unlikeVideo = Async(async function (req, res, next) {
  const { videoId } = req.params;
  const currUser = req.user;

  const updatedVideo = await Videos.findByIdAndUpdate(
    videoId,
    { $pull: { likes: currUser.id }, $addToSet: { dislikes: currUser.id } },
    { new: true }
  );

  if (!updatedVideo) return next(new AppError(404, "video does not exists"));

  res.status(201).json({
    likes: updatedVideo.likes,
    dislikes: updatedVideo.dislikes,
  });
});

exports.getTrendingVideos = Async(async function (req, res, next) {
  const videos = await Videos.find()
    .populate({ path: "user", select: "username avatar _id" })
    .sort({ views: -1, likes: -1 });

  res.status(200).json(videos);
});

exports.getRandomVideos = Async(async function (req, res, next) {
  const videos = await Videos.aggregate([
    { $sample: { size: 40 } },
    {
      $lookup: {
        localField: "user",
        foreignField: "_id",
        from: "users",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$user" },
  ]);

  res.status(200).json(videos);
});

exports.getSubscribedVideos = Async(async function (req, res, next) {
  const currUser = req.user;

  const user = await Users.findById(currUser.id);

  const videos = await Videos.aggregate([
    { $match: { user: { $in: user.subscribedUsers } } },
    {
      $lookup: {
        localField: "user",
        foreignField: "_id",
        from: "users",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$user" },
  ]);

  res.status(200).json(videos);
});

exports.getRelatedVideos = Async(async function (req, res, next) {
  const { tags: userTags } = req.query;

  const videos = await Videos.find({
    tags: { $in: userTags?.split(",") },
  })
    .limit(20)
    .populate({ path: "user", select: "username avatar _id" });

  res.status(200).json(videos);
});

exports.getUserVideos = Async(async function (req, res, next) {
  const currUser = req.user;

  const userVideos = await Videos.find({
    user: currUser.id,
  }).populate({ path: "user", select: "avatar username" });

  res.status(200).json(userVideos);
});
