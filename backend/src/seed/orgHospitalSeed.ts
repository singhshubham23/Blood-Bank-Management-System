import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db";
import User from "../models/User";
import generateUniqueId from "../utils/generateUniqueId";

async function seedUser(role: string, name: string, emailEnv: string, passEnv: string, location: string) {
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
    location,
  });

  console.log(`${role} created:`, user.email);
}

async function run() {
  await connectDB();

  await seedUser(
    "organisation",
    "Red Cross Blood Bank",
    "SEED_ORG_EMAIL",
    "SEED_ORG_PASSWORD",
    "New Delhi, India"
  );

  await seedUser(
    "hospital",
    "City Hospital",
    "SEED_HOSP_EMAIL",
    "SEED_HOSP_PASSWORD",
    "Mumbai, Maharashtra"
  );



  console.log("Seeding finished!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
