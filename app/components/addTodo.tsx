import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type AddTodoProps = {
  refresh: () => void;
};

export default function AddTodo({ refresh }: AddTodoProps) {
  const [title, setTitle] = useState("");
  const db = useSQLiteContext();

  const addTodo = async () => {
    const todoTitle = title.trim();

    if (!todoTitle) {
      Alert.alert("Please enter a todo title.");
      return;
    }

    try {
      const query = "INSERT INTO todos (title, completed) VALUES (?, ?);";
      await db.runAsync(query, todoTitle, 0);
      setTitle("");
      await refresh();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : "Cannot add todo.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter todo title"
        placeholderTextColor="gray"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <TouchableOpacity onPress={addTodo} style={styles.buttonContainer}>
        <Text style={styles.button}>ADD</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    width: "100%" as const,
    marginBottom: 14,
    backgroundColor: "#FFF9F0",
    borderRadius: 18,
    padding: 5,
    borderWidth: 1,
    borderColor: "#E8DFD2",
  },
  input: {
    flex: 1,
    color: "#252525",
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  button: {
    color: "#252525",
    fontSize: 20,
    fontWeight: "900",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  buttonContainer: {
    backgroundColor: "#B9E4C9",
    borderRadius: 14,
  },
});
