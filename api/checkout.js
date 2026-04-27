import Stripe from "stripe";

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: 1
      })),
      success_url: `${req.headers.origin}`,
      cancel_url: `${req.headers.origin}`,
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
