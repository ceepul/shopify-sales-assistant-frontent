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
      // Get shop data from session
      const shop = res.locals.shopify.session.shop;
      const accessToken = res.locals.shopify.session.accessToken;

      // Store accessToken
      const storeTokenResponse = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/store-secret", {
        method: "POST",
        body: JSON.stringify({ shop: shop, accessToken: accessToken }),
        headers: { "Content-Type": "application/json" }
      })

      if (!storeTokenResponse.ok) {
        console.error("Error storing token.")
        throw new Error(`API response status: ${storeTokenResponse.status}`);
      }

      console.log("Token stored successfully")

      // Initialize graphQL client
      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      });

      const SHOP_CONTACT_QUERY = `
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

      try {
        const contactData = await client.query({
          data: {
            query: SHOP_CONTACT_QUERY,
          },
        });

        const data = contactData?.body?.data.shop;
        shopName = data.name;
        contactEmail = data.contactEmail;
        console.log(`moneyWithCurrencyFormat: ${data.currencyFormats.moneyWithCurrencyFormat}`)

      } catch (error) {
        console.error("Error fetching contact data:", error);
        throw new Error(`Failed to retrieve shop information.`);
      }
  
      // Create shop in aws database
      const createShopResponse = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop", {
        method: "POST",
        body: JSON.stringify({ shop, shopName, contactEmail }),
        headers: { "Content-Type": "application/json" }
      })

      if (!createShopResponse.ok) {
        console.error(`Failed to create shop for shop: ${shop}`)
        console.log(JSON.stringify(createShopResponse))
        throw new Error(`Failed to initialize shop.`);
      }

      console.log("Shop Created successfully")
  
      // Notify backend to sync products
      const syncProductsRequest = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/sync-products", {
        method: "POST",
        body: JSON.stringify({ shop: shop }),
        headers: { "Content-Type": "application/json" }
      })
      
      if (!syncProductsRequest.ok) {
        console.error(`Failed to product sync for shop: ${shop}`)
        console.log(JSON.stringify(syncProductsRequest))
        throw new Error(`Failed to initialize shop.`);
      }

      console.log("Sync Products Initialized")
  
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
