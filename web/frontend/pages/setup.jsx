import {
  AlphaCard,
  Frame,
  Page,
  Layout,
  Banner,
  Toast,
  Text,
  VerticalStack,
  Box,
  TextField,
  ButtonGroup,
  Button,
  Collapsible,
} from "@shopify/polaris";
import { TitleBar, Loading } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";

const mockDatabaseCall = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { question: "How to install?", answer: "Just follow the guide." },
    { question: "How to customize?", answer: "Go to settings and customize." },
    { question: "Where to find stats?", answer: "Stats are in the dashboard." },
  ];
};

export default function SetupPage() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastActive, setToastActive] = useState(false);
  const [error, setError] = useState({ status: false, title: "", body: "" });

  const toggleToast = useCallback(() => {
    setToastActive((active) => !active);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    mockDatabaseCall()
      .then((data) => {
        setFaqs(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError({
          status: true,
          title: "Could not fetch FAQs",
          body: "There was a problem retrieving your FAQs. Please try again later.",
        });
        setIsLoading(false);
      });
  }, []);

  const addFAQ = () => {
    const newFAQ = { question: "", answer: "", isOpen: false };
    setFaqs([...faqs, newFAQ]);
  };

  const updateFAQ = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const toggleFAQ = (index) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
    setFaqs(updatedFaqs);
  };

  const removeFAQ = (index) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
  };

  const saveFAQs = () => {
    console.log("Saving FAQs:", faqs);
    toggleToast();
  };

  return (
    <Frame>
      <Page>
        <TitleBar
          title="Setup"
          primaryAction={{
            content: "Save",
            onAction: saveFAQs,
          }}
        />
        {toastActive && <Toast content="FAQs Updated" onDismiss={toggleToast} />}
        <Layout>
          {error.status && (
            <Layout.Section fullWidth>
              <Banner
                title={error.title}
                onDismiss={() => setError({ status: false, title: "", body: "" })}
                status="critical"
              >
                <p>{error.body}</p>
              </Banner>
            </Layout.Section>
          )}
          <Layout.Section>
            <VerticalStack gap="4">
              <Text variant="headingLg" as="h5">
                Frequently Asked Questions
              </Text>
              {isLoading ? (
                <Loading />
              ) : (
                faqs.map((faq, index) => (
                  <AlphaCard key={index}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text onClick={() => toggleFAQ(index)}>{faq.question}</Text>
                      <ButtonGroup>
                        <Button onClick={() => toggleFAQ(index)}>Edit</Button>
                        <Button onClick={() => removeFAQ(index)} destructive>
                          Delete
                        </Button>
                      </ButtonGroup>
                    </div>
                    <Collapsible open={faq.isOpen}>
                      <Box minHeight="0.5rem" />
                      <TextField
                        label="Question"
                        value={faq.question}
                        onChange={(value) => updateFAQ(index, "question", value)}
                      />
                      <Box minHeight="0.5rem" />
                      <TextField
                        label="Answer"
                        value={faq.answer}
                        onChange={(value) => updateFAQ(index, "answer", value)}
                      />
                    </Collapsible>
                  </AlphaCard>
                ))
              )}
              <Button onClick={addFAQ}>Add FAQ</Button>
            </VerticalStack>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}