import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config()

const redisUrl = process.env.REDIS_URL
const redisClient = new Redis(redisUrl as string);

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
})

export default redisClient;
