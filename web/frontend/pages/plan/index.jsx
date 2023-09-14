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
  Modal,
  Button,
  TextField,
  VerticalStack,
  Frame,
  Spinner,
  Toast
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import PricingCard from '../../components/PricingCard'

export default function PlanPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const authFetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [planDetails, setPlanDetails] = useState(null)
  const [shop, setShop] = useState('')
  const [shopData, setShopData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [pageLoadError, setPageLoadError] = useState(false)

  const [showContactUsModal, setShowContactUsModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [formSubmitionError, setFormSubmitionError] = useState(false)
  const [formNameError, setFormNameError] = useState(null)
  const [formEmailError, setFormEmailError] = useState(null)
  const [formCompanyError, setFormCompanyError] = useState(null)
  const [formMessageError, setFormMessageError] = useState(null)

  const [toastActive, setToastActive] = useState(false);
  const toggleToast = useCallback(() => {
    setToastActive((active) => !active)
  }, []);

  const handleFormInputChange = (field) => (value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const validateFormName = (value) => {
    if (value.trim() === '') {
      setFormNameError('Name cannot be blank.');
      return false;
    }
    setFormNameError(null);
    return true;
  };

  const validateFormEmail = (value) => {
    if (value.trim() === '') {
      setFormEmailError('Email cannot be blank.');
      return false;
    }
    setFormEmailError(null);
    return true;
  };

  const validateFormCompany = (value) => {
    if (value.trim() === '') {
      setFormCompanyError('Company cannot be blank.');
      return false;
    }
    setFormCompanyError(null);
    return true;
  };

  const validateFormMessage = (value) => {
    if (value.trim().length > 3000) {
        setFormMessageError('Message cannot be greater than 3000 characters');
        return false;
    }
    setFormMessageError(null);
    return true;
  };
  
  const handleContactFormSubmit = async () => {
    const isValidName = validateFormName(formData.name)
    const isValidEmail = validateFormEmail(formData.email)
    const isValidCompany = validateFormCompany(formData.company)
    const isValidMessage = validateFormMessage(formData.message)

    if (!isValidName || !isValidEmail || !isValidCompany || !isValidMessage) return;

    // Handle form submission
    console.log(formData);
    try {
      setIsFormSubmitting(true);
      setFormSubmitionError(false);
      const body = {
        shop: shop,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
      }

      const response = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/email/request-custom-plan", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setFormSubmitionError(true);
        setIsFormSubmitting(false);
        return
      }

      setFormData({ name: '', email: '', company: '', message: '' });
      setShowContactUsModal(false);
      setIsFormSubmitting(false);
      toggleToast();

    } catch (error) {
      setFormSubmitionError(true);
      setIsFormSubmitting(false);
    }
  };

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/plans`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })  
      if (!response.ok) {
        setPageLoadError(true)
        return null;
      }

      setPageLoadError(false)
      const data = await response.json();
      return data;
    } catch (error) {
      setPageLoadError(true)
      return null;
    }
  }

  const fetchShop = async () => {
    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    return shop
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
          title: "Failed to get subscription data", 
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
        title: "Failed to get subscription data", 
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
          title: "Failed to get subscription data", 
          body: "Please try again later." 
        })
      });  

    fetchPlanDetails().then((data) => {
      setPlanDetails(data)
      setIsLoading(false);
    })
  }, []);

  useEffect(() => {
    if (shop) { // Only run if shop is not an empty string
      fetchShopData(shop).then(res => {
        setShopData(res);
        if (res) {
          // Update so they are no longer a first time user
          const response = fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/firsttimeuser", {
            method: "PATCH",
            body: JSON.stringify({ shop: shop, firstTimeUser: false }),
            headers: { "Content-Type": "application/json" },
          });
        }
      });
    }
  }, [shop]);

  function getRemainingTrialDays(firstInstallDate, trialDuration) {
      const startDate = new Date(firstInstallDate);
      const trialEndDate = new Date(startDate);
      trialEndDate.setDate(startDate.getDate() + trialDuration);
      
      const currentDate = new Date();

      if (currentDate > trialEndDate) {
          return 0;  // trial has ended
      } else {
          // calculate the difference between current date and trial end date in milliseconds
          const diff = trialEndDate - currentDate;
          
          // convert the difference to days
          const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
          return daysRemaining;
      }
  }

  const handleSubscribe = async ({ planId, planName, planPrice, trialDuration }) => {
    const trialDays = getRemainingTrialDays(shopData?.firstInstallDate, trialDuration);
    const relativeUrl = '/'

    try {
      const response = await authFetch("/api/billing/subscribe", {
        method: "POST",
        body: JSON.stringify({ planName, planPrice, trialDays, relativeUrl }),
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        setError({ 
          status: true, 
          title: "Failed to create subscription", 
          body: "Please try again later." 
        })
        return
      }

      setError({ status: false, title: "", body: "" })
      const data = await response.json()
      
      navigate(data.confirmationUrl)

    } catch (error) {
      setError({ 
        status: true, 
        title: "Failed to create subscription", 
        body: "Please try again later." 
      })
    }
  }

  const loadingMarkup = isLoading ? (
      <Layout>
        <Loading />
        <Layout.Section fullWidth>
          <AlphaCard>
            <SkeletonBodyText lines={3} />
          </AlphaCard>
        </Layout.Section>
        <Layout.Section oneThird>
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="4rem"/>
            <SkeletonBodyText lines={3} />
            <Box minHeight="10rem"/>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section oneThird>
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="4rem"/>
            <SkeletonBodyText lines={3} />
            <Box minHeight="10rem"/>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section oneThird>
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="4rem"/>
            <SkeletonBodyText lines={3} />
            <Box minHeight="10rem"/>
          </AlphaCard>
        </Layout.Section>
      </Layout>
  ) : null

  const pageMarkup = !isLoading && !pageLoadError ? (
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
                planId={planDetails[1].planId}
                active={shopData?.subscriptionStatus === 'ACTIVE' && shopData?.planId === planDetails[1].planId} // Active plan and plan id matches.
                planName={planDetails[1].planName}
                planPrice={planDetails[1].monthlyPrice}
                features={planDetails[1].features}
                trialDuration={planDetails[1].trialDuration}
                handleSubscribe={(props) => handleSubscribe(props)}
              />
            </div>
          </Layout.Section>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                planId={planDetails[2].planId}
                active={shopData?.subscriptionStatus === 'ACTIVE' && shopData?.planId === planDetails[2].planId}
                primary
                planName={planDetails[2].planName}
                planPrice={planDetails[2].monthlyPrice}
                features={planDetails[2].features}
                trialDuration={planDetails[2].trialDuration}
                handleSubscribe={(props) => handleSubscribe(props)}
              />
            </div>
          </Layout.Section>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                planId={planDetails[3].planId}
                active={shopData?.subscriptionStatus === 'ACTIVE' && shopData?.planId === planDetails[3].planId}
                planName={planDetails[3].planName}
                planPrice={planDetails[3].monthlyPrice}
                features={planDetails[3].features}
                trialDuration={planDetails[3].trialDuration}
                handleSubscribe={(props) => handleSubscribe(props)}
              />
            </div>
          </Layout.Section>

          {/* Request Custom Plan Section */}
          <Layout.Section>
            <div style={{
                position: 'relative',
                textAlign: 'center',
                marginBottom: '30px'
            }}>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <Text variant="headingLg">Can't find a plan that suits your needs?</Text>
                <div style={{ maxWidth: '600px' }}>
                  <Text>
                    We understand that every business is unique. If our available plans don't meet your requirements,
                    let us know! We're here to tailor a custom plan just for you.
                  </Text>
                </div>
                <Button onClick={() => setShowContactUsModal(true)}>
                  Request Custom Plan
                </Button>
              </div>
  
              <Modal
                open={showContactUsModal}
                onClose={() => {
                  setShowContactUsModal(false);
                  setFormSubmitionError(false);
                }}
                title="Request a Custom Plan"
                primaryAction={{
                  content: 'Send Request',
                  onAction: handleContactFormSubmit,
                }}
                secondaryActions={[
                  {
                    content: 'Cancel',
                    onAction: () => {
                      setShowContactUsModal(false);
                      setFormSubmitionError(false);
                    },
                  },
                ]}
              >
                <Modal.Section>
                  {formSubmitionError && 
                    <div>
                      <Banner 
                        title={'Failed to send request'} 
                        onDismiss={() => {setFormSubmitionError(false)}}
                        status="critical"
                      >
                          <p>{'We could not send your request. Please try again later.'}</p>
                      </Banner>
                      <Box minHeight="1rem"/>
                    </div>
                  }
                  {isFormSubmitting && 
                    <div style={{minHeight: '28rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                      <Spinner />
                    </div>
                  }
                  {!isFormSubmitting && 
                    <VerticalStack gap='6'>
                      <TextField
                        label="Name"
                        value={formData.name}
                        placeholder="Name"
                        onChange={handleFormInputChange('name')}
                        required
                        error={formNameError}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        placeholder="Email"
                        onChange={handleFormInputChange('email')}
                        required
                        error={formEmailError}
                      />
                      <TextField
                        label="Company"
                        value={formData.company}
                        placeholder="Company"
                        onChange={handleFormInputChange('company')}
                        required
                        error={formCompanyError}
                      />
                      <TextField
                        label="Message"
                        value={formData.message}
                        placeholder="Tell us a bit about your company's needs..."
                        onChange={handleFormInputChange('message')}
                        multiline={3}
                        error={formMessageError}
                        helpText={`${formData.message.length}/3000 characters`} 
                      />
                      <Text variant="bodyMd">Our team will reach out to you within 2 business days to discuss a tailored solution for your business.</Text>
                    </VerticalStack>
                  }
                </Modal.Section>
              </Modal>
            </div>
          </Layout.Section>
        </Layout>
      </div>
    </AlphaCard>
  ) : null

  const pageLoadErrorMarkup = !isLoading && pageLoadError ? (
    <AlphaCard>
      <div style={{margin: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4rem"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem"}}>
          <Text variant="headingXl" as="h3">
            There was an error loading the pricing page
          </Text>
          <Text variant="bodyLg" as="p">
            Please try again later.
          </Text>
        </div>
      </div>
    </AlphaCard>
  ) : null

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar
          title="Plan"
          breadcrumbs={breadcrumbs}
          primaryAction={{
            content: "Plan Settings",
            onAction: () => navigate("/plan/settings")
          }}
        />
        {toastActive && <Toast content="Request Sent" onDismiss={toggleToast} />}
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
      </Page>
    </Frame>
  )
}