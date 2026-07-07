import { useEffect, useRef } from "react";
import { Text, View, Animated, Easing } from "react-native";
import { mainStyles } from "../../styles/style";

export default function Index() {
  // ==========================================
  // ANIMATION SETUP & CONFIGURATION
  // ==========================================
  const spinValue = useRef(new Animated.Value(0)).current;
  const blinkValue = useRef(new Animated.Value(0)).current;

  // Initialize and run the animations when the component mounts
  useEffect(() => {
    // 1. Spinning Animation loop setup
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

    // 2. Blinking (Border Color) Animation loop setup
    const blinkAnim = Animated.loop(
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
    );
    blinkAnim.start();

    // Clean up animations on unmount
    return () => {
      spinAnim.stop();
      blinkAnim.stop();
    };
  }, []);

  // 3. Interpolations mapping animated values to CSS values
  const rotateAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const borderColor = blinkValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0ff", "#f0f"], // Neon colors transition
  });

  // ==========================================
  // RENDER COMPONENT LAYOUT
  // ==========================================
  return (
    <View style={mainStyles.container}>
      <Text style={mainStyles.title}>Kanok045</Text>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* Animated Image using the rotation and blinking border defined above */}
        <Animated.Image
          source={require("../../img/jn.jpg")}
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
