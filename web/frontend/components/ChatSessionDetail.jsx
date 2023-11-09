import {
  AlphaCard,
  SkeletonDisplayText,
  SkeletonBodyText,
  Divider,
  Box,
  Spinner,
  HorizontalStack
} from "@shopify/polaris";

export default function ChatSessionDetail({ isLoading }) {
  return isLoading ? (
    <Box minHeight="90vh">
      <SkeletonBodyText lines={2}/>
    </Box>
  ) : (
    <Box minHeight="90vh">
      <SkeletonDisplayText/>
      <Box minHeight="6em"/>
      <SkeletonBodyText lines={2} />
      <Box minHeight="6em"/>
      <Divider padding="4" />
    </Box>
  )
}