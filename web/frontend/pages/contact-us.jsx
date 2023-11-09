import {
  Layout,
  Page,
  Text,
  Box,
  AlphaCard,
  Toast,
  Spinner,
  Button,
  TextField,
  VerticalStack,
  Frame,
  Banner
} from "@shopify/polaris";
import { TitleBar, useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";

export default function ContactUsPage() {
  const authFetch = useAuthenticatedFetch();
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

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
    switch (field) {
      case 'name':
        setFormNameError(false);
        break;
      case 'email':
        setFormEmailError(false);
        break;
      case 'company':
        setFormCompanyError(false);
        break;
      case 'message':
        setFormMessageError(false);
        break;
      default:
        break;
    }
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
    if (value.trim().length > 2000) {
        setFormMessageError('Message cannot be greater than 2000 characters');
        return false;
    }
    if (value.trim() === '') {
      setFormMessageError('Message cannot be blank.');
      return false;
    }
    setFormMessageError(null);
    return true;
  };

  const fetchShop = async () => {
    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    return shop
  }
  
  const handleContactFormSubmit = async () => {
    const isValidName = validateFormName(formData.name)
    const isValidEmail = validateFormEmail(formData.email)
    const isValidCompany = validateFormCompany(formData.company)
    const isValidMessage = validateFormMessage(formData.message)

    if (!isValidName || !isValidEmail || !isValidCompany || !isValidMessage) return;
    // Handle form submission
    try {
      setIsFormSubmitting(true);
      setFormSubmitionError(false);

      const shop = await fetchShop();

      const body = {
        shop: shop,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
      }

      const response = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/email/contact-us", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      console.log(response)

      if (!response.ok) {
        setFormSubmitionError(true);
        setIsFormSubmitting(false);
        return
      }

      setFormData({ name: '', email: '', company: '', message: '' });
      setIsFormSubmitting(false);
      toggleToast();

    } catch (error) {
      setFormSubmitionError(true);
      setIsFormSubmitting(false);
    }
  };

  return (
    <Frame>
      <Page>
        <TitleBar
          title="Contact Us"
          breadcrumbs={breadcrumbs}
        />
        {toastActive && <Toast content="Request Sent" onDismiss={toggleToast} />}

        <div style ={{marginInline: '12px'}}>
          <Layout>
            <Layout.Section>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem'}}>
                <div>
                  <span>
                   {'Reach out with any inquires using the contact form below or at '}
                  </span>
                  <span>
                    <a href="mailto:support@shopmateapp.com" target="_blank" rel="noopener noreferrer">
                        support@shopmateapp.com
                    </a>
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', marginBottom: '3rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{ maxWidth: '520px'}}>
                  <AlphaCard>
                    <div style={{
                        position: 'relative',
                    }}>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Text variant="headingLg">Get in Touch</Text>
                            <div style={{ maxWidth: '600px', textAlign: 'center' }}>
                                <Text>
                                  We're always eager to hear from you. Whether you have questions, feedback, or simply want to share your thoughts, don't hesitate to reach out.
                                </Text>
                            </div>
                        </div>
                        
                        {formSubmitionError && 
                            <div>
                                <Banner 
                                    title={'Submission Issue'} 
                                    onDismiss={() => {setFormSubmitionError(false)}}
                                    status="critical"
                                >
                                  <p>{'Please try emailing us directly at '}
                                    <a href="mailto:support@shopmateapp.com" target="_blank" rel="noopener noreferrer">
                                        support@shopmateapp.com
                                    </a>
                                  </p>
                                </Banner>
                                <Box minHeight="1rem"/>
                            </div>
                        }
                        
                        {isFormSubmitting ? (
                            <div style={{minHeight: '28rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Spinner />
                            </div>
                        ) : (
                            <VerticalStack gap='6'>
                                <TextField
                                    label="Full Name"
                                    value={formData.name}
                                    placeholder="John Doe"
                                    onChange={handleFormInputChange('name')}
                                    required
                                    error={formNameError}
                                />
                                <TextField
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    placeholder="johndoe@example.com"
                                    onChange={handleFormInputChange('email')}
                                    required
                                    error={formEmailError}
                                />
                                <TextField
                                    label="Business Name"
                                    value={formData.company}
                                    placeholder="ShopMate"
                                    onChange={handleFormInputChange('company')}
                                    required
                                    error={formCompanyError}
                                />
                                <TextField
                                    label="How can we help?"
                                    value={formData.message}
                                    placeholder="E.g., I have questions about the pricing plans, or I encountered an issue while using the app..."
                                    onChange={handleFormInputChange('message')}
                                    multiline={3}
                                    error={formMessageError}
                                    helpText={`${formData.message.length}/2000 characters`} 
                                />
                                <div style={{ textAlign: 'center' }}>
                                  <Text variant="bodyMd">We're committed to addressing your inquiries. Please anticipate our reply within the next 24 hours.</Text>
                                </div>
                                <Button primary onClick={handleContactFormSubmit}>Send Message</Button>
                            </VerticalStack>
                        )}
                    </div>
                  </AlphaCard>
                </div>
              </div>
            </Layout.Section>
          </Layout>
        </div>
      </Page>
    </Frame>
  );
}