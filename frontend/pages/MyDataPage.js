import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import Swiper from "react-native-swiper";
import { Slider } from "@miblanchard/react-native-slider";
import * as SecureStore from "expo-secure-store";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const MyDataPage = () => {
  const [books, setBooks] = useState([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [currentPageValues, setCurrentPageValues] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);
  state = {
    value: 0.2,
  };

  const fetchBooks = async () => {
    const username = await SecureStore.getItemAsync("username");
    if (!username) {
      console.error("Username not found");
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/reading?username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setBooks(data);
        const initialPages = data.map((book) => book.currentPage || 0);
        setCurrentPageValues(initialPages);
      } else {
        throw new Error(data.message || "Unable to fetch data");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const updateCurrentPage = async (bookId, page) => {
    try {
      const response = await fetch(`${apiUrl}/updatePage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, currentPage: page }),
      });
      if (response.ok) {
        console.log("Page updated successfully!");
      } else {
        throw new Error("Failed to update the page.");
      }
    } catch (error) {
      console.error("Error updating page:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Swiper
        showsButtons={true}
        loop={true}
        onIndexChanged={(index) => {
          setSliderValue(currentPageValues[index]);
        }}
        style={styles.wrapper}
      >
        {books.map((book, index) => (
          <View key={index} style={styles.slide}>
            <Image source={{ uri: book.thumbnail }} style={styles.image} />
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={book.pageCount}
              value={currentPageValues[index]}
              onValueChange={(value) => {
                const updatedPages = [...currentPageValues];
                updatedPages[index] = value;
                setCurrentPageValues(updatedPages);
              }}
              step={1}
              thumbTintColor="#000"
              thumbTouchSize={{ width: 40, height: 40 }} // Increase touch area
              minimumTrackTintColor="#007bff"
              maximumTrackTintColor="#e9ecef"
              trackStyle={{ height: 30, width: 300, borderRadius: 0 }} // Increased track height and rounded corners
              thumbStyle={{ height: 30, width: 5, borderRadius: 0 }} // Larger thumb with rounded shape
            />
            <Text
              style={styles.bookDetail}
            >{`Page ${currentPageValues[index]} of ${book.pageCount}`}</Text>
            <Button
              title="Update"
              onPress={() =>
                updateCurrentPage(book._id, currentPageValues[index])
              }
            />
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  wrapper: {
    height: 400,
  },
  slide: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
  },
  image: {
    width: 150,
    height: 225,
    resizeMode: "contain",
    marginTop: 0,
  },
  bookTitle: {
    fontSize: 16,
    color: "black",
    marginVertical: 5,
  },
  bookDetail: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  slider: {
    width: 320, // Full width to fill the space
    height: 50, // Increased height for visibility
    marginVertical: 20,
  },
});
export default MyDataPage;
