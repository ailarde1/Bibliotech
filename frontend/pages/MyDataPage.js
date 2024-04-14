import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyDataPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Data</Text>
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

export default MyDataPage;