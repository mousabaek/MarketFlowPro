import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// Hash the password "MousaBaek90Wolf"
async function generatePasswordHash() {
  const password = "MousaBaek90Wolf";
  const hashedPassword = await hashPassword(password);
  console.log("Password:", password);
  console.log("Hashed password:", hashedPassword);
}

generatePasswordHash().catch(console.error);