import { 
  AlphaCard,
  Box,
  Text,
  VerticalStack
} from "@shopify/polaris"

export default function PricingCard({ primary, title, price, features }) {

  const featuresMarkup = (
    <VerticalStack gap="4">
      {features.map(feature => {
        return (
          <Text>{feature.text}</Text>
        )
      })}
    </VerticalStack>
  )

  return (
    <AlphaCard>
      <Box minHeight={primary ? "28rem" : "22rem"}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
          {primary ? <Text>Most Popular</Text> : null}
          <VerticalStack gap="4">
            <Text variant="heading2xl" as="h3">{title}</Text>
            <div>
              <p style={{fontSize: "2rem", fontWeight: "500"}}>${price}</p>
              <p style={{fontSize: "2rem", fontWeight: "300", color:"grey"}}> /month</p>  
            </div>
          </VerticalStack>

          {featuresMarkup}
          <button>Start trial</button>
        </div>
      </Box>
    </AlphaCard>
  )
}