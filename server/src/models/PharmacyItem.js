const { clearCollection, insertMany, createOne, findMany } = require("../data/store");

const COLLECTION = "pharmacyItems";

module.exports = {
  async find(filter = {}) {
    return findMany(COLLECTION, filter);
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

