import express from "express";
import shopify from "../shopify.js";
import { getProduct, getProductById } from "../helpers/admin-query.js";
import { formatProductsAsVectors } from "../helpers/format-data.js";
import { PineconeDB } from "../pinecone-db.js";
import { getShopUrlFromSession } from "../helpers/admin-query.js";
import { embed } from "../openai.js";

export default function applyAppDataApiEndpoints(app) {
    app.use(express.json());
  
    app.post("/api/products", async (req, res) => {
        try {
            const products = await getProduct(req, res)

            const shopURL = await getShopUrlFromSession(req, res)
            const vectorArray = await formatProductsAsVectors(req, res, products, shopURL)

            const upsertResponse = await PineconeDB.upsert(vectorArray, shopURL);

            res.status(201).send(upsertResponse);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
    
    app.post("/api/productInfo", async (req, res) => {
      try {
        const productsData = await getProductById(req, res)

        res.status(200).send(productsData);
      } catch (error) {
        res.status(500).send(error.message);
      }
    })

    app.delete("/api/products", async (req, res) => {
        try {
            const response = await PineconeDB.delete(
                ["gid://shopify/Product/8417361166640", "gid://shopify/Product/8417361199408"],
                "https://ceepul-dev-store.myshopify.com"
            )
            res.status(200).send(response);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

    app.post("/api/query", async (req, res) => {
      try {
        console.log(req.body)
        const query = req.body.query

        const shopURL = await getShopUrlFromSession(req, res)
        const embeddingRes = await embed(req, res, query, shopURL)

        const vector = embeddingRes.data[0].embedding
        const response = await PineconeDB.query(vector, shopURL)

        res.status(200).send(JSON.stringify(response))
      } catch (error) {
        console.log(`Error at /api/query: ${error}`)
        res.status(500).send(error.message)
      }
    });
}