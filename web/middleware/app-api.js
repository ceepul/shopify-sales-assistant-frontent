import express from "express";
import shopify from "../shopify.js";

const PRODUCTS_QUERY = `{
    products(first: 50) {
      nodes {
        description
        title
        id
      }
      pageInfo {
        endCursor
      }
    }
  }
`;

export default function applyAppApiEndpoints(app) {
  app.use(express.json());

  app.get("/api/product-data", async (req, res) => {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    /* Fetch shop data, including all available discounts to list in the QR code form */
    const shopData = await client.query({
      data: {
        query: PRODUCTS_QUERY,
      },
    });

    res.send(shopData.body.data);
  });
}
