import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Url to backend. Edit in .env file.
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;


function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const navigation = useNavigation();

  const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(`${apiUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error("Error fetching search results: ", error);
      setBooks([]);
    }
  };

  const handleSearch = () => {
    fetchSearchResults(searchTerm);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search books..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={handleSearch} />
      <ScrollView style={styles.resultsContainer}>
        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookItem}
            onPress={() => navigation.navigate('NewBookDetails', { book })}
          >
            {book.volumeInfo.imageLinks?.thumbnail && (
              <Image source={{ uri: book.volumeInfo.imageLinks.thumbnail }} style={styles.bookImage} />
            )}
            <Text style={styles.bookTitle}>{book.volumeInfo.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 20,
  },
  input: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    padding: 10,
  },
  resultsContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  bookItem: {
    marginBottom: 20,
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
  },
  bookTitle: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default SearchPage;