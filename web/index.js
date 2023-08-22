// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import 'dotenv/config.js'

import shopify from "./shopify.js";
import { ShopMateDB } from "./shopmate-db.js";

import applyAppDataApiEndpoints from "./middleware/app-data-api.js";
import applyMessageRoutesEndpoints from "./middleware/messageRoutes.js";
import { getAllProducts, getShopUrlFromSession } from "./helpers/admin-query.js";
import { formatProductsAsVectors } from "./helpers/format-data.js";
import { PineconeDB } from "./pinecone-db.js";

import GDPRWebhookHandlers from "./gdpr.js";


const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),


  /* Code to run on app installation, ie. set up metafields and link products  */
  async (req, res, next) => {
    try {
      // Get shop data from session
      const shop = res.locals.shopify.session.shop;

      // Initialize graphQL client
      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      });

      const SHOP_CONTACT_QUERY = `
        {
          shop {
            name
            contactEmail
          }
        }
      `;

      let shopName = '';
      let contactEmail = '';

      try {
        const contactData = await client.query({
          data: {
            query: SHOP_CONTACT_QUERY,
          },
        });

        const data = contactData.body.data.shop;
        shopName = data.name;
        contactEmail = data.contactEmail;

      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
  
      // Create shop in aws database
      const createShopResponse = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop", {
        method: "POST",
        body: JSON.stringify({ shop, shopName, contactEmail }),
        headers: { "Content-Type": "application/json" }
      })
  
      // Connect all the store's products to database 50 at a time
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const PRODUCTS_QUERY = `
          {
            products(first: 50${cursor ? `, after: "${cursor}"` : ""}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                handle
                title
                description(truncateAt: 1500)
                status
                featuredImage {
                  altText
                  src
                }
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                options {
                  name
                  values
                }
              }
            }
          }
        `;

        const productData = await client.query({
          data: {
            query: PRODUCTS_QUERY,
          },
        });

        const newProducts = productData.body.data.products.nodes;

        // Make a POST request to your API with the new products
        const postProductsResponse = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/products", {
          method: "POST",
          body: JSON.stringify({ shop: shop, products: newProducts }),
          headers: { "Content-Type": "application/json" }
        });

        // Check the response status and throw an error if the request was unsuccessful
        if (!postProductsResponse.ok) {
          throw new Error(`API response status: ${postProductsResponse.status}`);
        }

        // Format products as vectors
        const vectorArray = await formatProductsAsVectors(req, res, newProducts, shop)

        // Upsert vectorArray into PineconeDB
        const upsertResponse = await PineconeDB.upsert(vectorArray, shop)
        // Update hasNextPage and cursor for next iteration
        hasNextPage = productData.body.data.products.pageInfo.hasNextPage;
        cursor = productData.body.data.products.pageInfo.endCursor;
      }
  
      console.log("Success!")
      next();
    } catch (error) {
      console.error(`Failed to initialize app: ${error.message}`);
      res.status(500).send(error.message);
    }
  },

  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

applyAppDataApiEndpoints(app);
applyMessageRoutesEndpoints(app);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
