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
    <Layout>
      <Layout.Section fullWidth>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem"}}>
          <Text variant="heading2xl" as="h3">
            Plans that fit your need
          </Text>
          <Text variant="bodyLg" as="p">
            Start with a 14-day free trial. Cancel at anytime.
          </Text>
        </div>
      </Layout.Section>
      <Layout.Section oneThird>
        <PricingCard 
          title={"Starter"}
          price={49}
          features={[
            {
              text: "1000 messages per month",
            },
            {
              text: "unlimited product recommendations",
            },
            {
              text: "custom website intigration",
            }
          ]}
        />
      </Layout.Section>
      <Layout.Section oneThird>
        <PricingCard 
          primary
          title={"Entreprenuer"}
          price={129}
          features={[
            {
              text: "5000 messages per month",
            },
            {
              text: "unlimited product recommendations",
            },
            {
              text: "custom website intigration",
            }
          ]}
        />
      </Layout.Section>
      <Layout.Section oneThird>
      <PricingCard 
          title={"Scale"}
          price={299}
          features={[
            {
              text: "15000 messages per month",
            },
            {
              text: "unlimited product recommendations",
            },
            {
              text: "custom website intigration",
            }
          ]}
        />
      </Layout.Section>
    </Layout>
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