import { useEffect, useRef } from "react";
import { Text, View, Animated, Easing } from "react-native";
import { mainStyles } from "../styles/style";
import { Link } from "expo-router";

export default function Index() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const blinkValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spinValue.setValue(0);
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    spinAnim.start();

    // Add blinking animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(blinkValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    return () => {
      spinAnim.stop();
    };
  }, []);

  const rotateAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const borderColor = blinkValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0ff", "#f0f"], // Neon colors
  });

  return (
    <View style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.title}>สบายแท้ 0079</Text>
        <Link href="/src/education" style={mainStyles.link}>
          Education
        </Link>
        <Link href="/src/contact" style={mainStyles.link}>
          Contact
        </Link>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.Image
          source={require("../img/jn.jpg")}
          style={[
            mainStyles.image,
            {
              transform: [{ rotate: rotateAnimation }],
              borderWidth: 5,
              borderColor: borderColor,
            },
          ]}
        />
      </View>
    </View>
  );
}
