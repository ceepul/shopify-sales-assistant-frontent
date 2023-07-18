import sqlite3 from "sqlite3";
import path from "path";
import shopify from "./shopify.js";

const DEFAULT_DB_FILE = path.join(process.cwd(), "shopmate_db.sqlite");

export const ShopMateDB = {
  shopsTableName: "shops",
  productsTableName: "products",
  plansTableName: "plans",
  messagesTableName: "messages",
  sessionsTableName: "sessions",
  recommendationEventsTableName: "recommendationEvents",
  addToCartEventsTableName: "addToCartEvents",
  productViewEventsTableName: "productViewEvents",

  db: null,
  ready: null,

  create: async function ({ id, shop }) {
    await this.ready;
  
    const shopID = id
    const shopDomain = shop
    const storeInfo = '';
    const assistantName = 'ShopMate';
    const accentColour = '#47AFFF';
    const lightMode = true;
    const welcomeMessage = 'Welcome to our shop!';
    const homeScreen = true;
    const planID = 1;
    const overLimit = false;
  
    const query = `
      INSERT INTO ${this.shopsTableName}
      (ShopID, ShopDomain, StoreInfo, AssistantName, AccentColour, LightMode, WelcomeMessage, HomeScreen, PlanID, OverLimit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id;
    `;
  
    const rawResults = await this.__query(query, [
      shopID,
      shopDomain,
      storeInfo,
      assistantName,
      accentColour,
      lightMode ? 1 : 0,
      welcomeMessage,
      homeScreen ? 1 : 0,
      planID,
      overLimit ? 1 : 0
    ]);
  
    return rawResults[0].id;
  },
  

  readShop: async function (shopID) {
    await this.ready;
  
    const query = `
      SELECT * FROM ${this.shopsTableName} WHERE ShopID = ?
    `;
  
    const rows = await this.__query(query, [shopID]);
  
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  },  

  update: async function (id, shop) {
    await this.ready;

    const query = `
      UPDATE ${this.shopsTableName}
      SET
        StoreInfo = ?,
        AssistantName = ?,
        AccentColour = ?,
        LightMode = ?,
        WelcomeMessage = ?,
        HomeScreen = ?,
        PlanID = ?,
        OverLimit = ?
      WHERE
        ShopID = ?;
    `;

    await this.__query(query, [
      shop.storeInfo,
      shop.assistantName,
      shop.accentColour,
      shop.lightMode ? 1 : 0,
      shop.welcomeMessage,
      shop.homeScreen ? 1 : 0,
      shop.planID,
      shop.overLimit ? 1 : 0,
      id
    ]);

    return true;
  },

  setShopOverLimit: async function (shopID, overLimit) {
    await this.ready;
  
    const query = `
      UPDATE ${this.shopsTableName}
      SET OverLimit = ?
      WHERE ShopID = ?;
    `;
  
    await this.__query(query, [overLimit ? 1 : 0, shopID]);
  
    return true;
  },
  
  updateShopPreferences: async function (shopID, color, lightMode, welcomeMessage, homeScreen) {
    await this.ready;
  
    const query = `
      UPDATE ${this.shopsTableName}
      SET
        AccentColour = ?,
        LightMode = ?,
        WelcomeMessage = ?,
        HomeScreen = ?
      WHERE
        ShopID = ?;
    `;
  
    await this.__query(query, [
      color,
      lightMode ? 1 : 0,
      welcomeMessage,
      homeScreen ? 1 : 0,
      shopID
    ]);
  
    return true;
  },  

  addProduct: async function (product) {
    await this.ready;
  
    const query = `
      INSERT INTO ${this.productsTableName} (ProductID, ShopID, Active, TotalRecommendations, TotalAddToCart, TotalProductViews)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    await this.__query(query, [
      product.productID,
      product.shopID,
      product.active ? 1 : 0,
      product.totalRecommendations,
      product.totalAddToCart,
      product.totalProductViews,
    ]);
  
    return true;
  },

  updateProduct: async function (productID, recommendations, addCart, productViews) {
    await this.ready;
    const query = `
      UPDATE ${this.productsTableName}
      SET
        TotalRecommendations = ?,
        TotalAddToCart = ?,
        TotalProductViews = ?
      WHERE
        ProductID = ?;
    `;
    await this.__query(query, [
      recommendations,
      addCart,
      productViews,
      productID,
    ]);
    return true;
  },  

  removeProduct: async function (productID) {
    await this.ready;
  
    const query = `
      DELETE FROM ${this.productsTableName} WHERE ProductID = ?
    `;
  
    await this.__query(query, [productID]);
  
    return true;
  },

  addMessage: async function (shopID) {
    await this.ready;

    let query = `
      INSERT INTO ${this.messagesTableName} (ShopID)
      VALUES (?)
    `;
    await this.__query(query, [shopID]);
  
    return true;
  },  

  addSession: async function (shopID) {
    await this.ready;
  
    const query = `
      INSERT INTO ${this.sessionsTableName} (ShopID)
      VALUES (?)
    `;
  
    await this.__query(query, [shopID]);
  
    return true;
  },

  endSession: async function (shopID) {
    await this.ready;
  
    const query = `
      UPDATE ${this.sessionsTableName}
      SET SessionEnd = datetime(CURRENT_TIMESTAMP, 'localtime')
      WHERE ShopID = ? AND SessionEnd IS NULL
    `;
  
    await this.__query(query, [shopID]);
  
    return true;
  },

  addRecommendationEvent: async function (shopID, productID) {
    await this.ready;
  
    const insertQuery = `
      INSERT INTO ${this.recommendationEventsTableName}
      (ShopID, ProductID)
      VALUES (?, ?);
    `;
    await this.__query(insertQuery, [shopID, productID]);
  
    const updateQuery = `
      UPDATE ${this.productsTableName}
      SET TotalRecommendations = TotalRecommendations + 1
      WHERE ProductID = ?;
    `;
    await this.__query(updateQuery, [productID]);
  
    return true;
  },
  
  addAddToCartEvent: async function (shopID, productID) {
    await this.ready;
  
    const query = `
      INSERT INTO ${this.addToCartEventsTableName}
      (ShopID, ProductID)
      VALUES (?, ?);
    `;
  
    await this.__query(query, [shopID, productID]);
  
    return true;
  },
  
  addProductViewEvent: async function (shopID, productID) {
    await this.ready;
  
    const query = `
      INSERT INTO ${this.productViewEventsTableName}
      (ShopID, ProductID)
      VALUES (?, ?);
    `;
  
    await this.__query(query, [shopID, productID]);
  
    return true;
  },
  

  deleteShop: async function (shopID) {
    await this.ready;
  
    let query = `DELETE FROM ${this.shopsTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);
  
    query = `DELETE FROM ${this.productsTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);
  
    query = `DELETE FROM ${this.messagesTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);
  
    query = `DELETE FROM ${this.sessionsTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);

    query = `DELETE FROM ${this.recommendationEventsTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);

    query = `DELETE FROM ${this.addToCartEventsTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);

    query = `DELETE FROM ${this.productViewEventsTableName} WHERE ShopID = ?`;
    await this.__query(query, [shopID]);
  
    return true;
  },  

  init: async function () {
    this.db = this.db ?? new sqlite3.Database(DEFAULT_DB_FILE);

    const hasShopsTable = await this.__hasTable(this.shopsTableName);
    const hasProductsTable = await this.__hasTable(this.productsTableName);
    const hasPlansTable = await this.__hasTable(this.plansTableName);
    const hasMessagesTable = await this.__hasTable(this.messagesTableName);
    const hasSessionsTable = await this.__hasTable(this.sessionsTableName);
    const hasRecommendationEventsTable = await this.__hasTable(this.recommendationEventsTableName);
    const hasAddToCartEventsTable = await this.__hasTable(this.addToCartEventsTableName);
    const hasProductViewEventsTable = await this.__hasTable(this.productViewEventsTableName);

    // Only create tables if they don't exist
    if (!hasShopsTable) {
      const query = `
        CREATE TABLE ${this.shopsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          ShopDomain VARCHAR(511) NOT NULL,
          StoreInfo TEXT,
          AssistantName VARCHAR(255),
          AccentColour VARCHAR(7),
          LightMode BOOLEAN,
          WelcomeMessage TEXT,
          HomeScreen BOOLEAN,
          PlanID INTEGER,
          OverLimit BOOLEAN,
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      this.ready = this.__query(query);
    }

    if (!hasProductsTable) {
      const query = `
        CREATE TABLE ${this.productsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ProductID VARCHAR(511) NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          Active BOOLEAN,
          TotalRecommendations INTEGER,
          TotalAddToCart INTEGER,
          TotalProductViews INTEGER,
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      await this.__query(query);
    }

    if (!hasPlansTable) {
      const query = `
        CREATE TABLE ${this.plansTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          PlanName VARCHAR(511) NOT NULL,
          MaxMessages INTEGER,
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      await this.__query(query);
    }

    if (!hasMessagesTable) {
      const query = `
        CREATE TABLE ${this.messagesTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          SentAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      await this.__query(query);
    }

    if (!hasSessionsTable) {
      const query = `
        CREATE TABLE ${this.sessionsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          SessionStart DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
          SessionEnd DATETIME
        );
      `;
      await this.__query(query);
    }

    if (!hasRecommendationEventsTable) {
      const query = `
        CREATE TABLE ${this.recommendationEventsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          ProductID VARCHAR(511) NOT NULL,
          RecommendedAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      await this.__query(query);
    }
    
    if (!hasAddToCartEventsTable) {
      const query = `
        CREATE TABLE ${this.addToCartEventsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          ProductID VARCHAR(511) NOT NULL,
          AddedAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      await this.__query(query);
    }
    
    if (!hasProductViewEventsTable) {
      const query = `
        CREATE TABLE ${this.productViewEventsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ShopID VARCHAR(511) NOT NULL,
          ProductID VARCHAR(511) NOT NULL,
          ViewedAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        );
      `;
      await this.__query(query);
    }
  },

  __hasTable: async function (tableName) {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [tableName]);
    return rows.length === 1;
  },

  /* Perform a query on the database. Used by the various CRUD methods. */
  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

};
