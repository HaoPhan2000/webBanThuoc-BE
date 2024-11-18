const { StatusCodes } = require("http-status-codes");
const notFoundErrorMiddleware = (req, res) => {
    return res.staus(StatusCodes.NOT_FOUND).json(ReasonPhrases.NOT_FOUND);
};
module.exports = notFoundErrorMiddleware;
