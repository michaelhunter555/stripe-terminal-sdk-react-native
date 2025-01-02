import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ConfirmPaymentMethodParams,
  Reader,
  requestNeededAndroidPermissions,
  useStripeTerminal,
} from "@stripe/stripe-terminal-react-native";

import { useStripe } from "../hooks/stripe-hook/stripe-hook";

export default function Index() {
  const { fetchPaymentIntent, capturePaymentIntent } = useStripe();
  const {
    discoverReaders,
    cancelDiscovering,
    retrievePaymentIntent,
    connectBluetoothReader,
    collectPaymentMethod,
    confirmPaymentIntent,
    setSimulatedCard,
    initialize,
  } = useStripeTerminal({
    onUpdateDiscoveredReaders: async (readers: Reader.Type[]) => {
      const selectedReader = readers[0];
      const { reader, error } = await connectBluetoothReader({
        reader: selectedReader,
        locationId: "tml_F3L8bgnNTYO59F",
      });

      console.log("Selected Reader:", reader);

      if (error) {
        console.log("connectBluetoothReader error", error);
      } else {
        console.log("Reader connected successfully", reader);
      }
    },
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const granted = await requestNeededAndroidPermissions({
          accessFineLocation: {
            title: "Location Permission",
            message: "Stripe Terminal needs access to your location",
            buttonPositive: "Accept",
          },
        });
        if (granted) {
          setPermissionsGranted(true);
          initialize();
        } else {
          Alert.alert(
            "Location services are required in order to connect to a reader."
          );
        }
      } catch {
        Alert.alert(
          "Location services are required in order to connect to a reader."
        );
      }
    }

    if (Platform.OS === "android") {
      init();
    } else {
      setPermissionsGranted(true);
    }
  }, [initialize]);

  const cancelCurrentDiscovering = async () => {
    await cancelDiscovering();
    console.log("Canceled ongoing discoveries in the process.");
  };

  const handleDiscoverReaders = async () => {
    await cancelCurrentDiscovering();
    // List of discovered readers will be available within useStripeTerminal hook
    console.log("attempting to discover phsyical readers");
    const { error } = await discoverReaders({
      discoveryMethod: "bluetoothScan",
      locationId: "tml_F3L8bgnNTYO59F",
      simulated: false,
    });

    console.log("await has completed");

    if (error) {
      console.log(
        "Discover readers error: ",
        `${error.code}, ${error.message}`
      );
    } else {
      console.log("discoverReaders succeeded");
    }
  };

  const collectPayment = async () => {
    const clientSecret = await fetchPaymentIntent();

    await setSimulatedCard("4242424242424242");

    if (!clientSecret) {
      console.log("createPaymentIntent failed");
      return;
    }
    const { paymentIntent, error } = await retrievePaymentIntent(clientSecret);

    if (error) {
      console.log(`Couldn't retrieve payment intent: ${error.message}`);
    } else if (paymentIntent) {
      const { paymentIntent: collectedPaymentIntent, error: collectError } =
        await collectPaymentMethod({ paymentIntent: paymentIntent });

      if (collectError) {
        console.log(`collectPaymentMethod failed: ${collectError.message}`);
      } else if (collectedPaymentIntent) {
        console.log("collectPaymentMethod succeeded");

        processPayment({ paymentIntent: collectedPaymentIntent });
      }
    }
  };

  const processPayment = async (paymentIntent: ConfirmPaymentMethodParams) => {
    const { paymentIntent: processPaymentPaymentIntent, error } =
      await confirmPaymentIntent(paymentIntent);

    if (error) {
      console.log(`confirmPaymentIntent failed: ${error.message}`);
    } else if (processPaymentPaymentIntent) {
      console.log("confirmPaymentIntent succeeded");

      const result = await capturePaymentIntent();
      if (!result) {
        console.log("capture failed");
      } else {
        console.log("capture succeeded");
      }
    }
  };

  return (
    <>
      {permissionsGranted ? (
        <View style={styles.container}>
          <TouchableOpacity
            disabled={!permissionsGranted}
            onPress={handleDiscoverReaders}
          >
            <Text>Discover Readers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!permissionsGranted}
            onPress={collectPayment}
          >
            <Text>Collect payment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
});
