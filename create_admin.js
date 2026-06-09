/*
Node script to create an admin user in Supabase.
Usage (PowerShell):
  node create_admin.js "admin" "StrongPassword123!" "Administrator"

This script uses the same SUPABASE_URL and SUPABASE_KEY found in `api.js`.
If you prefer, set SUPABASE_URL and SUPABASE_KEY environment variables instead.
*/

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://dfkhuomahqiwvzieyorx.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2h1b21haHFpd3Z6aWV5b3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzU5ODcsImV4cCI6MjA5NTQ1MTk4N30.dBdWHzQJ_9MyXpJLA5jvuRSB4uUpINPe2naTi8bu48M";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_KEY environment variables or edit the script.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const crypto = require("crypto");
function sha256HexSync(message) {
  return crypto.createHash("sha256").update(String(message)).digest("hex");
}

async function main() {
  const args = process.argv.slice(2);
  const login = args[0] || "admin";
  const password = args[1] || "Admin123!";
  const fullname = args[2] || "Administrator";

  const password_hash = sha256HexSync(password);
  const payload = {
    id: String(Date.now()),
    fullname,
    login,
    password_hash,
    status: "Faol",
    role: "admin",
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("login", login)
      .limit(1)
      .single();
    if (data) {
      console.log("User with this login already exists:", login);
      process.exit(0);
    }
  } catch (e) {
    // if select fails because no rows, continue
  }

  const { error } = await supabase.from("users").insert([payload]);
  if (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
  console.log("Admin created:", login);
  console.log("Now you can login on the site with this account.");
}

main();
