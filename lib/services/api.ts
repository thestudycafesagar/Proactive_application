import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    forgotPassword: builder.mutation({
      query: (payload: { email: string }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    resetPassword: builder.mutation({
      query: (payload: { token: string; newPassword: string }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
      transformResponse: (response: { data: any }) => response.data,
    }),
    uploadAvatar: builder.mutation({
      query: (formData: FormData) => ({
        url: "/auth/me/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useUploadAvatarMutation,
} = applicationApi;
