const _config = {
  MONGODB_URL: process.env.MONGODB_URL,
  PORT: process.env.PORT,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
};

Object.freeze(_config);

const config = {
  get(key) {
    const value = _config[key];
    if (!value) {
      console.log(value, _config);
      console.error(
        `❌ Configuration error : Environment variable "${key}" is missing`,
      );
      process.exit(1); // fail fast (important)
    }
    return value; // ✅ THIS WAS MISSING
  },
};

Object.freeze(config);

export default config;
