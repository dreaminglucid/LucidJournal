// CustomHeader.js

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CustomHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 10 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Account')}>
        <MaterialCommunityIcons name="account" color="#FFFFFF" size={26} />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
