export const jwtConstants = {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpires: process.env.JWT_ACCESS_EXPIRES,
  refreshExpires: process.env.JWT_REFRESH_EXPIRES,
};
