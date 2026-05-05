module.exports = async function handler(req, res) {
  return res.status(200).json({
    message: "API WORKING",
    keyExists: !!process.env.STRIPE_SECRET_KEY
  });
};
