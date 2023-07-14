import {
  Box,
  Text,
  Image,
} from "@shopify/polaris";

export default function MessageUI({ type, role, content }) {

  if (type === "text") {
    return (
      <Box
        style={role === "user" ? 
          {
            background: "var(--p-color-border-interactive-subdued)",
            padding: "var(--p-space-2)",
            maxWidth: "80%",
            marginLeft: "auto",
            borderRadius: "10px 10px 0px 10px",
          }:{
            background: "var(--p-color-border-disabled)",
            padding: "var(--p-space-2)",
            maxWidth: "80%",
            borderRadius: "10px 10px 10px 0px",
          }
        }  
      >
        <Text>{content}</Text>
      </Box>
    )
  }

  else if (type === "product") {
      return (
        <Box
          style={{
            background: "var(--p-color-border-disabled)",
            padding: "var(--p-space-2)",
            maxWidth: "80%",
            borderRadius: "10px 10px 10px 10px",
          }}  
        >
          <Text variant="headingSm" as="h6">{content.title}</Text>
          {content.images.nodes[0] ? 
            <Image
              source={content.images.nodes[0].src}
              height="160px"
            /> : null
          }
        </Box>
      )
    }

  else return null
}