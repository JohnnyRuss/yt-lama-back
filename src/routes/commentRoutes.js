const router = require("express").Router();
const {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} = require("../controllers/commentsController");
const { checkAuth } = require("../controllers/authenticationController");

router
  .route("/:videoId/:commentId")
  .delete(checkAuth, deleteComment)
  .patch(checkAuth, updateComment);

router.route("/:videoId").get(getComments).post(checkAuth, addComment);

module.exports = router;
