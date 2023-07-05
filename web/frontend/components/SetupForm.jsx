import { ContextualSaveBar } from "@shopify/app-bridge-react";
import { useForm, useField, notEmptyString } from "@shopify/react-form";
import {
  Form, 
  FormLayout, 
  Layout, 
  TextField, 
  VerticalStack,
  Text,
  AlphaCard,
  Box,
  Tooltip
} from "@shopify/polaris";
import { useCallback } from "react";


export default function SetupForm() {

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        
      })();
      return { status: "success" };
    },
    []
  );

  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: {
      name,
      welcomeMessage,
      personality,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      name: useField({
        value: "ShopMate",
        validates: [notEmptyString("Please name your AI Assistant")],
      }),
      welcomeMessage: useField({
        value: "Welcome to our store! Is there anything I can assist you with today?",
        validates: [notEmptyString("Please provide a welcome message")],
      }),
      personality: useField({
        value: "",
        validates: [],
      }),
    },
    onSubmit,
  });
  

  return (
    <AlphaCard>
      <Form>
        <ContextualSaveBar 
          saveAction={{
              label: "Save",
              onAction: submit,
              loading: submitting,
              disabled: submitting,
          }}
          discardAction={{
              label: "Discard",
              onAction: reset,
              loading: submitting,
              disabled: submitting,
          }}
          visible={dirty}
          fullWidth
        />
        <FormLayout>
          <Text variant="headingMd" as="h6">
            Assistant Name
          </Text>
          <TextField 
            {...name}
            label="Name"
            labelHidden
          />

          <Box minHeight="0.5rem"/>

          <Text variant="headingMd" as="h6">
            Welcome Message
          </Text>
          <TextField
            {...welcomeMessage}
            label="Welcome Message"
            labelHidden
            multiline
            clearButton
          />

          <Box minHeight="0.5rem"/>

          <Tooltip content="Example: Speak in a concise manner">
            <Text variant="headingMd" as="h6">
              Personality / Tone
            </Text>
          </Tooltip>
          <TextField
            {...personality}
            label="Personality"
            labelHidden
            multiline
            helpText="(Optional) this adjusts your assistants personailty"
            clearButton
          />
        </FormLayout>
      </Form>
    </AlphaCard>
  )
}