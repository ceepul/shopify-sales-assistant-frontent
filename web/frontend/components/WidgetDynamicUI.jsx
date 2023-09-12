import './Widget.css';
import { useEffect, useState } from 'react';

export default function WidgetDynamicUI({preferences}) {

  const [assistantName, setAssistantName] = useState("ShopMate");
  const [accentColour, setAccentColour] = useState("#47AFFF");
  const [darkMode, setDarkMode] = useState(false);
  const [homeScreen, setHomeScreen] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome to our store! Are there any products I could help you find?"
  );
  const [avatarImageSrc, setAvatarImageSrc] = useState('default_v1.png')

  const [assistantNameFontSize, setAssistantNameFontSize] = useState('22px');

  useEffect(() => {
    if (preferences) {
      const { assistantName, accentColour, darkMode, homeScreen, welcomeMessage, avatarImageSrc } = preferences;
      setAssistantName(assistantName);
      setAccentColour(accentColour);
      setDarkMode(darkMode);
      setHomeScreen(homeScreen);
      setWelcomeMessage(welcomeMessage);
      setAvatarImageSrc(avatarImageSrc)
    }
  }, [preferences]);

  useEffect(() => {
    if (assistantName.length > 13) {
      setAssistantNameFontSize('20px')
    } else setAssistantNameFontSize('22px')
  }, [assistantName]);


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

  const accentRgb = hexToRgb(accentColour);
  const darkerAccentRgb = darkenRgb(accentRgb, 0.20); // Darken by 15%

  const headerBgMainStyle = {
    background: `linear-gradient(180deg, 
    rgb(${darkerAccentRgb[0]}, ${darkerAccentRgb[1]}, ${darkerAccentRgb[2]}) 0%, 
    rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}) 100%)`,
  };

  const headerBgStyle = {
    backgroundColor: accentColour,
  };
  
  const textColorStyle = {
    color: calculateLuminance(accentRgb) > 0.7 ? '#2a2a2a' : '#ffffff',
  };

  const assistantNameStyle = {
    ...textColorStyle,
    fontSize: assistantNameFontSize
  };

  const poweredByNameStyle = {
    color: calculateLuminance(accentRgb) > 0.7 ? '#2a2a2a' : accentColour,
  };

  const circleIconPath = calculateLuminance(accentRgb) > 0.7 ? "../assets/info-circle-dark.svg" : "../assets/info-circle.svg"
  const closeIconPath = calculateLuminance(accentRgb) > 0.7 ? "../assets/down-chevron-dark.svg" : "../assets/down-chevron.svg"

  const emptyMarkup = (
    <div className="body-container">
      <div className="capabilities-container">
        <img className='capabilities-icon' alt="Checklist icon" src="../assets/capabilities1.svg" />
        <div className="capabilities-text">Capabilities</div>
      </div>
      <div className="example-container">
          <p className="example-heading">Find exactly what your looking for</p>
          <p className="example-text">“Show me low-top white shoes”</p>
      </div>
      <div className="example-container">
          <div className="example-heading">Get smart style recommendations</div>
          <p className="example-text">“I need a top I can wear to a semi-formal event on a hot</p>
          <p className="example-text"> summer day and that will go with my beige dress pants”</p>
      </div>
    </div>
  )

  const populatedMarkup = (
    <div className='body-container'>
      <div className="assistant-message">
        <p className="assistant-text">{welcomeMessage}</p>
      </div>
    </div>
  )

  return (
    <div className="widget">

      <div className="header-container">
        <div className="header-background-round" style={headerBgStyle} />
        <div className="header-background-main" style={headerBgMainStyle} />
        <div className="header-content">
          <img className="avatar" alt="Avatar" src={`https://shopify-recommendation-app.s3.amazonaws.com/avatars/${preferences.avatarImageSrc}`} />
          <div className='title-container'>
            <div className="assistant-name" style={assistantNameStyle}>{assistantName}</div>
            <div className="assistant-subtitle" style={textColorStyle}>AI Shopping Assistant</div>
          </div>
          <div className='info-icon-container'>
            <img className='header-icon' alt="Info icon" src={circleIconPath}/>
          </div>
          <div className='close-icon-container'>
            <img className='header-icon' alt="Close icon" src={closeIconPath}/>
          </div>
        </div>
      </div>

      {homeScreen ? emptyMarkup : populatedMarkup}

      <footer className="footer-container">
        <div className="input-field">
          <div className="input-placeholder">Start typing...</div>
          <div className='send-button-container'>
            <img className='send-button' alt="Send icon" src="../assets/send2.svg" />
          </div>
        </div>
        <div className="footer-divider"/>
        <div className="powered-by-container">
          <div className="powered-by-text">Powered by</div>
          <div className="powered-by-name" style={poweredByNameStyle}>ShopMate</div>
        </div>
      </footer>

    </div>
  );
}

