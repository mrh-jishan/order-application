const cron = require('node-cron');
const Order = require('./api/models/order.model');
const Payment = require('./api/models/payment.model');

// running envery two minutes
cron.schedule('*/2 * * * *', async () => {
  console.log('started deliver the product');
  const order = await Order.findOne({status: 'confirmed'});
  console.log('searched order------------>', order);
  if (order) {
    order.status = 'delivered';
    order.save().then((res) => {
      console.log('order updated to delivered---------->', res);
    }).catch((err) => {
      console.log('order update failed to delivered------------->', err);
    });
  }
  console.log('end deliver the product');
});

// running every minutes
cron.schedule('* * * * *', async () => {
  console.log('started checking the payment of the order');
  const order = await Order.findOne({status: 'created'});
  console.log('searched order------------>', order);
  if (order) {
    const payment = await Payment.findOne({product: order.product});
    console.log('searched payment------------>', payment);
    if (payment) {
      order.status = payment.status;
      order.save().then((res) => {
        console.log('order updated to delivered---------->', res);
      }).catch((err) => {
        console.log('order update failed to delivered------------->', err);
      });
    }
  }
  console.log('end deliver the product');
});
