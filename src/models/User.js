const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const getHost = require("../lib/getHost");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      // unique: true,
    },

    email: {
      type: String,
      required: true,
      // unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
    },

    subscribers: {
      type: Number,
      default: 0,
    },

    subscribedUsers: {
      type: [Schema.ObjectId],
      ref: "User",
    },

    fromGoogle: {
      type: Boolean,
      default: false,
    },

    bookmarks: {
      type: [Schema.ObjectId],
      ref: "Video",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

UserSchema.methods.checkPassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

UserSchema.pre("save", function (next) {
  if (!this.isNew || this.avatar) return next();

  this.avatar = `${getHost()}/avatar-male.webp`;

  next();
});

const User = model("User", UserSchema);

module.exports = User;
