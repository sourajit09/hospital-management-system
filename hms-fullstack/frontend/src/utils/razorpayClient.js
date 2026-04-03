import axios from "axios";
import { axiosErrorMessage } from "../apiBase.js";

/**
 * Load Razorpay Key Id from backend (secret stays server-side only).
 */
export async function fetchRazorpayKeyId(backendUrl, token) {
  const { data } = await axios.get(`${backendUrl}/api/user/razorpay-key`, {
    headers: { token },
  });
  if (!data.success) {
    throw new Error(data.message || "Razorpay is not configured on the server");
  }
  return data.key;
}

/**
 * Opens Razorpay Checkout for an existing order (created by POST /payment-razorpay).
 */
export function openRazorpayCheckout({
  keyId,
  order,
  token,
  backendUrl,
  onPaid,
  onError,
}) {
  if (!window.Razorpay) {
    onError?.(new Error("Razorpay script not loaded. Refresh the page."));
    return;
  }
  if (!keyId) {
    onError?.(new Error("Razorpay key missing"));
    return;
  }

  const options = {
    key: keyId,
    amount: order.amount,
    currency: order.currency || "INR",
    name: "Hospital Management System",
    description: "Doctor consultation fee",
    order_id: order.id,
    receipt: order.receipt,
    theme: { color: "#5F6FFF" },
    handler: async (response) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/user/verifyRazorpay`,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          },
          { headers: { token } }
        );
        if (data.success) {
          onPaid?.(data);
        } else {
          onError?.(new Error(data.message || "Verification failed"));
        }
      } catch (err) {
        onError?.(new Error(axiosErrorMessage(err)));
      }
    },
    modal: {
      ondismiss: () => {},
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (ev) => {
    onError?.(
      new Error(ev.error?.description || ev.error?.reason || "Payment failed")
    );
  });
  rzp.open();
}

/**
 * Create Razorpay order on server, then open checkout (full flow).
 */
export async function startAppointmentPayment({
  appointmentId,
  token,
  backendUrl,
  keyId,
  loadKey,
  onPaid,
  onError,
}) {
  try {
    let razorpayKey = keyId;
    if (!razorpayKey && typeof loadKey === "function") {
      razorpayKey = await loadKey();
    }
    if (!razorpayKey) {
      razorpayKey = await fetchRazorpayKeyId(backendUrl, token);
    }

    const { data } = await axios.post(
      `${backendUrl}/api/user/payment-razorpay`,
      { appointmentId },
      { headers: { token } }
    );
    if (!data.success) {
      throw new Error(data.message || "Could not start payment");
    }

    openRazorpayCheckout({
      keyId: razorpayKey,
      order: data.order,
      token,
      backendUrl,
      onPaid,
      onError,
    });
  } catch (err) {
    onError?.(new Error(axiosErrorMessage(err)));
  }
}
