import {
  Layout,
  Page,
  AlphaCard,
  Text,
  List,
  Box
} from "@shopify/polaris";
import { useNavigate, TitleBar } from "@shopify/app-bridge-react";
import GettingStartedCard from "../components/GettingStartedCard";

export default function GettingStartedPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar
        title="Getting Started"
        breadcrumbs={breadcrumbs}
      /*primaryAction={{
          content: "Contact Support",
          onAction: () => navigate("/"),
        }} */
      />

      <div style ={{margin: '12px'}}>
        <Layout>
  
          {/* How to Install */}
          <Layout.Section>
            <AlphaCard>
              <Text variant="headingLg">How to Install the Chatbot</Text>
              <Box minHeight="1rem"/>
              <Text variant="headingMd">Step-by-step Installation Guide</Text>
              <Box minHeight="0.5rem"/>
              <List type="number">
                <List.Item>Navigate to 'Online Store' in the Shopify Admin.</List.Item>
                <List.Item>Click to customize your current theme.</List.Item>
                <List.Item>Select the 'App embeds' tab.</List.Item>
                <List.Item>Toggle the slider for the Shopping Assistant app to enable it on your website.</List.Item>
                <List.Item>Configure the app settings as needed from the drop down menu.</List.Item>
              </List>
            </AlphaCard>
          </Layout.Section>
  
          <Layout.Section>
            <AlphaCard>
              <Text variant="headingLg">How to Customize the Chatbot</Text>
              <Box minHeight="1rem"/>
              <Text variant="headingMd">Personalize Your Chatbot</Text>
              <Box minHeight="0.5rem"/>
                <p>
                  To customize your chatbot, go to the 'Customize' tab where you can modify the bot's appearance, welcome message, and provide information about your store. Settings you can adjust include:
                </p>
                <Box minHeight="0.5rem"/>
                <List type="bullet">
                  <List.Item>Assistant name</List.Item>
                  <List.Item>Theme color</List.Item>
                  <List.Item>Avatar icon</List.Item>
                  <List.Item>Welcome message</List.Item>
                  <List.Item>Logo visibility</List.Item>
                </List>
            </AlphaCard>
          </Layout.Section>
  
          <Layout.Section>
            <AlphaCard title="How to Find Statistics" sectioned>
              <Text variant="headingLg">How to Find Statistics</Text>
              <Box minHeight="1rem"/>
              <Text variant="headingMd">Understanding Your Data</Text>
              <Box minHeight="0.5rem"/>
                <p>
                  The 'Statistics' tab provides insights into how customers are interacting with your shopping assistant. You can find metrics such as:
                </p>
                <Box minHeight="0.5rem"/>
                <List type="bullet">
                  <List.Item>Messages sent</List.Item>
                  <List.Item>Products recommended</List.Item>
                  <List.Item>Click-through rate</List.Item>
                  <List.Item>Messages remaining in billing cycle</List.Item>
                </List>
                <Box minHeight="0.5rem"/>
                <p>
                  Use these insights to monitor your shopping assistant to better understand customer engagement.
                </p>
            </AlphaCard>
          </Layout.Section>
  
          <Layout.Section>
              <AlphaCard title="Additional Resources" sectioned>
                  <Text variant="headingLg">Need Help?</Text>
                  <Box minHeight="1rem" />
                  
                  <Text variant="headingMd">Support</Text>
                  <Box minHeight="0.5rem" />
                  
                  <Text>
                      Our dedicated team is always ready to assist. For any queries, please email us at: support@shopmateapp.com.
                  </Text>
                  <Box minHeight="0.5rem" />
              </AlphaCard>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}