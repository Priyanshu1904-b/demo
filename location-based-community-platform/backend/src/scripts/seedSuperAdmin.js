const connectDB = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");

async function seedSuperAdmin() {
  await connectDB();
  const existing = await User.findOne({ email: env.superAdmin.email });
  if (existing) {
    console.log("Super-admin already exists");
    process.exit(0);
  }

  await User.create({
    name: env.superAdmin.name,
    email: env.superAdmin.email,
    password: env.superAdmin.password,
    role: "super-admin",
    verified: true
  });
  console.log("Super-admin seeded");
  process.exit(0);
}

seedSuperAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
