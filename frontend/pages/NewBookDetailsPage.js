import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

function NewBookDetailsPage({ route, navigation }) {
  const { book } = route.params;

  // Initialize state for each editable book detail
  const [title, setTitle] = useState(book.volumeInfo.title);
  const [authors, setAuthors] = useState(book.volumeInfo.authors.join(', '));
  const [publishedDate, setPublishedDate] = useState(book.volumeInfo.publishedDate);
  const [description, setDescription] = useState(book.volumeInfo.description);
  const [pageCount, setPageCount] = useState(book.volumeInfo.pageCount.toString());
 
  const isbn = book.volumeInfo.industryIdentifiers?.[0]?.identifier || '';  //Not able to edit idbn

  const addToLibrary = async () => {
    const username = await SecureStore.getItemAsync('username');

    const bookDetails = {
      title,
      authors,
      publishedDate,
      thumbnail: book.volumeInfo.imageLinks.thumbnail,
      description,
      pageCount: parseInt(pageCount, 10), // Ensure pageCount is sent as a number
      isbn,
      username,
    };

    try {
      const response = await fetch(`${apiUrl}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to add book');
      }

      alert('Book added to library');
      navigation.goBack(); // Sends them back to the search page
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding book');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.volumeInfo.imageLinks?.thumbnail }} style={styles.bookImage} />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setTitle}
          value={title}
        />
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
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
          value={description}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Page Count:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPageCount}
          keyboardType="numeric"
          value={pageCount}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>ISBN:</Text>
        <TextInput
          style={styles.input}
          value={isbn}
          editable={false} // Makes this TextInput not editable
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Save to Library" onPress={addToLibrary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  bookImage: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default NewBookDetailsPage;