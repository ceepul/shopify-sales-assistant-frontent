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
  Badge,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { ColorsMajor } from '@shopify/polaris-icons';
import { HexColorPicker } from "react-colorful"

export default function CustomizeUIForm({isLoading, preferences, resetPreferences, setPreferences, setError, toggleToast}) {
  
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false)
  const [colorInput, setColourInput] = useState("#47AFFF")

  const [assistantNameError, setAssistantNameError] = useState(null);
  const [accentColourError, setAccentColourError] = useState(null);
  const [greetingOneError, setGreetingOneError] = useState(null);
  const [greetingTwoError, setGreetingTwoError] = useState(null);

  useEffect(() => {
    setColourInput(preferences.accentColour)
  },[preferences])

  const authFetch = useAuthenticatedFetch();

  const onSubmit = async () => {
    setSubmitting(true);
    const isValidAssistantName = validateAssistantName(preferences.assistantName);
    const isValidAccentColour = validateAccentColour(colorInput);

    if (!isValidAssistantName || !isValidAccentColour) {
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
        assistantName: preferences.assistantName,
        accentColour: colorInput,
        avatarImageSrc: preferences.avatarImageSrc,
        greetingLineOne: preferences.greetingLineOne,
        greetingLineTwo: preferences.greetingLineTwo,
        showSupportForm: preferences.showSupportForm,
        showLauncherText: preferences.showLauncherText,
        launcherText: preferences.launcherText,
      }

      const response = await fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/dev/preferences", {
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
    setAccentColourError(null);
    setAssistantNameError(null);
    setGreetingOneError(null);
    setGreetingTwoError(null);
    resetPreferences();
    setDirty(false);
  }, []);

  const handleChangePreference = (key, value) => {
    if ((key === 'assistantName' || key === 'greetingLineOne' || key === 'greetingLineTwo') && value.length > 30) {
      if (key === 'assistantName') setAssistantNameError('Assistant name cannot be greater than 30 characters.');
      if (key === 'greetingLineOne') setGreetingOneError('Greeting cannot be greater than 30 characters.');
      if (key === 'greetingLineTwo') setGreetingTwoError('Greeting cannot be greater than 30 characters.');
      return;
    } else if (key === 'assistantName') {
      setAssistantNameError(null);
    } else if (key === 'greetingLineOne') {
      setGreetingOneError(null);
    } else if (key === 'greetingLineTwo') {
      setGreetingTwoError(null);
    }
  
    if (key === 'accentColour') {
      setColourInput(value);
      setAccentColourError(false);
    }
  
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  
    setDirty(true);
  };  

  const handleChangeColourInput= (value) => {
    setColourInput(value);
    setAccentColourError(false);
    setDirty(true);
  };

  const validateAssistantName = (value) => {
    if (value.trim() === '') {
      setAssistantNameError('Assistant name cannot be blank.');
      return false;
    } else if (value.length > 30) {
      setAssistantNameError('Assistant name cannot be greater than 30 characters.')
      return false;
    }
    setAssistantNameError(null);
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

  if (isLoading) {
    return (
      <VerticalStack gap="2">
        <SkeletonDisplayText />
        <AlphaCard>
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <SkeletonBodyText lines={2}/>
  
          <Box minHeight="2.25rem" />
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <SkeletonBodyText lines={2}/>
  
          <Box minHeight="2.5rem" />
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <SkeletonBodyText lines={2}/>

          <Box minHeight="2.5rem" />
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <SkeletonBodyText lines={2}/>
        </AlphaCard>

        <Box minHeight="1.5rem"/>
        <SkeletonDisplayText />
        <AlphaCard>
          <SkeletonDisplayText />
          <Box minHeight="1.5rem"/>
          <SkeletonBodyText lines={1}/>
        </AlphaCard>

        <Box minHeight="1.5rem"/>
        <SkeletonDisplayText />
        <AlphaCard>
        <SkeletonDisplayText />
          <Box minHeight="1.5rem"/>
          <SkeletonBodyText lines={1}/>
        </AlphaCard>
        <Box minHeight="1rem" />
      </VerticalStack>
    )
  }

  return (
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
        <Text variant="headingLg" as="h5">Widget</Text>
        <AlphaCard>
          <VerticalStack gap="4">
            <Text variant="headingMd" as="h6">
              Greeting Line 1
            </Text>
            <TextField
              value={preferences.greetingLineOne}
              onChange={(value) => handleChangePreference('greetingLineOne', value)}
              label="Greeting Line 1"
              labelHidden
              error={greetingOneError}
            />
  
            <Box minHeight="0.25rem" />
            <Text variant="headingMd" as="h6">
              Greeting Line 2
            </Text>
            <TextField
              value={preferences.greetingLineTwo}
              onChange={(value) => handleChangePreference('greetingLineTwo', value)}
              label="Greeting Line 2"
              labelHidden
              error={greetingTwoError}
            />
  
            <Box minHeight="0.5rem"/>
            <Text variant="headingMd" as="h6">Accent Color</Text>
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
                onClick={() => setColorPickerVisible(prev => !prev)}
              />
            </HorizontalStack>
            {colorPickerVisible && 
                <HexColorPicker 
                  color={preferences.accentColour}
                  onChange={(value) => handleChangePreference('accentColour', value)}
                />
            }
  
            <Box minHeight="0.5rem"/>
            <Text variant="headingMd" as="h6">
              Assistant Name
            </Text>
            <TextField
              value={preferences.assistantName}
              onChange={(value) => handleChangePreference('assistantName', value)}
              label="Assistant Name"
              labelHidden
              error={assistantNameError}
            />
          </VerticalStack>
        </AlphaCard>


        <Box minHeight="0.5rem"/>
        <Text variant="headingLg" as="h5">Launcher</Text>
        <AlphaCard>
          <VerticalStack gap="4">
            {/* <Text variant="headingMd" as="h6">Select Icon</Text>
            <HorizontalStack gap="4">
              {["default_v14.png", "default_v40.png", "default_v35.png", "default_v47.png", "default_v18.png", "default_v33.png",
                "default_v7.png", "default_v30.png", "default_v26.png", "default_v1.png", "default_v29.png", "default_v9.png"].map((src, index) => (
                <img 
                  key={index}
                  src={`https://shopify-recommendation-app.s3.amazonaws.com/avatars/${src}`}
                  alt={src}
                  onClick={() => handleChangePreference('avatarImageSrc', src)}
                  style={{
                    cursor: 'pointer',
                    width: '64px',
                    borderRadius: preferences?.avatarImageSrc === src ? '50%' : '0',
                    transform: preferences?.avatarImageSrc === src ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: preferences?.avatarImageSrc === src ? '0 2px 4px 1px grey' : 'none',
                  }}                  
                />
              ))}
            </HorizontalStack>


            <Box minHeight="1rem"/> */}
            <SettingToggle
              enabled={preferences.showLauncherText}
              handleToggle={() => handleChangePreference('showLauncherText', !preferences.showLauncherText)}
              title="Show Launcher Text"
              description="Call attention to the launcher with a popup text bubble."
            />
            {preferences.showLauncherText && 
              <VerticalStack gap="4">
                <Box minHeight="0.5rem"/>
                <Text variant="headingMd" as="h6">
                  Launcher Text
                </Text>
                <TextField
                  value={preferences.launcherText}
                  onChange={(value) => handleChangePreference('launcherText', value)}
                  label="Launcher Text"
                  labelHidden
                  error={null}
                  multiline
                />
              </VerticalStack>
            }
          </VerticalStack>
        </AlphaCard>


        <Box minHeight="0.5rem" />
        <Text variant="headingLg" as="h5">Pages</Text>
        <AlphaCard>
          <VerticalStack gap="4">
            <SettingToggle
              enabled={preferences.showSupportForm}
              handleToggle={() => handleChangePreference('showSupportForm', !preferences.showSupportForm)}
              title="Enable Support Form"
              description="Allow the AI to display a support form where users can send support questions"
            />
            {preferences.showSupportForm && 
              <VerticalStack gap="4">
                <Box minHeight="0.5rem"/>
                <VerticalStack gap='1'>
                  <Text variant="headingMd" as="h6"> Support Email</Text>
                  <Text>Please contact our support team to change your support email.</Text>
                </VerticalStack>
                <TextField
                  value={'example@email.com'}
                  onChange={null}
                  label="Support Email"
                  labelHidden
                  error={null}
                  disabled
                />
              </VerticalStack>
            }
          </VerticalStack>
        </AlphaCard>
        <Box minHeight="1rem" />
      </FormLayout>
    </Form>
  );
}