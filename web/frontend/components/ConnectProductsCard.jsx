import {
    AlphaCard,
    Text,
    VerticalStack,
    Button,
    Box
  } from "@shopify/polaris";
import { useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

export default function ConnectProductsCard({productsConnected}) {
    const fetch = useAuthenticatedFetch();
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleConnectProducts = async () => {
        setIsSubmitting(true)

        /* const response = await fetch("/api/upload-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }); */

        setIsSubmitting(false)
        {/*Remove console log before production */}
        //const readable = await response.json()
        //console.log(readable)
    }

    const connectProductsMarkup = (
        <VerticalStack gap="4">
            <Text variant="headingMd" as="h6">
                Connect Products
            </Text>
            <p>
                Enable the assistant to give personalized product reccomendations 
            </p>
            <Box>
                <Button
                    primary
                    loading={isSubmitting}
                    onClick={() => {handleConnectProducts()}}
                >Connect Products</Button>
            </Box>
        </VerticalStack>
      )

    const deleteProductsMarkup = (
        <VerticalStack gap="4">
            <Text variant="headingMd" as="h6">
                All Products Connected!
            </Text>
            <p>
                You're good to go. The assistant will automatically make product reccomendations. 
                If you prefer not to recommend products you may remove them here.
            </p>
            <Box>
                <Button
                    primary
                    destructive
                    loading={isSubmitting}
                    onClick={() => {handleConnectProducts()}}
                >Delete Products</Button>
            </Box>
        </VerticalStack>
      )

    return (
        <AlphaCard >
            {productsConnected ? deleteProductsMarkup : connectProductsMarkup}
        </AlphaCard>
    )
}