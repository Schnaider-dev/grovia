import "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import ConnectDB from "./config/db.js";
// import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
// import { readinessGate, requestTimeout } from "./middleware/readinessMiddleware.js";
// import { requestId } from "./middleware/requestIdMiddleware.js";

if (process.env.NODE_ENV !== "test") void ConnectDB();

const app = express();
app.set("trust proxy", 1);

//Security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

//Compression
app.use(compression());

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL];

app.use(cors({
    origin(origin, callback) {
        // Server to server calls and curl send no origin header so allow request from any server.
        if (!origin) return callback(null, true);

        //In developemnt allow every origin for easier testing
        if (process.env.NODE_ENV === "development") return callback(null, true);

        callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["Get", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["content-type", "Authorization"],
}),
);

//Anything that needs the raw body - the Stripe webhook - mounts above this line.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));