import { getOrderDetail } from "@/lib/admin/queries";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin/format";
import { PrintInvoiceButton } from "@/components/admin/PrintInvoiceButton";

export const metadata = {
  title: "Livaara - Invoice",
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 border border-stone-200 text-center max-w-md w-full">
          <h1 className="font-serif text-2xl text-stone-900 mb-2">Invoice Not Found</h1>
          <p className="text-stone-500 mb-6">The requested invoice could not be located.</p>
        </div>
      </div>
    );
  }

  const { name: customerName, email: customerEmail, phone: customerPhone } = order.customer;
  const shipping = order.shippingAddress as Record<string, string> | null;
  const subtotal =
    order.items?.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0) || 0;
  const grandTotal = order.totalAmount;

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-black print:bg-white print:p-0">
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print bg-stone-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="text-sm font-medium tracking-widest uppercase">Invoice Preview</div>
        <PrintInvoiceButton />
      </div>

      {/* A4 Container */}
      <div className="max-w-4xl mx-auto bg-white my-8 p-12 lg:p-16 shadow-lg print:shadow-none print:my-0 print:mx-0 print:max-w-full">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-stone-200 pb-8 mb-8">
          <div>
            <h1 className="font-serif text-4xl font-medium tracking-wide mb-2">LIVAARA</h1>
            <p className="text-stone-500 text-sm">Ayurvedic Hair Rituals</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-serif text-stone-900 mb-2">INVOICE</h2>
            <p className="text-sm text-stone-600 mb-1">
              <span className="font-medium">Order Number:</span> {order.displayId}
            </p>
            <p className="text-sm text-stone-600 mb-1">
              <span className="font-medium">Date:</span> {formatAdminDate(order.createdAt)}
            </p>
            <p className="text-sm text-stone-600">
              <span className="font-medium">Status:</span>{" "}
              <span className="uppercase">{order.paymentStatus}</span>
              {order.paymentMethod === "cod" && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-800 tracking-wider">
                  CASH ON DELIVERY
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-4">
              Billed To
            </h3>
            <p className="font-medium text-stone-900 mb-1">{customerName}</p>
            <p className="text-sm text-stone-600 mb-1">{customerEmail || "No email provided"}</p>
            <p className="text-sm text-stone-600">{customerPhone || "No phone provided"}</p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-4">
              Shipped To
            </h3>
            {shipping ? (
              <div className="text-sm text-stone-600 leading-relaxed">
                <p className="font-medium text-stone-900">
                  {shipping.firstName} {shipping.lastName}
                </p>
                <p>{shipping.address}</p>
                {shipping.apartment && <p>{shipping.apartment}</p>}
                <p>
                  {shipping.city}, {shipping.state} {shipping.pinCode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-500 italic">No shipping details</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-3 text-xs uppercase tracking-widest font-medium text-stone-400">
                  Item Description
                </th>
                <th className="py-3 text-xs uppercase tracking-widest font-medium text-stone-400 text-center w-24">
                  Qty
                </th>
                <th className="py-3 text-xs uppercase tracking-widest font-medium text-stone-400 text-right w-32">
                  Unit Price
                </th>
                <th className="py-3 text-xs uppercase tracking-widest font-medium text-stone-400 text-right w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length ? (
                order.items.map((item) => (
                  <tr key={item.id} className="border-b border-stone-100">
                    <td className="py-4 text-sm font-medium text-stone-900">{item.productName}</td>
                    <td className="py-4 text-sm text-stone-600 text-center">{item.quantity}</td>
                    <td className="py-4 text-sm text-stone-600 text-right">
                      {formatAdminCurrency(item.priceAtPurchase)}
                    </td>
                    <td className="py-4 text-sm font-medium text-stone-900 text-right">
                      {formatAdminCurrency(item.priceAtPurchase * item.quantity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-sm text-stone-500 text-center italic">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64">
            {order.codCharge > 0 ? (
              <>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-600">Subtotal</span>
                  <span className="text-sm font-medium">{formatAdminCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200">
                  <span className="text-sm text-stone-600">COD Charge</span>
                  <span className="text-sm font-medium">
                    {formatAdminCurrency(order.codCharge)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-600">Subtotal</span>
                  <span className="text-sm font-medium">{formatAdminCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-600">Tax (0%)</span>
                  <span className="text-sm font-medium">{formatAdminCurrency(0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200">
                  <span className="text-sm text-stone-600">Shipping</span>
                  <span className="text-sm font-medium">Free</span>
                </div>
              </>
            )}
            <div className="flex justify-between py-4">
              <span className="font-serif text-lg font-medium text-stone-900">Total</span>
              <span className="font-serif text-lg font-medium text-stone-900">
                {formatAdminCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 pt-8 text-center">
          <p className="font-serif text-lg text-stone-900 mb-2">Thank you for your purchase.</p>
          <p className="text-xs text-stone-500">
            If you have any questions about this invoice, please contact support@livaara.com
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body {
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `,
        }}
      />
    </div>
  );
}
