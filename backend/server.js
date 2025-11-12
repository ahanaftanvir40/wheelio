import express from "express";
import cookieParser from "cookie-parser";
// import bodyParser from 'body-parser';
import cors from "cors";
import "./config/mongoose-connection.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ollamaRoutes from "./routes/ollamaRoutes.js";
import wheelhubRoutes from "./routes/wheelhubRoutes.js";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
// import { Socket } from 'dgram'
import { Message } from "./models/message.model.js";

dotenv.config();

const app = express();

const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/api", userRoutes);
app.use("/api", vehicleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", bookingRoutes);
app.use("/api", notificationRoutes);
app.use("/api/ollama", ollamaRoutes);
app.use("/api", wheelhubRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("homepage");
});

// Socekt - Io - Config;

io.on("connection", (socket) => {
  socket.on("join", ({ vehicleId, ownerId, userId }) => {
    const room = `${vehicleId}-${ownerId}-${userId}`;
    socket.join(room);
  });

  socket.on(
    "message",
    async ({ vehicleId, ownerId, userId, message, senderId, username }) => {
      const room = `${vehicleId}-${ownerId}-${userId}`;
      const newMessage = new Message({
        vehicleId,
        ownerId,
        userId,
        message,
        senderId,
        username,
      });
      await newMessage.save();
      io.to(room).emit("message", {
        message,
        senderId,
        username,
        timestamp: newMessage.timestamp,
      });
      io.to(`${vehicleId}-${ownerId}`).emit("newUser", { userId, username });
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/api/chat/:vehicleId/:ownerId/:userId", async (req, res) => {
  const { vehicleId, ownerId, userId } = req.params;
  const messages = await Message.find({ vehicleId, ownerId, userId }).sort(
    "timestamp"
  );
  res.json(messages);
});

app.get("/api/ownerChats/:vehicleId/:ownerId", async (req, res) => {
  const { vehicleId, ownerId } = req.params;
  const userIds = await Message.distinct("userId", { vehicleId, ownerId });
  const userNames = await Message.distinct("username", { vehicleId, ownerId });
  res.json({ userIds, userNames });
});

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
