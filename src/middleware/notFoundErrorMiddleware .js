const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const notFoundErrorMiddleware = (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json(ReasonPhrases.NOT_FOUND);
};
module.exports = notFoundErrorMiddleware;
