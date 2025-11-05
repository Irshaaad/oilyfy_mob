/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../utils/theme';
import CustomIcon from './CustomIcon';
import {useTranslation} from 'react-i18next';

interface SearchBarProps {
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch}) => {
  const [text, setText] = useState('');
  const {t} = useTranslation();

  const handleSearch = () => {
    onSearch(text.trim());
  };

  const handleClear = () => {
    setText('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('SEARCH_SCHEDULES')}
        value={text}
        onChangeText={setText}
        placeholderTextColor={COLORS.greyText}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      {/* {text.length > 0 ? (
        <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
          <CustomIcon
            name={'cross'}
            type="entypo"
            size={20}
            color={COLORS.blackGrey}
          />
        </TouchableOpacity>
      ) : ( */}
        <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
          <CustomIcon
            name={'search'}
            type="ionicons"
            size={20}
            color={COLORS.blackGrey}
          />
        </TouchableOpacity>
      {/* )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 25,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.black,
  },
  iconButton: {
    padding: 6,
  },
});

export default SearchBar;
