const { clearCollection, insertMany, createOne, findMany, findById } = require("../data/store");

const COLLECTION = "bookings";

module.exports = {
  async find(filter = {}) {
    return findMany(COLLECTION, filter);
  },
  async findById(id) {
    return findById(COLLECTION, id);
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

