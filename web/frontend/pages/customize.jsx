import { TitleBar, Loading } from "@shopify/app-bridge-react"
import { 
  Frame,
  Page,
  Layout,
  Banner,
  Toast,
  Box,
} from "@shopify/polaris"
import CustomizeUIForm from "../components/CustomizeUIForm";
import WidgetDynamicUI from "../components/WidgetDynamicUI";
import { useAuthenticatedFetch } from '../hooks'
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
    avatarImageSrc: "default_v1.png",
    greetingLineOne: "Hi There 👋",
    greetingLineTwo: "How can we help?",
    showSupportForm: false,
    supportUrlPath: '',
    showLauncherText: true,
    launcherText: "Hi! Anything I can help you find?"
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
        setPreferences(prevPreferences => ({
          ...prevPreferences,
          ...data
        }));
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
        setPreferences(prevPreferences => ({
          ...prevPreferences,
          ...data
        }));
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

  return (
    <Frame>
      <Page>
          <TitleBar
            title="Customize"
            breadcrumbs={breadcrumbs}
            primaryAction={null}
          />
          {isLoading && <Loading />}
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
              </Layout.Section>
            }
  
            <Layout.Section>
              <CustomizeUIForm
                isLoading={isLoading}
                preferences={preferences}
                resetPreferences={refetchPreferences}
                setPreferences={setPreferences}
                setError={setError}
                toggleToast={toggleToast}
              />
            </Layout.Section>
            <Layout.Section secondary>
              <WidgetDynamicUI 
                isLoading={isLoading}
                fetchedPreferences={preferences}
              />
            </Layout.Section>
          </Layout>
      </Page> 
    </Frame>
  )
}