import dotenv from "dotenv";
import crypto from "crypto";

// Load environment variables
dotenv.config({ path: ".env.local" });

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.error("Missing RAZORPAY_WEBHOOK_SECRET in .env.local");
  process.exit(1);
}

const url = "http://localhost:3000/api/checkout/razorpay-webhook";

// Dummy payload matching the expected razorpay event structure
const payload = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_dummy" + Date.now(),
        order_id: "order_dummy" + Date.now(),
        amount: 59900, // 599.00 INR
        currency: "INR",
      },
    },
  },
};

const payloadString = JSON.stringify(payload);

// Generate signature
const signature = crypto.createHmac("sha256", webhookSecret).update(payloadString).digest("hex");

async function fireWebhook() {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature,
    },
    body: payloadString,
  });

  const text = await response.text();
  return { status: response.status, body: text };
}

async function runStressTest() {
  console.log("Starting Razorpay Webhook Stress Test...");
  console.log(`Firing 10 concurrent requests to ${url}`);

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(fireWebhook());
  }

  const results = await Promise.all(promises);

  results.forEach((result, index) => {
    console.log(`Request ${index + 1}: Status ${result.status} - ${result.body}`);
  });

  const successCount = results.filter((r) => r.status === 200).length;
  console.log(`\nTest Complete: ${successCount} successful requests out of 10.`);
}

runStressTest();
