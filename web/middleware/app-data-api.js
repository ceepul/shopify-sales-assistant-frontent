import express from "express";

export default function applyAppDataApiEndpoints(app) {
    app.use(express.json());

    app.get("/api/shop", async (req, res) => {
      res.status(200).send(res.locals.shopify.session.shop);
    });
}