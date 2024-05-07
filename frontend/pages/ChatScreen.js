import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import io from "socket.io-client";

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  //const { username } = route.params;

  useEffect(() => {
    // Connect to Socket.io server
    const socket = io("http://your-socket-server-address");

    // Listen for incoming messages
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    // Emit message to server

    const message = {
      sender: "currentUserName",
      receiver: "Test",
      text: inputMessage,
    };
    // Send message to server
    socket.emit("sendMessage", message);
    // Add the message to the current messages state
    setMessages([...messages, message]);
    // Clear input field
    setInputMessage("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Text key={index}>{msg.text}</Text>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type your message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  messagesContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
});

export default ChatScreen;
