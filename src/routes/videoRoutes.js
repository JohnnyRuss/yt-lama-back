const router = require("express").Router();
const {
  addVideo,
  updateVideo,
  addView,
  deleteVideo,
  getVideo,
  getVideos,
  likeVideo,
  unlikeVideo,
  getTrendingVideos,
  getRandomVideos,
  getSubscribedVideos,
  getRelatedVideos,
  getUserVideos,
  searchByTitle,
  searchVideos,
} = require("../controllers/videoController");
const { checkAuth } = require("../controllers/authenticationController");

router.route("/trending").get(getTrendingVideos);

router.route("/random").get(getRandomVideos);

router.route("/user-uploads").get(checkAuth, getUserVideos);

router.route("/subscribed").get(checkAuth, getSubscribedVideos);

router.route("/related").get(getRelatedVideos);

router.route("/search-by-title").get(searchByTitle);

router.route("/search").get(searchVideos);

router
  .route("/:videoId/reaction")
  .post(checkAuth, likeVideo)
  .delete(checkAuth, unlikeVideo);

router.route("/:videoId/view").put(addView);

router
  .route("/:videoId")
  .get(getVideo)
  .put(checkAuth, updateVideo)
  .delete(checkAuth, deleteVideo);

router.route("/").get(getVideos).post(checkAuth, addVideo);

module.exports = router;
