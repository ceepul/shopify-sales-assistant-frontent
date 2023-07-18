import shopify from "../shopify.js";
import { embed } from "../openai.js";
import { PineconeDB } from "../pinecone-db.js";

export async function getShopUrlFromSession(req, res) {
  return `https://${res.locals.shopify.session.shop}`;
}

export async function getShopIdFromSession(req, res) {
  return res.locals.shopify.session.id
}

export async function getAllProducts(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  let allProducts = [];
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
            description
            title
            id
          }
        }
      }
    `;

    const productData = await client.query({
      data: {
        query: PRODUCTS_QUERY,
      },
    });

    // Add new products to allProducts
    const newProducts = productData.body.data.products.nodes;
    allProducts = [...allProducts, ...newProducts];

    // Update hasNextPage and cursor for next iteration
    hasNextPage = productData.body.data.products.pageInfo.hasNextPage;
    cursor = productData.body.data.products.pageInfo.endCursor;
  }

  return allProducts;
}
  

export async function getProductById(req, res, ids) {
  /*
    TO DO:
    accepts an array of products ids and returns array of product objects
  */
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const PRODUCT_QUERY = `
      query($id: ID!) {
        product(id: $id) {
          title
          images(first: 1) {
            nodes {
              src
              altText
            }
          }
          description
        }
      }
    `;

  const productData = await client.query({
    data: {
      query: PRODUCT_QUERY,
      variables: { id: ids },
    },
  });

  return productData.body.data.product
}

export async function makeQuery(req, res, query) {
  /*
    Takes in a query (string).
    Queries Pinecone DB
    Returns top k vectors
  */
  // TO DO: Check that the product query / response is coming from the current store
  const topK = 5;
  console.log(`Making query with input: ${query}`)

  try {
    const shopURL = await getShopUrlFromSession(req, res)
    const embeddingRes = await embed(req, res, query, shopURL)

    const vector = embeddingRes.data[0].embedding
    const response = await PineconeDB.query(vector, shopURL, topK)

    return response
  } catch (error) {
    console.log(`Error at admin-query/makeQuery: ${error}`)
    return null
  }
}