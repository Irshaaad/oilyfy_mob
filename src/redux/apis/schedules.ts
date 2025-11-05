import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQueryWithReauth} from './baseQuery';

export const schedulesApis = createApi({
  reducerPath: 'schedulesApis',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Schedule'],
  endpoints: builder => ({
    getAllSchedules: builder.query({
      query: params => ({
        url: 'users/driver/schedule',
        method: 'GET',
        params,
      }),
      providesTags: ['Schedule'],
    }),

    updateSchedule: builder.mutation({
      query: body => ({
        url: `users/driver/schedule/${body?.id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),

    updateMultipleSchedule: builder.mutation({
      query: body => ({
        url: `users/driver/end-trip`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),

    cancelSchedule: builder.mutation({
      query: body => ({
        url: `users/driver/cancel-trip`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),

    moveToDaily: builder.mutation({
      query: body => {
        const url = `users/driver/move-to-daily/${body?.id}`;
        return {
          url,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Schedule'],
    }),

    uploadScheduleImage: builder.mutation({
      query: body => ({
        url: `uploads?upload_type=1&route_type=2&schedule_id=${body?.id}`,
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        body,
      }),
    }),
  }),
});

export const {
  useGetAllSchedulesQuery,
  useUpdateScheduleMutation,
  useUploadScheduleImageMutation,
  useUpdateMultipleScheduleMutation,
  useMoveToDailyMutation,
  useCancelScheduleMutation,
} = schedulesApis;
