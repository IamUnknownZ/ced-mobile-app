import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Todo = {
  id: number;
  title: string;
  completed: number;
};

type CardProps = {
  todo: Todo;
  refresh: () => void;
};

export default function Card({ todo, refresh }: CardProps) {
  const db = useSQLiteContext();

  const setCompleted = async () => {
    const markComplete = (todo.completed + 1) % 2;

    try {
      await db.runAsync("UPDATE todos SET completed = ? WHERE id = ?", [
        markComplete,
        todo.id,
      ]);
      refresh();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : "Cannot update todo.");
    }
  };

  const removeTodo = async () => {
    Alert.alert(
      "Are you sure?",
      `Do you really want to delete "${todo.title}"?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM todos WHERE id = ?", [todo.id]);
              refresh();
            } catch (err) {
              Alert.alert(
                err instanceof Error ? err.message : "Cannot delete todo."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={[
        styles.container,
        todo.completed ? styles.completedCard : styles.activeCard,
      ]}
    >
      <View
        style={[
          styles.cardRail,
          todo.completed ? styles.doneRail : styles.activeRail,
        ]}
      />
      <View style={styles.titleWrap}>
        <View style={[styles.statusDot, todo.completed && styles.doneDot]} />
        <Text style={[styles.text, todo.completed && styles.completedText]}>
          {todo.title}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={setCompleted}
          style={styles.statusButton}
        >
          <Text style={styles.statusText}>
            {todo.completed ? (
              <Text style={styles.done}>DONE</Text>
            ) : (
              <Text style={styles.todo}>TO DO</Text>
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={removeTodo} style={styles.deleteButton}>
          <FontAwesome
            name="trash"
            size={24}
            color="white"
          />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8DFD2",
  },
  activeCard: {
    backgroundColor: "#FFF9F0",
  },
  completedCard: {
    backgroundColor: "#E8F3EC",
  },
  cardRail: {
    width: 4,
    height: 38,
    borderRadius: 4,
    marginRight: 12,
  },
  activeRail: {
    backgroundColor: "#FF6B57",
  },
  doneRail: {
    backgroundColor: "#7EB594",
  },
  titleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B57",
    marginRight: 10,
  },
  doneDot: {
    backgroundColor: "#98A2B3",
  },
  text: {
    color: "#252525",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  completedText: {
    color: "#7D8D82",
    textDecorationLine: "line-through",
  },
  statusButton: {
    backgroundColor: "#252525",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusText: {
    textAlign: "center",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  todo: {
    color: "#B9E4C9",
  },
  done: {
    color: "#B9E4C9",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B57",
    padding: 8,
    marginLeft: 10,
    borderRadius: 10,
  },
  deleteText: {
    color: "white",
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 0.5,
  },
});
