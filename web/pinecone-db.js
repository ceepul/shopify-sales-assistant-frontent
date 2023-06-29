import { getShopUrlFromSession } from "./helpers/admin-query.js";

export const PineconeDB = {
  index: null,
  db: null,

/*   init: async function() {
    this.db = this.db ?? new PineconeClient();
    await this.db.init({
      environment: process.env.PINECONE_ENVIRONMENT,
      apiKey: process.env.PINECONE_API_KEY,
    });
  }, */

  upsert: async function (vectorArray, shopURL) {
    const index = this.db.Index(this.index);
    const batchSize = 5;
    let upsertedCount = 0;

    for (let i = 0; i < vectorArray.length; i += batchSize) {
      const vectors = vectorArray.slice(i, i + batchSize);

      const upsertRequest = {
        vectors: vectors,
        namespace: shopURL,
      };
      const upsertResponse = await index.upsert({ upsertRequest });
      upsertedCount += upsertResponse.upsertedCount
    }

    return {upsertedCount}
  },

  delete: async function (id, namespace) {
    const index = this.db.Index(this.index);

    return await index.delete1({
      id: id,
      namespace: namespace
    })
  },

  deleteAll: async function (namespace) {
    const index = this.db.Index(this.index);

    await index.delete1({
        namespace: namespace,
        deleteAll: deleteAll,
    })
  },

  getIndexes: async function() {
    return await this.db.listIndexes();
  }
}