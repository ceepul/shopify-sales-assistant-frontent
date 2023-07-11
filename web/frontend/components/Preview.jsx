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

export default function Preview() {
  const [query, setQuery] = useState("");
  const [messageRequestPending, setMessageRequestPending] = useState(false);
  const messagesContainerRef = useRef(null);


  //Temporary variables for testing, in future will be passed via props
  const welcomeMessage = "Welcome to our store! Is there anything I can assist you with today?";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: welcomeMessage,
    },
  ])

  const fetch = useAuthenticatedFetch();

  const handleSendMessage = async () => {
    setMessageRequestPending(true)
    const tempQuery = query
    setQuery("")

    let tempMessages = messages
    tempMessages.push(
    {
      role: "user",
      content: tempQuery,
    })
    
    console.log(tempMessages)
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ query: tempQuery }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Handle the response here
        const responseData = await response.json();
        console.log(responseData)

        tempMessages.push(
          {
            role: "assistant",
            content: responseData.res,
          })

        if(responseData.query) { 
          console.log("Making a product query")

          const res = await fetch("/api/query", {
            method: "POST",
            body: JSON.stringify({ query: responseData.query }),
            headers: { "Content-Type": "application/json" },
          })

          const relevantProducts = await res.json()

          const productData = await fetch(`/api/productInfo`, {
            method: "POST",
            body: JSON.stringify({ ids: relevantProducts.matches[0].id }), // Closest vector - product id
            headers: { "Content-Type": "application/json" },
          });

          if(productData.ok) {
            const jsonProductData = await productData.json()
            console.log(jsonProductData)

            tempMessages.push(
              {
                role: "products",
                content: jsonProductData,
            })
          } else {
            console.error("Failed to get product information from id", productData.status)
          }
        }

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

      else if (message.role === "products") {
        return (
          <Box
          key={key}
            style={{
              background: "var(--p-color-border-disabled)",
              padding: "var(--p-space-2)",
              maxWidth: "80%",
              borderRadius: "10px 10px 10px 10px",
            }}  
          >
            <Text variant="headingSm" as="h6">{message.content.title}</Text>
            {message.content.images.nodes[0] ? 
              <Image
                source={message.content.images.nodes[0].src}
                height="160px"
              /> : null
            }
          </Box>
        )
      }

      else return null;
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
    console.log(messages.length)
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