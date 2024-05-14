import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Button,
  TextInput,
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
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState(null);
  const { refreshTrigger, triggerRefresh } = useRefresh();

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("Refreshing...");
    SocialPage();
    setRefreshing(false);
  };
  useEffect(() => {
    if (refreshTrigger === "Social Page") {
      fetchMembershipStatus();
      triggerRefresh("EmptyState");
    }
  }, [refreshTrigger]);

  const handleTextChange = useCallback((text) => {
    setMessageText(text);
  }, []);

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
        setMessages(jsonResponse.messageBoard || []);
        if (jsonResponse.members && Array.isArray(jsonResponse.members)) {
          jsonResponse.members.forEach((member) => {
            console.log(
              `Member Name: ${member.username}, Image URL: ${member.imageUrl}`
            );
          });
        } else {
          console.log("No members data available");
        }
      }
    } catch (error) {
      console.error("Error fetching membership status:", error);
    }
  };

  useEffect(() => {
    fetchMembershipStatus();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await SecureStore.getItemAsync("username");
      setUsername(storedUsername);
    };

    fetchUsername();
  }, []);

  const navigateToCreateBookClub = useCallback(() => {
    navigation.navigate("CreateBookClub");
  }, [navigation]);

  const navigateToSearchBookClub = useCallback(() => {
    navigation.navigate("SearchBookClub");
  }, [navigation]);

  const sendMessage = async () => {
    const username = await SecureStore.getItemAsync("username");
    const response = await fetch(`${apiUrl}/bookclub/${bookClub._id}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
        username: username,
      }),
    });
    fetchMembershipStatus();
    handleTextChange("");
  };

  //If part of club you see this page
  //Nevermind It was buggy so most of MemberView is in Return
  const MemberView = () => (
    <View style={styles.container}>
      <Text style={[styles.clubText, { color: isDarkMode ? "#DDD" : "#333" }]}>
        {bookClub?.name}
      </Text>
      <View style={styles.clubAndMembersContainer}>
        {book && book.thumbnail && (
          <Image
            source={{ uri: book.thumbnail }}
            style={styles.thumbnail}
            resizeMode="contain"
          />
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
                style={[
                  styles.memberText,
                  { color: isDarkMode ? "#FFF" : "#333" },
                ]}
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
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#EEE" }]}>
      <Text style={[styles.titleText, { color: isDarkMode ? "#FFF" : "#333" }]}>
        Welcome to
      </Text>
      <Text style={[styles.title2Text, { color: isDarkMode ? "#FFF" : "#333" }]}>
        The BookClub
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={navigateToCreateBookClub}
          style={[
            styles.BigButton,
            { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
          ]}
        >
          <Text style={[styles.BigButtonText]}>Create BoookClub</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={navigateToSearchBookClub}
          style={[
            styles.BigButton,
            { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
          ]}
        >
          <Text style={[styles.BigButtonText]}>Search BoookClubs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.fullScreenContainer,
        { backgroundColor: isDarkMode ? "#333" : "#EEE" },
      ]}
    >
      {isMember ? (
        <>
          <View style={styles.upperHalf}>
            <MemberView />
          </View>
          <View style={styles.lowerHalf}>
            <ScrollView
              alwaysBounceVertical={true}
              contentContainerStyle={styles.scrollView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View
                style={[
                  { backgroundColor: isDarkMode ? "#333" : "#EEE" },
                  styles.messagesContainer,
                ]}
              >
                {messages.map((message, index) => {
                  const member = members.find(
                    (member) => member.username === message.postedBy
                  );
                  return (
                    <View
                      key={index}
                      style={[
                        styles.messageContainer,
                        message.postedBy === username
                          ? [
                              styles.messageRight,
                              {
                                backgroundColor: isDarkMode
                                  ? "#005ECB"
                                  : "#007AFF",
                              },
                            ]
                          : [
                              styles.messageLeft,
                              {
                                backgroundColor: isDarkMode
                                  ? "#E0E0E0"
                                  : "#9E9E9E",
                              },
                            ],
                        message.postedBy === username
                          ? styles.userMessageLayout
                          : styles.otherMessageLayout,
                      ]}
                    >
                      {message.postedBy !== username &&
                        member &&
                        member.imageUrl && (
                          <Image
                            source={{ uri: member.imageUrl }}
                            style={styles.profileImage}
                            resizeMode="contain"
                          />
                        )}
                      <Text style={styles.messageText}>
                        {message.postedBy === username
                          ? message.message
                          : ` ${message.message}`}
                      </Text>
                      {message.postedBy === username &&
                        member &&
                        member.imageUrl && (
                          <Image
                            source={{ uri: member.imageUrl }}
                            style={styles.profileImage}
                            resizeMode="contain"
                          />
                        )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: isDarkMode ? "#333" : "#EEE" },
              ]}
            >
              <TextInput
                style={styles.input}
                value={messageText}
                onChangeText={(messageText) => handleTextChange(messageText)}
                placeholder="Write a message..."
                keyboardType="default"
                returnKeyType="search"
                backgroundColor={isDarkMode ? "#DDDDDD" : "#FFF"}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={[
                  styles.searchButton,
                  { backgroundColor: isDarkMode ? "#005ECB" : "#007AFF" },
                ]}
              >
                <Text style={[styles.searchButtonText]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <NonMemberView />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  upperHalf: {
    overflow: "hidden",
    flex: 0.8,
  },
  lowerHalf: {
    flex: 1,
  },
  titleText:{
      fontSize: 50,
      textAlign: 'center',
      marginTop: 30,
  },
  title2Text:{
    fontSize: 55,
    textAlign: 'center',
    marginTop: 30,
    fontWeight: 'bold',
},
  BigButton:{
    marginHorizontal: 10,  // Provide some space between buttons
    marginTop: 70,
    flex: 1,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  BigButtonText:{
    textAlign: "center",
    fontSize: 20,
    color: '#FFFFFF',
  },
  buttonsContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
    padding: 4,
  },
  clubText: {
    fontSize: 30,
    marginBottom: 10,
  },

  clubAndMembersContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  bookContainer: {
    marginRight: 20,
  },
  thumbnail: {
    width: 135,
    height: 202.5,
  },
  membersList: {
    flex: 1,
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginRight: "30%",
    alignSelf: "flex-end",
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
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userMessageLayout: {
    justifyContent: "flex-end",
    marginRight: 10,
  },
  otherMessageLayout: {
    justifyContent: "flex-start",
    marginLeft: 10,
  },
  messageContainer: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    marginVertical: 4,
  },
  messageRight: {
    padding: 3,
    marginLeft: "45%",
    borderRadius: 5,
    marginTop: 5,
    marginRight: "3%",
    maxWidth: "50%",
    alignSelf: "flex-end",
    borderRadius: 20,
  },
  messageLeft: {
    padding: 3,
    borderRadius: 5,
    marginTop: 5,
    marginLeft: "3%",
    maxWidth: "50%",
    alignSelf: "flex-start",
    borderRadius: 20,
  },
  messageText: {
    fontSize: 16,
    padding: 8,
  },
  inputContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    borderWidth: 0,
    borderColor: "gray",
    marginleft: "4",
    padding: 5,
    fontSize: 18,
    borderRadius: 15,
    fontSize: 16,
  },
  searchButton: {
    flex: 0.3,
    marginHorizontal: 0,
    marginTop: 0,
    padding: 0,
    padding: 5,
    marginBottom: 0,
    marginLeft: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
});

export default SocialPage;
