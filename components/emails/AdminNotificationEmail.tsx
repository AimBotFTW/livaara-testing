import * as React from "react";

interface AdminNotificationEmailProps {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  subtotal?: number;
  codCharge?: number;
  paymentMethod?: "cod" | "razorpay";
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export const AdminNotificationEmail: React.FC<Readonly<AdminNotificationEmailProps>> = ({
  orderNumber,
  customerName,
  customerEmail,
  totalAmount,
  subtotal,
  codCharge,
  paymentMethod,
  items,
}) => (
  <div
    style={{
      backgroundColor: "#0c0a09",
      padding: "40px",
      fontFamily: "sans-serif",
      color: "#e7e5e4",
    }}
  >
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#1c1917",
        padding: "40px",
        borderRadius: "4px",
        border: "1px solid #292524",
      }}
    >
      <h1 style={{ fontFamily: "serif", fontSize: "24px", margin: "0 0 20px 0", color: "#ffffff" }}>
        New Order Received!
      </h1>

      <p style={{ fontSize: "16px", marginBottom: "30px", color: "#d6d3d1" }}>
        A new order has been successfully placed and paid for.
      </p>

      <div
        style={{
          backgroundColor: "#292524",
          padding: "20px",
          borderRadius: "4px",
          marginBottom: "30px",
        }}
      >
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Order Number:</strong> #{orderNumber.toString().padStart(3, "0")}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Customer Name:</strong> {customerName}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Customer Email:</strong> {customerEmail}
        </p>

        {items && items.length > 0 && (
          <div
            style={{
              margin: "15px 0",
              padding: "10px 0",
              borderTop: "1px solid #e7e5e4",
              borderBottom: "1px solid #e7e5e4",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Items</h4>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        )}

        {paymentMethod === "cod" && subtotal !== undefined && codCharge !== undefined && (
          <>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              <strong>Subtotal:</strong> ₹{subtotal}
            </p>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              <strong>COD Charge:</strong> ₹{codCharge}
            </p>
          </>
        )}
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Payment Method:</strong>{" "}
          {paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Total Amount:</strong> ₹{totalAmount}
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#d6d3d1" }}>
        Please check the Admin Dashboard for full fulfillment details and to print the shipping
        invoice.
      </p>
    </div>
  </div>
);
