import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "./Authentication";
import * as SecureStore from 'expo-secure-store';

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
import { useRefresh } from './RefreshContext';

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated } = useAuth();
  const { triggerRefresh } = useRefresh();

  const storeCredentials = async (username) => {
    await SecureStore.setItemAsync('username', username);
  };

  const handleLoginPress = () => {
    loginUser(username, password);
  };

  const handleNewUserPress = () => {
    fetch(`${apiUrl}/new-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message.includes('User created')) {
          Alert.alert("Success", "User has been added.");
          setIsAuthenticated(true);
          storeCredentials(username);
          triggerRefresh();
        } else {
          Alert.alert("Error", data.message);
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        Alert.alert("Error", "An unexpected error occurred");
      });
  };

  const loginUser = (username, password) => {
    fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Login successful') {
          Alert.alert("Login Success", "You have been logged in successfully.");
          setIsAuthenticated(true);
          storeCredentials(username);
          triggerRefresh();
        } else {
          Alert.alert("Login Error", data.message);
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        Alert.alert("Login Error", "An unexpected error occurred");
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Button title="Test User 1" onPress={() => loginUser('Martyn', 'password1')} />
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