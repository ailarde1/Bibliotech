import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "./Authentication";
import * as SecureStore from 'expo-secure-store';

//Need to remake with Proper User login and Authentication

//Url to backend. Edit in .env file.
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const LoginPage = ({ navigation }) => {
  const [inputValue, setInputValue] = useState("");
  const { setIsAuthenticated } = useAuth();

  const storeUsername = async (username) => {
    await SecureStore.setItemAsync('username', username);
  };

  const handleLoginPress = () => {
    console.log(inputValue);
    fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: inputValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        if (data.message === 'Username Exists') {
          Alert.alert("Login Success", "You have been logged in successfully.");
          setIsAuthenticated(true);
          storeUsername(inputValue); // Store username on successful login
        } else {
          Alert.alert("Login Error", data.message);
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Alert.alert("Login Error", "An unexpected error occurred");
      });
  };

  const handleNewUserPress = () => {
    console.log(inputValue);
    fetch(`${apiUrl}/new-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: inputValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        if (data.message.includes('User created')) {
          Alert.alert("Success", "Username has been added.");
          setIsAuthenticated(true);
          storeUsername(inputValue); // Store username on successful creation
        } else {
          Alert.alert("Error", data.message);
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Alert.alert("Error", "An unexpected error occurred");
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setInputValue}
        value={inputValue}
        placeholder="Enter Username"
      />
      <View style={styles.buttons}>
        <Button title="Login" onPress={handleLoginPress} />
        <Button title="New User" onPress={handleNewUserPress} />
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
  input: {
    height: 40,
    width: "100%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoginPage;