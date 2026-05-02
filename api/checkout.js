import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { items, email } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: "No items provided" });
    }

    if (!email) {
      return res.status(400).json({ error: "No email provided" });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: 1
      })),
      success_url: "https://yoyo-delicious-eats-pyo1.vercel.app/?success=true",
      cancel_url: "https://yoyo-delicious-eats-pyo1.vercel.app"
    });

    // Send email
    try {
      const emailResponse = await resend.emails.send({
        from: "YoYo Eats <onboarding@resend.dev>",
        to: email,
        subject: "Your Order Confirmation 🍰",
        html: `
          <h2>Thanks for your order!</h2>
          <p>We received your order.</p>
          <ul>
            ${items.map(i => `<li>${i.name} - $${i.price}</li>`).join("")}
          </ul>
          <p>We’ll notify you when it’s ready!</p>
        `
      });

      console.log("EMAIL SENT:", emailResponse);
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError);
    }

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
