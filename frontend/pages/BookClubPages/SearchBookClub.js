import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
import { useRefresh } from "../RefreshContext";

import * as SecureStore from 'expo-secure-store';

const SearchBookClub = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { triggerRefresh } = useRefresh();

  const handleSearch = async () => {
    if (searchQuery.trim() === ""){
      setSearchResults([]);
      return;
    }

  try {
    const response = await fetch(
      `${apiUrl}/bookclub/search?search=${searchQuery}`
    );
    const data = await response.json();
    if (response.ok) {
      setSearchResults(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    Alert.alert("Error", error.toString());
  }
  };

  const handleJoinBookclub = async (bookClubName) => {
    const username = await SecureStore.getItemAsync("username");

    try {
      const response = await fetch(`${apiUrl}/bookclub/join?username=${encodeURIComponent(username)}&bookClubName=${encodeURIComponent(bookClubName)}`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "You have successfully joined the book club");
        navigation.goBack();
        triggerRefresh("SocialPage");
      } else {
        throw new Error(data.message || "Failed to join the book club.");
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      <TextInput
        style={styles.input}
        onChangeText={setSearchQuery}
        backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
        value={searchQuery}
        placeholder="Search BookClubs..."
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity
        onPress={handleSearch}
        style={[
          styles.searchButton,
          { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
        ]}
      >
        <Text style={[styles.searchButtonText]}>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.searchItem, { backgroundColor: isDarkMode ? "#444445" : "#FFF" }]}>
            <Text style={[styles.itemText, { color: isDarkMode ? "#FFF" : "#333" }]}>
              {item.name}
            </Text>
            <Button
              color={isDarkMode ? "#005ECB" : "#007AFF"}
              title="Add"
              onPress={() => handleJoinBookclub(item.name)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -40,
    padding: 0,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  itemText:{
    fontSize: 30,
  },
  searchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginBottom: 5,
  },
  item: {
    fontSize: 20,
  },
  searchButton: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  input: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 5,
    marginBottom: 15,
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default SearchBookClub;
