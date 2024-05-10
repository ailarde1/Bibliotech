import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";

const SocialPage = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  const navigateToCreateBookClub = () => {
    navigation.navigate("CreateBookClub");
  };

  const navigateToSearchBookClub = () => {
    navigation.navigate("SearchBookClub");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#FFF" },
      ]}
    >
      <Text style={[styles.text, { color: isDarkMode ? "#FFF" : "#333" }]}>
        Welcome to "The BookClub"
      </Text>
      <View style={styles.buttonsContainer}>
        <Button title="Create BookClub" onPress={navigateToCreateBookClub} />
        <Button title="Search BookClubs" onPress={navigateToSearchBookClub} />
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
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default SocialPage;
