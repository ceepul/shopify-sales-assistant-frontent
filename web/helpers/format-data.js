import { embed } from "../openai.js"

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