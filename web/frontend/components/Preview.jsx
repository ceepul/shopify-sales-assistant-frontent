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
    setMessageRequestPending(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        type: "text",
        content: query,
      },
    ]);
  
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      });
  
      const reader = response.body.getReader();
  
      let buffer = "";
  
      const read = async () => {
        const { done, value } = await reader.read();
  
        if (done) {
          console.log("[end]");
          setMessageRequestPending(false); // Set loading state to false when all messages are received
          return;
        }
  
        const decoder = new TextDecoder();
        buffer += decoder.decode(value);
  
        let separatorPosition;
        while ((separatorPosition = buffer.indexOf("\n\n")) !== -1) {
          const message = buffer.slice(0, separatorPosition);
          buffer = buffer.slice(separatorPosition + 2);
  
          if (message.startsWith("data: ")) {
            const jsonText = message.slice(6); // remove "data: " prefix
            try {
              const json = JSON.parse(jsonText);
              console.log("Received: ", json);
  
              // Append the message to the messages array
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  role: "assistant",
                  type: json.type,
                  content: json.content,
                },
              ]);
            } catch (error) {
              console.log("Error parsing JSON:", error);
            }
          }
        }
  
        read();
      };
  
      read();
    } catch (error) {
      setMessageRequestPending(false); // If an error occurs, also set loading state to false
    } finally {
      setQuery("");
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
    </VerticalStack>
  )

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