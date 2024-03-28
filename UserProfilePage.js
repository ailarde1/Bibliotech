import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const SocialPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>User Profile Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    color: 'black',
  },
});

export default SocialPage;