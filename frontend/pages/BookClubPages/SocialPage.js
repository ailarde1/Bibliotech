import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Button,
  RefreshControl,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
import { useRefresh } from "../RefreshContext";
import { ScrollView } from "react-native-gesture-handler";

const SocialPage = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [isMember, setIsMember] = useState(false);
  const [bookClub, setBookClub] = useState(null);
  const [book, setBook] = useState(null);
  const [members, setMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshTrigger } = useRefresh();
  const { triggerRefresh } = useRefresh();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembershipStatus();
    setRefreshing(false);
  };

  const fetchMembershipStatus = async () => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(
        `${apiUrl}/bookclub/check-membership?username=${encodeURIComponent(username)}`
      );
      const jsonResponse = await response.json();
      if (response.ok) {
        setIsMember(jsonResponse.isMember);
        setBookClub(jsonResponse.bookClub);
        setBook(jsonResponse.book);
        setMembers(jsonResponse.members || []);
        if (jsonResponse.members && Array.isArray(jsonResponse.members)) {
          jsonResponse.members.forEach((member) => {
            console.log(
              `Member Name: ${member.username}, Image URL: ${member.imageUrl}`
            );
          });
        } else {
          console.log("No members data available");
        }
      } else {
        console.error("Failed to fetch book club data:", jsonResponse.message);
      }
    } catch (error) {
      console.error("Error fetching membership status:", error);
    }
  };

  useEffect(() => {
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
    <View style={styles.container}>
      {bookClub && (
            <Text style={[styles.clubText, { color: isDarkMode ? "#DDD" : "#333" }]}>
              {bookClub.name}
            </Text>)}
      <View style={styles.clubAndMembersContainer}>
        {bookClub && (
          <View style={styles.bookContainer}>
            {book && book.thumbnail && (
              <Image
                source={{ uri: book.thumbnail }}
                style={styles.thumbnail}
                resizeMode="contain"
              />
            )}
          </View>
        )}
        <View style={styles.membersList}>
          {members.map((member, index) => (
            <View key={index} style={styles.memberContainer}>
              {member.imageUrl && (
                <Image
                  source={{ uri: member.imageUrl }}
                  style={styles.memberImage}
                  resizeMode="contain"
                />
              )}
              <Text
                style={[styles.memberText, { color: isDarkMode ? "#FFF" : "#333" }]}
              >
                {member.username}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#333" : "#FFF" },
        ]}
      >
        {isMember ? <MemberView /> : <NonMemberView />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
    padding: 4,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  clubAndMembersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookContainer: {
    marginRight: 20,
  },
  thumbnail: {
    width: 150,
    height: 225,
  },
  membersList: {
    flex: 1,
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  memberImage: {
    borderRadius: 25,
    width: 50,
    height: 50,
    marginRight: 10,
  },
  memberText: {
    fontSize: 18,
  },
  clubText: {
    fontSize: 30,
    marginBottom: 10,
  },
});

export default SocialPage;
