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
    const batchSize = 50;
    let upsertedCount = 0;

    for (let i = 0; i < vectorArray.length; i += batchSize) {
      const vectors = vectorArray.slice(i, i + batchSize);

      const upsertRequest = {
        vectors: vectors,
        namespace: shopURL,
      };
      const upsertResponse = await this.index.upsert({ upsertRequest });
      upsertedCount += upsertResponse.upsertedCount
    }

    return {upsertedCount}
  },

  delete: async function (id, namespace) {

    return await this.index.delete1({
      id: id,
      namespace: namespace
    })
  },

  deleteAll: async function (namespace) {

    await this.index.delete1({
        namespace: namespace,
        deleteAll: deleteAll,
    })
  },

  query: async function (vector, namespace, topK) {
    const queryRequest = {
      vector: vector,
      namespace: namespace,
      topK: topK,
    }

    //Query the index and store the response.
    const queryResponse = await this.index.query({queryRequest});

    return queryResponse
  },

  getIndexes: async function() {
    return await this.db.listIndexes();
  }
}