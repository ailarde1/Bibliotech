import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRefresh } from "./RefreshContext";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";

const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

function NewBookDetailsPage({ route, navigation }) {
  const { book } = route.params;
  const { triggerRefresh } = useRefresh();

  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [selectedCoverUrl, setSelectedCoverUrl] = useState("");
  const [customCoverUrl, setCustomCoverUrl] = useState(null);
  const [isManualUrlEnabled, setIsManualUrlEnabled] = useState(false);
  const [showCustomCover, setShowCustomCover] = useState(false);

  // Initialize state for each editable book detail
  const [title, setTitle] = useState(book.volumeInfo.title);
  const [authors, setAuthors] = useState(
    book.volumeInfo.authors?.join(", ") ?? "Unknown Author"
  );
  const [publishedDate, setPublishedDate] = useState(
    book.volumeInfo.publishedDate
  );

  const [fetchedPageCount, setFetchedPageCount] = useState("");
  const [isCustomPageCount, setIsCustomPageCount] = useState(false);
  const [selectedPageCount, setSelectedPageCount] = useState("");

  const [description, setDescription] = useState(book.volumeInfo.description);
  const [pageCount, setPageCount] = useState(
    book.volumeInfo.pageCount.toString()
  );
  const [readStatus, setReadStatus] = useState("not read");
  const [readFormat, setReadFormat] = useState("physical");
  const [ebookPageCount, setEbookPageCount] = useState("");
  const [audioLength, setAudioLength] = useState("");
  const isbn = book.volumeInfo.industryIdentifiers?.[0]?.identifier || ""; //Not able to edit idbn

  const pageCountOptions = [
    { label: `${pageCount} pages (Google API)`, value: pageCount },
    fetchedPageCount && {
      label: `${fetchedPageCount} pages (OpenLibrary API)`,
      value: fetchedPageCount,
    },
    { label: "Custom...", value: "custom" },
  ].filter(Boolean);

  const fetchBookDetails = async () => {
    const title = book.volumeInfo.title;
    try {
      const response = await fetch(
        `${apiUrl}/books/info/title/${encodeURIComponent(title)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.log("Failed to fetch book details");
      }
      const bookDetails = await response.json();
      console.log(bookDetails);
      if (bookDetails.message === "Book not found") {
        console.log("Book not found");
        setFetchedPageCount("");
        return;
      }

      if (
        bookDetails.numberOfPages &&
        bookDetails.numberOfPages !== "Unknown Page Count"
      ) {
        setFetchedPageCount(bookDetails.numberOfPages.toString());
      }
      if (bookDetails.newCoverUrl) {
        setNewCoverUrl(bookDetails.newCoverUrl);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
      setCustomCoverUrl(uri);
      setSelectedCoverUrl(uri);
    } else {
      console.log("Image picker cancelled or failed");
    }
  };

  const addToLibrary = async () => {
    const username = await SecureStore.getItemAsync("username");

    let bookDetails = {
      title,
      authors,
      publishedDate,
      thumbnail: selectedCoverUrl || book.volumeInfo.imageLinks.thumbnail,
      description,
      pageCount: parseInt(selectedPageCount, 10) || pageCount,
      isbn,
      username,
      readStatus,
      readFormat,
    };

    if (readFormat === "digital") {
      bookDetails.ebookPageCount = parseInt(ebookPageCount, 10) || 0;
    } else if (readFormat === "audio") {
      bookDetails.audioLength = parseInt(audioLength, 10) || 0;
    }

    try {
      const response = await fetch(`${apiUrl}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });

      if (response.status === 409) {
        // Book already exists, ask user if they want to override
        Alert.alert(
          "Book Exists",
          "This book already exists in your library. Would you like to update the existing book?",
          [
            { text: "Cancel" },
            { text: "Yes", onPress: () => updateExistingBook(bookDetails) },
          ]
        );
      } else if (!response.ok) {
        throw new Error("Failed to add book");
      } else {
        alert("Book added to library");
        triggerRefresh();
        navigation.goBack(); // Sends them back to the search page
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding book");
    }
  };

  const updateExistingBook = async (bookDetails) => {
    try {
      const response = await fetch(`${apiUrl}/books/${bookDetails.isbn}`, {
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
            triggerRefresh();
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

  useEffect(() => {
    fetchBookDetails(book.volumeInfo.title);
  }, [book.volumeInfo.title]);

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 20,
        }}
      >
        <View style={styles.imagesContainer}>
          <TouchableOpacity
            onPress={() =>
              setSelectedCoverUrl(book.volumeInfo.imageLinks?.thumbnail)
            }
          >
            <Image
              source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
              style={[
                styles.bookImage,
                selectedCoverUrl === book.volumeInfo.imageLinks?.thumbnail &&
                  styles.selectedImage,
              ]}
            />
          </TouchableOpacity>

          {newCoverUrl && (
            <TouchableOpacity onPress={() => setSelectedCoverUrl(newCoverUrl)}>
              <Image
                source={{ uri: newCoverUrl }}
                style={[
                  styles.bookImage,
                  selectedCoverUrl === newCoverUrl && styles.selectedImage,
                ]}
              />
            </TouchableOpacity>
          )}
          {customCoverUrl && showCustomCover && (
            <TouchableOpacity
              onPress={() => setSelectedCoverUrl(customCoverUrl)}
            >
              <Image
                source={{ uri: customCoverUrl }}
                style={[
                  styles.bookImage,
                  selectedCoverUrl === customCoverUrl && styles.selectedImage,
                ]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setIsManualUrlEnabled((prevState) => !prevState)}
        style={styles.CustomCoverLink}
      >
        <Text style={styles.CustomCoverLinkText}>Input Custom Cover Link</Text>
      </TouchableOpacity>

      {isManualUrlEnabled && (
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => {
              setCustomCoverUrl(text); // Set custom URL
            }}
            value={customCoverUrl}
            placeholder="Enter Link of Image"
            onSubmitEditing={() => setShowCustomCover(true)}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title:</Text>
        <TextInput style={styles.input} onChangeText={setTitle} value={title} />
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
        <Text style={styles.label}>Page Count:</Text>
        <Dropdown
          style={[styles.dropdown, { flex: 2, marginLeft: 0 }]}
          placeholder="Select Page Count"
          data={pageCountOptions}
          labelField="label"
          valueField="value"
          value={isCustomPageCount ? "custom" : pageCount}
          onChange={(item) => {
            if (item.value === "custom") {
              setIsCustomPageCount(true);
              setSelectedPageCount("");
            } else {
              setIsCustomPageCount(false);
              setSelectedPageCount(item.value);
            }
          }}
        />
      </View>

      {isCustomPageCount && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter Page Count:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setSelectedPageCount(text)}
            value={selectedPageCount}
            placeholder="Enter custom page count"
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ISBN:</Text>
        <TextInput style={styles.input} value={isbn} editable={false} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Read Status:</Text>
        <View style={styles.statusContainer}>
          {renderStatusButton("read")}
          {renderStatusButton("reading")}
          {renderStatusButton("not read")}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Read Format:</Text>
        <View style={styles.statusContainer}>
          {renderFormatButton("audio")}
          {renderFormatButton("physical")}
          {renderFormatButton("digital")}
        </View>
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

      <View style={styles.buttonContainer}>
        <Button title="Save to Library" onPress={addToLibrary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 25,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#007bff",
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
  },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  urlInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 5,
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
  dropdown: {
    height: 40,
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    backgroundColor: "white",
    elevation: 5,
  },
  placeholderStyle: {
    fontSize: 18,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 18,
    color: "black",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  itemStyle: {
    justifyContent: "flex-start",
  },
  itemTextStyle: {
    fontSize: 16,
  },
  dropdownStyle: {
    backgroundColor: "white",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 0,
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
  selectedImage: {
    borderWidth: 5,
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

export default NewBookDetailsPage;
