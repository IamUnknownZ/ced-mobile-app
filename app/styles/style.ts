import { StyleSheet, Animated, Easing } from "react-native";

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCC",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#07F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  link: {
    color: "#fff",
    backgroundColor: "#07F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "600",
    overflow: "hidden",
  },
  image: {
    width: 300,
    height: 400,
  },
});
