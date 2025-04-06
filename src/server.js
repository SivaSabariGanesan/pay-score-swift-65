
// server.js
import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();

app.use(cors({
  origin: [
    "https://TransPay-five.vercel.app",  // ✅ your deployed frontend
    "capacitor://localhost",             // ✅ for APK
    "http://localhost",
    "http://localhost:5173",
    "file://",
    "https://localhost",                 // Adding this for Android
    "https://localhost:5173"             // Adding this for Android
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

const razorpay = new Razorpay({
  key_id: 'rzp_test_eDVMj23yL98Hvt',
  key_secret: 'LOr3SG3XRnMpgduiMYqljwgH',
});

app.post("/create-order", async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order); // includes order.id
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).send("Failed to create Razorpay order");
  }
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
