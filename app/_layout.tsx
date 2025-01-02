import React from "react";

import { Slot } from "expo-router";

import { StripeTerminalProvider } from "@stripe/stripe-terminal-react-native";

export default function RootLayout() {
  const fetchConnectionToken = async () => {
    console.log("I attempted to run.");
    try {
      const response = await fetch(
        "http://192.168.1.182:4242/connection_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (!data) {
        throw Error("No data in response from ConnectionToken endpoint");
      }

      if (!data.secret) {
        throw Error("Missing `secret` in ConnectionToken JSON response");
      }
      console.log("I finished running.");
      return data.secret;
    } catch (err) {
      console.log("fetch tokens error", err);
    }
  };

  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchConnectionToken}
    >
      <Slot />
    </StripeTerminalProvider>
  );
}
