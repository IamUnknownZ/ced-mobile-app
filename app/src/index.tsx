import { Image, Text, View } from "react-native";
import { mainStyles } from "../styles/style";

export default function Index() {
  return (
    <View style={mainStyles.container}>
      <Text style={mainStyles.title}>Kanok045</Text>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* Image from week1 displayed statically with mainStyles.image, rounded and without animation */}
        <Image
          source={require("../image/nn.jpg")}
          style={[mainStyles.image, { borderRadius: 16, resizeMode: "cover" }]}
        />
      </View>
    </View>
  );
}
