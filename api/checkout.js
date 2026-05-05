export default function handler(req, res) {
  res.status(200).json({
    message: "API WORKING",
    hasKey: !!process.env.STRIPE_SECRET_KEY
  });
}
