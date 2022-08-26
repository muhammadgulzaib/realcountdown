const Joi = require("joi").extend(require("@joi/date"));

const propertySchema = Joi.object({
  propertyName: Joi.string(),
  propertyAddress: Joi.string(),
  mailingAddress: Joi.string(),
  phone: Joi.string().min(8).max(15),
  zipCode: Joi.string().min(4).max(32),
  listForOpenBid: Joi.boolean(),
});

const propertySchemaForEdit = Joi.object({
  propertyName: Joi.string(),
  propertyAddress: Joi.string(),
  mailingAddress: Joi.string(),
  phone: Joi.string().min(8).max(15),
  zipCode: Joi.string().min(4).max(32),
});

module.exports = { propertySchema, propertySchemaForEdit };
