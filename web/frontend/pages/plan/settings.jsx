import { TitleBar, Loading, useAuthenticatedFetch, useNavigate } from "@shopify/app-bridge-react"
import { 
  AlphaCard,
  Layout,
  Page,
  Text,
  SkeletonBodyText,
  SkeletonDisplayText,
  Box,
  Banner,
  ButtonGroup,
  Button,
  Modal,
  Spinner,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import PricingCard from "../../components/PricingCard";

export default function PlanSettingsPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }, { content: "Plan", url: "/plan" }];

  const authFetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [currentPlanDetails, setCurrentPlanDetails] = useState(null)

  const [shop, setShop] = useState('')
  const [shopData, setShopData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [pageLoadError, setPageLoadError] = useState(false)
  const [showCancelPlanModal, setShowCancelPlanModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [planCancelled, setPlanCancelled] = useState(false);

  const fetchShop = async () => {
    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    return shop
  }

  const fetchCurrentPlanDetails = async () => {
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/current-plan?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })  
      if (!response.ok) {
        setError({ 
          status: true, 
          title: "Failed to get current plan data", 
          body: "Please try again later." 
        })
        return null;
      }

      setError({ status: false, title: "", body: "" })
      const data = await response.json();
      return data;
    } catch (error) {
      setError({ 
        status: true, 
        title: "Failed to get current plan data", 
        body: "Please try again later." 
      })
      return null;
    }
  }

  const fetchShopData = async () => {
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/data?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })  
      if (!response.ok) {
        setError({ 
          status: true, 
          title: "Failed to get current plan data", 
          body: "Please try again later." 
        })
        return null;
      }

      setError({ status: false, title: "", body: "" })
      const data = await response.json();
      return data;
    } catch (error) {
      setError({ 
        status: true, 
        title: "Failed to get current plan data", 
        body: "Please try again later." 
      })
      return null;
    }
  }

  useEffect(() => {
    setIsLoading(true);

    fetchShop()
      .then((shop) => {
        setShop(shop);
      })
      .catch((err) => {
        setError({ 
          status: true, 
          title: "Failed to get current plan data", 
          body: "Please try again later." 
        })
      });  
  }, []);

  useEffect(() => {
    if (shop) { // Only run if shop is not an empty string
      fetchShopData().then(res => {
        setShopData(res);
      });
      fetchCurrentPlanDetails().then(res => {
        setCurrentPlanDetails(res);
      })
      setIsLoading(false)
    }
  }, [shop]);

  const openModal = () => setShowCancelPlanModal(true);
  const closeModal = () => setShowCancelPlanModal(false);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const confirmCancelSubscription = async () => {
    try {
      setModalLoading(true);

      const response = await authFetch("/api/billing/cancel-subscription", {
        method: "POST",
        body: JSON.stringify({ subscriptionId: shopData.graphqlPlanId }),
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        setError({ 
          status: true, 
          title: "Failed to cancel subscription", 
          body: "Please try again later." 
        })
        await delay(1500);
        setModalLoading(false);
        setShowCancelPlanModal(false);
        return
      }


      setError({ status: false, title: "", body: "" })
      await delay(1500);

      setPlanCancelled(true)
      setModalLoading(false);
      
    } catch (error) {
      setError({ 
        status: true, 
        title: "Failed to cancel subscription", 
        body: "Please try again later." 
      })
      await delay(1500);
      setModalLoading(false);
      setShowCancelPlanModal(false);
    }
  }

  const handleCancelSubscription = () => {
    openModal();
  }

  const cancelModalMarkup = (
    <Modal
      open={showCancelPlanModal}
      onClose={closeModal}
      title={planCancelled ? "Subscription Cancelled" : "Are you sure?"}
      primaryAction={planCancelled ? 
      {
        content: 'Close',
        onAction: closeModal
      } :
      {
        content: 'Cancel',
        onAction: closeModal
      }}
      secondaryActions={!planCancelled && [
        {
          content: 'Confirm',
          onAction: confirmCancelSubscription,
        },
      ]}
    >
      {modalLoading && 
        <Modal.Section>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Spinner />
          </div>
        </Modal.Section>
      }
      {!modalLoading && planCancelled &&
        <Modal.Section>
          <p>
            You're subscription has been Cancelled. If you wish to continue using the shopping assistant please select a new plan.
          </p>
        </Modal.Section>
      }
      {!modalLoading && !planCancelled &&
        <Modal.Section>
          <p>
            Do you really want to cancel your subscription? Your shopping assistant will no longer appear on your website.
          </p>
        </Modal.Section>
      }
    </Modal>
  );

  const loadingMarkup = isLoading ? (
      <Layout>
        <Loading />
        <Layout.Section fullWidth>
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <AlphaCard>
            <SkeletonBodyText lines={4} />
          </AlphaCard>
        </Layout.Section>
      </Layout>
  ) : null

  const pageLoadErrorMarkup = !isLoading && pageLoadError ? (
    <AlphaCard>
      <div style={{margin: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4rem"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem"}}>
          <Text variant="headingXl" as="h3">
            There was an error loading your plan settings
          </Text>
          <Text variant="bodyLg" as="p">
            Please try again later.
          </Text>
        </div>
      </div>
    </AlphaCard>
  ) : null

  const pageMarkup = !isLoading && !pageLoadError ? (
    <Layout>
      <Layout.Section primary>
        <div style={{paddingInline: '1rem'}}>
          <Text variant="headingXl" as="h3">Your Plan</Text>
          <Box minHeight="1rem"/>
          <AlphaCard>
            <Text variant="bodyLg" as="p">Plan Name:</Text>
            <Text>{currentPlanDetails?.planName}</Text>
            <Box minHeight="1rem"/>
  
            <Text variant="bodyLg" as="p">Plan Status:</Text>
            <Text>{planCancelled ? 'CANCELLED' : shopData?.subscriptionStatus}</Text>
            <Box minHeight="1rem"/>

            {shopData?.subscriptionStatus === 'TRIAL' || shopData?.subscriptionStatus === 'ACTIVE' &&
              <div>
                <Text variant="bodyLg" as="p">{
                  shopData?.subscriptionStatus === 'TRIAL' ? 'Trial End Date:' : 'Subscription Renews:'
                }</Text>
                <Text>{shopData?.subscriptionEndDate}</Text>
                <Box minHeight="1rem"/>
              </div>
            }
  
            <Text variant="bodyLg" as="p">Price:</Text>
            <Text>${currentPlanDetails?.monthlyPrice}</Text>
            <Box minHeight="1rem"/>
  
            <Text variant="bodyLg" as="p">Messages Included:</Text>
            <Text>{currentPlanDetails?.messagesPerMonth}</Text>
            <Box minHeight="1rem"/>
  
            {currentPlanDetails?.usagePrice && 
              <>
                <Text variant="bodyLg" as="p">Price after included messages:</Text>
                <Text>${currentPlanDetails.usagePrice} /message</Text>
                <Box minHeight="1rem"/>
              </>
            }
  
            <Text variant="bodyLg" as="p">Features: </Text>
            {currentPlanDetails?.features?.map((feature, index) => {
              return (
              <div key={index}>
                <Text>- {feature}</Text>
                <Box minHeight="0.5rem"/>
              </div>
              )
            })}
            <Box minHeight="1rem"/>
  
            <Box minHeight="2rem"/>
            <ButtonGroup>
              {shopData?.subscriptionStatus === 'ACTIVE' && !planCancelled &&
                <Button onClick={handleCancelSubscription}>Cancel Subscription</Button>
              }
              <Button primary onClick={() => navigate("/plan")}>Change Plan</Button>
            </ButtonGroup>
  
          </AlphaCard>
        </div>
      </Layout.Section>

      <Layout.Section secondary>
        <Box minHeight="2.75rem"/>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {currentPlanDetails && 
            <PricingCard 
              planId={currentPlanDetails.planId}
              active={shopData?.subscriptionStatus === 'ACTIVE'}
              planName={currentPlanDetails.planName}
              planPrice={currentPlanDetails.monthlyPrice}
              features={currentPlanDetails.features}
              handleSubscribe={() => navigate('/plan')}
            />
          }
        </div>
      </Layout.Section>
    </Layout>
  ) : null

  return (
    <Page fullWidth>
      <TitleBar
        title="Details"
        breadcrumbs={breadcrumbs}
      />
      {/* Error banner */}
      {error.status === true && 
        <>
          <Banner 
            title={error.title} 
            onDismiss={() => {setError({status: false, title: "", body: ""})}}
            status="critical"
          >
              <p>{error.body}</p>
          </Banner>
          <Box minHeight="1rem" />
        </>
      }
      {loadingMarkup}
      {pageMarkup}
      {pageLoadErrorMarkup}
      {cancelModalMarkup}
    </Page>
  )
}