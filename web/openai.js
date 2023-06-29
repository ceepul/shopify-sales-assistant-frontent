import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

/*Takes in an array of strings, makes a request to the OpenAI API,
 and returns an array of vector embeddings */
export  async function embed(req, res, data, shopURL) {

    const response = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: data,
        user: shopURL,
    });

    return response.data
}

