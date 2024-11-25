const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const customError = require("../utils/customError");

const authValidation = {
  register: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        email: Joi.string().email().required(),
      });
      await Schema.validateAsync(req.body);
      next();
    } catch (error) {
      const errorValidation = new customError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details[0].message
      );
      next(errorValidation);
    }
  },
  confirmOtp: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        otp: Joi.string().min(6).max(6).required(),
        dataUser: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string()
            .min(8)
            .max(32)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$"))
            .required(),
        }).required(),
      });
      await Schema.validateAsync(req.body);
      next();
    } catch (error) {
      const errorValidation = new customError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details[0].message
      );
      next(errorValidation);
    }
  },
  login: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });
      await Schema.validateAsync(req.body);
      next();
    } catch (error) {
      const errorValidation = new customError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details[0].message
      );
      next(errorValidation);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        email: Joi.string().email().required(),
      });
      await Schema.validateAsync(req.body);
      next();
    } catch (error) {
      const errorValidation = new customError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details[0].message
      );
      next(errorValidation);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        user_id: Joi.string().required(),
        token: Joi.string().required(),
        password:  Joi.string()
        .min(8)
        .max(32)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$"))
        .required(),
      });
      await Schema.validateAsync(req.body);
      next();
    } catch (error) {
      const errorValidation = new customError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.details[0].message
      );
      next(errorValidation);
    }
  },
};
module.exports = authValidation;
