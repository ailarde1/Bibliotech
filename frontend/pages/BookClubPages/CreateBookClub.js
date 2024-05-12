import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRefresh } from "../RefreshContext";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const CreateBookClub = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const [selectedBook, setSelectedBook] = useState(null);
  const [bookClubName, setBookClubName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const { triggerRefresh } = useRefresh();

  useEffect(() => {
    if (route.params?.selectedBook) {
      setSelectedBook(route.params.selectedBook);
    }
  }, [route.params?.selectedBook]);

  const handleSelectBook = () => {
    navigation.navigate("BookClubShelfSelecting");
  };

  const renderDatePicker = (date, setDate, showPicker, setShowPicker) =>
    showPicker && (
      <DateTimePicker
        value={date || new Date()}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setShowPicker(false);
          setDate(selectedDate || date);
        }}
      />
    );

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const toggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
  };

  const toggleEndDatePicker = () => {
    setShowEndDatePicker(!showEndDatePicker);
  };

  const submitBookClub = async () => {
    if (!selectedBook || !bookClubName || !startDate || !endDate) {
      Alert.alert("Error", "Fill all fields before submitting.");
      return;
    }
    const username = await SecureStore.getItemAsync("username");
    const body = {
      name: bookClubName,
      bookId: selectedBook._id,
      username: username, 
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    try {
      const response = await fetch(`${apiUrl}/bookclub/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const jsonResponse = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Book club created successfully!");
        navigation.goBack();
        triggerRefresh("SocialPage");
      } else {
        Alert.alert("Error", jsonResponse.message || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while trying to create the book club.");
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      <TextInput
        style={styles.input}
        backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
        onChangeText={setBookClubName}
        value={bookClubName}
        placeholder="Enter Book Club Name"
      />
      {selectedBook ? (
        <View style={styles.bookDetail}>
          <Image
            source={{ uri: selectedBook.thumbnail }}
            style={styles.bookImage}
          />
          <Text
            style={[styles.bookTitle, { color: isDarkMode ? "#FFF" : "#333" }]}
          >
            {selectedBook.title}
          </Text>
        </View>
      ) : (
        <Text
          style={[styles.bookText, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          No book selected
        </Text>
      )}
      <Button
        title="Select Book"
        onPress={handleSelectBook}
        color={isDarkMode ? "#005ECB" : "#007AFF"}
      />
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Start Date:
        </Text>
        <Button
          color={isDarkMode ? "#005ECB" : "#007AFF"}
          title="Select Start Date"
          onPress={toggleStartDatePicker}
        />
        <Text
          style={[
            {
              color:
                Platform.OS === "ios"
                  ? "transparent"
                  : isDarkMode
                    ? "#FFF"
                    : "#333",
            },
            styles.dateDisplay,
          ]}
        >
          {startDate ? formatDate(startDate) : "No date selected"}
        </Text>
        {renderDatePicker(
          startDate,
          setStartDate,
          showStartDatePicker,
          setShowStartDatePicker
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Finish Date:
        </Text>
        <Button
          color={isDarkMode ? "#005ECB" : "#007AFF"}
          title="Select Finish Date"
          onPress={toggleEndDatePicker}
        />
        <Text
          style={[
            {
              color:
                Platform.OS === "ios"
                  ? "transparent"
                  : isDarkMode
                    ? "#FFF"
                    : "#333",
            },
            styles.dateDisplay,
          ]}
        >
          {endDate ? formatDate(endDate) : "No date selected"}
        </Text>
        {renderDatePicker(
          endDate,
          setEndDate,
          showEndDatePicker,
          setShowEndDatePicker
        )}
      </View>
      <Text
        style={[
          {
            color:
              Platform.OS === "ios"
                ? "transparent"
                : isDarkMode
                  ? "#FFF"
                  : "#333",
          },
          styles.dateDisplay,
        ]}
      >
        {" "}
      </Text>
      <TouchableOpacity
        onPress={submitBookClub}
        style={[
          styles.submitButton,
          { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
        ]}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dateDisplay: {
    fontSize: 20,
    marginTop: 5,
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  bookImage: {
    width: 120,
    height: 180,
    resizeMode: "contain",
    alignSelf: "center",
  },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 0,
  },
  submitButton: {
    marginHorizontal: 0,
    marginBottom: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  input: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 5,
    marginBottom: 15,
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    fontSize: 16,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  bookDetail: {
    alignItems: "center",
    margin: 20,
  },
  bookImage: {
    width: 180,
    height: 270,
    resizeMode: "contain",
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  bookText: {
    fontSize: 18,
  },
});

export default CreateBookClub;
