import Stripe from "stripe";

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: "No items provided" });
    }

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
      success_url: `${req.headers.origin}?success=true`,
      cancel_url: `${req.headers.origin}`,
      success_url: "https://yoyo-delicious-eats-clm.vercel.app/?success=true",
      cancel_url: "https://yoyo-delicious-eats-clm.vercel.app"
    });

    res.status(200).json({ url: session.url });
    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}
