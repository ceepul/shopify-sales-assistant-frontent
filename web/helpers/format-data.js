import { embed } from "../openai.js"

// Accepts an array of product objects
export async function formatProductsAsVectors(req, res, productData, shopURL) {
    // Add missing productData error handling here
    if (!productData) {
      console.error("No data")
      return
    };

    const formattedData = productData.map((product) => {
        return (
            `Product Title: ${product.title}.
             Product Description: ${product.description}.
             Tags: ${product.tags.join(', ')}.
             Options: ${product.options.map(option => `${option.name}: ${option.values.join(', ')}`).join('; ')}`
        );
    });

    const embeddingRes = await embed(req, res, formattedData, shopURL);

    const vectors = productData.map((product, index) => {
        return {
            id: product.id,
            values: embeddingRes.data[index].embedding,
            metadata: {
                type: "product",
                ...product.priceRangeV2.maxVariantPrice.amount && { maxPrice: product.priceRangeV2.maxVariantPrice.amount },
                ...product.priceRangeV2.minVariantPrice.amount && { minPrice: product.priceRangeV2.minVariantPrice.amount },
                ...product.status && { status: product.status }
            }
        }
    });

    return vectors;
}