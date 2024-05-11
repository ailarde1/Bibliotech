import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button} from "react-native";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const SocialPage = () => {
  
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [isMember, setIsMember] = useState(false);
  const [bookClubs, setBookClubs] = useState([]);

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      const username = await SecureStore.getItemAsync("username");
      try {
        const response = await fetch(`${apiUrl}/bookclub/check-membership?username=${encodeURIComponent(username)}`);
        const jsonResponse = await response.json();
        if (response.ok) {
          setIsMember(jsonResponse.isMember);
          setBookClubs(jsonResponse.bookClubs || []);
        } else {
          console.error("Failed to fetch book club data:", jsonResponse.message);
        }
      } catch (error) {
        console.error("Error fetching membership status:", error);
      }
    };

    fetchMembershipStatus();
  }, []);

  const navigateToCreateBookClub = () => {
    navigation.navigate("CreateBookClub");
  };

  const navigateToSearchBookClub = () => {
    navigation.navigate("SearchBookClub");
  };
  
  //If part of club you see this page
  const MemberView = () => (
    <View>
      <Text style={[styles.text, { color: isDarkMode ? "#FFF" : "#333" }]}>
        Welcome back to your BookClub!
      </Text>
      {bookClubs.map((club, index) => (
        <Text key={index} style={[styles.clubText, { color: isDarkMode ? "#DDD" : "#333" }]}>
          {club.name}
        </Text>
      ))}
    </View>
  );
  //Not part of a club you see this page
  const NonMemberView = () => (
    <View>
      <Text style={[styles.text, { color: isDarkMode ? "#FFF" : "#333" }]}>
        Welcome to "The BookClub"
      </Text>
      <View style={styles.buttonsContainer}>
        <Button title="Create BookClub" onPress={navigateToCreateBookClub} />
        <Button title="Search BookClubs" onPress={navigateToSearchBookClub} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#FFF" }]}>
      {isMember ? <MemberView /> : <NonMemberView />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  clubText: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default SocialPage;
