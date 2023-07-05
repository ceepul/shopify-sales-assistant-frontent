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
  Tooltip,
  HorizontalStack,
  ColorPicker,
  Icon,
  Button
} from "@shopify/polaris";
import { ColorsMajor } from '@shopify/polaris-icons';
import { useCallback } from "react";


export default function CustomizeUIForm() {

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
      primaryColor,
      secondaryColor,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      primaryColor: useField({
        value: "4299E1",
        validates: [notEmptyString("Primary color is required")],
      }),
      secondaryColor: useField({
        value: "E2E8F0",
        validates: [notEmptyString("Secondary color is required")],
      }),
    },
    onSubmit,
  });
  
  /* const colorMarkup = (
    <VerticalStack gap="4">
      <Text variant="headingMd" as="h6">
        Primary Color
      </Text>
      <HorizontalStack gap="4">
      <Box
        style={{
          background: 'var(--p-color-border-interactive-subdued)',
          borderRadius: 8,
          minWidth: 35,
        }}>&nbsp;</Box>
        <TextField 
          {...primaryColor}
          label="Primary Color"
          labelHidden
        />
        <Button 
          icon={ColorsMajor}
          outline
        />
      </HorizontalStack>
    </VerticalStack>
  ) */

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
            Primary Color
          </Text>
          <HorizontalStack gap="4">
          <Box
            style={{
              background: 'var(--p-color-border-interactive-subdued)',
              borderRadius: 8,
              minWidth: 35,
            }}>&nbsp;</Box>
            <TextField 
              {...primaryColor}
              label="Primary Color"
              labelHidden
              prefix="Hex #"
            />
            <Button 
              icon={ColorsMajor}
              outline
            />
          </HorizontalStack>

          <Box minHeight="0.5rem"/>

          <Text variant="headingMd" as="h6">
            Secondary Color
          </Text>
          <HorizontalStack gap="4">
          <Box
            style={{
              background: 'var(--p-color-icon-inverse)',
              borderRadius: 8,
              minWidth: 35,
            }}>&nbsp;</Box>
            <TextField 
              {...secondaryColor}
              label="Secondary Color"
              labelHidden
              prefix="Hex #"
            />
            <Button 
              icon={ColorsMajor}
              outline
            />

            <Box minHeight="0.5rem"/>

          </HorizontalStack>

          <Box minHeight="0.5rem"/>

          <Text variant="headingMd" as="h6">
            Text Color
          </Text>
        </FormLayout>
      </Form>
    </AlphaCard>
  )
}