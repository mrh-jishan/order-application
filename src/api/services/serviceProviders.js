const request = require('request');
const Order = require('../models/order.model');

exports.payment = async (accessToken, body) => {
  const paymentHost = process.env.PAYMENT_URI || 'http://localhost:4000';
  const url = `${paymentHost}/v1/payment`;

  const headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'content-type': 'application/json',
    Authorization: accessToken
  };

  const options = {
    url,
    method: 'POST',
    headers,
    body,
    json: true
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, data) => {
      if (error) {
        reject(error);
      } else {
        // update the order after 10 sec
        setTimeout(() => {
          changeOrder(data);
        }, 10000);
        resolve(data);
      }
    });
  });
};

const changeOrder = async (payout) => {
  const order = await Order.findOne({product: payout.product});
  order.status = payout.status;
  order.save().then((res) => {
    console.log('order updated---------->', res);
  }).catch((err) => {
    console.log('order update failed------------->', err);
  });
}
