import {
  VerticalStack,
  Text,
  AlphaCard,
  Avatar,
  Box,
  HorizontalStack,
  Divider,
  TextField,
  Button,
  Bleed
} from "@shopify/polaris";
import { useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { SendMajor } from '@shopify/polaris-icons'

export default function Preview() {
  const [query, setQuery] = useState("");
  const [messageRequestPending, setMessageRequestPending] = useState(false);

  //Temporary variables for testing, in future will be passed via props
  const welcomeMessage = "Welcome to our store! Is there anything I can assist you with today?";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: welcomeMessage,
    },
    {
      role: "user",
      content: "test user message"
    },
  ])

  const fetch = useAuthenticatedFetch();

  const handleSendMessage = async () => {
    setMessageRequestPending(true)
    
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Handle the response here
        const responseData = await response.json();
        console.log(responseData)

      } else {
        console.error("Failed to send message:", response.status);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setMessageRequestPending(false);
    }
  };

  //Styles each message object depending on whether it is an assistant or user message
  const messagesMarkup = (
    <VerticalStack gap="4">
      {messages.map((message, key) => {
      if (message.role === "assistant") return (
        <Box
          key={key}
          style={{
            background: "var(--p-color-border-disabled)",
            padding: "var(--p-space-2)",
            maxWidth: "80%",
            borderRadius: "10px 10px 10px 0px",
          }}  
        >
          <Text>{message.content}</Text>
        </Box>
      )

      else if (message.role === "user") return (
          <Box
          key={key}
            style={{
              background: "var(--p-color-border-interactive-subdued)",
              padding: "var(--p-space-2)",
              maxWidth: "80%",
              marginLeft: "auto",
              borderRadius: "10px 10px 0px 10px",
            }}  
          >
            <Text>{message.content}</Text>
          </Box>
      )

      else return null;
    })}
  </VerticalStack>)
  
  return (
    <Box maxWidth="20rem">
      <AlphaCard>
        <VerticalStack gap="4">
          {/*Header */}
          <Bleed marginInline="5" marginBlockStart="5">
            <Box style={{
              background: "var(--p-color-border-interactive-subdued)",
              padding: "var(--p-space-4)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}>
              <VerticalStack gap="4">
                <HorizontalStack gap="4" blockAlign="center">
                  <Avatar name="m" initials="SM"/>
                  <Text variant="headingMd" as="h6">ShopMate</Text>
                </HorizontalStack>
              </VerticalStack>
            </Box>
          </Bleed>
  
          {/*Body */}
          <Box minHeight="18rem">
            {messagesMarkup}
          </Box>
          
          {/*Footer*/}
          <Box>
            <VerticalStack gap="4">
              <Divider />
              <TextField 
                value={query}
                placeholder="Type question here"
                onChange={(val) => setQuery(val)}
                multiline
                disabled={messageRequestPending}
                connectedRight={
                  <Button 
                    icon={SendMajor} 
                    onClick={handleSendMessage}
                    disabled={messageRequestPending}  
                  />
                }
              />
            </VerticalStack>
          </Box>
  
        </VerticalStack>
      </AlphaCard>
    </Box>
  )
}