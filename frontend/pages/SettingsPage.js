import React from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView } from 'react-native';

const SettingsPage = () => {
  return (

// need to set global variables, and also communicate change to backend.
// SecureStore?
<ScrollView>
  <View style={styles.settingsContainer}>
    <View style={styles.settingsRow}>
      <Switch />
      <Text style={styles.settingsText}>
        Dark Mode
      </Text>
    </View>
  </View>
</ScrollView>

  );
};




const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  settingsText: {
    fontSize: 18,
    color: '#333333',
    marginLeft: 10,
  },
});


export default SettingsPage;