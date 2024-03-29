import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const BookshelfPage = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    SecureStore.getItemAsync("username").then((username) => {
      if (username) {
        fetchBooks(username).then(() => setRefreshing(false));
      } else {
        console.error("Username not found");
        setRefreshing(false);
      }
    });
  }, []);

  useEffect(() => {
    onRefresh(); // Call onRefresh initially   need to figure out how to call when bookshelf changes
  }, [onRefresh]);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.scrollView}
        data={books}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookItem}
            onPress={() => navigation.navigate("BookDetails", { book: item })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
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
  scrollView: {
    width: '100%',
  },
});

export default BookshelfPage;
