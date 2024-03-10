import './Widget.css';
import { useEffect, useState } from 'react';
import { 
  infoCircle, 
  infoCircleDark,
  downChevron,
  downChevronDark,
  sendB,
  backIconDark,
  chatIcon,
  chatIconDark,
  resetIcon,
  resetIconDark
} from "../assets/index"
import { 
  SkeletonBodyText,
  VerticalStack,
  SkeletonDisplayText,
  AlphaCard,
  Box,
  Text
} from '@shopify/polaris';

export default function WidgetDynamicUI({ isLoading, fetchedPreferences }) {

  const [preferences, setPreferences] = useState({
    greetingLineOne: "Hi There 👋",
    greetingLineTwo: "How can we help?",
    accentColour: "#47AFFF",
    assistantName: "ShopMate",
    showLauncherText: true,
    launcherText: "Hi 👋 Anything I can help you find?",
    showSupportForm: false,
    welcomeMessage: "Welcome to our store! Are there any products I could help you find?",
    avatarImageSrc: "default_v1.png",
  })

  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (fetchedPreferences) {
      setPreferences(prev => ({
        ...prev,
        ...fetchedPreferences
      }));
    }
  }, [fetchedPreferences]);

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }
  
  function darkenRgb(rgb, percent) {
    return rgb.map(value => Math.round(value * (1 - percent)));
  }

  function calculateLuminance(rgb) {
    const normalizedRgb = rgb.map(val => val / 255);
    const luminance = 0.2126 * normalizedRgb[0] + 0.7152 * normalizedRgb[1] + 0.0722 * normalizedRgb[2];
    return luminance;
  } 

  const accentRgb = hexToRgb(preferences.accentColour);
  const darkerAccentRgb = darkenRgb(accentRgb, 0.14); // Darken by 14%

  const headerBgMainStyle = {
    background: `linear-gradient(180deg, 
    rgb(${darkerAccentRgb[0]}, ${darkerAccentRgb[1]}, ${darkerAccentRgb[2]}) 0%, 
    rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}) 100%)`,
  };

  const headerBgStyle = {
    backgroundColor: preferences.accentColour,
  };

  const homeBgGradientStyle = {
    background: `linear-gradient(
      ${preferences.accentColour} 0%, 
      ${preferences.accentColour} 25%,
      rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.60) 75%, 
      #FFFFFF 100%
    )`        
  };
  
  const textColorStyle = {
    color: calculateLuminance(accentRgb) > 0.7 ? '#2a2a2a' : '#ffffff',
  };

  const assistantNameStyle = {
    ...textColorStyle
  };

  const poweredByNameStyle = {
    color: calculateLuminance(accentRgb) > 0.7 ? '#2a2a2a' : preferences.accentColour,
  };

  const isDark = calculateLuminance(accentRgb) > 0.7 ? true : false;
  const closeIconPath = isDark ? downChevronDark : downChevron;
  const chatIconPath = isDark ? chatIconDark : chatIcon;
  const resetIconPath = isDark ? resetIconDark : resetIcon;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (isLoading) {
    return (
      <VerticalStack gap="2">
        <SkeletonDisplayText />
        <AlphaCard>
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <SkeletonBodyText />
          <Box minHeight="20.25rem"/>
        </AlphaCard>
      </VerticalStack>
    )
  }

  return (
    <VerticalStack gap="4">
      <Text variant="headingLg" as="h5">Preview</Text>
      <div className="widget">
        {currentPage === 'home' && 
          <div>
            <div className="home-background" style={homeBgGradientStyle} />
            <div className="home-page">
              <div className="home-header">
                <div className='title-container'>
                  <div className="assistant-name" style={textColorStyle} >{preferences.greetingLineOne}</div>
                  <div className="assistant-subtitle" style={textColorStyle} >{preferences.greetingLineTwo}</div>
                </div>
                <div id="home-page-close-button" className='right-icon-container'>
                  <img className='header-icon' alt="Close icon" src={closeIconPath}/>
                </div>
              </div>
      
              <div onClick={() => setCurrentPage('message')} className="home-card-container">
                <div className="card-content">
                <img className='card-image' 
                  src='https://shopify-recommendation-app.s3.amazonaws.com/illustrations/recommendation-card-illustration.svg'
                  alt='Illustration of a women sitting using a computer'
                />
                </div>
                <div className="card-footer-container">
                  <div className="card-title">AI Product Recommendations</div>
                  <div className="card-subtitle">Tell us what you need and we’ll help find the perfect product!</div>
                  <div className="card-button-container">
                    <div className="card-button">
                      <img className='header-icon' alt="Prev Page" src={backIconDark}/>
                    </div>
                    <div className="dot-container">
                      <div className="card-dot active">&nbsp;</div>
                      <div className="card-dot">&nbsp;</div>
                    </div>
                    <div className="card-button flip">
                      <img className='header-icon' alt="Next Page" src={backIconDark}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
  
        {currentPage === 'message' && 
          <div className="message-page">
            <div className="header-container">
              <div className="header-background-round" style={headerBgStyle}>&nbsp;</div>
              <div className="header-background-main" style={headerBgMainStyle}>&nbsp;</div>
              <div className="header-content">
                <div className='icon-container' onClick={() => setCurrentPage('home')}>
                  <img className='header-icon rotate90' alt="Back icon" src={closeIconPath}/>
                </div>
                <div className='title-container'>
                  <div className="assistant-name" style={assistantNameStyle}>{preferences.assistantName}</div>
                  <div className="assistant-subtitle" style={textColorStyle}>AI Shopping Assistant</div>
                </div>
                <div className='right-icon-container'>
                  <img className='header-icon' alt="Info icon" src={resetIconPath}/>
                </div>
              </div>
            </div>
          
            <div id="message-page-body" class="body-container">
              <p class="date-text">{formattedDate}</p>
              <div className="assistant-message">
                <p className="assistant-text">{preferences.welcomeMessage}</p>
              </div>
            </div>
          </div>
        }
  
        <div className="footer-container">
          <div className="footer-divider"/>
          <div className="input-group">
            <div className="input-field">Start typing...</div>
            <button className="send-button-container">
              <img className='send-button' alt="Send icon" src={sendB} />
            </button>
          </div>
          <div className="character-count-container">
            <div className="character-count-text">0/200</div>
          </div>
          <div className="powered-by-container">
            <div className="powered-by-text">Powered by</div>
            <div className="powered-by-name" style={poweredByNameStyle}>
              <div style={poweredByNameStyle}>ShopMate</div>
            </div>
          </div>
        </div>
  
      </div>

      <div className='toggle'>
        <div className="toggle-button" style={headerBgStyle}>
          <img className="toggle-icon" alt="Toggle Icon" src={chatIconPath} />
        </div>
        {preferences.showLauncherText &&
          <div id="#animated-message" className="animated-message-left">
            <p class="assistant-text">{preferences.launcherText}</p>
          </div>
        }
      </div>
    </VerticalStack>
  );
}