import {createSlice} from '@reduxjs/toolkit';
import {IUserState} from './interface';

const initialState: IUserState = {
  id: 0,
  name: '',
  email_address: '',
  phone_number: undefined,
  profile_pic_url: undefined,
  provider: '',
  status: 0,
  role_id: 0,
  createdAt: '',
  updatedAt: '',
  deletedAt: undefined,
  company_id: 0,
  created_by: undefined,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, {payload}) => {
      Object.keys(payload).forEach((e: any) => {
        state[e] = payload[e];
      });
    },
    setUserProfilePicture: (state, {payload}) => {
      state.profile_pic_url = payload;
    },
  },
});

export const {setUserData, setUserProfilePicture} = userSlice.actions;

export default userSlice.reducer;
