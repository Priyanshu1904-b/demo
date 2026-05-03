const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const User = require("./models/User");
const { setSocketServer } = require("./services/socket.service");

async function seedSuperAdmin() {
  const existing = await User.findOne({ email: env.superAdmin.email });
  if (existing) return;

  await User.create({
    name: env.superAdmin.name,
    email: env.superAdmin.email,
    password: env.superAdmin.password,
    role: "super-admin",
    verified: true
  });
  console.log("Default super-admin seeded");
}

async function start() {
  await connectDB();
  await seedSuperAdmin();

  const server = http.createServer(app);

  try {
    const io = new Server(server, {
      cors: { origin: env.clientUrl, credentials: true }
    });
    io.on("connection", (socket) => {
      socket.emit("connected", { ok: true });
    });
    setSocketServer(io);
  } catch (error) {
    console.warn("Socket.io disabled:", error.message);
  }

  server.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
