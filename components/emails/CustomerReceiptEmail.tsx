import * as React from "react";

interface CustomerReceiptEmailProps {
  orderNumber: number;
  customerName: string;
  shippingAddress: string;
  totalAmount: number;
}

export const CustomerReceiptEmail: React.FC<Readonly<CustomerReceiptEmailProps>> = ({
  orderNumber,
  customerName,
  shippingAddress,
  totalAmount,
}) => (
  <div
    style={{
      backgroundColor: "#F8F5F0",
      padding: "40px",
      fontFamily: "sans-serif",
      color: "#1c1917",
    }}
  >
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "4px",
        border: "1px solid #e7e5e4",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1
          style={{
            fontFamily: "serif",
            fontSize: "28px",
            letterSpacing: "0.1em",
            margin: 0,
            color: "#1c1917",
          }}
        >
          LIVAARA
        </h1>
      </div>

      <h2 style={{ fontFamily: "serif", fontSize: "24px", marginBottom: "20px" }}>
        Thank you for your order, {customerName}.
      </h2>

      <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "30px", color: "#44403c" }}>
        We have successfully received your order and are preparing it for shipment.
      </p>

      <div
        style={{
          backgroundColor: "#fafaf9",
          padding: "20px",
          borderRadius: "4px",
          marginBottom: "30px",
          border: "1px solid #f5f5f4",
        }}
      >
        <h3 style={{ fontFamily: "serif", fontSize: "18px", margin: "0 0 10px 0" }}>
          Order Summary
        </h3>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Order Number:</strong> #{orderNumber.toString().padStart(3, "0")}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          <strong>Total Paid:</strong> ₹{totalAmount}
        </p>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontFamily: "serif", fontSize: "18px", margin: "0 0 10px 0" }}>
          Shipping Address
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#44403c",
            whiteSpace: "pre-line",
          }}
        >
          {shippingAddress}
        </p>
      </div>

      <div
        style={{
          borderTop: "1px solid #e7e5e4",
          paddingTop: "20px",
          marginTop: "40px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "12px", color: "#78716c", margin: 0 }}>
          © {new Date().getFullYear()} LIVAARA. All rights reserved.
        </p>
        <p style={{ fontSize: "12px", color: "#78716c", fontStyle: "italic", marginTop: "5px" }}>
          Crafted with intention. Delivered with care.
        </p>
      </div>
    </div>
  </div>
);
