const Joi = require("joi").extend(require("@joi/date"));
const updateAgentCredentials = Joi.object({
    brokeragePhone: Joi.string().min(8).max(12),
    commision: Joi.number().integer().min(0).max(3)
})
const updatePassword = Joi.object({
    password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      )
    )
    .required(),
})
module.exports = {updateAgentCredentials, updatePassword}