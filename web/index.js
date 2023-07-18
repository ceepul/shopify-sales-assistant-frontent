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
      const shopId = res.locals.shopify.session.id;
      const shop = res.locals.shopify.session.shop;
  
      // Create shop in ShopMateDB
      ShopMateDB.create({ id: shopId, shop: shop })
  
      // Get products
      const products = await getAllProducts(req, res)
  
      // Get shop URL
      const shopURL = await getShopUrlFromSession(req, res)
  
      // Format products as vectors
      const vectorArray = await formatProductsAsVectors(req, res, products, shopURL)
  
      // Upsert vectorArray into PineconeDB
      const upsertResponse = await PineconeDB.upsert(vectorArray, shopURL)

      // Add each product to ShopMateDB
      for (const product of products) {
        await ShopMateDB.addProduct({
          productID: product.id,
          shopID: shopId,
          active: true,
          totalRecommendations: 0, 
          totalAddToCart: 0,
        });
      }
  
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
