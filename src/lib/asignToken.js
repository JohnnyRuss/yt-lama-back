const JWT = require("jsonwebtoken");
const getOrigins = require("../lib/getOrigins");

async function asignToken(res, payload) {
  const ENV_MODE = process.env.NODE_MODE;

  const SECRET = process.env.JWT_SECRET;
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  const userCredentials = {
    id: payload._id,
    username: payload.username,
    email: payload.email,
  };

  const refreshToken = JWT.sign(userCredentials, REFRESH_SECRET);
  const accessToken = JWT.sign(userCredentials, SECRET, { expiresIn: "1h" });

  const cookieOptions = {
    httpOnly: true,
    origin: getOrigins(),
    secure: false,
  };

  if (ENV_MODE === "PROD") {
    cookieOptions.secure = true;
    cookieOptions.sameSite = "none";
  }

  res.cookie("authorization", `Bearer ${refreshToken}`, cookieOptions);

  return { accessToken };
}

module.exports = asignToken;
