// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import 'dotenv/config.js'

import shopify from "./shopify.js";
import applyQrCodeApiEndpoints from "./middleware/qr-code-api.js";
import applyAppApiEndpoints from "./middleware/app-api.js";
import applyAppDataApiEndpoints from "./middleware/app-data-api.js";

import GDPRWebhookHandlers from "./gdpr.js";

import applyQrCodePublicEndpoints from "./middleware/qr-code-public.js";


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

  /* Code to run on app installation, ie. set up metafields and link products 
  async(req, res, next) => {

    next();
  },
  */

  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

applyQrCodePublicEndpoints(app);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

applyAppApiEndpoints(app);
applyQrCodeApiEndpoints(app);
applyAppDataApiEndpoints(app);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
