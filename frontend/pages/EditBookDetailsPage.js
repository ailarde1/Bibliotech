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
  Platform,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useRefresh } from "./RefreshContext";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useTheme } from "./ThemeContext";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const EditBookDetailsPage = ({ route, navigation }) => {
  // get the book object passed through navigation
  const { book } = route.params;
  const { isDarkMode } = useTheme();

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
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(book.thumbnail); //The Cover that the user has selected
  const [customCoverUrl, setCustomCoverUrl] = useState(null); //Cover the user inputed the link for
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); //The local URI of the Image user uploaded
  const [isManualUrlEnabled, setIsManualUrlEnabled] = useState(false); //The state for if URL input box should appear
  const [showCustomCover, setShowCustomCover] = useState(false); //State of if Image either uplaoded or linked should be displayed
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(
    book.startDate ? new Date(book.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    book.endDate ? new Date(book.endDate) : null
  );
  const [selectedYear, setSelectedYear] = useState(
    book.readYear
      ? book.readYear.toString()
      : new Date().getFullYear().toString()
  );

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

    let finalCoverUrl = uploadedImageUrl || selectedCoverUrl || book.thumbnail;

    // If user uploaded an image and that is one that is selected
    if (uploadedImageUrl === selectedCoverUrl) {
      try {
        const newUploadedImageUrl = await uploadImage(uploadedImageUrl);
        if (newUploadedImageUrl) {
          finalCoverUrl = newUploadedImageUrl; // sets to URL returned from backend
        } else {
          alert("Failed to upload custom image.");
          return;
        }
      } catch (error) {
        console.error("Upload Image Error:", error);
        alert("An error occurred during image upload.");
        return;
      }
    }
    console.log(`finalCoverUrl: ${finalCoverUrl}`);

    const bookDetails = {
      title,
      authors: authors.split(", "),
      publishedDate,
      thumbnail: finalCoverUrl,
      description,
      pageCount: parseInt(pageCount, 10) || 0, // Ensure pageCount is sent as a number
      isbn: book.isbn,
      username,
      readStatus,
      readFormat,
    };

    // Condition for adding ebookPageCount or audioLength
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
            triggerRefresh("BookshelfPage");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const axiosInstance = axios.create({
    baseURL: apiUrl,
  });
  // Axios used for multiple attempts at uploading image.
  axiosInstance.interceptors.response.use(undefined, async (err) => {
    const config = err.config;
    if (!config.retryCount || config.retryCount < config.maxRetries) {
      config.retryCount = config.retryCount ? config.retryCount + 1 : 1;
      const retryDelay = Math.pow(2, config.retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return axiosInstance(config);
    }
    return Promise.reject(err);
  });

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
            triggerRefresh("BookshelfPage");
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
          ? isDarkMode
            ? styles.activeStatusButtonDark
            : styles.activeStatusButtonLight
          : isDarkMode
            ? styles.inactiveStatusButtonDark
            : styles.inactiveStatusButtonLight,
      ]}
      onPress={() => setReadStatus(status)}
    >
      <Text
        style={
          readStatus === status
            ? styles.statusButtonTextActive
            : styles.statusButtonTextInactive
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderFormatButton = (format) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        readFormat === format
          ? isDarkMode
            ? styles.activeStatusButtonDark
            : styles.activeStatusButtonLight
          : isDarkMode
            ? styles.inactiveStatusButtonDark
            : styles.inactiveStatusButtonLight,
      ]}
      onPress={() => setReadFormat(format)}
    >
      <Text
        style={
          readFormat === format
            ? styles.statusButtonTextActive
            : styles.statusButtonTextInactive
        }
      >
        {format.charAt(0).toUpperCase() + format.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderDateTypeButton = (format) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        dateFormat === format
          ? isDarkMode
            ? styles.activeStatusButtonDark
            : styles.activeStatusButtonLight
          : isDarkMode
            ? styles.inactiveStatusButtonDark
            : styles.inactiveStatusButtonLight,
      ]}
      onPress={() => setDateFormat(format)}
    >
      <Text
        style={
          dateFormat === format
            ? styles.statusButtonTextActive
            : styles.statusButtonTextInactive
        }
      >
        {format.charAt(0).toUpperCase() + format.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You refused to allow access your photos");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 6],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      console.log("New image URI:", uri);
      setUploadedImageUrl(uri);
      setSelectedCoverUrl(uri);
    } else {
      console.log("Image picker cancelled or failed");
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: uri,
      type: "image/jpeg",
      name: uri.split("/").pop(),
    });

    try {
      const response = await axiosInstance.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxRetries: 5, //number of retries
      });

      if (response.status === 200) {
        alert("Image uploaded successfully");
        return response.data.url;
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload failed after retries:", error);
      alert("Error uploading image after retries");
    }
  };

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
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 20,
        }}
      >
        <View style={styles.imagesContainer}>
          <TouchableOpacity onPress={() => setSelectedCoverUrl(book.thumbnail)}>
            <Image
              source={{ uri: book.thumbnail }}
              style={[
                styles.bookImage,
                selectedCoverUrl === book.thumbnail && styles.selectedImage,
                {borderColor: isDarkMode ? "#005ECB" : "#007AFF"} ,
              ]}
            />
          </TouchableOpacity>
          {customCoverUrl && showCustomCover && (
            <TouchableOpacity
              onPress={() => setSelectedCoverUrl(customCoverUrl)}
            >
              <Image
                source={{ uri: customCoverUrl }}
                style={[
                  styles.bookImage,
                  selectedCoverUrl === customCoverUrl && styles.selectedImage,
                  {borderColor: isDarkMode ? "#005ECB" : "#007AFF"} ,
                ]}
              />
            </TouchableOpacity>
          )}
          {uploadedImageUrl && (
            <TouchableOpacity
              onPress={() => setSelectedCoverUrl(uploadedImageUrl)}
            >
              <Image
                source={{ uri: uploadedImageUrl }}
                style={[
                  styles.bookImage,
                  selectedCoverUrl === uploadedImageUrl && styles.selectedImage,
                  {borderColor: isDarkMode ? "#005ECB" : "#007AFF"} ,
                ]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={pickImage}
        style={[
          styles.CustomCoverLink,
          { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
        ]}
      >
        <Text style={styles.CustomCoverLinkText}>Upload Custom Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsManualUrlEnabled((prevState) => !prevState)}
        style={[
          styles.CustomCoverLink,
          { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
        ]}
      >
        <Text style={styles.CustomCoverLinkText}>Input Custom Cover URL</Text>
      </TouchableOpacity>

      {isManualUrlEnabled && (
        <View style={styles.urlInputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? "#DDDDDD" : "#FFF" },
            ]}
            onChangeText={(text) => {
              setCustomCoverUrl(text);
            }}
            value={customCoverUrl}
            placeholder="Enter Link of Image"
            onSubmitEditing={() => setShowCustomCover(true)}
          />
        </View>
      )}

      <View style={styles.container}>
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Title:
        </Text>
        <TextInput
          style={styles.input}
          backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
          onChangeText={setTitle}
          value={title}
        />
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Authors:
        </Text>
        <TextInput
          backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
          style={styles.input}
          onChangeText={setAuthors}
          value={authors}
        />
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Published Date:
        </Text>
        <TextInput
          backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
          style={styles.input}
          onChangeText={setPublishedDate}
          value={publishedDate}
        />
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Page Count:
        </Text>
        <TextInput
          backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
          style={styles.input}
          onChangeText={setPageCount}
          value={pageCount}
          keyboardType="numeric"
        />
        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Description:
        </Text>
        <TextInput
          backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
          style={[styles.input, { height: 120 }, styles.description]}
          onChangeText={setDescription}
          value={description}
          multiline
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
            Read Status:
          </Text>
          <View style={styles.statusContainer}>
            {renderStatusButton("read")}
            {renderStatusButton("reading")}
            {renderStatusButton("not read")}
          </View>
        </View>

        {readStatus === "reading" && (
          <View style={styles.inputContainer}>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
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
        )}
        {readStatus === "read" && (
          <View style={styles.inputContainer}>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              Date Format:
            </Text>
            <View style={styles.statusContainer}>
              {renderDateTypeButton("year")}
              {renderDateTypeButton("date")}
            </View>
          </View>
        )}
        {readStatus === "read" && dateFormat === "date" && (
          <>
            <View style={styles.inputContainer}>
              <Text
                style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
              >
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
              <Text
                style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
              >
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
          </>
        )}

        {readStatus === "read" && dateFormat === "year" && (
          <View style={styles.inputContainer}>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              Year Read:
            </Text>
            <Dropdown
              style={[
                styles.dropdown,
                {
                  flex: 2,
                  marginLeft: 0,
                  backgroundColor: isDarkMode ? "#DDDDDD" : "#FFF",
                },
              ]}
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

        <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>
          Read Format:
        </Text>
        <View style={styles.statusContainer}>
          {renderFormatButton("audio")}
          {renderFormatButton("physical")}
          {renderFormatButton("digital")}
        </View>

        {readFormat === "digital" && (
          <View style={styles.inputContainer}>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              Ebook Page Count:
            </Text>
            <TextInput
              style={styles.input}
              backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
              onChangeText={setEbookPageCount}
              value={ebookPageCount}
              keyboardType="numeric"
              placeholder="Enter ebook page count"
            />
          </View>
        )}
        {readFormat === "audio" && (
          <View style={styles.inputContainer}>
            <Text
              style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}
            >
              Audio Length (minutes):
            </Text>
            <TextInput
              style={styles.input}
              backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
              onChangeText={setAudioLength}
              value={audioLength}
              keyboardType="numeric"
              placeholder="Enter audio length in minutes"
            />
          </View>
        )}
      </View>
      <TouchableOpacity
          onPress={submitEdits}
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
    paddingHorizontal: 10,
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
    marginHorizontal: 10,
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
    flex: 1,
    fontSize: 18,
    borderRadius: 8,
    fontSize: 16,
  },
  description: {
    paddingVertical: 0,
    paddingHorizontal: 5,
    marginVertical: 0,
  },
  urlInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 10,
    width: "100%",
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
  activeStatusButtonDark: {
    backgroundColor: "#005ECB",
    borderWidth: 1,
  },
  activeStatusButtonLight: {
    backgroundColor: "#007AFF",
    borderWidth: 1,
  },
  inactiveStatusButtonDark: {
    backgroundColor: "#DDDDDD",
    borderWidth: 1,
  },
  inactiveStatusButtonLight: {
    backgroundColor: "#FFF",
    borderWidth: 1,
  },
  statusButtonTextActive: {
    color: "#FFF",
  },
  statusButtonTextInactive: {
    color: "#333",
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
  },
  selectedImage: {
    borderWidth: 4,
    borderColor: "#007bff",
  },
  CustomCoverLink: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  CustomCoverLinkText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditBookDetailsPage;
