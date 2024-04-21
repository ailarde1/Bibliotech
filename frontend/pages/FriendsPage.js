import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const FriendsPage = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(`${apiUrl}/friends?username=${username}`);
      const data = await response.json();
      if (response.ok) {
        setFriends(data.friends);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  const fetchFriendRequests = async () => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(
        `${apiUrl}/friends/requests?username=${username}`
      );
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  const handleAccept = async (requesterId) => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(`${apiUrl}/friends/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, requesterId }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchFriends();
        fetchFriendRequests();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  const handleDecline = async (requesterId) => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(`${apiUrl}/friends/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, requesterId }),
      });
      if (response.ok) {
        setRequests((current) =>
          current.filter((req) => req._id !== requesterId)
        );
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  const handleSearch = async () => {
    const username = await SecureStore.getItemAsync("username");
    try {
      const response = await fetch(
        `${apiUrl}/users/search?search=${searchQuery}`
      );
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  const handleSendFriendRequest = async (toUsername) => {
    const fromUsername = await SecureStore.getItemAsync("username");

    try {
      const response = await fetch(`${apiUrl}/friends/send-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUsername, toUsername }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Friend request sent successfully");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <TouchableOpacity
            style = {styles.listItem}
              onPress={() => navigation.navigate("DetailedFriend", { friendUsername: item.username})}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <Text style={styles.item}>{item.username}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.header}>Friend Requests</Text>
      {requests.map((request) => (
        <View key={request._id} style={styles.requestItem}>
          <Image source={{ uri: request.imageUrl }} style={styles.image} />
          <Text style={styles.item}>{request.username}</Text>
          <Button title="Accept" onPress={() => handleAccept(request._id)} />
          <Button title="Decline" onPress={() => handleDecline(request._id)} />
        </View>
      ))}

      <Text style={styles.header}>Add Friend</Text>
      <TextInput
        style={styles.input}
        onChangeText={setSearchQuery}
        value={searchQuery}
        placeholder="Search..."
      />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.searchItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text>{item.username}</Text>
            <Button
              title="Add"
              onPress={() => handleSendFriendRequest(item.username)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
  },
  item: {
    padding: 10,
    fontSize: 18,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
  },
  searchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
});

export default FriendsPage;