require("dotenv").config();
const App = require("./app");
const mongoose = require("mongoose");
const { createServer } = require("http");

process.on("uncaughtException", (err) => {
  console.log("uncaughtException, pocess is Exited 💥", err);
  process.exit(1);
});

const SERVER = createServer(App);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_APP_CONNECTION)
  .then(() => {
    console.log(`DB Is Connected Successfully`);
    SERVER.listen(process.env.PORT, () =>
      console.log(`App listens on PORT:${process.env.PORT}`)
    );
  })
  .catch(() => {
    process.on("unhandledRejection", (err) => {
      console.log("Unhandled Rejection, server is closed 💥", err.message);
      SERVER.close(() => process.exit(1));
    });
  });
