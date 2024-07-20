"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
console.log(process.env.REDIS_URL);
const redisClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
redisClient.on("error", (err) => {
    console.log("Redis error: ", err);
});
exports.default = redisClient;
//# sourceMappingURL=redis.js.map