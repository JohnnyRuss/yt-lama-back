const AppError = require("../lib/AppError");
const Async = require("../lib/Async");
const asignToken = require("../lib/asignToken");
const verifyToken = require("../lib/verifyToken");

const Users = require("../models/User");

exports.register = Async(async function (req, res, next) {
  const { email, username, password } = req.body;

  const newUserBody = {
    email,
    username,
    password,
  };

  const newUser = await Users.create(newUserBody);

  newUser.password = undefined;

  const { accessToken } = await asignToken(res, newUser);

  res.status(201).json({ user: newUser, accessToken });
});

exports.login = Async(async function (req, res, next) {
  const { email, password } = req.body;

  const user = await Users.findOne({ email }).select("+password");

  const validPassword = user?.checkPassword(password, user.password);

  if (!user || !validPassword)
    return next(new AppError(403, "invalid email or password"));

  user.password = undefined;

  const { accessToken } = await asignToken(res, user);

  res.status(201).json({
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      subscribers: user.subscribers,
      subscribedUsers: user.subscribedUsers,
    },
    accessToken,
  });
});

exports.logout = Async(async function (req, res, next) {
  res.cookie("authorization", "");
  res.clearCookie();
  res.end();
});

exports.googleAuth = Async(async function (req, res, next) {
  const { username, email, avatar } = req.body;

  let user = await Users.findOne({ username, email });

  if (!user)
    user = await new Users({
      username,
      email,
      avatar,
      fromGoogle: true,
    }).save({ validateBeforeSave: false });

  const { accessToken } = await asignToken(res, user);

  res.status(200).json({
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      subscribers: user.subscribers,
      subscribedUsers: user.subscribedUsers,
    },
    accessToken,
  });
});

exports.checkAuth = Async(async function (req, res, next) {
  const { authorization } = req.headers;

  const accessToken = authorization?.split("Bearer ")[1];

  if (!authorization || !authorization.startsWith("Bearer ") || !accessToken)
    return next(new AppError(403, "you are not authorized"));

  const decodedUser = await verifyToken(accessToken);

  if (!decodedUser) return next(new AppError(401, "you are not authorized"));

  const user = await Users.findById(decodedUser.id);

  if (!user) return next(new AppError(401, "user does not exists"));

  req.user = decodedUser;

  next();
});

exports.refresh = Async(async function (req, res, next) {
  const { authorization } = req.cookies;

  const refreshToken = authorization.split("Bearer ")[1];

  if (!authorization || !authorization.startsWith("Bearer ") || !refreshToken)
    return next(new AppError(403, "you are not authorized"));

  const decodedUser = await verifyToken(refreshToken, true);

  if (!decodedUser) return next(new AppError(401, "you are not authorized"));

  const user = await Users.findById(decodedUser.id);

  if (!user) return next(new AppError(401, "user does not exists"));

  const { accessToken } = await asignToken(res, user);

  res.status(200).json({ accessToken });
});
