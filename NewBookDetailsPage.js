import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';

//Url to backend. Edit in .env file.
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

function NewBookDetailsPage({ route, navigation }) {
  const { book } = route.params;

  const addToLibrary = async () => {
    const username = await SecureStore.getItemAsync('username');
    // Book details. Need to add the rest and fix
    const bookDetails = {
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors.join(', '), // Grabs all authors when connected with ','
      publishedDate: book.volumeInfo.publishedDate,
      thumbnail: book.volumeInfo.imageLinks.thumbnail,
      description: book.volumeInfo.description,
      pageCount: book.volumeInfo.pageCount,
      isbn: book.volumeInfo.industryIdentifiers?.[0].identifier, // Fix to grab the proper isbn, there are multiple and this grabs first. 
      username: username,
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
      navigation.goBack(); // Sends them back to search page
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding book');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.volumeInfo.imageLinks?.thumbnail }} style={styles.bookImage} />
      <Text style={styles.title}>{book.volumeInfo.title}</Text>
      <Text style={styles.author}>{book.volumeInfo.authors.join(', ')}</Text>
      <Text style={styles.description}>{book.volumeInfo.description}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Add to Library" onPress={addToLibrary} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  author: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 25,
  },
  // Need to adjust some Style settings
});

export default NewBookDetailsPage;