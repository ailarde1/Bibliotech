import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useRefresh } from "./RefreshContext";
import { Dropdown } from "react-native-element-dropdown";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

function NewBookDetailsPage({ route, navigation }) {
  const { book } = route.params;
  const { triggerRefresh } = useRefresh();

  // Initialize state for each editable book detail
  const [title, setTitle] = useState(book.volumeInfo.title);
  const [authors, setAuthors] = useState(book.volumeInfo.authors.join(", "));
  const [publishedDate, setPublishedDate] = useState(book.volumeInfo.publishedDate);

  const [fetchedPageCount, setFetchedPageCount] = useState(""); // Declare fetchedPageCount
  const [isCustomPageCount, setIsCustomPageCount] = useState(false); // Declare isCustomPageCount
  const [selectedPageCount, setSelectedPageCount] = useState(""); // Declare selectedPageCount
  // ^find better way to do this^

  const [description, setDescription] = useState(book.volumeInfo.description);
  const [pageCount, setPageCount] = useState(book.volumeInfo.pageCount.toString());
  const [readStatus, setReadStatus] = useState("not read");
  const isbn = book.volumeInfo.industryIdentifiers?.[0]?.identifier || ""; //Not able to edit idbn


  const pageCountOptions = [
    { label: `${pageCount} pages (Google API)`, value: pageCount },
    fetchedPageCount && {
      label: `${fetchedPageCount} pages (OpenLibrary API)`,
      value: fetchedPageCount,
    },
    { label: "Custom...", value: "custom" },
  ].filter(Boolean);

  const fetchBookDetails = async () => {
    const title = book.volumeInfo.title;
    try {
      const response = await fetch(
        `${apiUrl}/books/info/title/${encodeURIComponent(title)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.log("Failed to fetch book details");
      }
      const bookDetails = await response.json();
      if (bookDetails.message === "Book not found") {
        console.log(
          "Book not found"
        );
        setFetchedPageCount("");
        return;
      }

      if (
        bookDetails.numberOfPages &&
        bookDetails.numberOfPages !== "Unknown Page Count"
      ) {
        setFetchedPageCount(bookDetails.numberOfPages.toString());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addToLibrary = async () => {
    const username = await SecureStore.getItemAsync("username");

    const bookDetails = {
      title,
      authors,
      publishedDate,
      thumbnail: book.volumeInfo.imageLinks.thumbnail,
      description,
      pageCount: parseInt(selectedPageCount, 10) || 0, // Ensure pageCount is sent as a number
      isbn,
      username,
      readStatus,
    };

    try {
      const response = await fetch(`${apiUrl}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to add book");
      }

      alert("Book added to library");
      triggerRefresh();
      navigation.goBack(); // Sends them back to the search page
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding book");
    }
  };
  const renderStatusButton = (status) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        readStatus === status
          ? styles.activeStatusButton
          : styles.inactiveStatusButton,
      ]}
      onPress={() => setReadStatus(status)}
    >
      <Text style={styles.statusButtonText}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </TouchableOpacity>
  );
  useEffect(() => {
    fetchBookDetails(book.volumeInfo.title);
  }, [book.volumeInfo.title]);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
        style={styles.bookImage}
      />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title:</Text>
        <TextInput style={styles.input} onChangeText={setTitle} value={title} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Authors:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setAuthors}
          value={authors}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Published Date:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPublishedDate}
          value={publishedDate}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Page Count:</Text>
        <Dropdown
          style={[styles.dropdown, { flex: 2, marginLeft: 0 }]}
          placeholder="Select Page Count"
          data={pageCountOptions}
          labelField="label"
          valueField="value"
          value={isCustomPageCount ? "custom" : pageCount}
          onChange={(item) => {
            if (item.value === "custom") {
              setIsCustomPageCount(true);
              setSelectedPageCount("");
            } else {
              setIsCustomPageCount(false);
              setSelectedPageCount(item.value);
            }
          }}
        />
      </View>
      {isCustomPageCount && (
        <TextInput
          style={styles.input}
          onChangeText={(text) => setSelectedPageCount(text)}
          value={selectedPageCount}
          placeholder="Enter page count"
          keyboardType="numeric"
        />
      )}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>ISBN:</Text>
        <TextInput style={styles.input} value={isbn} editable={false} />
      </View>

      <Text style={styles.label}>Read Status:</Text>
      <View style={styles.statusContainer}>
        {renderStatusButton("read")}
        {renderStatusButton("reading")}
        {renderStatusButton("not read")}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Save to Library" onPress={addToLibrary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bookImage: {
    width: 200,
    height: 300,
    resizeMode: "contain",
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    width: 100,
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    height: 40,
    flex: 1,
    borderWidth: 1,
    padding: 10,
    fontSize: 18,
  },
  multilineInput: {
    height: 100,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 25,
  },
  dropdown: {
    height: 40,
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: "white",
    elevation: 5,
  },
  placeholderStyle: {
    fontSize: 18,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 18,
    color: "black",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  itemStyle: {
    justifyContent: "flex-start",
  },
  itemTextStyle: {
    fontSize: 16,
  },
  dropdownStyle: {
    backgroundColor: "white",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  statusButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeStatusButton: {
    backgroundColor: "#007bff",
  },
  inactiveStatusButton: {
    backgroundColor: "#e9ecef",
  },
  statusButtonText: {
    color: "white",
  },
});

export default NewBookDetailsPage;
