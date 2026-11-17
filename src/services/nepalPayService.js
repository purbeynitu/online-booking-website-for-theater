/**
 * NepalPay Payment Gateway Integration Service
 * Supporting NepalPay QR, eSewa, Khalti, connectIPS and Fonepay
 */

export const NEPAL_PAY_CONFIG = {
  merchantId: "NP-GIRIJA-JANAKPUR-01",
  merchantName: "Girija Cinema Hall Janakpur",
  merchantCity: "Janakpurdham",
  merchantPAN: "302918271",
  terminalId: "GIRIJA-AUDI-01",
  currency: "NPR",
  acquirerBank: "Global IME Bank / NCHL",
};

/**
 * Generate a dynamic NepalPay QR code string compliant with EMVCo & NCHL standards
 */
export function generateNepalPayQr({ amount, bookingId, customerName }) {
  const timestamp = Date.now();
  const txRef = `NP-${bookingId}-${timestamp.toString().slice(-4)}`;
  
  // Simulated formatted NepalPay / connectIPS QR payload
  const qrPayload = `00020101021226580010com.nepalpay0124${NEPAL_PAY_CONFIG.merchantId}520478325303524540${amount.toFixed(2)}5802NP5926${NEPAL_PAY_CONFIG.merchantName}6012Janakpurdham62240112${bookingId}0208${txRef}6304`;
  
  return {
    qrPayload,
    transactionRef: txRef,
    merchantName: NEPAL_PAY_CONFIG.merchantName,
    merchantPAN: NEPAL_PAY_CONFIG.merchantPAN,
    amount,
    bookingId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Process simulated payment through selected Nepali Gateway
 */
export async function processNepalPayPayment({
  gateway, // 'nepalpay_qr' | 'esewa' | 'khalti' | 'connectips' | 'fonepay'
  amount,
  bookingId,
  customer
}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const txId = `NPAY-${gateway.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      resolve({
        success: true,
        transactionId: txId,
        gateway: gateway,
        amount: amount,
        currency: "NPR",
        status: "COMPLETED",
        paidAt: new Date().toISOString(),
        paymentRef: `NCHL-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        merchant: NEPAL_PAY_CONFIG.merchantName
      });
    }, 1400);
  });
}
