import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChangePasswordPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Change Password Page. Should probably move functionality inside of edit Profile Page</Text>
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

export default ChangePasswordPage;