import {
  AlphaCard,
  Box,
  Text,
  Spinner,
  Badge,
} from "@shopify/polaris";


export default function StatCardSmall({ heading, headingData, subHeading, badgeStatus, badgeData }) {
  const markup = heading && headingData && subHeading ? (
    <AlphaCard>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
        <Text variant="bodyLg">{heading}</Text>
        {badgeStatus && badgeData && <Badge status={badgeStatus}>{badgeData}</Badge>}
      </div>
      <Box minHeight="0.5rem"/>
      {headingData}
      <Box minHeight="0.3rem"/>
      <Text variant="bodySm">{subHeading}</Text>
    </AlphaCard>
  ) : (
    <AlphaCard>
      <div style={{minHeight: '4.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Spinner />
      </div>
    </AlphaCard>
  )

  return markup
}