const Joi = require('joi');
const Order = require('../models/order.model');

module.exports = {

  // POST /v1/order
  createOrder: {
    body: {
      createdBy: Joi.string().max(128),
      product: Joi.string().max(128),
      status: Joi.string().valid(Order.status)
    }
  },

  // PATCH /v1/order/:orderId
  updateOrder: {
    body: {
      createdBy: Joi.string().max(128),
      product: Joi.string().max(128),
      status: Joi.string().valid(Order.status)
    },
    params: {
      userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    }
  }
};
