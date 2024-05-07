import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  RefreshControl,
  ScrollView,
  Button,
  StyleSheet,
  Image,
} from "react-native";
import Swiper from "react-native-swiper";
import { Slider } from "@miblanchard/react-native-slider";
import { useRefresh } from "./RefreshContext";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "./ThemeContext";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const MyDataPage = () => {
  const [books, setBooks] = useState([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [currentPageValues, setCurrentPageValues] = useState([]);
  const [currentYearPagesPerDay, setCurrentYearPagesPerDay] =
    useState("Calculating...");
  const [lastYearPagesPerDay, setLastYearPagesPerDay] =
    useState("Calculating...");
  const [currentYearTotalPages, setCurrentYearTotalPages] =
    useState("Calculating...");
  const [lastYearTotalPages, setLastYearTotalPages] =
    useState("Calculating...");
  const [refreshing, setRefreshing] = useState(false);
  const { refreshTrigger } = useRefresh();
  const { triggerRefresh } = useRefresh();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const getUsernameAndFetchData = async () => {
      const username = await SecureStore.getItemAsync("username");
      if (!username) {
        console.error("Username not found");
        return;
      }
      fetchBooks(username);
      fetchPagesPerYearData(username);
    };

    getUsernameAndFetchData();
  }, []);

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    const getUsernameAndFetchData = async () => {
      const username = await SecureStore.getItemAsync("username");
      if (!username) {
        console.error("Username not found");
        return;
      }
      fetchBooks(username);
      fetchPagesPerYearData(username);
    };

    getUsernameAndFetchData().then(() => setRefreshing(false));
  }, []);

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

  const fetchPagesPerYearData = async (username) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    try {
      const [currentYearResponse, lastYearResponse] = await Promise.all([
        fetch(
          `${apiUrl}/pages-read/${currentYear}?username=${encodeURIComponent(username)}`
        ),
        fetch(
          `${apiUrl}/pages-read/${lastYear}?username=${encodeURIComponent(username)}`
        ),
      ]);
      const currentYearData = await currentYearResponse.json();
      const lastYearData = await lastYearResponse.json();
      if (currentYearResponse.ok && lastYearResponse.ok) {
        setCurrentYearTotalPages(currentYearData.totalPages);
        setLastYearTotalPages(lastYearData.totalPages);

        const currentYearDays = isLeapYear(currentYear) ? 366 : 365;
        const lastYearDays = isLeapYear(lastYear) ? 366 : 365;
        setCurrentYearPagesPerDay(
          (currentYearData.totalPages / currentYearDays).toFixed(2)
        );
        setLastYearPagesPerDay(
          (lastYearData.totalPages / lastYearDays).toFixed(2)
        );
      } else {
        throw new Error("Unable to fetch year data");
      }
    } catch (error) {
      console.error("Error fetching year data:", error);
    }
  };

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Swiper
          showsButtons={false}
          loop={false}
          showsPagination={false}
          onIndexChanged={(index) => {
            setSliderValue(currentPageValues[index]);
            //calculateCurrentBookPagesPerDay(books[index]);
          }}
          style={[
            styles.wrapper,
            { backgroundColor: isDarkMode ? "#333" : "#EEE" },
          ]}
        >
          {books.map((book, index) => (
            <View
              key={index}
              style={[
                styles.slide,
                { backgroundColor: isDarkMode ? "#333" : "#EEE" },
              ]}
            >
              <Image source={{ uri: book.thumbnail }} style={styles.image} />
              <Text
                style={[
                  styles.bookTitle,
                  { color: isDarkMode ? "#FFF" : "#333" },
                ]}
              >
                {book.title}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={book.ebookPageCount || book.pageCount}
                value={currentPageValues[index]}
                onValueChange={(value) => {
                  const updatedPages = [...currentPageValues];
                  updatedPages[index] = value;
                  setCurrentPageValues(updatedPages);
                }}
                step={1}
                thumbTintColor="#000"
                thumbTouchSize={{ width: 40, height: 40 }}
                maximumTrackTintColor={isDarkMode ? "#444445" : "#DDDDDD"}
                minimumTrackTintColor={isDarkMode ? "#005ECB" : "#007AFF"}
                trackStyle={{ height: 30, width: 300, borderRadius: 0 }}
                thumbStyle={{ height: 30, width: 5, borderRadius: 0 }}
              />
              <Text
                style={[
                  styles.bookTitle,
                  { color: isDarkMode ? "#FFF" : "#333" },
                ]}
              >{`Page ${currentPageValues[index]} of ${book.ebookPageCount || book.pageCount}`}</Text>
              <Button
                color={isDarkMode ? "#005ECB" : "#007AFF"}
                title="Update"
                onPress={() =>
                  updateCurrentPage(book._id, currentPageValues[index])
                }
              />
            </View>
          ))}
        </Swiper>
        <View style={styles.stats}>
          <Text
            style={[styles.statsText, { color: isDarkMode ? "#FFF" : "#333" }]}
          >
            Current Book Pages/Day: {"Calculating..."}
          </Text>
          <Text
            style={[styles.statsText, { color: isDarkMode ? "#FFF" : "#333" }]}
          >
            Current Year Total Pages: {currentYearTotalPages}
          </Text>
          <Text
            style={[styles.statsText, { color: isDarkMode ? "#FFF" : "#333" }]}
          >
            Last Year Total Pages: {lastYearTotalPages}
          </Text>
          <Text
            style={[styles.statsText, { color: isDarkMode ? "#FFF" : "#333" }]}
          >
            Current Year Pages/Day: {currentYearPagesPerDay}
          </Text>
          <Text
            style={[styles.statsText, { color: isDarkMode ? "#FFF" : "#333" }]}
          >
            Last Year Pages/Day: {lastYearPagesPerDay}
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: "#FFF",
  },
  image: {
    width: 150,
    height: 225,
    resizeMode: "contain",
    marginTop: 0,
  },
  bookTitle: {
    fontSize: 18,
    marginVertical: 5,
  },
  bookDetail: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  slider: {
    width: 320,
    height: 50,
    marginVertical: 20,
  },
  statsText: {
    fontSize: 18,
    color: "#333",
    marginVertical: 10,
    marginBottom: 0,
    textAlign: "center",
  },
  stats: {
    flex: 0.6,
    height: "100%",
    width: "100%",
  },
});
export default MyDataPage;
