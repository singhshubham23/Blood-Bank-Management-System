require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const generateUniqueId = require("../utils/generateUniqueId");

async function seedUser(role, name, emailEnv, passEnv) {
  const email = process.env[emailEnv];
  const password = process.env[passEnv];

  if (!email || !password) {
    console.log(`Skipping ${role} — email/password not set in .env`);
    return;
  }

  const exists = await User.findOne({ email, role });
  if (exists) {
    console.log(`${role} already exists:`, email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    uniqueId: await generateUniqueId(),
    isVerified: true,
  });

  console.log(`${role} created:`, user.email);
}

async function run() {
  await connectDB();

  await seedUser(
    "organisation",
    "Red Cross Blood Bank",
    "SEED_ORG_EMAIL",
    "SEED_ORG_PASSWORD"
  );

  await seedUser(
    "hospital",
    "City Hospital",
    "SEED_HOSP_EMAIL",
    "SEED_HOSP_PASSWORD"
  );

  console.log("Seeding finished!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
