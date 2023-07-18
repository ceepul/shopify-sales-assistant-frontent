import express from "express";
import { 
  getAction,
  getProductRecommendation,
  getProductQuery,
} from "../helpers/langchain.js";
import { makeQuery } from "../helpers/admin-query.js";
import { getProductById } from "../helpers/admin-query.js";

export default function applyMessageRoutesEndpoints(app) {
  app.use(express.json());

  app.post("/api/message", async (req, res) => {
    try {
      const input = await req.body.query
      console.log(`Message received: ${input}`)
  
      // Prepare the headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // Flush the headers to establish SSE with client
  
      const action = await getAction(req, res) // Get action contains action routing logic
      if (action === "product") {
        // Steps for making a product recommendation go here
        console.log("Generating product recommendation response")
        const recommendationResponse = await getProductRecommendation(req, res)
  
        // Send the recommendation response
        const recommendationMessage = {
          type: "text",
          role: "assistant",
          content: recommendationResponse,
        };
        res.write(`data: ${JSON.stringify(recommendationMessage)}\n\n`);
  
        console.log("Generating product query")
        const productQuery = await getProductQuery(recommendationResponse)
        
        const queryResponse = await makeQuery(req, res, productQuery)
        const matches = queryResponse.matches
  
        /* 
          Logic to decide the number of products to recommend below 
        */
        const relevantMatches = matches.filter(match => matches[0].score - match.score < 0.02);
  
        for (let match of relevantMatches) {
          const productData = await getProductById(req, res, match.id)
  
          const productMessage = {
            type: "product",
            role: "assistant",
            content: productData,
          }
          
          // Write the product data to the stream
          res.write(`data: ${JSON.stringify(productMessage)}\n\n`);
        }
      } else {
        // Return a default response
      }
  
      res.end()
  
    } catch (error) {
      console.log(`Error at /api/message: ${error}`)
      res.status(500).send(error);
    }
  });
  


  app.post("/api/search", async (req, res) => {
    try {
      const query = await req.body.query
      console.log(`Query recieved: ${query}`)

      res.status(200).send({response: "TO DO"})
    } catch (error) {
      console.log(`Error at /api/search: ${error}`)
      res.status(500).send(error)
    }  
  })
}