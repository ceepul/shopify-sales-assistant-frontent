import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { 
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";

const chatModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.4, // 0 - 1, higher values mean higher randomness
})

export async function getAction(req, res) {
  /*
  Takes in the user's message (String) 
  Returns what action to take.
    1. Default response
    2. Recommend product
    3. - future - 
  */
  const input = await req.body.query
  let action = null;

  const search = (input) => {
    console.log(`Wants to make a search with input: ${input}`)
    action = "product"
    return ("Success")
  }
  
  const defaultResponse = (input) => {
    console.log(`Want to use default response with input ${input}`)
    action = "default"
    return ("Success")
  }

  const tools = [
    new DynamicTool({
      name: "productSearch",
      description: "Call this to search the active store for relevant products.",
      func: (input) => search(input),
    }),
    new DynamicTool({
      name: "defaultResponse",
      description: "Call this to get a default response message.",
      func: (input) => defaultResponse(input),
    }),
  ];

  const agent = await initializeAgentExecutorWithOptions(tools, chatModel, {
    agentType: "chat-zero-shot-react-description",
    returnIntermediateSteps: true,
    maxIterations: 1,
  })
  const agentResponse = await agent.call({ input })
  console.log(agentResponse)

  return action;
}


export async function getProductRecommendation(req, res) {
  /*
  Takes in the user's message (string).
  Returns a product category to recommend (string).
  */
  const input = await req.body.query
  const productRecommendationMessage = (
    "You are a knowledgable shopping assistant who can only recommend product categories. Given a users input, perform the following: " +
    "1. Determine what features and product category to recommend based on the users input. " +
    "Be semi-concise."
  )

  const response = await chatModel.call([
    new SystemChatMessage(productRecommendationMessage),
    new HumanChatMessage(input),
  ])

  return response.text
}


export async function getProductQuery(input) {
  /*
  Takes in a product category (string).\
  Returns a query to find the product (string)
  */
  const productQueryMessage = (
    "Given a recommended product category and or features, perform the following: " +
    "1. Return a general mock product title and concise general description that would represent the users input."
  )

  const response = await chatModel.call([
    new SystemChatMessage(productQueryMessage),
    new HumanChatMessage(input),
  ])

  return response.text
}


export async function checkMatchingProductResponse(req, res) {
  /*
  Takes in products (string w title and description) and a product category. 
  Returns a (boolean) representing whether the products match the product category. 
  */

}
