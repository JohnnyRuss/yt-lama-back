const { Schema, model } = require("mongoose");

const CommentsSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: Schema.ObjectId,
      ref: "Video",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Comments = model("Comments", CommentsSchema);
module.exports = Comments;
