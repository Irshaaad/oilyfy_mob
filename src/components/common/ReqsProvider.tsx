import React from 'react';
import { useToast } from 'react-native-toast-notifications';
import { preReqs } from '../../utils/service/preReqs';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';

type ReqsProviderProps = {
  children: React.ReactNode;
};

const ReqsProvider: React.FC<ReqsProviderProps> = ({ children }) => {
  preReqs(useToast, useTranslation, useAppDispatch, useNavigation);
  return children;
};

export default ReqsProvider;
