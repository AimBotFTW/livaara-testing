import crypto from "crypto";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_secret";

if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.warn(
    "Warning: RAZORPAY_WEBHOOK_SECRET not found in .env.local. Using 'dummy_secret' for local testing.",
  );
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
  try {
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
  } catch (error) {
    return { status: "Error", body: error.message };
  }
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
