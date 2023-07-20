import { useState, useCallback } from "react";
import { ContextualSaveBar, useAuthenticatedFetch } from "@shopify/app-bridge-react";
import {
  Form, 
  FormLayout,  
  TextField, 
  Text,
  AlphaCard,
  Box,
  HorizontalStack,
  Button,
  Checkbox,
  VerticalStack,
  useBreakpoints,
  Badge
} from "@shopify/polaris";
import { ColorsMajor } from '@shopify/polaris-icons';
import { HexColorPicker } from "react-colorful"

export default function CustomizeUIForm({preferences, refetch}) {

  const [assistantName, setAssistantName] = useState(preferences ? preferences.assistantName : "ShopMate");
  const [accentColour, setAccentColour] = useState(preferences ? preferences.accentColour : "#47AFFF");
  const [darkMode, setDarkMode] = useState(preferences ? preferences.darkMode : false);
  const [homeScreen, setHomeScreen] = useState(preferences ? preferences.homeScreen : true);
  const [welcomeMessage, setWelcomeMessage] = useState(preferences ? preferences.welcomeMessage : 
      "Welcome to our store! Are there any products I could help you find?"
    );

  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false)

  const [assistantNameError, setAssistantNameError] = useState(null);
  const [welcomeMessageError, setWelcomeMessageError] = useState(null);
  const [accentColourError, setAccentColourError] = useState(null);

  const fetch = useAuthenticatedFetch();

  const onSubmit = async () => {
    setSubmitting(true);
    const isValidAssistantName = validateAssistantName(assistantName);
    const isValidWelcomeMessage = validateWelcomeMessage(welcomeMessage);
    const isValidAccentColour = validateAccentColour(accentColour);

    if (!isValidAssistantName || !isValidWelcomeMessage || !isValidAccentColour) {
      setSubmitting(false)
      return;
    }
    
    const body = {
      assistantName,
      accentColour,
      darkMode,
      homeScreen,
      welcomeMessage,
    }

    const response = await fetch("/api/preferences", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      console.log("Success")
    } else {
      // Create a toast?
      console.log("An error occured while updating preferences")
    }

    setSubmitting(false);
    setDirty(false);
  }

  const onReset = useCallback(() => {
    refetch();
    setDirty(false);
  }, []);

  const handleChangeAssistantName = (value) => {
    setAssistantName(value);
    setDirty(true);
  };

  const handleChangeAccentColour = (value) => {
    setAccentColour(value);
    setDirty(true);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
    setDirty(true);
  };

  const handleToggleHomeScreen = () => {
    setHomeScreen(prev => !prev);
    setDirty(true);
  };

  const handleChangeWelcomeMessage = (value) => {
    setWelcomeMessage(value);
    setDirty(true);
  };

  const handleColorPickerVisibility = () => {
    setColorPickerVisible(prev => !prev)
  }

  const validateAssistantName = (value) => {
    if (value.trim() === '') {
      setAssistantNameError('Assistant name cannot be blank.');
      return false;
    }
    setAssistantNameError(null);
    return true;
  };
  
  const validateWelcomeMessage = (value) => {
    if (value.trim() === '') {
      setWelcomeMessageError('Welcome message cannot be blank.');
      return false;
    }
    setWelcomeMessageError(null);
    return true;
  };
  
  const validateAccentColour = (value) => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      setAccentColourError('Invalid hex color');
      return false;
    }
    setAccentColourError(null);
    return true;
  };

  const {mdDown} = useBreakpoints();

  const SettingToggle = ({enabled, handleToggle, title, description}) => {
    const contentStatus = enabled ? 'Disable' : 'Enable';
    const toggleId = `${title.toLowerCase().replace(' ', '-')}-toggle-uuid`;
    const badgeStatus = enabled ? 'success' : undefined;
    const badgeContent = enabled ? 'On' : 'Off';

    const settingStatusMarkup = (
      <Badge
        status={badgeStatus}
        statusAndProgressLabelOverride={`Setting is ${badgeContent}`}
      >
        {badgeContent}
      </Badge>
    );

    const actionMarkup = (
      <Button
        role="switch"
        id={toggleId}
        ariaChecked={enabled ? 'true' : 'false'}
        onClick={handleToggle}
        size="slim"
      >
        {contentStatus}
      </Button>
    );

    const headerMarkup = (
      <Box width="100%">
        <HorizontalStack align="space-between">
          <HorizontalStack
            gap="4"
            blockAlign="start"
            wrap={false}
          >
            <Text variant="headingMd" as="h6">{title}</Text>
            {settingStatusMarkup}
          </HorizontalStack>
  
          {!mdDown && (
            <Box minWidth="fit-content">
              <HorizontalStack align="end">{actionMarkup}</HorizontalStack>
            </Box>
          )}
        </HorizontalStack>
      </Box>
    );

    const descriptionMarkup = (
      <VerticalStack gap="4">
        <Text variant="bodyMd" as="p" color="subdued">
          {description}
        </Text>
        {mdDown && (
          <Box width="100%">
            <HorizontalStack align="start">{actionMarkup}</HorizontalStack>
          </Box>
        )}
      </VerticalStack>
    );

    return (
      <VerticalStack gap="4">
        {headerMarkup}
        {descriptionMarkup}
      </VerticalStack>
    );
  };

  return (
    <AlphaCard>
      <Form onSubmit={onSubmit}>
        <ContextualSaveBar
          saveAction={{
            label: "Save",
            onAction: onSubmit,
            loading: submitting,
            disabled: submitting
          }}
          discardAction={{
            label: "Discard",
            onAction: onReset,
            loading: submitting,
            disabled: submitting
          }}
          visible={dirty}
          fullWidth
        />
        <FormLayout>
          <Text variant="headingMd" as="h6">
            Assistant Name
          </Text>
          <TextField
            value={assistantName}
            onChange={handleChangeAssistantName}
            label="Name"
            labelHidden
            error={assistantNameError}
          />

          <Box minHeight="0.5rem"/>

          <Text variant="headingMd" as="h6">
            Accent Color
          </Text>

          <HorizontalStack gap="4">
            <Box
              style={{
                backgroundColor: accentColour,
                borderRadius: 8,
                minWidth: 35,
                minHeight: 35,
              }}
            />
            <TextField 
              value={accentColour}
              onChange={handleChangeAccentColour}
              label="Accent Color"
              labelHidden
              prefix="Hex"
              error={accentColourError}
            />
            <Button 
              icon={ColorsMajor}
              outline
              onClick={handleColorPickerVisibility}
            />
          </HorizontalStack>
          {colorPickerVisible && 
              <HexColorPicker 
                color={accentColour}
                onChange={handleChangeAccentColour}
              />
          }

          <Box minHeight="1rem"/>

          <SettingToggle
            enabled={darkMode}
            handleToggle={handleToggleDarkMode}
            title="Dark Mode"
            description="Switch the app to Dark Mode for better readability in low light environments."
          />

          <Box minHeight="1rem"/>

          <SettingToggle
            enabled={homeScreen}
            handleToggle={handleToggleHomeScreen}
            title="Home Screen"
            description="Displays a home screen outlining the functionality of the assistant instead of a welcome message (recommended)"
          />

          {!homeScreen && 
            <VerticalStack gap="4">
              <Box minHeight="0.5rem"/>
              <Text variant="headingMd" as="h6">
                Welcome Message
              </Text>
              <TextField
                value={welcomeMessage}
                onChange={handleChangeWelcomeMessage}
                label="Name"
                labelHidden
                error={welcomeMessageError}
              />
            </VerticalStack>
          }

        </FormLayout>
      </Form>
    </AlphaCard>
  );
}