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
  Image,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./Authentication";
import { useRefresh } from "./RefreshContext";
import { useTheme } from "./ThemeContext";
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const SettingsProfilePage = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const { setIsAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState({ username: "", imageUrl: "" });

  const [refreshing, setRefreshing] = useState(false);
  const { refreshTrigger, triggerRefresh } = useRefresh();

  const fetchUserInfo = async () => {
    const username = await SecureStore.getItemAsync("username");
    if (!username) {
      console.error("Username not found");
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/userinfo?username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching User Info:", error);
    }
  };

  const navigateToEditProfile = () => {
    navigation.navigate("Edit Profile", { userInfo: userInfo });
  };
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("username");
    setIsAuthenticated(false);
    navigation.navigate("LoginPage");
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserInfo().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const updateDarkModeSetting = async (newDarkMode) => {
    const username = await SecureStore.getItemAsync("username");
    if (!username) {
      console.error("Username not found");
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/user/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, darkMode: newDarkMode })
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Settings updated successfully:", data);
    } catch (error) {
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    toggleTheme();
    updateDarkModeSetting(newDarkMode).catch(console.error);
  };

  useEffect(() => {
    if (refreshTrigger === "SettingsProfilePage") {
      fetchUserInfo();
      triggerRefresh("EmptyState");
    }
  }, [refreshTrigger]);

  return (
    <ScrollView style={{ backgroundColor: isDarkMode ? "#333333" : "#FFFFFF" }}>
      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={
            userInfo.imageUrl
              ? { uri: userInfo.imageUrl }
              : require("../assets/NoUserImage.png")
          }
        />
        <Text
          style={[
            styles.usernameText,
            { color: isDarkMode ? "#FFFFFF" : "#333333" },
          ]}
        >
          {userInfo.username}
        </Text>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.settingsRow}>
        <Switch value={isDarkMode} onValueChange={handleDarkModeToggle} />
          <Text
            style={[
              styles.settingsText,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            Dark Mode
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={navigateToEditProfile}
        style={styles.editButton}
      >
        <Text style={styles.ButtonText}>Edit Profile Information</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.ButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 75,
  },
  usernameText: {
    fontSize: 25,
    marginTop: 10,
  },
  settingsContainer: {
    flex: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  settingsText: {
    fontSize: 18,
    marginLeft: 10,
  },
  helloText: {
    fontSize: 24,
    color: "#FFFFFF",
    marginTop: 20,
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    alignItems: "center",
  },
  ButtonText: {
    color: "#EEEEEE",
    fontSize: 18,
  },
});

export default SettingsProfilePage;
