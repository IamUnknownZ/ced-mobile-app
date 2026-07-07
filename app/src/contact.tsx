import { Text, View, StyleSheet } from "react-native";

const Contact = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>Kanokpong Huakham</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>s6702041610045@email.kmutnb.ac.th</Text>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>080-000-0000</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FCC" },
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
export default Contact;
