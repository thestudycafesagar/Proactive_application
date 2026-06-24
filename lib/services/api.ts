import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  credentials: "include", // Send HttpOnly cookies globally (like refreshToken)
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // try to get a new token
        // Use 'include' credentials to send the HttpOnly refreshToken cookie
        const refreshResult: any = await baseQuery(
          { url: "/auth/refresh", method: "POST", credentials: "include" },
          api,
          extraOptions
        );
        if (refreshResult.data?.accessToken || refreshResult.data?.data?.accessToken) {
          const newToken = refreshResult.data.accessToken || refreshResult.data.data.accessToken;
          // store the new token
          localStorage.setItem("accessToken", newToken);
          // retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          // refresh failed - log out
          localStorage.removeItem("accessToken");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Task", "Client", "Service"],
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
    
    // Tasks
    getTasks: builder.query({
      query: (params) => ({ url: "/tasks", params }),
      providesTags: ["Task"],
      transformResponse: (response: { data: any }) => response.data,
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ["Task"],
      transformResponse: (response: { data: any }) => response.data,
    }),
    updateTaskStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Task"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // Clients
    getClients: builder.query({
      query: (params) => ({ url: "/clients", params }),
      providesTags: ["Client"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // Services
    getServices: builder.query({
      query: (params) => ({ url: "/services", params }),
      providesTags: ["Service"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // Users
    getUsers: builder.query({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["User"],
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
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetClientsQuery,
  useGetServicesQuery,
  useGetUsersQuery,
} = applicationApi;
