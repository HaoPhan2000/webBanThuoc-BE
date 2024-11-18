const constants= require("../utils/constants")
const authentication =require("../middleware/authenticationMiddleware ")
const authorization =require("../middleware/authorizationMiddleware ")
const errorHandle=require("../middleware/errorHandleMiddleware ")
const notFoundError =require("../middleware/notFoundErrorMiddleware ")
const authenticationRoute=require("./authenticationRoute")
const roleRoute =require("./roleRoute")
const initRoutes = (app) => {
    app.all('*', authentication, authorization)
  
    app.use(constants.BASE_URL_API_VERSION, authenticationRoute)
    app.use(constants.BASE_URL_API_VERSION, roleRoute)

    app.use(errorHandle)
    app.use(notFoundError)
  }
module.exports= initRoutes