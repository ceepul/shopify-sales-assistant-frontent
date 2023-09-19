import { useState, useEffect } from 'react';
import {
  Text,
  ButtonGroup,
  Button,
  Banner,
  Icon,
} from '@shopify/polaris';
import {
  AppExtensionMinor,
  CancelMinor
} from '@shopify/polaris-icons';
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import './GettingStartedPrompt.css'
import { homeTrophy, handShake, embedSS } from '../assets/index';

export default function GettingStartedPrompt({ isActive, onClose, shop }) {
  const [step, setStep] = useState(0);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmSkip, setShowConfirmSkip] = useState(false);
  const [nextPageDisabled, setNextPageDisabled] = useState(true)
  const [uuid, setUuid] = useState(null);

  const authFetch = useAuthenticatedFetch();

  const fetchUUID = async () => {
    const uuid = await authFetch("/api/chat-widget-id", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());
    return uuid;
  }

  useEffect(() => {
    fetchUUID()
      .then((uuid) => {
        setUuid(uuid);
      }) 
  }, []);

  const appEmbedLink = `
    https://${shop}/admin/themes/current/editor?context=apps&template={template}&activateAppId=${uuid}/app-embed
  `;

  const handleNext = () => {
    setShowConfirmSkip(false)
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleClosePage = () => {
    if (step === 2) { // If it's the last step dont show the confirm close page
      onClose()
    } else {
      setShowConfirmClose(prev => !prev)
    }
  }

  const toggleSkipPage = () => {
    setShowConfirmSkip(prev => !prev)
  }

  const handleEmbedLink = () => {
    setNextPageDisabled(false)
    console.log(appEmbedLink)
    // Redirect to the desired URL
    window.open(appEmbedLink, '_blank');
  }

  const steps = [
    (
      <div className="modal-content">
        <img className="step-icon" src={handShake} alt="Handshake Icon" />
        <p variant='headingXl' className="step-title">Welcome to Shop Mate!</p>
        <p className="step-description">We're thrilled to have you on board. Let's get your AI shopping assistant set up in just a few easy steps.</p>
        <div className='step-button'>
          <Button primary size="slim" onClick={handleNext}>Get Started</Button>
        </div>
        <div className="step-dots">
          <span className="active"></span>
          <span></span>
          <span></span>
        </div>
      </div>
    ),
    (
      <div className="modal-content">
        <img className="step-image" src={embedSS} alt="Web screen shot of app embedding" />
        <p className="step-title">Activate Your AI Assistant</p>
        <p className="step-description">To let the AI shopping assistant start helping your customers, you'll first need to enable the app embed on your store.</p>
        
        <div className='step-button'>
          <Button primary onClick={handleEmbedLink}>
            <div className='step-button-content'>
              <Icon source={AppExtensionMinor} color="base" />
              <Text>Enable App Embed</Text>
            </div>
          </Button>
        </div>

        <div className='step-space'>
          <Banner status="warning">
            Don't forget to <strong>save</strong> your theme changes.
          </Banner>
        </div>

        <div className='step-button-container'>
          <Button plain monochrome onClick={nextPageDisabled ? toggleSkipPage : handleNext}>skip</Button>
          <Button primary size="slim" onClick={handleNext} disabled={nextPageDisabled}>Next</Button>
        </div>
        <div className="step-dots">
          <span></span>
          <span className="active"></span>
          <span></span>
        </div>
      </div>
    ),
    (
      <div className="modal-content">
        <img className="step-icon" src={homeTrophy} alt="Trophy Icon" />
        <p className="step-title">You're all set!</p>
        <p className="step-description">The AI shopping assistant is ready to use!.</p>
        <p className="step-description step-space">Next, select a plan to continue using your shopping assistant after the free trial has expired.</p>

        <div className='step-button-container'>
          <Button size='slim' onClick={handlePrev}>Prev</Button>
          <div style={{display: 'flex', gap: "8px"}}>
            <Button size='slim' onClick={onClose}>Finish</Button>
            <Button primary size='slim' url="/plan"> View Plans</Button>
          </div>
        </div>
        <div className="step-dots">
          <span></span>
          <span></span>
          <span className="active"></span>
        </div>
      </div>
    ),
  ];

  const confirmCloseMarkup = showConfirmClose ? (
    <div className="modal-content">
      <Text variant='headingMd'>Are you sure you want to close?</Text>
      <p className='step-description'>You can get help anytime from the "Getting Started" Page.</p>
      <div className='step-button'>
        <ButtonGroup>
          <Button onClick={onClose}>Close</Button>
          <Button primary onClick={toggleClosePage}>Back</Button>
        </ButtonGroup>
      </div>
    </div>
  ) : null;

  const confirmSkipMarkup = showConfirmSkip && !showConfirmClose ? (
    <div className="modal-content">
      <Text variant='headingMd'>Are you skip this step?</Text>
      <p className='step-description'>
          App embed is required for the assistant to show up.
          You can enable the app embed anytime through the theme editor.
      </p>
      <div className='step-button'>
        <ButtonGroup>
          <Button onClick={handleNext}>Skip</Button>
          <Button primary onClick={toggleSkipPage}>Back</Button>
        </ButtonGroup>
      </div>
    </div>
  ) : null;

  if (!isActive) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {!showConfirmClose && !showConfirmSkip &&
          <button className="close-button" onClick={toggleClosePage}>
            <Icon source={CancelMinor} color="base"/>
          </button>
        }
        {confirmCloseMarkup}
        {confirmSkipMarkup}
        {!showConfirmClose && !showConfirmSkip && (steps[step])}
      </div>
    </div>
  );
}