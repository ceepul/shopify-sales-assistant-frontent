import { Box, Button, HorizontalStack, Icon, TextField } from "@shopify/polaris";
import {
  SearchMajor
} from '@shopify/polaris-icons';
import { useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [searchPending, setSearchPending] = useState(false);

  const fetch = useAuthenticatedFetch()

  const handleSearch = async () => {
    setSearchPending(true)
    
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const jsonResponse = await response.json()
        console.log(jsonResponse)

      } else {
        console.log(response.status)
      }
    } catch (error) {
      console.log(`Error at SearchBar/handleSearch: ${error}`)
    } finally {
      setSearchPending(false)
    }
  }

  return (
    <Box>
      <TextField 
        value={query}
        placeholder={ 
          "Search..."
        }
        onChange={(val) => setQuery(val)}
        suffix={
          <Button onClick={handleSearch}>
            <Icon source={SearchMajor} color="base"/>
          </Button>}
        disabled={searchPending}
      />
    </Box>
  )
}