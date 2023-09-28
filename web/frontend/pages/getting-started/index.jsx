import {
  Layout,
  Page,
  Text,
  Box
} from "@shopify/polaris";
import { useNavigate, TitleBar } from "@shopify/app-bridge-react";
import GettingStartedCard from "../../components/GettingStartedCard";

export default function GettingStartedPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar
        title="Getting Started"
        breadcrumbs={breadcrumbs}
        primaryAction={{
          content: "Contact Support",
          onAction: () => navigate("/getting-started/contact-us"),
        }}
      />

      <div style ={{margin: '12px'}}>
        <Layout>
          <Layout.Section>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px'}}>
              <div style={{fontWeight: '600', fontSize: '1.3rem'}}>
                <span>Getting Started with </span>
                <span>ShopMate</span>
              </div>
              <Text>Explore tips and tricks to optimize your experience. From installation and customization to support, we've got you covered.</Text>
            </div>
            <Box minHeight="1rem"/>
          </Layout.Section>

          <Layout.Section oneHalf>
            <GettingStartedCard 
              title="Installation Guide"
              body="Learn how to add the AI Assistant to your storefront"
              onClick={() => navigate("/getting-started/installation")}
            />
          </Layout.Section>
          
          <Layout.Section oneHalf>
            <GettingStartedCard 
              title="Customization"
              body="Information on customizing your AI Assistant"
              onClick={() => navigate("/getting-started/customization")}
            />
          </Layout.Section>
  
          <Layout.Section oneHalf>
            <GettingStartedCard 
              title="Setup"
              body="Learn how to add custom knowledge to your Assistant"
              onClick={() => navigate("/getting-started/setup")}
            />
          </Layout.Section>
  
          <Layout.Section oneHalf>
            <GettingStartedCard 
              title="Support"
              body="How to contact us"
              onClick={() => navigate("/getting-started/contact-us")}
            />
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}