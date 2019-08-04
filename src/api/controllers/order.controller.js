const httpStatus = require('http-status');
const {omit} = require('lodash');
const Order = require('../models/order.model');
const authProviders = require('../services/authProviders');

/**
 * Load order and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const order = await Order.get(id);
    req.locals = {order};
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get order
 * @public
 */
exports.get = (req, res) => res.json(req.locals.order.transform());


/**
 * Create new order
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const order = new Order(req.body);
    const savedorder = await order.save();

    // eslint-disable-next-line no-unused-vars
    createPayout(req, savedorder).then((response) => {
      res.status(httpStatus.CREATED);
      const tOrder = savedorder.transform();
      tOrder.payout = {
        status: response.status,
        cardHolderName: response.cardHolderName,
        product: response.product
      }
      res.json(tOrder);
    }).catch((err) => {
      next(err);
    });
  } catch (error) {
    next(Order.checkValidation(error));
  }
};


const createPayout = async (req, order) => new Promise((resolve, reject) => {
  const body = req.body.payment;
  body.createdBy = `${order.createdBy}`;
  body.product = `${order.product}`;
  authProviders.payment(req.headers.authorization, body).then((res) => {
    resolve(res);
  }).catch((err) => {
    reject(err);
  });
});

/**
 * Replace existing order
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const {user} = req.locals;
    const newUser = new Order(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.update(newUserObject, {override: true, upsert: true});
    const savedUser = await Order.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(Order.checkDuplicateEmail(error));
  }
};

/**
 * Update existing order
 * @public
 */
exports.update = (req, res, next) => {
  const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.locals.user, updatedUser);

  user.save()
    .then(savedOrder => res.json(savedOrder.transform()))
    .catch(e => next(e));
};

/**
 * Get order list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const orders = await Order.list(req.query);
    const transformedOrders = orders.map(order => order.transform());
    res.json(transformedOrders);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete order
 * @public
 */
exports.remove = (req, res, next) => {
  const {user} = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
