import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import FriendsPage from "./FriendsPage";
import MyDataPage from "./MyDataPage";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

const PeopleStack = createStackNavigator();

const PeopleDataStackScreen = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderPage = () => {
    switch (selectedIndex) {
      case 0:
        return <MyDataPage />;
      case 1:
        return <FriendsPage />;
      default:
        return <MyDataPage />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SegmentedControl
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
