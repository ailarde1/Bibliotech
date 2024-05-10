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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";

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

  useEffect(() => {
    if (route.params?.selectedBook) {
      setSelectedBook(route.params.selectedBook);
    }
  }, [route.params?.selectedBook]);

  const handleSelectBook = () => {
    navigation.navigate("BookClubShelfSelecting");
  };

  const onChangeStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  const onChangeEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>Book Club Name:</Text>
      <TextInput
        style={styles.input}
        backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
        onChangeText={setBookClubName}
        value={bookClubName}
        placeholder="Enter Book Club Name"
      />
      {selectedBook ? (
        <View style={styles.bookDetail}>
          <Image source={{ uri: selectedBook.thumbnail }} style={styles.bookImage} />
          <Text style={[styles.bookTitle, { color: isDarkMode ? "#FFF" : "#333" }]}>
            {selectedBook.title}
          </Text>
        </View>
      ) : (
        <Text style={[styles.bookText, { color: isDarkMode ? "#FFF" : "#333" }]}>
          No book selected
        </Text>
      )}
      <Button
        title="Select Book"
        onPress={handleSelectBook}
        color={isDarkMode ? "#AAA" : "#333"}
      />
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>Start Date:</Text>
      <Button color={isDarkMode ? "#005ECB" : "#007AFF"} title="Select Start Date" onPress={() => setShowStartDatePicker(true)} />
      {showStartDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={startDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeStartDate}
        />
      )}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>End Date:</Text>
      <Button color={isDarkMode ? "#005ECB" : "#007AFF"} title="Select End Date" onPress={() => setShowEndDatePicker(true)} />
      {showEndDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeEndDate}
        />
      )}
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
      > </Text>
            <TouchableOpacity
          
          style={[
            styles.submitButton,
            { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
          ]}
        >
          <Text style={[styles.submitButtonText]}>Submit</Text>
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
    flex: 0,
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
    resizeMode: 'contain',
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