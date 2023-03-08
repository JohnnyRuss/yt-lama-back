const { Schema, model } = require("mongoose");

const VideoSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      type: [Schema.ObjectId],
      ref: "User",
      default: [],
    },
    dislikes: {
      type: [Schema.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

VideoSchema.pre("save", function (next) {
  if (!this.isNew || this.thumbnail) return next();

  this.avatar = "http://localhost:4001/thumbnail.webp";

  next();
});

const Video = model("Video", VideoSchema);

module.exports = Video;
