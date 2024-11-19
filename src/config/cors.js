const env=require("./environment")
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = env.DomainInterface.split(",");
    if (!origin || whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new ApiError(
        StatusCodes.FORBIDDEN,
        `${origin} not allowed by our CORS Policy.`
      )
    );
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
