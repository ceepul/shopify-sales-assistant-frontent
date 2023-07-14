import express from "express";
import { 
  getAction,
  getProductRecommendation,
  getProductQuery,
} from "../helpers/langchain.js";
import { makeQuery } from "../helpers/admin-query.js";
import { getProductById } from "../helpers/admin-query.js";
import { generateMessageUI } from "../helpers/format-data.js";

export default function applyMessageRoutesEndpoints(app) {
  app.use(express.json());

  app.post("/api/message", async (req, res) => {
    try {
      const input = await req.body.query
      console.log(`Message recieved: ${input}`)

      let messages = []

      const action = await getAction(req, res) // Get action contains action routing logic
      if (action === "product") {
        // Steps for making a product recommendation go here
        console.log("Generating product recomendation response")
        const recommendationResponse = await getProductRecommendation(req, res)
        messages.push({
          type: "text",
          role: "assistant",
          content: recommendationResponse,
        })

        console.log("Generating product query")
        const productQuery = await getProductQuery(recommendationResponse)
      
        const queryResponse = await makeQuery(req, res, productQuery)
        const matches = queryResponse.matches

        /* 
          Logic to decide the number of products to recommend below 
        */
        const relevantMatches = matches.map((match) => {
          if (matches[0].score - match.score < 0.02) {
            return match
          }
          else return null;
        })

        const productData = await getProductById(req, res, relevantMatches[0].id)
        messages.push({
          type: "product",
          role: "assistant",
          content: productData,
        })

        /* Get product data */ // TODO: fix 
        /* await relevantMatches.forEach(async (match) => {
          if (match) {
            const productData = await getProductById(req, res, match.id)
            messages.push({
              type: "product",
              role: "assistant",
              content: productData,
            })
          }
        }) */

      } 
      else {
        // Return a default response
      }

      res.status(200).send(messages)
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