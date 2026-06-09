/*
Node script to list users in Supabase.
Usage:
  npm install @supabase/supabase-js
  node list_users.js

You can set SUPABASE_URL and SUPABASE_KEY environment variables.
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

async function main() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, fullname, login, role, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching users:", error);
      process.exit(1);
    }
    console.log("Users:", data);
  } catch (e) {
    console.error("Unexpected error:", e);
  }
}

main();
