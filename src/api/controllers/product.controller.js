const httpStatus = require('http-status');
const {omit} = require('lodash');
const Product = require('../models/product.model');

/**
 * Load product and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const product = await Product.get(id);
    req.locals = {product};
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get product
 * @public
 */
exports.get = (req, res) => res.json(req.locals.product.transform());


/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new Product(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(Product.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const {user} = req.locals;
    const newUser = new Product(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.update(newUserObject, {override: true, upsert: true});
    const savedUser = await Product.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(Product.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.locals.user, updatedUser);

  user.save()
    .then(savedProduct => res.json(savedProduct.transform()))
    .catch(e => next(e));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const products = await Product.list(req.query);
    const transformedProducts = products.map(product => product.transform());
    res.json(transformedProducts);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const {user} = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
