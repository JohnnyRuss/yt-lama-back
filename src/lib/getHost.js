function getHost() {
  const ENV_MODE = process.env.NODE_MODE;

  const HOST_DEV_APP = process.env.HOST_DEV_APP;
  const HOST_PROD_APP = process.env.HOST_PROD_APP;

  return ENV_MODE === "DEV" ? HOST_DEV_APP : HOST_PROD_APP;
}

module.exports = getHost;
