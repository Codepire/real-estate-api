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
    database: {
        user: process.env.DATABASE_USER,
        pass: process.env.DATABASE_PASSWORD,
        port: parseInt(process.env.DATABASE_PORT, 10),
        database: process.env.DATABASE,
        type: process.env.DATABASE_TYPE,
        host: process.env.DATABASE_HOST,
    },
    email: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
    walkscore: {
        apiKey: process.env.WALKSCORE_KEY,
    },
    google_analytics: {
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    },
    cors: {
        origins: process.env.CORS_ORIGINS,
    },
});
