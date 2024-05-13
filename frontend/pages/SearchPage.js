import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

//Url to backend. Edit in .env file.
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(
        `${apiUrl}/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const updatedBooks = data.items?.map(book => {
        if (book.volumeInfo?.imageLinks?.thumbnail) {
          book.volumeInfo.imageLinks.thumbnail = book.volumeInfo.imageLinks.thumbnail.replace(/^http:/, 'https:');
        }
        return book;
      }) || [];
      setBooks(updatedBooks);
    } catch (error) {
      console.error("Error fetching search results: ", error);
      setBooks([]);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setBooks([]);
      return;
    }
    fetchSearchResults(searchTerm);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.input}
          placeholder="Search books..."
          value={searchTerm}
          backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
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

        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookItem}
            onPress={() => navigation.navigate("Add Book", { book })}
          >
            {book.volumeInfo.imageLinks?.thumbnail && (
              <Image
                source={{ uri: book.volumeInfo.imageLinks.thumbnail }}
                style={styles.bookImage}
              />
            )}
            <Text
              style={[
                styles.bookTitle,
                { color: isDarkMode ? "#FFF" : "#333" },
              ]}
            >
              {book.volumeInfo.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -40,
    padding: 0,
    paddingHorizontal: 20,
  },
  searchButton: {
    marginHorizontal: 0,
    marginTop: 0,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
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
  resultsContainer: {
    marginBottom: 40,
    marginTop: 0,
  },
  bookItem: {
    marginTop: 20,
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: "contain",
  },
  bookTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  button: {
    marginBottom: 5,
  },
});

export default SearchPage;
