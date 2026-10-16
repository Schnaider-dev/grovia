import mongoose from "mongoose";
import { resolve } from "node:dns";

const RETRY_MS = 5_000;
const MAX_RETRY_MS = 30_000;

const ConnectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("MongoDB: MONGO_URI is not defined in the root .env");
        process.exit(1);
    }

    mongoose.connection.on("disconnected", () =>
        console.warn("MongoDB: disconnected - request running again"),
    );
    mongoose.connection.on("reconnected", () => console.log("MongoDB: reconnected"));
    mongoose.connection.on("error", (error) => console.error("MongoDB: connection error:", error.message));

    let delay = RETRY_MS;
    for (; ;) {
        try {
            const conn = await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 8_000,
                heartbeatFrequencyMS: 10_000,
                maxPoolSize: 20,
                maxIdleTimeMS: 60_000,
                socketTimeoutMS: 45_000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`)
            return;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`MongoDB connection Error: ${message} - retrying in ${delay / 1000},`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay = Math.min(delay * 2, MAX_RETRY_MS);
        }
    }
};

export default ConnectDB;
