import { useState, useCallback, useEffect } from "react";
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
  VerticalStack,
  useBreakpoints,
  Badge
} from "@shopify/polaris";
import { ColorsMajor } from '@shopify/polaris-icons';
import { HexColorPicker } from "react-colorful"

export default function CustomizeUIForm({preferences, resetPreferences, setPreferences, setError, toggleToast}) {
  
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false)
  const [colorInput, setColourInput] = useState("#47AFFF")

  const [assistantNameError, setAssistantNameError] = useState(null);
  const [welcomeMessageError, setWelcomeMessageError] = useState(null);
  const [accentColourError, setAccentColourError] = useState(null);

  useEffect(() => {
    setColourInput(preferences.accentColour)
  },[preferences])

  const authFetch = useAuthenticatedFetch();

  const onSubmit = async () => {
    setSubmitting(true);
    const isValidAssistantName = validateAssistantName(preferences.assistantName);
    const isValidWelcomeMessage = validateWelcomeMessage(preferences.welcomeMessage);
    const isValidAccentColour = validateAccentColour(colorInput);

    if (!isValidAssistantName || !isValidWelcomeMessage || !isValidAccentColour) {
      setSubmitting(false)
      return;
    }

    setPreferences({
      ...preferences,
      accentColour: colorInput
    });

    try {
      const shop = await authFetch("/api/shop", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((response) => response.text());

      const body = {
        shop: shop,
        storeInfo: preferences.storeInfo,
        assistantName: preferences.assistantName,
        accentColour: colorInput,
        darkMode: preferences.darkMode,
        homeScreen: preferences.homeScreen,
        welcomeMessage: preferences.welcomeMessage,
      }

      const response = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/preferences", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setError({
          status: true, 
          title: "Could not save preferences", 
          body: "There was a problem updating your preferences. Please try again later."
        })
      } else {
        setError({
          status: false, 
          title: "", 
          body: ""
        })
        toggleToast();
      }

    } catch (error) {
      setError({
        status: true, 
        title: "Could not save preferences", 
        body: "There was a problem updating your preferences. Please try again later."
      })
    }

    setSubmitting(false);
    setDirty(false);
  }

  const onReset = useCallback(() => {
    resetPreferences();
    setDirty(false);
  }, []);

  const handleChangeAssistantName = (value) => {
    if (value.length > 18) {
      setAssistantNameError('Assistant name cannot be greater than 18 characters.')
    } else {
      setAssistantNameError(null)
    }
    setPreferences({
      ...preferences,
      assistantName: value
    });
    setDirty(true);
  };

  const handleChangeColourPicker = (value) => {
    setPreferences({
      ...preferences,
      accentColour: value
    });
    setDirty(true);
  };

  const handleChangeColourInput= (value) => {
    setColourInput(value);
    setDirty(true);
  };

  const handleToggleDarkMode = () => {
    setPreferences((prev) => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
    setDirty(true);
  };

  const handleToggleHomeScreen = () => {
    setPreferences((prev) => ({
      ...prev,
      homeScreen: !prev.homeScreen
    }));
    setDirty(true);
  };

  const handleChangeWelcomeMessage = (value) => {
    setPreferences({
      ...preferences,
      welcomeMessage: value
    });
    setDirty(true);
  };

  const handleColorPickerVisibility = () => {
    setColorPickerVisible(prev => !prev)
  }

  const validateAssistantName = (value) => {
    if (value.trim() === '') {
      setAssistantNameError('Assistant name cannot be blank.');
      return false;
    } else if (value.length > 18) {
      setAssistantNameError('Assistant name cannot be greater than 18 characters.')
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
            value={preferences.assistantName}
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
                backgroundColor: preferences.accentColour,
                borderRadius: 8,
                minWidth: 35,
                minHeight: 35,
              }}
            />
            <TextField 
              value={colorInput}
              onChange={handleChangeColourInput}
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
                color={preferences.accentColour}
                onChange={handleChangeColourPicker}
              />
          }

{/*           <Box minHeight="1rem"/>

          <SettingToggle
            enabled={preferences.darkMode}
            handleToggle={handleToggleDarkMode}
            title="Dark Mode"
            description="Switch the app to Dark Mode for better readability in low light environments."
          /> */}

          <Box minHeight="1rem"/>

          <SettingToggle
            enabled={preferences.homeScreen}
            handleToggle={handleToggleHomeScreen}
            title="Home Screen"
            description="Displays a home screen outlining the functionality of the assistant instead of a welcome message"
          />

          {!preferences.homeScreen && 
            <VerticalStack gap="4">
              <Box minHeight="0.5rem"/>
              <Text variant="headingMd" as="h6">
                Welcome Message
              </Text>
              <TextField
                value={preferences.welcomeMessage}
                onChange={handleChangeWelcomeMessage}
                label="Name"
                labelHidden
                error={welcomeMessageError}
                multiline
              />
            </VerticalStack>
          }

        </FormLayout>
      </Form>
    </AlphaCard>
  );
}