import { PineconeClient } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from "openai";
import { RDSDataClient, ExecuteStatementCommand } from "@aws-sdk/client-rds-data"

const client = new RDSDataClient({ region: 'us-east-1' });
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const pinecone = new PineconeClient();
await pinecone.init({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index('shopify-app-data');

export const handler = async (event) => {
  console.log(event);

  const body = JSON.parse(event.body);
  const shop = body.shop;
  const messages = body.messages;
  const getProducts = body.getProducts;
  
  console.log(`Shop: ${shop}, messages: ${JSON.stringify(messages)}, getProducts: ${getProducts}`)
  
  const updateMessageCountResult = await updateMessageCount(shop);
  if (!updateMessageCountResult.success) {
    console.error('Failed to update message count:', updateMessageCountResult.error);
    // Handle failed message update here
  }
  
  const latestMessage = messages[messages.length - 1].content
  console.log(`Latest message: ${latestMessage}`)
  
  const productRecommendationResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": "You are a knowledgable shopping assistant who can only recommend product categories. Given a users input, perform the following: 1. Determine what features and product category to recommend based on the users input. Be semi-concise."},
      {role: "user", content: latestMessage}
    ],
  });
  const productRecommendationMessage = productRecommendationResponse.data.choices[0].message.content
  console.log(`Product recommendation message: ${productRecommendationMessage}`)
  
  const productQueryResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": "Given a recommended product category and or features, perform the following: 1. Return a general mock product title and concise general description that would represent the users input."},
      {role: "user", content: productRecommendationMessage}
    ],
  });
  const productQueryMessage = productQueryResponse.data.choices[0].message.content
  console.log(`Product query message: ${productQueryMessage}`)
  
  const productQueryVector = await embed(productQueryMessage, shop);
  console.log(`Product query vector: ${productQueryVector}`);
  
  const productMatches= await pineconeQuery(productQueryVector, shop);
  console.log(`product matches: ${JSON.stringify(productMatches)}`);
  const productScores = productMatches.map(match => {
    return match.score
  })
  
  const assitantResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": `An expert shopping assistant recommended this product category and features for the user's latest chat message: ${productRecommendationMessage}
      A product search was performed and products with the following scores were found: ${productScores}. A score above 0.86 is generally considered relevant.
      Determine the best response for the user's latest message given all of this information.`},
      ...messages
    ],
  });
  const assistantMessage = assitantResponse.data.choices[0].message.content
  console.log(`Assistant Message: ${assistantMessage}`)

  //const response = await getProductData('gid://shopify/Product/8417361428784')
  //const data = [response, response]
  // Define the response message

  // Return the response
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: 'assistant',
      content: assistantMessage,
    }),
  };
};

const updateMessageCount = async (shop) => {
  const params = {
    secretArn: 'arn:aws:secretsmanager:us-east-1:076345013651:secret:rds-db-credentials/cluster-GVZCGGLJETYQ76TA5CBDPYTSNU/postgres/1690854708363-h74Q3Z',
    resourceArn: 'arn:aws:rds:us-east-1:076345013651:cluster:shopify-app-dev-db',
    sql: `INSERT INTO messages (shop)
          VALUES (:shop);
          `,
    parameters: [
        { name: 'shop', value: { stringValue: shop } },
    ],
    database: 'shopify_app_dev_db'
  };

  const command = new ExecuteStatementCommand(params);
  try {
      await client.send(command);
      return { success: true };
  } catch (error) {
      console.error(error);
      return { success: false, error: error };
  }
}

const embed = async (query, shop) => {
  const embeddingRes = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: query,
    user: shop,
  });

  const values = embeddingRes.data.data[0].embedding;
  return values;
}

const pineconeQuery = async (vector, shop) => {
  try {
    const queryRequest = {
      topK: 5,
      vector: [vector],
      namespace: shop
    };

    const queryResponse = await pineconeIndex.query({ queryRequest });
    console.log(`pinecone query response: ${JSON.stringify(queryResponse)}`);
    return queryResponse.matches;
  } catch (error) {
    console.error(`Error querying Pinecone: ${error}`);
    return null;
  }
};

const getProductData = async (productId) => {
  const params = {
    secretArn: 'arn:aws:secretsmanager:us-east-1:076345013651:secret:rds-db-credentials/cluster-GVZCGGLJETYQ76TA5CBDPYTSNU/postgres/1690854708363-h74Q3Z',
    resourceArn: 'arn:aws:rds:us-east-1:076345013651:cluster:shopify-app-dev-db',
    sql: `SELECT productid, producthandle, active, title, description, imagesrc, imagealt, price, options
          FROM products
          WHERE productID = :productID;
          `,
    parameters: [
        { name: 'productID', value: { stringValue: productId } },
    ],
    database: 'shopify_app_dev_db'
  };
  
  const command = new ExecuteStatementCommand(params);
  try {
      const data = await client.send(command);
  
      if (data.records.length === 0) {
          return {
              statusCode: 404,
              body: JSON.stringify({ message: 'No record found.' }),
          };
      }
  
      const record = data.records[0];

      // Assuming the record contains all the columns for the product
      const jsonData = {
          productid: record[0].stringValue,
          producthandle: record[1].stringValue,
          active: record[2].booleanValue,
          title: record[3].stringValue,
          description: record[4].stringValue,
          imagesrc: record[5].stringValue,
          imagealt: record[6].stringValue,
          price: record[7].stringValue,
          options: record[8].stringValue
      };

      return jsonData
  } catch (error) {
      console.error(error);
      return null
  }
}
