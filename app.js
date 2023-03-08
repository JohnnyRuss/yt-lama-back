const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const errorController = require("./src/lib/errorController");
const AppError = require("./src/lib/AppError");
const getOrigins = require("./src/lib/getOrigins");

const userRoutes = require("./src/routes/userRoutes");
const videoRoutes = require("./src/routes/videoRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const authenticationRoutes = require("./src/routes/authenticationRoutes");

const App = express();

process.env.NODE_MODE === "DEV" && App.use(morgan("dev"));

App.use(express.json());
App.use(express.urlencoded({ extended: false }));
App.use(express.static(path.join(__dirname, "public/images")));

App.use(cookieParser());

App.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Authorization"
  );

  if (req.method === "OPTIONS") res.sendStatus(200);
  else next();
});

App.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, false);

      if (!getOrigins().includes(origin)) {
        const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }

      callback(null, true);
    },
  })
);

App.use("/api/v1/authentication", authenticationRoutes);
App.use("/api/v1/users", userRoutes);
App.use("/api/v1/videos", videoRoutes);
App.use("/api/v1/comments", commentRoutes);

App.all("*", (req, res, next) => {
  next(new AppError(404, `can't find ${req.originalUrl} on this server !!!`));
});

App.use(errorController);

module.exports = App;
