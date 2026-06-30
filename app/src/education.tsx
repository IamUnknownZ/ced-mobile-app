import { Text, View, StyleSheet } from "react-native";
export default function Education() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Major:</Text>
        <Text style={styles.value}>CED</Text>
        <Text style={styles.label}>University:</Text>
        <Text style={styles.value}>
          King Mongkut's University of Technology North Bangkok
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    textAlign: "center",
    color: "#07F",
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 14, color: "#666", marginTop: 10 },
  value: { fontSize: 18, color: "#333", fontWeight: "600" },
});
