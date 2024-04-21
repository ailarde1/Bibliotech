import React, { useLayoutEffect, useState, useEffect } from "react";
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

import * as SecureStore from "expo-secure-store";
import { useRefresh } from "./RefreshContext";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const EditBookDetailsPage = ({ route, navigation }) => {
  // get the book object passed through navigation
  const { book } = route.params;

  const { triggerRefresh } = useRefresh();

  // State for each book detail
  const [title, setTitle] = useState(book.title);
  const [authors, setAuthors] = useState(book.authors.join(", "));
  const [publishedDate, setPublishedDate] = useState(book.publishedDate);
  const [pageCount, setPageCount] = useState(book.pageCount.toString());
  const [description, setDescription] = useState(book.description);
  const [readStatus, setReadStatus] = useState(book.readStatus || "not read");
  const [readFormat, setReadFormat] = useState(book.readFormat || "physical");
  const [ebookPageCount, setEbookPageCount] = useState(
    book.ebookPageCount?.toString() || ""
  );
  const [audioLength, setAudioLength] = useState(
    book.audioLength?.toString() || ""
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(book.startDate ? new Date(book.startDate) : null);
  const [endDate, setEndDate] = useState(book.endDate ? new Date(book.endDate) : null);
  const [selectedYear, setSelectedYear] = useState(book.readYear ? book.readYear.toString() : new Date().getFullYear().toString());

  // determens the date format from what information is available
  const [dateFormat, setDateFormat] = useState(() => {
    if (book.readYear && !book.startDate && !book.endDate) {
      return "year";
    } else {
      return "date";
    }
  });

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const toggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
  };

  const toggleEndDatePicker = () => {
    setShowEndDatePicker(!showEndDatePicker);
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


  // handle the submission of the edit
  const submitEdits = async () => {
    const username = await SecureStore.getItemAsync("username");

    const bookDetails = {
      title,
      authors: authors.split(", "), // Assuming you want to convert back to array
      publishedDate,
      thumbnail: book.thumbnail, // Corrected path for thumbnail
      description,
      pageCount: parseInt(pageCount, 10) || 0, // Ensure pageCount is sent as a number, safely
      isbn: book.isbn, // Assuming isbn is directly a property of book
      username,
      readStatus,
      readFormat,
    };

    // Conditionally add ebookPageCount or audioLength
    if (readFormat === "digital") {
      bookDetails.ebookPageCount = parseInt(ebookPageCount, 10) || 0;
    } else if (readFormat === "audio") {
      bookDetails.audioLength = parseInt(audioLength, 10) || 0;
    }
    try {
      const response = await fetch(`${apiUrl}/books/${book.isbn}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update book details.");
      }

      Alert.alert("Success", "Book details updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            navigation.popToTop();
            triggerRefresh('BookshelfPage');
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const deleteBook = async () => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(`${apiUrl}/books/${book.isbn}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete the book.");
      }

      Alert.alert("Success", "Book deleted successfully.", [
        {
          text: "OK",
          onPress: () => {
            navigation.popToTop();
            triggerRefresh('BookshelfPage');
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderStatusButton = (status) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        readStatus === status
          ? styles.activeStatusButton
          : styles.inactiveStatusButton,
      ]}
      onPress={() => setReadStatus(status)}
    >
      <Text style={styles.statusButtonText}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderFormatButton = (format) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        readFormat === format
          ? styles.activeStatusButton
          : styles.inactiveStatusButton,
      ]}
      onPress={() => setReadFormat(format)}
    >
      <Text style={styles.statusButtonText}>
        {format.charAt(0).toUpperCase() + format.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderDateTypeButton = (format) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        dateFormat === format
          ? styles.activeStatusButton
          : styles.inactiveStatusButton,
      ]}
      onPress={() => setDateFormat(format)}
    >
      <Text style={styles.statusButtonText}>
        {format.charAt(0).toUpperCase() + format.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  //header button to delete - followed by confirmation alert
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Confirm Delete",
              "Are you sure you want to delete this book?", //confirmation they want to delete
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes, Delete It",
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.container}>
        <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
        <Text style={styles.label}>Title:</Text>
        <TextInput style={styles.input} onChangeText={setTitle} value={title} />
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

        <View style={styles.inputContainer}>
        <Text style={styles.label}>Read Status:</Text>
        <View style={styles.statusContainer}>
          {renderStatusButton("read")}
          {renderStatusButton("reading")}
          {renderStatusButton("not read")}
        </View>
      </View>

      {readStatus === "reading" && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date:</Text>
          <Button title="Select Start Date" onPress={toggleStartDatePicker} />
          <Text style={styles.dateDisplay}>
            {startDate ? formatDate(startDate) : "No date selected"}
          </Text>
          {renderDatePicker(
            startDate,
            setStartDate,
            showStartDatePicker,
            setShowStartDatePicker
          )}
        </View>
      )}
      {readStatus === "read" && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date Format:</Text>
          <View style={styles.statusContainer}>
            {renderDateTypeButton("year")}
            {renderDateTypeButton("date")}
          </View>
        </View>
      )}
      {readStatus === "read" && dateFormat === "date" && (
        <>
          {/* Existing date picker UI for Start Date and Finish Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Date:</Text>
            <Button title="Select Start Date" onPress={toggleStartDatePicker} />
            <Text style={styles.dateDisplay}>
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
            <Text style={styles.label}>Finish Date:</Text>
            <Button title="Select Finish Date" onPress={toggleEndDatePicker} />
            <Text style={styles.dateDisplay}>
              {endDate ? formatDate(endDate) : "No date selected"}
            </Text>
            {renderDatePicker(
              endDate,
              setEndDate,
              showEndDatePicker,
              setShowEndDatePicker
            )}
          </View>
        </>
      )}

      {readStatus === "read" && dateFormat === "year" && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Year Read:</Text>
          <Dropdown
            style={styles.dropdown}
            placeholder="Select Year"
            data={Array.from(
              { length: new Date().getFullYear() - 1999 },
              (v, k) => 2000 + k
            ).map((year) => ({
              label: year.toString(),
              value: year.toString(),
            }))}
            labelField="label"
            valueField="value"
            value={selectedYear}
            onChange={(item) => setSelectedYear(item.value)}
          />
        </View>
      )}

      <Text style={styles.label}>Read Format:</Text>
        <View style={styles.statusContainer}>
          {renderFormatButton("audio")}
          {renderFormatButton("physical")}
          {renderFormatButton("digital")}
        </View>

        {readFormat === "digital" && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ebook Page Count:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setEbookPageCount}
              value={ebookPageCount}
              keyboardType="numeric"
              placeholder="Enter ebook page count"
            />
          </View>
        )}
        {readFormat === "audio" && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Audio Length (minutes):</Text>
            <TextInput
              style={styles.input}
              onChangeText={setAudioLength}
              value={audioLength}
              keyboardType="numeric"
              placeholder="Enter audio length in minutes"
            />
          </View>
        )}
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
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: "white",
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
    backgroundColor: "red",
  },
  headerButtonText: {
    color: "white",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  statusButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeStatusButton: {
    backgroundColor: "#007bff",
  },
  inactiveStatusButton: {
    backgroundColor: "#e9ecef",
  },
  statusButtonText: {
    color: "white",
  },
  dropdown: {
    height: 50,
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: "white",
  },
});

export default EditBookDetailsPage;
