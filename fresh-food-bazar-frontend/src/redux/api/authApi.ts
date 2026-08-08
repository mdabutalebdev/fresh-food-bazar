import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
        updatePassword: builder.mutation({
            query: (data) => ({
                url: '/auth/update-password',
                method: 'POST',
                body: data,
            }),
        }),
        // Set a new password from an invite / reset link — POST /auth/reset-password
        resetPassword: builder.mutation({
            query: (data: { token: string; newPassword: string }) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUpdatePasswordMutation,
    useResetPasswordMutation,
} = authApi;
