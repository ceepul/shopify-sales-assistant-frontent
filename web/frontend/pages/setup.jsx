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
import { TitleBar, Loading, ContextualSaveBar } from "@shopify/app-bridge-react"
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import FAQTableRow from "../components/FAQTableRow";
export default function SetupPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [faqs, setFaqs] = useState([]);
  const [deletedFaqs, setDeletedFaqs] = useState([]);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState({});
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

  const getFAQId = () => {
    return uuidv4();
  }

  const handleFAQEdit = (id) => {
    const faqMatch = faqs.find(faq => faq.id === id);
    setActiveFAQ(faqMatch);
    setShowFAQModal(true);
  };

  const handleFAQAdd = () => {
    const id = getFAQId();
  
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
      setActiveFAQ(prev => ({
        ...prev,
        questionError: 'Question cannot be blank'
      }))
      return;
    }
    if (activeFAQ.answer.length === 0) {
      setActiveFAQ(prev => ({
        ...prev,
        answerError: 'Question cannot be blank'
      }))
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
  }

  const handleFAQDelete = () => {
    if (!activeFAQ.newThisSession) setDeletedFaqs(prev => ([...prev, activeFAQ.id]))
    setFaqs(prev => prev.filter(faq => faq.id !== activeFAQ.id));
    setShowFAQModal(false);
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

  const handleSubmit = () => {

  }

  const handleReset = () => {

  }

  const faqRows = (!faqs || faqs.length === 0) ? (
      <div style={{ padding: '3rem', display: "flex", flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center'}}>
        <Text variant="headingLg">No FAQs</Text>
        <Text>Get started by adding an FAQ so ShopMate can answer specific store related question</Text>
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
    <Layout>
      <Layout.Section>
        <SkeletonDisplayText />
        <SkeletonBodyText />
      </Layout.Section>
    </Layout>
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

        <Layout.AnnotatedSection
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
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="faqs"
          title="FAQs"
          description="Add common questions and their answers to enable your AI Assistant to address store-related inquiries effectively."
        >
          <AlphaCard padding={0}>
            <div style={{padding: '1rem', display: 'flex', justifyContent: 'space-between'}}>
              <Text variant="bodyLg">Questions</Text>
              <Button primary size='slim' onClick={handleFAQAdd}>Add FAQ</Button>
            </div>
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