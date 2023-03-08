const router = require("express").Router();
const {
  updateUser,
  deleteUser,
  getUser,
  subscribeUser,
  unsubscribeUser,
  saveVideo,
  unsaveVideo,
  getBookmarks,
  getBookmarksIds,
} = require("../controllers/userController");
const { checkAuth } = require("../controllers/authenticationController");

router
  .route("/save/:videoId")
  .post(checkAuth, saveVideo)
  .delete(checkAuth, unsaveVideo);

router
  .route("/:userId/subscribe")
  .post(checkAuth, subscribeUser)
  .delete(checkAuth, unsubscribeUser);

router.route("/bookmarks").get(checkAuth, getBookmarks);
router.route("/bookmarksIds").get(checkAuth, getBookmarksIds);

router
  .route("/:userId")
  .put(checkAuth, updateUser)
  .delete(checkAuth, deleteUser)
  .get(getUser);

module.exports = router;
