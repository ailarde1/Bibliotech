import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "./ThemeContext";
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const DetailedFriendPage = ({ route }) => {
  const { friendUsername } = route.params;

  const navigation = useNavigation();

  const startChat = () => {
    navigation.navigate("ChatScreen", { friendUsername: userInfo.username });
  };

  const [userInfo, setUserInfo] = useState({
    username: friendUsername,
    imageUrl:
      "https://awsbucketbibliotecha.s3.us-east-2.amazonaws.com/NoUserImage.png",
  });
  const { isDarkMode } = useTheme();
  useEffect(() => {
    fetchUserInfo();
  }, []);

  //Using same GET backend as user, not sure if that will cause problem later.
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/userinfo?username=${encodeURIComponent(friendUsername)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        console.error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.centerContent,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: userInfo.imageUrl }}
          style={styles.profileImage}
        />
        <Text
          style={[styles.usernameText, { color: isDarkMode ? "#FFF" : "#333" }]}
        >
          {userInfo.username}
        </Text>
        <Button title="Start Chat" onPress={startChatWithFriend} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  usernameText: {
    fontSize: 25,
    marginTop: 10,
  },
});

export default DetailedFriendPage;
