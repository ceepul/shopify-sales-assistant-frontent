import { TitleBar, Loading } from "@shopify/app-bridge-react"
import { 
  AlphaCard,
  Layout,
  Page,
  Text,
  Box
} from "@shopify/polaris";
import { useState } from "react";
import PricingCard from "../components/PricingCard";

export default function PlanPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const [isLoading, setIsLoading] = useState(false)

  const loadingMarkup = isLoading ? (
    <Loading/>
  ) : null

  const pageMarkup = !isLoading ? (
    <AlphaCard>
      <div style={{marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4rem"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem"}}>
          <Text variant="heading2xl" as="h3">
            Find the right plan for your business
          </Text>
          <Text variant="bodyLg" as="p">
            Start with a 14-day free trial. Cancel at anytime.
          </Text>
        </div>
        <Layout>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                active={true}
                title={"Starter"}
                price={49}
                features={['2000 messages per month', 'Seamless integration', 'UI customization']}
              />
            </div>
          </Layout.Section>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                active={false}
                primary
                title={"Entreprenuer"}
                price={129}
                features={['6000 messages per month', 'Seamless integration', 'UI customization']}
              />
            </div>
          </Layout.Section>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                active={false}
                title={"Scale"}
                price={299}
                features={['20000 messages per month', 'Seamless integration', 'UI customization']}
              />
            </div>
          </Layout.Section>
        </Layout>
      </div>
    </AlphaCard>
  ) : null

  return (
    <Page fullWidth>
      <TitleBar
        title="Edit QR code"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      {loadingMarkup}
      {pageMarkup}
    </Page>
  )
}