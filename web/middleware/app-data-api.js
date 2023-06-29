import express from "express";
import shopify from "../shopify.js";
import { getProduct } from "../helpers/admin-query.js";
import { formatProductsAsVectors } from "../helpers/format-data.js";
import { PineconeDB } from "../pinecone-db.js";
import { getShopUrlFromSession } from "../helpers/admin-query.js";

export default function applyAppDataApiEndpoints(app) {
    app.use(express.json());
  
    app.post("/api/upload-products", async (req, res) => {
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
    
    app.delete("/api/delete-products", async (req, res) => {
        try {
            const response = await PineconeDB.delete(
                ["gid://shopify/Product/8417361166640", "gid://shopify/Product/8417361199408"],
                "https://ceepul-dev-store.myshopify.com"
            )
            res.status(200).send(response);
        } catch (error) {
            res.status(500).send(error.message);
        }
    })
}