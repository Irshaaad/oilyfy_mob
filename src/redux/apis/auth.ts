import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const authApis = createApi({
  reducerPath: 'authApis',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: builder => ({
    login: builder.mutation({
      query: body => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation({
      query: body => ({
        url: 'auth/password',
        method: 'PUT',
        body,
      }),
    }),
    updateProfile: builder.mutation({
      query: body => {
        console.log('===body===>', JSON.stringify(body, null, 1));
        return {
          url: `users/${body?.id}`,
          method: 'PUT',
          body,
        };
      },
    }),
    uploadVideo: builder.mutation({
      query: body => {
        let url = "http://34.18.118.253/api/uploads?upload_type=3&route_type=3"
        if (body?.schedule_ids) {
          url += `&schedule_id=${body?.schedule_ids}`
        }
        return {
          url,
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: body.formData,
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useUploadVideoMutation
} = authApis;
