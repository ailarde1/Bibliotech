import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTheme } from "./ThemeContext";

const BookDetailsPage = ({ route, navigation }) => {
  const { isDarkMode } = useTheme();
  const { book } = route.params;

  const navigateToEdit = () => {
    navigation.navigate("EditBookDetails", { book });
  };

  return (
    <ScrollView
      style={[
        styles.scrollView,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.container}>
        <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Title:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.title}
        </Text>

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Authors:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.authors.join(", ")}
        </Text>

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Published Date:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.publishedDate}
        </Text>

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Page Count:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.pageCount}
        </Text>

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          ISBN:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.isbn}
        </Text>

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Read Status:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.readStatus}
        </Text>

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Read Format:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.readFormat}
        </Text>

        {book.readFormat === "audio" && (
          <View>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              Audio Length:
            </Text>
            <Text
              style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              {book.audioLength}
            </Text>
          </View>
        )}
        {book.readFormat === "digital" && (
          <View>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              Ebook Page Count:
            </Text>
            <Text
              style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              {book.ebookPageCount}
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Description:
        </Text>
        <Text
          style={[styles.bookInfo, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {book.description}
        </Text>
      </View>
      <TouchableOpacity onPress={navigateToEdit} style={[styles.editButton,
        {backgroundColor: isDarkMode ? "#005ECB" : "#007AFF"}]
      }>
        <Text
          style={[
            styles.editButtonText,
            { color: isDarkMode ? "#FFF" : "#333" },
          ]}
        >
          Edit
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  bookImage: {
    width: 180,
    height: 270,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 18,
  },
  bookInfo: {
    alignSelf: "flex-start",
    marginBottom: 5,
    fontSize: 18,
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 20,
  },
});

export default BookDetailsPage;
