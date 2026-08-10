# Students Phone App

Expo SDK 54 app following the CRUD JSON Server slides: it uses Axios to create, read, update, and delete records in the `phones` resource.

## Run it

1. Use Node 20 or newer: `nvm use 20`
2. Install packages: `npm install`
3. In one terminal start the API: `npm run api`
4. In another terminal start Expo: `npm start`

The API endpoint is `http://localhost:3008/phones` as used in the slides. In Expo Go,
the app automatically uses the same LAN IP that Expo uses, so a phone on the same Wi-Fi
can also reach JSON Server.

## Using an emulator or a physical phone

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`:

- Android emulator: `http://10.0.2.2:3008`
- Physical phone: use this computer's LAN IP, such as `http://192.168.1.25:3008`

Restart Expo after changing `.env`.
