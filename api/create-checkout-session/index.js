export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: "No items provided" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: 1
      })),
      success_url: "https://your-site-url.com",
      cancel_url: "https://your-site-url.com"
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message });
  }
}
