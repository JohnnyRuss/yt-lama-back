function getOrigins() {
  const ENV_MODE = process.env.NODE_MODE;

  const ORIGIN_DEV_APP = process.env.ORIGIN_DEV_APP;
  const ORIGIN_PROD_APP = process.env.ORIGIN_PROD_APP;

  return ENV_MODE === "DEV" ? [ORIGIN_DEV_APP] : [ORIGIN_PROD_APP];
}

module.exports = getOrigins;
