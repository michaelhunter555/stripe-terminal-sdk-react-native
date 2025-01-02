export const useStripe = () => {
  const fetchConnectionToken = async () => {
    const response = await fetch("http://192.168.1.182:4242/connection_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!data) {
      throw Error("No data in response from ConnectionToken endpoint");
    }

    if (!data.secret) {
      throw Error("Missing `secret` in ConnectionToken JSON response");
    }
    return data.secret;
  };

  const fetchPaymentIntent = async () => {
    const parameters = {
      amount: 1000,
    };

    const response = await fetch(
      "http://192.168.1.182:4242/create_payment_intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      }
    );
    const data = await response.json();

    if (!data) {
      throw Error("No data in response from PaymentIntent endpoint");
    }

    if (!data.client_secret) {
      throw Error("Missing `client_secret` in ConnectionToken JSON response");
    }
    return data.client_secret;
  };

  const capturePaymentIntent = async () => {
    const parameters = {
      id: "paymentIntentId",
    };

    const response = await fetch(
      "http://192.168.1.182:4242/capture_payment_intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      return false;
    }
  };

  return {
    fetchConnectionToken,
    fetchPaymentIntent,
    capturePaymentIntent,
  };
};
