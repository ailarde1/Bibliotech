import React from 'react';


import { Button } from 'react-native';
//Using for easy page setup
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RefreshProvider } from './pages/RefreshContext';

// Import all the pages
import SearchPage from './pages/SearchPage';
import SocialPage from './pages/SocialPage';
import BookshelfPage from './pages/BookshelfPage';
import BookDetailsPage from './pages/BookDetailsPage';
import DataPage from './pages/DataPage';
import SettingsProfilePage from './pages/SettingsProfilePage';
import NewBookDetailsPage from './pages/NewBookDetailsPage';
import LoginPage from './pages/LoginPage';
import EditBookDetailsPage from './pages/EditBookDetailsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import EditProfilePage from './pages/EditProfilePage';

import { AuthProvider, useAuth } from './pages/Authentication';

const Tab = createBottomTabNavigator();
const BookStack = createStackNavigator();
const SearchStack = createStackNavigator();

//Stacks of pages
function SearchStackScreen() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Searchs" component={SearchPage} options={{headerShown: false }} />
      <SearchStack.Screen name="NewBookDetails" component={NewBookDetailsPage} options={{headerShown: false }} />
    </SearchStack.Navigator>
  );
}

const BookStackScreen = () => {
  return (
    <BookStack.Navigator>
      <BookStack.Screen name="Bookshelfs" component={BookshelfPage}/>
      <BookStack.Screen name="BookDetails" component={BookDetailsPage}/>
      <BookStack.Screen name="EditBookDetails" component={EditBookDetailsPage}/>
    </BookStack.Navigator>
  );
};

const SettingsStackScreen = () => {
  return (
    <BookStack.Navigator>
      <BookStack.Screen name="Settings" component={SettingsProfilePage}/>
      <BookStack.Screen name="EditProfile" component={EditProfilePage}/>
      <BookStack.Screen name="EditPassword" component={ChangePasswordPage}/>
      <BookStack.Screen name="LoginPage" component={LoginPage}/>
    </BookStack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RefreshProvider>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
      </RefreshProvider>
    </AuthProvider>
  );
};

//Main pages on bottom tab.
const MainApp = () => {
  const { isAuthenticated } = useAuth();

  // If not authenticated shows the LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // else shows the main app
  return (
    <Tab.Navigator initialRouteName="Bookshelf">
        <Tab.Screen name="Social" component={SocialPage} />
        <Tab.Screen name="Search" component={SearchStackScreen} />
        <Tab.Screen name="Bookshelf" component={BookStackScreen} options={{headerShown: false }} />
        <Tab.Screen name="Data" component={DataPage} />
        <Tab.Screen name="SettingsProfile" component={SettingsStackScreen} options={{headerShown: false }}/>
    </Tab.Navigator>
  );
};

export default App;