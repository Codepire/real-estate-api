export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    google_client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
        callback_uri: process.env.GOOGLE_CLIENT_CALLBACK,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiry: process.env.JWT_EXPIRY,
    },
    frontend: {
        uri: process.env.FRONTEND_URI,
        auth_callback: process.env.FRONTEND_AUTH_CALLBACK,
    },
});
