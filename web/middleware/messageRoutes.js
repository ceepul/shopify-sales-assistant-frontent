import express from "express";
import { ChatOpenAI } from "langchain/chat_models/openai"

export default function applyMessageRoutesEndpoints(app) {
  app.use(express.json());

  app.post("/api/message", async (req, res) => {
    try {
      const message = req.body
      console.log(message)

      // use agent to check if product recommendation is required
      // If yes, get product
      // If no respond with chat message

      res.status(200).send(message);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  }