import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();

export const reduxPersistStorage = {
  setItem: (key: string, value: string | number | boolean | Uint8Array) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },
};
