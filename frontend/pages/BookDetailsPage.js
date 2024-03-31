import React, { useLayoutEffect } from "react";
import {  
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";

const BookDetailsPage = ({ route, navigation }) => {
  const { book } = route.params;

  const navigateToEdit = () => {
    navigation.navigate('EditBookDetails', { book });
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
        <Text style={styles.label}>Title:</Text>
        <Text style={styles.bookInfo}>{book.title}</Text>
      
      <Text style={styles.label}>Authors:</Text>
      <Text style={styles.bookInfo}>{book.authors.join(', ')}</Text>
      
      <Text style={styles.label}>Published Date:</Text>
      <Text style={styles.bookInfo}>{book.publishedDate}</Text>
      
      <Text style={styles.label}>Page Count:</Text>
      <Text style={styles.bookInfo}>{book.pageCount}</Text>
      
      <Text style={styles.label}>ISBN:</Text>
      <Text style={styles.bookInfo}>{book.isbn}</Text>
      
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.bookInfo}>{book.description}</Text>
      </View>
      <TouchableOpacity onPress={navigateToEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
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
    width: 150,
    height: 200,
    resizeMode: "contain",
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bookInfo: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 14,
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default BookDetailsPage;
