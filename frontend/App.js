import React from "react";

import { Button } from "react-native";
//Using for easy page setup
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { RefreshProvider } from "./pages/RefreshContext";
import { useTheme } from "./pages/ThemeContext";

// Import all the pages
import SearchPage from "./pages/SearchPage";
import SocialPage from "./pages/BookClubPages/SocialPage";
import SearchBookClub from "./pages/BookClubPages/SearchBookClub";
import CreateBookClub from "./pages/BookClubPages/CreateBookClub";
import BookClubShelfSelecting from "./pages/BookClubPages/BookClubBookSelecting";
import FriendsPage from "./pages/FriendsPage";
import ChatScreen from "./pages/ChatScreen";
import BookshelfPage from "./pages/BookshelfPage";
import BookDetailsPage from "./pages/BookDetailsPage";
import PeopleDataStackScreen from "./pages/PeopleDataStackScreen";
import SettingsProfilePage from "./pages/SettingsProfilePage";
import NewBookDetailsPage from "./pages/NewBookDetailsPage";
import LoginPage from "./pages/LoginPage";
import EditBookDetailsPage from "./pages/EditBookDetailsPage";
import EditProfilePage from "./pages/EditProfilePage";
import DetailedFriendPage from "./pages/DetailedFriendPage";
import { AuthProvider, useAuth } from "./pages/Authentication";

import { ThemeProvider } from "./pages/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const BookStack = createStackNavigator();
const SearchStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const SocialStack = createStackNavigator();

//Stacks of pages
function SearchStackScreen() {
  const { isDarkMode } = useTheme();
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? "#333" : "#fff",
        },
        headerTintColor: isDarkMode ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <SearchStack.Screen name="Search" component={SearchPage} />
      <SearchStack.Screen name="Add Book" component={NewBookDetailsPage} />
    </SearchStack.Navigator>
  );
}

const SocialStackScreen = () => {
  const { isDarkMode } = useTheme();
  return (
    <SocialStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? "#333" : "#fff",
        },
        headerTintColor: isDarkMode ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <SocialStack.Screen name="BookClub" component={SocialPage} />
      <SocialStack.Screen name="SearchBookClub" component={SearchBookClub} />
      <SocialStack.Screen name="CreateBookClub" component={CreateBookClub} />
      <SocialStack.Screen name="BookClubShelfSelecting" component={BookClubShelfSelecting} />
      <SocialStack.Screen name="ChatScreen" component={ChatScreen} />
      <SocialStack.Screen name="FriendsPage" component={FriendsPage} />
    </SocialStack.Navigator>
  );
};

const BookStackScreen = () => {
  const { isDarkMode } = useTheme();
  return (
    <BookStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? "#333" : "#fff",
        },
        headerTintColor: isDarkMode ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <BookStack.Screen name="Bookshelf" component={BookshelfPage} />
      <BookStack.Screen name="BookDetails" component={BookDetailsPage} />
      <BookStack.Screen
        name="EditBookDetails"
        component={EditBookDetailsPage}
      />
    </BookStack.Navigator>
  );
};

const SettingsStackScreen = () => {
  const { isDarkMode } = useTheme();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? "#333" : "#fff",
        },
        headerTintColor: isDarkMode ? "#fff" : "#000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsProfilePage} />
      <SettingsStack.Screen name="EditProfile" component={EditProfilePage} />
      <SettingsStack.Screen name="LoginPage" component={LoginPage} />
    </SettingsStack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RefreshProvider>
        <ThemeProvider>
          <NavigationContainer>
            <MainApp />
          </NavigationContainer>
        </ThemeProvider>
      </RefreshProvider>
    </AuthProvider>
  );
};

//Main pages on bottom tab.
const MainApp = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const screenOptions = {
    tabBarStyle: {
      backgroundColor: isDarkMode ? "#333" : "#fff",
      height: 55,
    },
    tabBarActiveTintColor: isDarkMode ? "#fff" : "#000",
    tabBarInactiveTintColor: isDarkMode ? "#ccc" : "#888",
    headerStyle: {
      backgroundColor: isDarkMode ? "#333" : "#fff",
    },
    headerTintColor: isDarkMode ? "#fff" : "#000",
    headerTitleStyle: {
      fontWeight: "bold",
    },
    tabBarShowLabel: false,
  };
  const iconSize = 30;
  // If not authenticated shows the LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  if (isAuthenticated) { // Else shows the main app
  return (
    <Tab.Navigator initialRouteName="Bookshelfs" screenOptions={screenOptions}>
      <Tab.Screen
        name="Social"
        component={SocialStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-sharp" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Read & Connect"
        component={PeopleDataStackScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-sharp" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookshelfs"
        component={BookStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="library-sharp" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Searchs"
        component={SearchStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-sharp" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsProfile"
        component={SettingsStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" color={color} size={iconSize} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
};

export default App;
