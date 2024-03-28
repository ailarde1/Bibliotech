import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const BookDetailsPage = ({ route }) => {
  const { book } = route.params;
  return (
    <View style={styles.container}>
      <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
      <Text style={styles.bookTitle}>{book.title}</Text>
      <Text>{book.description}</Text>
      {/*Need to add all the information.*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: "contain",
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
});

export default BookDetailsPage;
