// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import 'dotenv/config.js'

import shopify from "./shopify.js";

import applyAppApiEndpoints from "./middleware/app-api.js";
import { formatProductsAsVectors } from "./helpers/format-data.js";
import { PineconeDB } from "./pinecone-db.js";

import GDPRWebhookHandlers from "./gdpr.js";
import { error } from "console";


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
      // Variables for retry logic
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 2000;

      // Get shop data from session
      const shop = res.locals.shopify.session.shop;
      const accessToken = res.locals.shopify.session.accessToken;

      // Store accessToken
      let storeTokenRetries = 0;
      while (storeTokenRetries < MAX_RETRIES) {
        try {
          const storeTokenResponse = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/store-secret", {
              method: "POST",
              body: JSON.stringify({ shop: shop, accessToken: accessToken }),
              headers: { "Content-Type": "application/json" }
          });
  
          if (!storeTokenResponse.ok) {
              console.error("Error storing token.")
              throw new Error(`API response status: ${storeTokenResponse.status}`);
          }
  
          // Success, so break out of the retry loop
          console.log("Token stored successfully");
          break;
        } catch (error) {
          storeTokenRetries++;
          console.error(`Store Token Attempt ${storeTokenRetries} failed: ${error}. Retrying...`);
  
          if (storeTokenRetries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * storeTokenRetries)); 
              throw new Error(`Failed to initialize shop.`);
          }
        }
      }
      
      // Initialize graphQL client
      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      });

      const SHOP_QUERY = `
        {
          shop {
            name
            contactEmail
            currencyFormats {
              moneyWithCurrencyFormat
            }
          }
        }
      `;

      let shopName = '';
      let contactEmail = '';
      let currencyFormat = null;

      // Get Shop data from GraphQl
      let graphqlRetries = 0;
      while (graphqlRetries < MAX_RETRIES) {
        try {
          const contactData = await client.query({
            data: {
              query: SHOP_QUERY,
            },
          });

          const data = contactData.body.data.shop;
          shopName = data.name;
          contactEmail = data.contactEmail;
          currencyFormat = data.currencyFormats.moneyWithCurrencyFormat;

          // If the query was successful, break out of the loop
          break;
        } catch (error) {
          graphqlRetries++;
          console.error(`GraphQL Attempt ${graphqlRetries} failed: ${error}. Retrying...`);

          if (graphqlRetries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * graphqlRetries));
          } else {
            console.error("Error fetching contact data:", error);
            throw new Error(`Failed to retrieve shop information.`);
          }
        }
      }
  
      // Create shop in aws database
      let createShopRetries = 0;
      while (createShopRetries < MAX_RETRIES) {
        try {
          const createShopResponse = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop", {
              method: "POST",
              body: JSON.stringify({ shop, shopName, contactEmail, currencyFormat }),
              headers: { "Content-Type": "application/json" }
          });

          if (!createShopResponse.ok) {
              console.error(`Failed to create shop for shop: ${shop}`);
              throw new Error(`API response status: ${createShopResponse.status}`);
          }

          // If the request was successful, break out of the loop
          console.log("Shop Created successfully");
          break;
        } catch (error) {
          createShopRetries++;
          console.error(`Create Shop Attempt ${createShopRetries} failed: ${error}. Retrying...`);

          // Introduce a delay before retrying
          if (createShopRetries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * createShopRetries));
          } else {
              throw new Error(`Failed to initialize shop.`);
          }
        }
      }
  
      // Notify backend to sync products
      let syncProductsRetries = 0;
      while (syncProductsRetries < MAX_RETRIES) {
        try {
          const syncProductsRequest = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/sync-products", {
              method: "POST",
              body: JSON.stringify({ shop: shop }),
              headers: { "Content-Type": "application/json" }
          });

          if (!syncProductsRequest.ok) {
              console.error(`Failed to request product sync for shop: ${shop}`);
              throw new Error(`API response status: ${syncProductsRequest.status}`);
          }

          // If the request was successful, break out of the loop
          console.log("Sync Products Initialized");
          break;
        } catch (error) {
          syncProductsRetries++;
          console.error(`Sync Products Attempt ${syncProductsRetries} failed: ${error}. Retrying...`);

          // Introduce a delay before retrying
          if (syncProductsRetries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * syncProductsRetries));
          } else {
              throw new Error(`Failed to sync products.`);
          }
        }
      }
  
      console.log("Success!")
      next();
    } catch (error) {
      console.error(`Failed to initialize app: ${error}`);
      res.status(500).send(`Failed to initialize app. Please try again.`);
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

applyAppApiEndpoints(app);

app.use(shopify.cspHeaders());

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
