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
  Bleed,
  Icon,
  Image
} from "@shopify/polaris";
import { useEffect, useState, useRef } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { SendMajor, MobileHorizontalDotsMajor } from '@shopify/polaris-icons'
import MessageUI from "./MessageUI";

export default function Preview() {
  const [query, setQuery] = useState("");
  const [messageRequestPending, setMessageRequestPending] = useState(false);
  const messagesContainerRef = useRef(null);


  //Temporary variables for testing, in future will be passed via props
  const welcomeMessage = "Welcome to our store! Is there anything I can assist you with today?";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content: welcomeMessage,
    },
  ])

  const fetch = useAuthenticatedFetch();

  const handleSendMessage = async () => {
    setMessageRequestPending(true)
    const tempQuery = query
    setQuery("")

    let tempMessages = [...messages]
    tempMessages.push(
    {
      role: "user",
      type: "text",
      content: tempQuery,
    })

    try {
      const response = fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ query: tempQuery }),
        headers: { "Content-Type": "application/json" },
      })

      console.log(response)

      if (response.ok) {
        
        console.log("response ok")

      } else {
        console.error("Failed to send message:", response.status);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setMessageRequestPending(false);
      setMessages(tempMessages)
    }
  };

  //Styles each message object depending on whether it is an assistant or user message
  const messagesMarkup = (
    <VerticalStack gap="4">
      {messages.map((message, key) => {
        return (
          <Box key={key}>
            <MessageUI
              type={message.type}
              role={message.role}
              content={message.content}
            />
          </Box>
        )
      })}
    </VerticalStack>)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesMarkup]);

  if(messages.length > 14) {
    const temp = messages
    temp.shift()
    setMessages(temp)
  }
  
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
          <Box style={{ 
              maxHeight: "20rem",
              minHeight: "20rem", 
              overflowY: "auto" 
            }}
            ref={messagesContainerRef}
          >
            {messagesMarkup}
            {messageRequestPending && 
              <Box
              style={{
                marginBlockStart: "8px",
                background: "var(--p-color-border-disabled)",
                padding: "var(--p-space-2)",
                maxWidth: "15%",
                borderRadius: "10px 10px 10px 0px",
              }}  
              >
                <Icon source={MobileHorizontalDotsMajor}/>
              </Box>
            }
          </Box>
          
          {/*Footer*/}
          <Box>
            <VerticalStack gap="4">
              <Divider />
              <TextField 
                value={query}
                placeholder="Start typing..."
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