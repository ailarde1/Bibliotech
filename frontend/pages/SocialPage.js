// Import necessary dependencies
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useTheme } from "./ThemeContext";
import { useNavigation } from "@react-navigation/native";

// Define SocialPage component
const SocialPage = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation(); // Access navigation object

  // Function to handle starting a chat
  const NavigatetoChat = () => {
    // Navigate to the ChatScreen component
    navigation.navigate("ChatScreen");
  };

  const NavigatetoFriends = () => {
    // Navigate to the Friends Screen component
    navigation.navigate("FriendsPage");
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#FFF" }]}>
    <Text style={[styles.text, { color: isDarkMode ? "#FFF" : "#333" }]}>
      Welcome to "The BookClub"
    </Text>
    <View style={styles.buttonsContainer}>
      <Button title="Start Chat" onPress={NavigatetoChat} />
      <Button title="View Friends" onPress={NavigatetoFriends} />
    </View>
  </View>
);
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    color: "black",
  },
});

export default SocialPage;
