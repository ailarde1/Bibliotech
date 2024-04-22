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

//Url to backend. Edit in .env file.
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const navigation = useNavigation();

  const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(
        `${apiUrl}/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error("Error fetching search results: ", error);
      setBooks([]);
    }
  };

  const handleSearch = () => {
    fetchSearchResults(searchTerm);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.resultsContainer}showsVerticalScrollIndicator={false}>
      <TextInput
        style={styles.input}
        placeholder="Search books..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <Button title="Search" onPress={handleSearch} />

        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookItem}
            onPress={() => navigation.navigate("NewBookDetails", { book })}
          >
            {book.volumeInfo.imageLinks?.thumbnail && (
              <Image
                source={{ uri: book.volumeInfo.imageLinks.thumbnail }}
                style={styles.bookImage}
              />
            )}
            <Text style={styles.bookTitle}>{book.volumeInfo.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: -40,
    padding: 0,
    paddingHorizontal: 20,
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
    fontSize: 16,
    
  },
  resultsContainer: {
    marginBottom: 40,
    marginTop: 0,
  },
  bookItem: {
    marginBottom: 20,
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

});

export default SearchPage;
