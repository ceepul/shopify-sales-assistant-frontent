import {
  VerticalStack,
  Text,
  AlphaCard,
  Avatar,
  Box,
  HorizontalStack,
  Divider,
} from "@shopify/polaris";

export default function Preview() {
  
  return (
    <VerticalStack gap="4">
      <Text variant="headingLg" as="h5">
        Preview
      </Text>
      <AlphaCard>
        <VerticalStack gap="4">
          <HorizontalStack gap="4" blockAlign="center">
            <Avatar />
            <Text variant="headingMd" as="h6">ShopMate</Text>
          </HorizontalStack>
  
          <Divider />
          <Box minHeight="20rem"/>
        </VerticalStack>
      </AlphaCard>
    </VerticalStack>
  )
}