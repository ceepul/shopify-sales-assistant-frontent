import shopify from "../shopify.js";

export async function getShopUrlFromSession(req, res) {
    return `https://${res.locals.shopify.session.shop}`;
  }

export async function getProduct(req, res) {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

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
    
      /* Query the Shopify GraphQL Admin API */
    const productData = await client.query({
      data: {
        query: PRODUCTS_QUERY,
      },
    });
    // Return an array of just product objects
    return productData.body.data.products.nodes
}
