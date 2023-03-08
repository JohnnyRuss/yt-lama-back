const Async = (handler) => (req, res, next) =>
  handler(req, res, next).catch(next);

module.exports = Async;
