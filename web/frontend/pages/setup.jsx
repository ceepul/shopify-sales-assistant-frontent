import { 
  AlphaCard,
  Banner,
  Layout,
  Page, 
  SkeletonBodyText, 
  SkeletonDisplayText,
  Text,
  TextField,
  Form,
  Box,
  Button,
  Divider,
  Modal,
  VerticalStack,
  Frame,
  Toast
} from "@shopify/polaris";
import { TitleBar, Loading, ContextualSaveBar, useAuthenticatedFetch } from "@shopify/app-bridge-react"
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import FAQTableRow from "../components/FAQTableRow";
export default function SetupPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];
  const authFetch = useAuthenticatedFetch();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });

  const [shop, setShop] = useState('');
  const [currentPlanDetails, setCurrentPlanDetails] = useState(null);
  const [maxFaqsError, setMaxFaqsError] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [deletedFaqs, setDeletedFaqs] = useState([]);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState({id: '', status: 'INITIAL', question: "", answer: ""});
  const [storeInfo, setStoreInfo] = useState({edited: false, error: null, content: ''});
  const [shippingPolicy, setShippingPolicy] = useState({edited: false, error: null, content: ''});
  const [returnPolicy, setReturnPolicy] = useState({edited: false, error: null, content: ''});

  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState('Success!');

  const toggleToast = useCallback((message) => {
    if (message) {
      setToastContent(message);
    }
    setToastActive((active) => !active);
  }, []);

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
        setError({ status: true, title: "Failed to load data", body: "Please try again later." })
        return null;
      }

      const data = await response.json();
      return data;

    } catch (error) {
      setError({ status: true, title: "Failed to load data", body: "Please try again later." })
      return null;
    }
  }

  const fetchAndSetSetupData = async () => {
    setMaxFaqsError(false);
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/setup?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })  
      if (!response.ok) {
        setError({ status: true, title: "Failed to load data", body: "Please try again later." })
        return null;
      }

      const data = await response.json();
      console.log(data)
      setStoreInfo({edited: false, error: null, content: data.storeInfo ? data.storeInfo : "" })
      setShippingPolicy({edited: false, error: null, content: data.shippingPolicy ? data.shippingPolicy : "" })
      setReturnPolicy({edited: false, error: null, content: data.returnPolicy ? data.returnPolicy : "" })
      const faqsWithStatus = data.faqs.map(faq => ({
        ...faq,
        status: 'UNCHANGED'
      }));
      setFaqs(faqsWithStatus);
    
      return true;
      
    } catch (error) {
      setError({ status: true, title: "Failed to load data", body: "Please try again later." })
      return null;
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchShop()
      .then(shop => setShop(shop))
      .catch(() => setError({ status: true, title: "Failed to load data", body: "Please try again later." }))
      .finally(() => setIsLoading(false)); 
  }, []);

  useEffect(() => {
    if (shop) { // Only run if shop is not an empty string
      setIsLoading(true);
      setError({ status: false, title: "", body: "" });
  
      Promise.all([
        fetchCurrentPlanDetails().then(res => setCurrentPlanDetails(res)),
        fetchAndSetSetupData()
      ])
      .catch(error)
      .finally(() => setIsLoading(false));
    }
  }, [shop]);

  const handleStoreInfoChange= (value) => {
    let error = null;
    if (value.length > 300) error = "Store info cannot exceed 300 characters."
    setStoreInfo({
      edited: true, 
      error: error,
      content: value
    });
    setIsDirty(true);
  };

  const handleShippingPolicyChange = (value) => {
    let error = null;
    if (value.length > 10000) error = "Shipping Policy cannot exceed 10000 characters."
    setShippingPolicy({
      edited: true, 
      error: error,
      content: value
    });
    setIsDirty(true);
  };

  const handleReturnPolicyChange= (value) => {
    let error = null;
    if (value.length > 10000) error = "Return Policy cannot exceed 10000 characters."
    setReturnPolicy({
      edited: true, 
      error: error,
      content: value
    });
    setIsDirty(true);
  };

  const handleFAQEdit = (id) => {
    const faqMatch = faqs.find(faq => faq.id === id);
    setActiveFAQ(faqMatch);
    setMaxFaqsError(false);
    setShowFAQModal(true);
  };

  const handleFAQAdd = () => {
    if (faqs.length >= currentPlanDetails?.faqsAllowed) {
      setMaxFaqsError(true);
      return;
    }

    const id = uuidv4();
    const newFAQ = {
      id: id,
      status: "NEW",
      question: "", 
      answer: "",
      questionError: null,
      answerError: null
    };
  
    setActiveFAQ(newFAQ);
    setShowFAQModal(true);
  }; 

  const handleFAQSave = () => {
    if (activeFAQ.questionError || activeFAQ.answerError) return;
    if (activeFAQ.question.length === 0) {
      setActiveFAQ(prev => ({ ...prev, questionError: 'Question cannot be blank' }))
      return;
    }
    if (activeFAQ.answer.length === 0) {
      setActiveFAQ(prev => ({ ...prev, answerError: 'Question cannot be blank' }))
      return;
    }

    setFaqs(prev => {
      const existingFaq = prev.findIndex(faq => faq.id === activeFAQ.id);
      if (existingFaq > -1) {
        prev[existingFaq] = {
          id: activeFAQ.id,
          status: "UPDATED",
          question: activeFAQ.question,
          answer: activeFAQ.answer
        };
        toggleToast("FAQ Updated")
        return [...prev];
      }
    
      toggleToast("FAQ Created")
      return [...prev, {
        id: activeFAQ.id,
        status: "UPDATED",
        question: activeFAQ.question,
        answer: activeFAQ.answer,
        newThisSession: true,
      }];
    });
    setShowFAQModal(false);
    setIsDirty(true);
  }

  const handleFAQDelete = () => {
    if (!activeFAQ.newThisSession) setDeletedFaqs(prev => ([...prev, activeFAQ.id]))
    setFaqs(prev => prev.filter(faq => faq.id !== activeFAQ.id));
    setMaxFaqsError(false);
    setShowFAQModal(false);
    setIsDirty(true);
    toggleToast("FAQ Deleted");
  }

  const handleFAQChange = (field) => (value) => {
    let errorUpdate = {};
    if (field === 'question') {
      errorUpdate.questionError = value.length > 100 ? "Question cannot exceed 100 characters" : null;
    }
    if (field === 'answer') {
      errorUpdate.answerError = value.length > 300 ? "Answer cannot exceed 300 characters" : null;
    }
  
    setActiveFAQ((prev) => ({
      ...prev,
      [field]: value,
      ...errorUpdate
    }));
  } 

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (shippingPolicy.error || returnPolicy.error || storeInfo.error) {
      setError({ status: true, title: "Could not save", body: "Fix all errors in form and try again." })
      setIsDirty(false);
      return
    }

    const updatedFaqs = faqs.filter((faq) => faq.status === 'UPDATED');

    const data = {
      storeInfo: storeInfo.edited ? storeInfo.content : null,
      shippingPolicy: shippingPolicy.edited ? shippingPolicy.content : null,
      returnPolicy: returnPolicy.edited ? returnPolicy.content : null,
      updatedFaqs: updatedFaqs,
      deletedFaqs: deletedFaqs
    }

    try {
      const response = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/setup", {
        method: "POST",
        body: JSON.stringify({ shop, data }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setError({ status: true, title: "Could not update", body: "There was a problem updating your store data. Please try again later." })
        setIsSubmitting(false)
        return
      }

      setError({ status: false, title: "", body: ""})

      // Update data to saved state
      setStoreInfo(prev => ({...prev, edited: false}))
      setShippingPolicy(prev => ({...prev, edited: false}));
      setReturnPolicy(prev => ({...prev, edited: false}));
      setDeletedFaqs([])
      const faqsSavedStatus = faqs.map(faq => ({
        ...faq,
        status: 'UNCHANGED'
      }));
      setFaqs(faqsSavedStatus);

      setIsSubmitting(false);
      setIsDirty(false);
      toggleToast("Store Updated");
      
    } catch (error) {
      setError({ status: true, title: "Could not update", body: "There was a problem updating your store data. Please try again later." })
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    if (shop) {
      setError({ status: false, title: "", body: "" })
      setIsLoading(true);
      fetchAndSetSetupData();
      setIsLoading(false);
    }
    setIsDirty(false);
  }

  const faqRows = (!faqs || faqs.length === 0) ? (
      <div style={{ padding: '3rem', display: "flex", flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center'}}>
        <Text variant="headingLg">No FAQs</Text>
        <Text>Get started by adding an FAQ so ShopMate can answer specific store related questions</Text>
      </div>
    ) : (
      faqs.map(faq => (
        <FAQTableRow 
          key={faq.id}
          question={faq.question}
          onEdit={() => handleFAQEdit(faq.id)} 
        />
      ))
    );

  const loadingMarkup = isLoading ? (
    <div>
      <Loading/>
      <Layout>
        <Layout.AnnotatedSection
          id="loadingFaqs"
          title={currentPlanDetails ? `FAQs (${faqs.length}/${currentPlanDetails.faqsAllowed})` : 'FAQs'}
          description="Add common questions and their answers to enable your AI Assistant to address store-related inquiries effectively."
        >
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="2rem" />
            <SkeletonBodyText lines={3} />
            <Box minHeight="5rem" />
          </AlphaCard>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          id="loadingShippingPolicy"
          title="Shipping Policy"
          description="Add a shipping policy to enable your AI Assistant to assist customers with shipping related questions."
        >
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="2rem" />
            <SkeletonBodyText lines={3} />
            <Box minHeight="5rem" />
          </AlphaCard>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          id="loadingReturnPolicy"
          title="Return Policy"
          description="Add a return policy to help your AI Assistant to assist customers with questions about returns."
        >
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="2rem" />
            <SkeletonBodyText lines={3} />
            <Box minHeight="5rem" />
          </AlphaCard>
        </Layout.AnnotatedSection>
      </Layout>
    </div>
  ) : null;

  const modalMarkup = showFAQModal ? (
    <Modal
      open={showFAQModal}
      onClose={() => setShowFAQModal(false)}
      title="Edit FAQ"
      primaryAction={{
        content: 'Save',
        onAction: handleFAQSave,
      }}
      secondaryActions={[
        {
          content: activeFAQ?.status === 'NEW' ? 'Cancel' : 'Delete',
          onAction: () => activeFAQ.status === 'NEW' ? setShowFAQModal(false) : handleFAQDelete(),
        },
      ]}
    >
      <Modal.Section>
          <VerticalStack gap='6'>
            <TextField
              label="Question"
              value={activeFAQ.question}
              placeholder="Question"
              onChange={handleFAQChange('question')}
              helpText={`${activeFAQ.question.length}/100 characters`}
              error={activeFAQ.questionError}
            />
            <TextField
              label="Answer"
              value={activeFAQ.answer}
              placeholder="Answer"
              onChange={handleFAQChange('answer')}
              helpText={`${activeFAQ.answer.length}/300 characters`}
              error={activeFAQ.answerError}
            />
          </VerticalStack>
      </Modal.Section>
    </Modal>
  ) : null;

  const pageMarkup = !isLoading ? (
    <Layout>
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
      <Form onSubmit={handleSubmit}>
        <ContextualSaveBar
          saveAction={{
            label: "Save",
            onAction: handleSubmit,
            loading: isSubmitting,
            disabled: isSubmitting
          }}
          discardAction={{
            label: "Discard",
            onAction: handleReset,
            loading: isSubmitting,
            disabled: isSubmitting
          }}
          visible={isDirty}
          fullWidth
        />

        {/* <Layout.AnnotatedSection
          id="storeInfo"
          title="Store Info"
          description="Add general information about your store such as the types of products your store sells"
        >
          <AlphaCard>
            <Text>Store Info (recommended)</Text>
            <Box minHeight="1rem"/>
            <TextField
              type=""
              value={storeInfo.content}
              onChange={handleStoreInfoChange}
              multiline={3}
              helpText={`${storeInfo.content.length}/300 characters`} 
              error={storeInfo.error}
            >
            </TextField>
          </AlphaCard>
        </Layout.AnnotatedSection> */}

        <Layout.AnnotatedSection
          id="faqs"
          title={currentPlanDetails ? `FAQs (${faqs.length}/${currentPlanDetails.faqsAllowed})` : 'FAQs'}
          description="Add common questions and their answers to enable your AI Assistant to address store-related inquiries effectively."
        >
          <AlphaCard padding={0}>
            <div style={{padding: '1rem', display: 'flex', justifyContent: 'space-between'}}>
              <Text variant="bodyLg">Questions</Text>
              <Button primary size='slim' onClick={handleFAQAdd}>Add FAQ</Button>
            </div>
            {maxFaqsError && 
              <div style={{paddingInline: '1rem', marginBottom: '1rem'}}>
                <Banner 
                  title="Max FAQs Reached" 
                  onDismiss={() => setMaxFaqsError(false)} 
                  action={{content: 'Upgrade Now', url: '/plan'}}
                  status="warning">
                  <p>You have reached the maximum number of FAQs allowed for your plan. Upgrade now to add more.</p>
                </Banner>
              </div>
            }
            <Divider />
              {faqRows}
          </AlphaCard>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="shippingPolicy"
          title="Shipping Policy"
          description="Add a shipping policy to enable your AI Assistant to assist customers with shipping related questions."
        >
          <AlphaCard>
            <Text>Shipping Policy (optional)</Text>
            <Box minHeight="1rem"/>
            <TextField
              type=""
              value={shippingPolicy.content}
              onChange={handleShippingPolicyChange}
              multiline={5}
              helpText={`${shippingPolicy.content.length}/10000 characters`} 
              error={shippingPolicy.error}
            >
            </TextField>
          </AlphaCard>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="returnPolicy"
          title="Return Policy"
          description="Add a return policy to help your AI Assistant to assist customers with questions about returns."
        >
          <AlphaCard>
            <Text>Return Policy (optional)</Text>
            <Box minHeight="1rem"/>
            <TextField
              type=""
              value={returnPolicy.content}
              onChange={handleReturnPolicyChange}
              multiline={5}
              helpText={`${returnPolicy.content.length}/10000 characters`} 
              error={returnPolicy.error}
            >
            </TextField>
          </AlphaCard>
        </Layout.AnnotatedSection>
      </Form>
    </Layout>
  ) : null;
  
  return (
    <Frame>
      <Page>
        <TitleBar
          title="Setup"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        {toastActive && <Toast content={toastContent} onDismiss={toggleToast} />}
        {loadingMarkup}
        {pageMarkup}
        {modalMarkup}
      </Page>
    </Frame>
  )
}