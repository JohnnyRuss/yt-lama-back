const JWT = require("jsonwebtoken");
const { promisify } = require("util");

async function verifyToken(token, refresher = false) {
  const SECRET = process.env.JWT_SECRET;
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  const verify = promisify(JWT.verify);

  return await verify(token, refresher ? REFRESH_SECRET : SECRET);
}

module.exports = verifyToken;
