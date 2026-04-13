const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "db.json");
const EMPTY_DB = {
  hospitals: [],
  doctors: [],
  bookings: [],
  users: [],
  bloodDonors: [],
  pharmacyItems: [],
  labTests: [],
};

async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return { ...EMPTY_DB, ...parsed };
  } catch {
    return { ...EMPTY_DB };
  }
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return crypto.randomUUID();
}

function textSearchMatch(obj, term) {
  if (!term) return true;
  const haystack = JSON.stringify(obj).toLowerCase();
  return haystack.includes(String(term).toLowerCase());
}

function sortBy(items, keys) {
  return [...items].sort((a, b) => {
    for (const [field, dir] of keys) {
      const av = getByPath(a, field);
      const bv = getByPath(b, field);
      if (av === bv) continue;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av > bv) return dir === -1 ? -1 : 1;
      if (av < bv) return dir === -1 ? 1 : -1;
    }
    return 0;
  });
}

function getByPath(obj, dotPath) {
  return dotPath.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function matchFilter(item, filter = {}) {
  return Object.entries(filter).every(([k, v]) => {
    if (k === "$text") return textSearchMatch(item, v.$search);
    const current = getByPath(item, k);
    if (Array.isArray(current)) return current.includes(v);
    return current === v;
  });
}

async function clearCollection(name) {
  const db = await readDb();
  db[name] = [];
  await writeDb(db);
}

async function insertMany(name, docs) {
  const db = await readDb();
  const created = docs.map((doc) => {
    const ts = nowIso();
    return { _id: createId(), createdAt: ts, updatedAt: ts, ...doc };
  });
  db[name].push(...created);
  await writeDb(db);
  return created;
}

async function createOne(name, doc) {
  const [created] = await insertMany(name, [doc]);
  return created;
}

async function findMany(name, filter = {}) {
  const db = await readDb();
  return db[name].filter((item) => matchFilter(item, filter));
}

async function findOne(name, filter = {}) {
  const items = await findMany(name, filter);
  return items[0] || null;
}

async function findById(name, id) {
  return findOne(name, { _id: id });
}

async function updateById(name, id, updates) {
  const db = await readDb();
  const idx = db[name].findIndex((item) => item._id === id);
  if (idx === -1) return null;
  const next = { ...db[name][idx], ...updates, updatedAt: nowIso() };
  db[name][idx] = next;
  await writeDb(db);
  return next;
}

module.exports = {
  clearCollection,
  insertMany,
  createOne,
  findMany,
  findOne,
  findById,
  updateById,
  sortBy,
};
