const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: "rzp_live_URXDIEVhrVJJrU",
  key_secret: "OSnwBBNshcNPKqToiFjtQWBN",
});

const createOrder = async (totalCartValue, id, currCode) => {
  console.log('totalCartValue',totalCartValue)
  const order = await instance.orders.create({
    amount: (totalCartValue * 100).toFixed(),
    currency: currCode,
    receipt: id,
    // notes: {
    //   key1: "value3",
    //   key2: "value2",
    // },
  });

  return order;
};

module.exports = {
  createOrder,
};
