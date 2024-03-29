import React, { useLayoutEffect, useState } from "react";
import {
  ScrollView,
  View,
  Button,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

import * as SecureStore from 'expo-secure-store';

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const EditBookDetailsPage = ({ route, navigation }) => {
    // get the book object passed through navigation
    const { book } = route.params;
  
    // State for each book detail
    const [title, setTitle] = useState(book.title);
    const [authors, setAuthors] = useState(book.authors.join(', '));
    const [publishedDate, setPublishedDate] = useState(book.publishedDate);
    const [pageCount, setPageCount] = useState(book.pageCount.toString());
    const [description, setDescription] = useState(book.description);
  
    // handle the submission of the edit
    const submitEdits = async () => {
      const username = await SecureStore.getItemAsync('username');
      try {
        const response = await fetch(`${apiUrl}/books/${book.isbn}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            authors,
            publishedDate,
            description,
            pageCount: parseInt(pageCount, 10),
            username,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update book details.');
        }
  
        Alert.alert('Success', 'Book details updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };
    
    //Deletes book from backend/db
    const deleteBook = async () => {
      const username = await SecureStore.getItemAsync('username');
      try {
          const response = await fetch(`${apiUrl}/books/${book.isbn}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title,
                authors,
                publishedDate,
                description,
                pageCount: parseInt(pageCount, 10),
                username,
              }),
          });

          if (!response.ok) {
              throw new Error('Failed to delete the book.');
          }

          Alert.alert('Success', 'Book deleted successfully.', [
              { text: 'OK', onPress: () => navigation.popToTop() },
          ]);
      } catch (error) {
          Alert.alert('Error', error.message);
      }
  };

  //header button to delete - followed by confirmation Alert
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Confirm Delete',
              'Are you sure you want to delete this book?', //confirmation they want to delete
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete It',
                  onPress: deleteBook,
                },
              ],
              { cancelable: true } // lets them click outside popup to dismiss it.
            );
          }} 
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Delete</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
        <Text style={styles.label}>Title:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setTitle}
          value={title}
        />
        <Text style={styles.label}>Authors:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setAuthors}
          value={authors}
        />
        <Text style={styles.label}>Published Date:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPublishedDate}
          value={publishedDate}
        />
        <Text style={styles.label}>Page Count:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPageCount}
          value={pageCount}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          onChangeText={setDescription}
          value={description}
          multiline
        />
      </View>
      <Button title="Submit" onPress={submitEdits} />
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
    alignSelf: "center",
  },
  input: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 5,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 25,
  },
  headerButton: {
    marginRight: 10,
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'red',
},
headerButtonText: {
    color: 'white',
},
});

export default EditBookDetailsPage;