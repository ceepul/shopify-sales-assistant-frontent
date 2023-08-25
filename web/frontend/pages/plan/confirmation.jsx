import { 
  AlphaCard,
  Box,
  Layout,
  Page,
  Spinner,
  Text,
  Button
} from "@shopify/polaris"
import { TitleBar, useNavigate, useAuthenticatedFetch } from "@shopify/app-bridge-react"
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from "react";

export default function ConfirmationPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];
  const navigate = useNavigate();
  const location = useLocation();
  const authFetch = useAuthenticatedFetch();

  /* 
    Check for shop in query params
    If it doesnt exist or is invalid, redirect
    
    Otherwise show loading state until;
    1. Success -> Show success screen
    2. Error -> Try again
    3. Final Error -> Show Error Message
  */
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const charge_id = searchParams.get('charge_id');

  if (!charge_id) {
    navigate('/'); // redirect if charge_id is not present
    return null; // don't render the component further
  }

  const fetchSubscriptionData = async () => {
    try {
      const response = await authFetch(`/api/billing/subscription-data/${charge_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
  
      console.log(response)

      if (!response.ok) {
        console.error('Response was not okay')
        setIsError(true)
      }

      const data = await response.json()
      return data;

    } catch (error) {
      console.error("Error fetching subscription data: ", error)
      setIsError(true)
    }
  }

  useEffect(() => {
    fetchSubscriptionData().then(data => setSubscriptionData(data))
  }, []);

  console.log(subscriptionData)

  const loadingMarkup = isLoading ? (
    <AlphaCard>
      <div style={{height: '8rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Spinner />
      </div>
    </AlphaCard>
  ) : null

  const errorMarkup = !isLoading && isError ? (
    <AlphaCard>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Text variant="headingLg">There was an error on our end.</Text>
        <Box minHeight="1rem"/>
        <Text variant="bodyMd">Don't worry. Our team has been notified and is looking into the issue.</Text>
        <Box minHeight="1rem"/>
        <Button onClick={() => navigate('/')}>Back to App</Button>
      </div>
    </AlphaCard>
  ) : null

  const successMarkup = !isLoading && !isError ? (
    <AlphaCard>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Text variant="headingLg">Success!</Text>
        <Box minHeight="1rem"/>
        <Text variant="bodyMd">You current plan is now the $CURRENT PLAN HERE</Text>
        <Box minHeight="1rem"/>
        <Button onClick={() => navigate('/')}>Back to App</Button>
      </div>
    </AlphaCard>
  ) : null

  return (
    <Page>
      <TitleBar
        title="Edit QR code"
        breadcrumbs={breadcrumbs}
        primaryAction={{
          content: "Back to App",
          onAction: () => navigate("/")
        }}
      />
      {loadingMarkup}
      {errorMarkup}
      {successMarkup}
    </Page>

  )
}