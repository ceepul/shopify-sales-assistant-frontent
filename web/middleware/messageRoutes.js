import express from "express";
import { useState } from "react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { 
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";

let productQuery = ""
let initiateProductSearch = false

const queryProducts = async (input) => {
  productQuery = input
  console.log(productQuery)
  initiateProductSearch = true
  return ("Success")
}

const systemClassificationMessage = (
  "You are a knowledgable shopping assistant. Given a users input, perform the following:" +
  "1. Return a boolean representing whether a product recommendation would be acceptable in this situation. " +
  "Return the result in this format: " +
  "{{\"recommend\": <the boolean value from step 1>}}"
)

const productSearchMessage = (
  "You are a knowledgable shopping assistant who can only recommend product categories. Given a users input, perform the following steps in order: " +
  "1. Determine what product(s) to recommend based on the users input. " +
  "2. Create a seatch query that would find the primary product. " +
  "Return the result in this format: " +
  "{{\"res\": <the info from step 1>, " +
  "\"query\": <the search query from step 2>}} "
)

const chatModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.2, // 0 - 1, higher values mean higher randomness
})

const tools = [
  new DynamicTool({
    name: "Store Information",
    description: "Call this to search for information about the current ecommerce website.",
    func: (input) => queryProducts(input),
  }),
];

const agent = await initializeAgentExecutorWithOptions(tools, chatModel, {
  agentType: "chat-zero-shot-react-description",
  returnIntermediateSteps: true,
  maxIterations: 1,
})

export default function applyMessageRoutesEndpoints(app) {
  app.use(express.json());

  app.post("/api/message", async (req, res) => {
    try {
      const message = await req.body.query
      console.log("Attempting call")
      
      const messageClassification = await chatModel.call([
        new SystemChatMessage(systemClassificationMessage),
        new HumanChatMessage(message),
      ])

      const jsonMessageClassification = JSON.parse(messageClassification.text)
      
      if (jsonMessageClassification.recommend) {
        console.log("Product search")
        const response = await chatModel.call([
          new SystemChatMessage(productSearchMessage),
          new HumanChatMessage(message),
        ])
        console.log(response)
        const jsonRes = JSON.parse(response.text)

        return res.status(200).send(jsonRes);
      }
      else {
        console.log("Default response")
        const response = await chatModel.call([
          new SystemChatMessage("You are a helpful shoppping assistant. Only answer questions that would pertain to an eccomerce website."),
          new HumanChatMessage(message),
        ])

        return res.status(200).send({res: response.text});
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
}