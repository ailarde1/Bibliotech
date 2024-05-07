import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import FriendsPage from "./FriendsPage";
import MyDataPage from "./MyDataPage";
import DetailedFriendPage from "./DetailedFriendPage";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useTheme } from "./ThemeContext";
const PeopleStack = createStackNavigator();
const FriendStack = createStackNavigator();
function FriendsStackScreen() {
  return (
    <FriendStack.Navigator>
      <FriendStack.Screen
        name="FriendsPage"
        component={FriendsPage}
        options={{ headerShown: false }}
      />
      <FriendStack.Screen
        name="DetailedFriendPage"
        component={DetailedFriendPage}
        options={{ headerShown: false }}
      />
    </FriendStack.Navigator>
  );
}

const PeopleDataStackScreen = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isDarkMode } = useTheme();

  const renderPage = () => {
    switch (selectedIndex) {
      case 0:
        return <MyDataPage />;
      case 1:
        return <FriendsStackScreen />;
      default:
        return <MyDataPage />;
    }
  };

  return (
    <SafeAreaView
      style={[{ flex: 1 }, { backgroundColor: isDarkMode ? "#333" : "#EEE" }]}
    >
      <SegmentedControl
        backgroundColor={isDarkMode ? "#444445" : "#EEE"}
        values={["My Data", "Friends"]}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        style={{ margin: 10 }}
      />
      <View style={{ flex: 1 }}>{renderPage()}</View>
    </SafeAreaView>
  );
};

export default PeopleDataStackScreen;
