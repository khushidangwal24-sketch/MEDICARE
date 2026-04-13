const {
  clearCollection,
  insertMany,
  createOne,
  findMany,
  findOne,
  findById,
  updateById,
} = require("../data/store");

const COLLECTION = "users";

module.exports = {
  async find(filter = {}) {
    return findMany(COLLECTION, filter);
  },
  async findOne(filter = {}) {
    return findOne(COLLECTION, filter);
  },
  async findById(id) {
    return findById(COLLECTION, id);
  },
  async updateById(id, updates) {
    return updateById(COLLECTION, id, updates);
  },
  async create(doc) {
    return createOne(COLLECTION, doc);
  },
  async insertMany(docs) {
    return insertMany(COLLECTION, docs);
  },
  async deleteMany() {
    return clearCollection(COLLECTION);
  },
};

