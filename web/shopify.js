import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

import sqlite3 from "sqlite3";
import { join } from "path";
import { QRCodesDB } from "./qr-codes-db.js";

import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeDB } from "./pinecone-db.js";

const database = new sqlite3.Database(join(process.cwd(), "database.sqlite"));

// Initialize SQLite DB
QRCodesDB.db = database;
QRCodesDB.init();

const pinecone = new PineconeClient();
await pinecone.init({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});

PineconeDB.db = pinecone;
PineconeDB.index = pinecone.Index("shopify-app-data"); // *** This should be made scalable in the future 

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(database),
});

export default shopify;
