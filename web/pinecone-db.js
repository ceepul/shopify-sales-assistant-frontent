export const PineconeDB = {
  index: null,
  db: null,

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

  getIndexes: async function() {
    return await this.db.listIndexes();
  }
}