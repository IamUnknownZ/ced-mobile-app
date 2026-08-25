import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";

export default function RootLayout() {
  const createTable = async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0
      );
    `);
  };

  return (
    <SQLiteProvider
      databaseName="stdphones.db"
      onInit={createTable}
      options={{ useNewConnection: false }}
    >
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#252525" },
          headerTintColor: "#FFF9F0",
          headerTitleStyle: { fontWeight: "900" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Daily Focus" }}
        />
      </Stack>
    </SQLiteProvider>
  );
}
