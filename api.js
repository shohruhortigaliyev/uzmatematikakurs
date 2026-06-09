/* SUPABASE API (client-side) — provides CRUD and auth helpers for frontend */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://dfkhuomahqiwvzieyorx.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2h1b21haHFpd3Z6aWV5b3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzU5ODcsImV4cCI6MjA5NTQ1MTk4N30.dBdWHzQJ_9MyXpJLA5jvuRSB4uUpINPe2naTi8bu48M";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sha256Hex(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

window.api = {
  // Tests
  async getTests() {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createTest(test) {
    const payload = {
      id: test.id,
      name: test.name,
      time: test.time,
      type: test.type,
      questions: test.questions,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("tests").insert([payload]);
    if (error) throw error;
  },

  async updateTest(test) {
    const payload = {
      name: test.name,
      time: test.time,
      type: test.type,
      questions: test.questions,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("tests")
      .update(payload)
      .eq("id", test.id);
    if (error) throw error;
  },

  async deleteTest(id) {
    const { error } = await supabase.from("tests").delete().eq("id", id);
    if (error) throw error;
  },

  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id, fullname, login, status, created_at, role");
    if (error) throw error;
    return data || [];
  },

  async createUser(user) {
    const password_hash = user.password ? await sha256Hex(user.password) : null;
    const payload = {
      id: user.id || String(Date.now()),
      fullname: user.fullname,
      login: user.login,
      password_hash,
      status: user.status || "Faol",
      role: user.role || "user",
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("users").insert([payload]);
    if (error) throw error;
  },

  async updateUser(user) {
    const payload = {
      fullname: user.fullname,
      login: user.login,
      status: user.status || "Faol",
      role: user.role || "user",
      updated_at: new Date().toISOString(),
    };
    if (user.password) {
      payload.password_hash = await sha256Hex(user.password);
    }
    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", user.id);
    if (error) throw error;
  },

  async deleteUser(id) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
  },

  // Auth-like helpers (DB-based)
  async loginUser(login, password) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("login", login)
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") {
      return { ok: false };
    }
    const user = data || null;
    if (!user) return { ok: false };
    const hash = user.password_hash || null;
    const provided = await sha256Hex(password);
    if (!hash || provided !== hash) return { ok: false };
    return {
      ok: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        login: user.login,
        status: user.status,
        role: user.role,
        created_at: user.created_at,
      },
    };
  },

  async adminLogin(login, password) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`login.eq.${login},role.eq.admin`)
      .limit(1)
      .single();
    const user = data || null;
    if (!user) return { ok: false };
    const provided = await sha256Hex(password);
    if (!user.password_hash || provided !== user.password_hash)
      return { ok: false };
    const admin_key = await sha256Hex(`${user.id}:${Date.now()}`);
    return { ok: true, admin_key };
  },

  // Results
  async postResult(result) {
    const payload = {
      userId: result.userId,
      fullname: result.fullname,
      login: result.login,
      test: result.test,
      score: result.score,
      correct: result.correct,
      wrong: result.wrong,
      percent: result.percent,
      time: result.time,
      date: result.date,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("results").insert([payload]);
    if (error) throw error;
  },

  async getResults() {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  subscribeToResults(cb) {
    try {
      const channel = supabase
        .channel("public:results")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "results" },
          (payload) => {
            if (payload && payload.new) cb(payload.new);
          },
        )
        .subscribe();
      return channel;
    } catch (e) {
      console.warn("Realtime subscription failed", e);
      return null;
    }
  },

  // Client helpers for app pages
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("current_user") || "null");
    } catch (e) {
      return null;
    }
  },

  setActiveTestId(id) {
    if (id === null || id === undefined)
      localStorage.removeItem("active_test_id");
    else localStorage.setItem("active_test_id", String(id));
  },

  getActiveTestId() {
    return localStorage.getItem("active_test_id");
  },
};
