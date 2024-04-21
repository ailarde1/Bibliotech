import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "./Authentication";
import * as SecureStore from "expo-secure-store";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
import { useRefresh } from "./RefreshContext";

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated } = useAuth();
  const { triggerRefresh } = useRefresh();

  const storeCredentials = async (username) => {
    await SecureStore.setItemAsync("username", username);
  };

  const handleLoginPress = () => {
    loginUser(username, password);
  };

  const handleNewUserPress = () => {
    createNewUser(username, password);
  };

  const createNewUser = async (username, password) => {
    const response = await fetch(`${apiUrl}/new-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.message.includes("User created")) {
      Alert.alert("Success", "User has been added.");
      await storeCredentials(username);
      setIsAuthenticated(true);
      triggerRefresh("BookshelfPage");
      triggerRefresh("SettingsProfilePage");
    } else {
      Alert.alert("Error", data.message);
      setIsAuthenticated(false);
    }
  };

  const loginUser = async (username, password) => {
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.message === "Login successful") {
      Alert.alert("Login Success", "You have been logged in successfully.");
      await storeCredentials(username);
      setIsAuthenticated(true);
      triggerRefresh("BookshelfPage");
      triggerRefresh("SettingsProfilePage");
    } else {
      Alert.alert("Login Error", data.message);
      setIsAuthenticated(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Button
          title="Test User 1"
          onPress={() => loginUser("Martyn", "password1")}
        />
      </View>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
        placeholder="Enter Username"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Enter Password"
        secureTextEntry={true} // hides the password input
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.button} onPress={handleNewUserPress}>
          <Text style={styles.buttonText}>New User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#407BFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,  // adds shadow for Android
    shadowOpacity: 0.3,  // adds shadow for iOS
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  spacer: {
    width: 20,
  },
  input: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 5,
    marginBottom: 15,
    marginHorizontal: 10,
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: "white",
  },
});

export default LoginPage;
