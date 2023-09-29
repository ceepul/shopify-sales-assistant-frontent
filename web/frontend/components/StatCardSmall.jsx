import {
  AlphaCard,
  Box,
  Text,
  Spinner,
  Badge,
} from "@shopify/polaris";


export default function StatCardSmall({ loading, heading, headingData, subHeading, badgeStatus, badgeData, icon }) {
  const loadingMarkup = (
    <AlphaCard>
      <div style={{minHeight: '4.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Spinner />
      </div>
    </AlphaCard>
  )

  const markup = heading && headingData && subHeading ? (
    <AlphaCard>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <Text variant="bodyLg">{heading}</Text>
          {badgeStatus && badgeData && <Badge status={badgeStatus}>{badgeData}</Badge>}
        </div>
        {icon && <div>{icon}</div>}
      </div>
      {!badgeStatus && <Box minHeight="0.2rem" />}
      <Box minHeight="0.5rem"/>
      {headingData}
      <Box minHeight="0.3rem"/>
      <Text variant="bodySm">{subHeading}</Text>
    </AlphaCard>
  ) : (
    <AlphaCard>
      <div style={{minHeight: '4.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Text>Could not load statistic.</Text>
      </div>
    </AlphaCard>
  )

  return loading ? loadingMarkup : markup;
}