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
  const breadcrumbs = [{ content: "ShopMate", url: "/" }, { content: "Plan", url: "/plan" }];
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

  const searchParams = new URLSearchParams(location.search);
  const charge_id = searchParams.get('charge_id');

  if (!charge_id) {
    navigate('/'); // redirect if charge_id is not present
    return null; // don't render the component further
  }

  useEffect(() => {
    setIsLoading(false)
  }, []);

  const loadingMarkup = isLoading ? (
    <AlphaCard>
      <div style={{height: '8rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Spinner />
      </div>
    </AlphaCard>
  ) : null

  const successMarkup = !isLoading ? (
    <AlphaCard padding='8'>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <img width='160' src="../assets/home-trophy.png" alt="Trophy Icon" />
        <Text variant="headingXl">Success!</Text>
        <Box minHeight="1rem"/>
        <Text variant="bodyMd">Your current plan has been updated.</Text>
        <Box minHeight="2.5rem"/>
        <Button onClick={() => navigate('/')}>Back to App</Button>
        <Box minHeight="1.5rem"/>
        <Text variant="bodySm">Please note that it may take a few moments for changes to be reflected in the app.</Text>
      </div>
    </AlphaCard>
  ) : null

  return (
    <Page>
      <TitleBar
        title="Confirmation"
        breadcrumbs={breadcrumbs}
        primaryAction={{
          content: "Back to App",
          onAction: () => navigate("/")
        }}
      />
      {loadingMarkup}
      {successMarkup}
    </Page>
  )
}