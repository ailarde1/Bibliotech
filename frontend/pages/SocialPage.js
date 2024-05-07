import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";

const SocialPage = () => {
  const { isDarkMode } = useTheme();

  return (
    //<View style={styles.container}>
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#FFF" },
      ]}
    >
      <Text style={[styles.text, { color: isDarkMode ? "#FFF" : "#333" }]}>
        Social Page
      </Text>
    </View>
  );
};

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
