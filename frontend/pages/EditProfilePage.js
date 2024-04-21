import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useRefresh } from "./RefreshContext";

const EditProfile = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const [uploadedImageUrl, setUploadedImageUrl] = useState(userInfo.imageUrl); //The local URI of the Image user uploaded
  const [username, setUsername] = useState(userInfo.username);
  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { triggerRefresh } = useRefresh();
  const storeCredentials = async (username) => {
    await SecureStore.setItemAsync('username', username);
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
      aspect: [4, 4],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      console.log("New image URI:", uri);
      setUploadedImageUrl(uri);
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

  const handleSaveChanges = async () => {
    let imageUrl = uploadedImageUrl;

    // See if User uploaded new image
    if (uploadedImageUrl && uploadedImageUrl !== userInfo.imageUrl) {
      const uploadedUrl = await uploadImage(uploadedImageUrl);
      imageUrl = uploadedUrl || userInfo.imageUrl; // set to new url if successful
    }

    const updatedUserInfo = {
      currentUsername: userInfo.username,
      newUsername: username,
      imageUrl: imageUrl,
    };

    try {
      const response = await axiosInstance.patch("/userinfo", updatedUserInfo, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        alert("Profile updated successfully");
        storeCredentials(username);
        navigation.goBack();
        triggerRefresh('SettingsProfilePage');
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      alert("Error updating profile");
    }
  };



  return (
    <View style={styles.profileContainer}>
      <Image
        style={styles.profileImage}
        source={
          userInfo.imageUrl
            ? { uri: uploadedImageUrl }
            : require("../assets/NoUserImage.png")
        } // Failure to find image, or if no image is set uses local png.
      />
      <TouchableOpacity onPress={pickImage} style={styles.CustomCoverLink}>
        <Text style={styles.CustomCoverLinkText}>Upload Custom Image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />

      <Button style={styles.CustomCoverLink} title="Save Changes" onPress={handleSaveChanges} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
    input: {
      alignSelf: "stretch",
      borderWidth: 1,
      borderColor: "gray",
      marginTop: 5,
      marginBottom: 15,
      marginHorizontal: 10,
      padding: 10,
      fontSize: 18,
      borderRadius: 8,
      backgroundColor: "white",
      fontSize: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  CustomCoverLink: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 9,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

});

export default EditProfile;
