import {
  AlphaCard,
  SkeletonDisplayText,
  SkeletonBodyText,
  Divider,
  Box,
} from "@shopify/polaris";


export default function PlaceholderStatSmall() {
  return (
      <AlphaCard>
          <SkeletonDisplayText/>
          <Box minHeight="2em"/>
          <SkeletonBodyText lines={2} />
          <Box minHeight="2em"/>
          <Divider padding="4" />
      </AlphaCard>
  )
}