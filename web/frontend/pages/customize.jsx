import { TitleBar, Loading } from "@shopify/app-bridge-react"
import { 
  Frame,
  Page,
  Layout,
  SkeletonBodyText,
  AlphaCard,
  Text,
  Box,
  VerticalStack,
  SkeletonDisplayText,
  Banner,
  Toast,
} from "@shopify/polaris"
import CustomizeUIForm from "../components/CustomizeUIForm";
import WidgetDynamicUI from "../components/WidgetDynamicUI";
import { useAppQuery, useAuthenticatedFetch } from '../hooks'
import { useEffect, useState, useCallback } from "react";
 
export default function CustomizePage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [toastActive, setToastActive] = useState(false);
  const toggleToast = useCallback(() => {
    setToastActive((active) => !active)
  }, []);

  const [preferences, setPreferences] = useState({
    storeInfo: "",
    assistantName: "ShopMate",
    accentColour: "#47AFFF",
    darkMode: false,
    homeScreen: true,
    welcomeMessage: "Welcome to our store! Are there any products I could help you find?",
  });

  const authFetch = useAuthenticatedFetch()

  const fetchPreferences = async () => {
    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/preferences?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      setError({
        status: true, 
        title: "Could not fetch preferences", 
        body: "There was a problem retriving your preferences. Please try again later."
      })
      return preferences;
    }
    
    const data = await response.json();
    return data;
  };

  const refetchPreferences = () => {
    setError({
      status: false,
      title: "",
      body: ""
    });
    setIsLoading(true);
    fetchPreferences()
      .then((data) => {
        setPreferences(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError({
          status: true, 
          title: "Could not fetch preferences", 
          body: "There was a problem retriving your preferences. Please try again later."
        })
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPreferences()
      .then((data) => {
        setPreferences(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError({
          status: true, 
          title: "Could not fetch preferences", 
          body: "There was a problem retriving your preferences. Please try again later."
        })
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Page>
        <TitleBar
          title="Edit QR code"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading/>
        <Layout>
          <Layout.Section>
            <VerticalStack gap="4">
              <Text variant="headingLg" as="h5">Settings</Text>
              <AlphaCard>
                <Text variant="headingMd" as="h6">Assistant Name</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText />
  
                <Box minHeight="2rem" />
  
                <Text variant="headingMd" as="h6">Accent Color</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText />
  
  {/*               <Box minHeight="2.5rem" />
  
                <Text variant="headingMd" as="h6">Dark Mode</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText /> */}
  
                <Box minHeight="2.5rem" />
  
                <Text variant="headingMd" as="h6">Home Screen</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText />
              </AlphaCard>
            </VerticalStack>
          </Layout.Section>
          <Layout.Section secondary>
            <VerticalStack gap="4">
              <Text variant="headingLg" as="h5">Preview</Text>
              <AlphaCard>
                <SkeletonDisplayText />
                <Box minHeight="1rem"/>
                <SkeletonBodyText />
              </AlphaCard>
            </VerticalStack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Frame>
      <Page>
          <TitleBar
            title="Customize"
            breadcrumbs={breadcrumbs}
            primaryAction={null}
          />
          {toastActive && <Toast content="Preferences Updated" onDismiss={toggleToast} />}
          <Layout>
  
            {/*Error banner */}
            {error.status === true && 
              <Layout.Section fullWidth>
                <Banner 
                  title={error.title} 
                  onDismiss={() => {setError({status: false, title: "", body: ""})}}
                  status="critical"
                >
                    <p>{error.body}</p>
                </Banner>
              </Layout.Section>}
  
            <Layout.Section>
              <VerticalStack gap="4">
                <Text variant="headingLg" as="h5">Settings</Text>
                <CustomizeUIForm
                  preferences={preferences}
                  resetPreferences={refetchPreferences}
                  setPreferences={setPreferences}
                  setError={setError}
                  toggleToast={toggleToast}
                />
              </VerticalStack>
            </Layout.Section>
            <Layout.Section secondary>
              <VerticalStack gap="4">
                <Text variant="headingLg" as="h5">Preview</Text>
                <WidgetDynamicUI preferences={preferences}/>
              </VerticalStack>
            </Layout.Section>
          </Layout>
      </Page> 
    </Frame>
  )
}