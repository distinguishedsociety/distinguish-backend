const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: "rzp_live_HRTCJnxkRyWNF2",
  key_secret: "gMHYb8cGQwHhAtD1HhRcFnHA",
});

const createOrder = async (totalCartValue, id) => {
  console.log(totalCartValue)
  const order = await instance.orders.create({
    amount: totalCartValue * 100,
    currency: "INR",
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
