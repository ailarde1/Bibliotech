import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRefresh } from "./RefreshContext";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const BookshelfPage = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [selection, setSelection] = useState("all books");
  const [viewStyle, setViewStyle] = useState("list");

  const [refreshing, setRefreshing] = useState(false);
  const { refreshTrigger } = useRefresh();
  const { triggerRefresh } = useRefresh();

  const fetchBooks = async () => {
    const username = await SecureStore.getItemAsync("username");
    if (!username) {
      console.error("Username not found");
      return;
    }

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
    fetchBooks().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (refreshTrigger === 'BookshelfPage') {
      fetchBooks();
      triggerRefresh('EmptyState');
    }
  }, [refreshTrigger]);

  // Filter books based on selection before rendering
  const filteredBooks = books.filter((book) => {
    if (selection === "all books") return true;
    return book.readStatus === selection;
  });

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={viewStyle === "list" ? styles.bookItem : styles.bookShelfItem}
      onPress={() => navigation.navigate("BookDetails", { book: item })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.bookImage} />
      {viewStyle === "list" && (
        <Text style={styles.bookTitle}>{item.title}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SegmentedControl
        style={styles.segmentControl}
        values={["All Books", "Read", "Not Read"]}
        selectedIndex={["all books", "read", "not read"].indexOf(selection)}
        onChange={(event) => {
          const newIndex = event.nativeEvent.selectedSegmentIndex;
          const newSelection = ["all books", "read", "not read"][newIndex];
          setSelection(newSelection);
        }}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
        data={filteredBooks}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderBookItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        key={viewStyle === "shelf" ? "shelf" : "list"}
        numColumns={viewStyle === "shelf" ? 3 : 1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
    fontSize: 20,
  },
  scrollView: {
    width: "100%",
  },
  segmentControl: {
    marginHorizontal: 15,
    marginBottom: 5,
  },
  bookShelfItem: {
    margin: 0,
    padding: 0,
    flex: 1 / 3, // three books per row in shelf view
    alignItems: "center",
    marginBottom: 10,
  },
});

export default BookshelfPage;
