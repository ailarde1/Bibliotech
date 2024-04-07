import React, { useState } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView } from 'react-native';

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ScrollView style={{ backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }}>
      <View style={styles.settingsContainer}>
        <View style={styles.settingsRow}>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
          />
          <Text style={[styles.settingsText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
            Dark Mode
          </Text>
        </View>
        {isDarkMode && <Text style={styles.helloText}>Hello</Text>}
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
    marginLeft: 10,
  },
  helloText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 20,
  },
});

export default SettingsPage;
