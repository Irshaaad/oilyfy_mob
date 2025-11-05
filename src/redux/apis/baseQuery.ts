import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import {RootState} from '../store';
import {API_URL} from '../../utils/constants';
import {utility} from '../../utils/utility';
// import {utility} from '../../utils/utility';
// Create our baseQuery instance
export const customFetchBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, {getState}) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const token =
      (getState() as RootState).generalSlice?.accessToken ||
      (getState() as RootState).generalSlice?.tempToken ||
      (getState() as RootState).generalSlice?.refreshToken;
    if (token) {
      headers.set('Authorization', `${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  console.log('===api call===>', JSON.stringify(api.endpoint, null, 1));
  let result = await customFetchBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // if (result.error && result?.error?.data.error === 'jwt expired') {
    utility.showToast?.show('Session Expired', {type: 'danger'});
    // try to get a new token
    const refreshResult = await customFetchBaseQuery(
      {url: '/api/user/logout', method: 'POST'},
      api,
      extraOptions,
    );
    if (refreshResult.data) {
      // store the new token
      // api.dispatch(tokenReceived(refreshResult.data));
      // retry the initial query
      result = await customFetchBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch({type: 'LOGOUT', payload: null});
    }
  }
  return result;
};
