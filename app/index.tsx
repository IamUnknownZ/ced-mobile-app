import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import AddTodo from "./components/addTodo";
import Card from "./components/card";

type Todo = {
  id: number;
  title: string;
  completed: number;
};

export default function Index() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);

  const getTodos = async () => {
    try {
      const results = await db.getAllAsync<Todo>("SELECT * FROM todos");
      setTodos(results);
    } catch {
      Alert.alert("Cannot Read Todos.");
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>TODAY&apos;S BOARD</Text>
        <Text style={styles.heading}>{"Make space\nfor what matters."}</Text>
        <View style={styles.heroFooter}>
          <Text style={styles.subtitle}>One task at a time.</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{todos.length}</Text>
            <Text style={styles.countLabel}>TASKS</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>YOUR LIST</Text>
      <AddTodo refresh={getTodos} />
      <FlatList
        contentContainerStyle={styles.listContent}
        style={styles.list}
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Card todo={item} refresh={getTodos} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>No todos yet</Text>
            <Text style={styles.emptyText}>Add one small thing to get started.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F1E9",
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  list: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  hero: {
    backgroundColor: "#252525",
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,
    minHeight: 190,
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#B9E4C9",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    color: "#FFF9F0",
    fontSize: 31,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 16,
  },
  subtitle: {
    color: "#B7B3AC",
    fontSize: 13,
    fontWeight: "600",
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  countBadge: {
    backgroundColor: "#FF6B57",
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-6deg" }],
  },
  countNumber: {
    color: "#FFF9F0",
    fontSize: 23,
    fontWeight: "900",
  },
  countLabel: {
    color: "#FFF9F0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: "#8D877D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#FFF9F0",
    borderRadius: 24,
    padding: 28,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E8DFD2",
  },
  emptyIcon: {
    color: "#FF6B57",
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#252525",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#8D877D",
    fontSize: 13,
    marginTop: 6,
  },
});
