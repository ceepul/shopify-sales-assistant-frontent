import { embed } from "../openai.js"
import { getShopUrlFromSession } from "./admin-query.js"

// Accepts an array of product objects
export async function formatProductsAsVectors(req, res, productData, shopURL) {
    // Add missing productData error handling here
    if (!productData) console.log("NO DATA")

    const formattedData = productData.map((product) => {
        return (
            `Product Title: ${product.title}.
             Product Description: ${product.description}`
        )
    })

    const embeddingRes = await embed(req, res, formattedData, shopURL)

    const vectors = productData.map((product, index) => {
        console.log(product.id)
        return (
            {
                id: product.id,
                values: embeddingRes.data[index].embedding,
                metadata: {
                    type: "product",
                }
            }
        )
    })

    return vectors
}

export async function generateMessageUI(data) {
  /* Takes in an array of objects and formats them to messages */
  // If text - 
  // If product -
  // else null
}