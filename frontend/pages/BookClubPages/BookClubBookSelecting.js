import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  Button,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRefresh } from "../RefreshContext";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useTheme } from "../ThemeContext";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const BookClubShelfSelecting = ({ navigation, route }) => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selection, setSelection] = useState("all books");
    const [viewStyle, setViewStyle] = useState("list");
    const { isDarkMode } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const { refreshTrigger, triggerRefresh } = useRefresh();
  
    useEffect(() => {
      fetchBooks();
    }, []);
  
    useEffect(() => {
      if (refreshTrigger === "BookshelfPage") {
        fetchBooks();
        triggerRefresh("EmptyState");
      }
    }, [refreshTrigger]);
  
    const fetchBooks = async () => {
      const username = await SecureStore.getItemAsync("username");
      if (!username) {
        console.error("Username not found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/books?username=${encodeURIComponent(username)}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
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
  
    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <SegmentedControl
            values={["List", "Shelf"]}
            selectedIndex={["list", "shelf"].indexOf(viewStyle)}
            onChange={(event) => {
              const newIndex = event.nativeEvent.selectedSegmentIndex;
              const newViewStyle = ["list", "shelf"][newIndex];
              setViewStyle(newViewStyle);
            }}
            style={{ width: 120, height: 30, marginRight: 10 }}
            backgroundColor={isDarkMode ? "#444445" : "#EEE"}
          />
        ),
      });
    }, [navigation, viewStyle, isDarkMode]);
  
    
    const confirmSelection = () => {
        if (selectedBook) {
          navigation.navigate("CreateBookClub", { selectedBook });
        }
      };
  
    const renderBookItem = ({ item }) => (
        <TouchableOpacity
          style={[
            viewStyle === "list" ? styles.bookItem : styles.bookShelfItem,
            { backgroundColor: isDarkMode ? "#444445" : "#FFF" },
            item._id === selectedBook?._id ? { borderColor: isDarkMode ? "#005ECB" : "#007AFF" , borderWidth: 2 } : {}
          ]}
          onPress={() => setSelectedBook(item)}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.bookImage} />
          {viewStyle === "list" && (
            <Text style={[styles.bookTitle, { color: isDarkMode ? "#FFF" : "#333" }]}>
              {item.title}
            </Text>
          )}
        </TouchableOpacity>
      );
  
    return (
        <View style={{ backgroundColor: isDarkMode ? "#333" : "#EEE", flex: 1 }}>
          <View style={styles.container}>
            <SegmentedControl
              backgroundColor={isDarkMode ? "#444445" : "#EEE"}
              values={["All Books", "Read", "Not Read"]}
              selectedIndex={["all books", "read", "not read"].indexOf(selection)}
              onChange={(event) => {
                const newIndex = event.nativeEvent.selectedSegmentIndex;
                const newSelection = ["all books", "read", "not read"][newIndex];
                setSelection(newSelection);
              }}
            />
            <Button title="Confirm Selection" onPress={confirmSelection} disabled={!selectedBook} />
          </View>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollView}
            data={books.filter(book => book.readStatus === selection || selection === "all books")}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderBookItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            key={viewStyle === "shelf" ? "shelf" : "list"}
            numColumns={viewStyle === "shelf" ? 3 : 1}
          />
        </View>
      );
    };
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 3,
    },
    bookItem: {
      flexDirection: "row",
      width: "100%",
      marginBottom: 5,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 1,
      height: 75,
      backgroundColor: "#FAFAFA",
    },
    bookImage: {
      width: "undefined",
      height: "100%",
      aspectRatio: 4 / 6,
      marginRight: 10,
    },
    bookTitle: {
      fontSize: 20,
    },
    scrollView: {
      width: "100%",
      paddingBottom: "1%",
    },
    bookShelfItem: {
      width: "undefined",
      aspectRatio: 4 / 6,
      margin: 0,
      padding: 0,
      flex: 1 / 3, // three books per row in shelf view
      alignItems: "center",
    },
  });
export default BookClubShelfSelecting;