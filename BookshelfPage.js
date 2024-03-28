import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";

//Url to backend. Edit in .env file.
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const BookshelfPage = ({ navigation }) => {
  // navigation prop
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchUsernameAndBooks = async () => {
      try {
        // gets the username from SecureStore
        const username = await SecureStore.getItemAsync("username");
        if (username) {
          await fetchBooks(username);
        } else {
          console.error("Username not found");
        }
      } catch (error) {
        console.error("Error fetching username", error);
      }
    };
    fetchUsernameAndBooks();
  }, []);

  const fetchBooks = async (username) => {
    try {
      const response = await fetch(
        `${apiUrl}/books?username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookItem}
            onPress={() => navigation.navigate("BookDetails", { book: item })} // navigates to BookDetails.js, and sends it book item as parameter
          >
            <Image source={{ uri: item.thumbnail }} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  bookItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  bookImage: {
    width: 50,
    height: 75,
    marginRight: 10,
  },
  bookTitle: {
    fontSize: 18,
  },
});

export default BookshelfPage;
