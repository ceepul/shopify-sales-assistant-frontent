function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const updatedHex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(updatedHex);
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

class ChatWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        /* Block */
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        /* Element: Toggle Button */
        .chat-widget__toggle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font: inherit;
            cursor: pointer;
            outline: none;
            border: none;
            box-shadow: 0px 0px 4px #616161;
        }
        
        /* Element: Toggle Button Icon */
        .chat-widget__toggle-icon {
          width: 38px;
          height: 38px;
          transition: transform 0.2s ease, opacity 0.10s ease;
          opacity: 1; /* Fully visible by default */
        }
        
        .chat-widget__toggle-icon--rotate {
            transform: rotate(15deg);
        }
        
        .chat-widget__toggle-icon--fade {
            opacity: 0; /* Fully transparent */
        }

        /* Pseudo-classes for the Toggle Button using BEM */
        .chat-widget__toggle:hover {
            transform: scale(1.10);
        }
        
        .chat-widget__toggle:active {
            transform: scale(0.95);
        }      

        .chat-widget__box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: absolute;
          border: none;
          border-radius: 20px;
          width: 384px;
          height: 700px;
          bottom: 72px;
          right: 50px;
          background-color: #ffffff;
          overflow: hidden;
          transition: opacity 0.3s, transform 0.3s;
          opacity: 0;
          pointer-events: none;
          transform: translateY(20px);
          box-shadow: 0 4px 8px rgba(128, 128, 128, 0.2);
        }
        
        .chat-widget__header-container {
          display: flex;
          justify-content: center;
          border: 0px none;
          height: 128px;
          width: 100%;
          top: 0;
          overflow: hidden;
        }
        
        .chat-widget__header-background-round {
          z-index: 1;
          background-color: #47afff;
          border-radius: 396px/66px;
          box-shadow: 0px 0px 4px #8b8680;
          height: 128px;
          left:-204px;
          position: absolute;
          width: 792px;
        }
        
        .chat-widget__header-background-main {
          z-index: 1;
          background: linear-gradient(180deg, rgb(0, 139, 245) 0%, rgb(71, 175, 255) 100%);
          height: 120px;
          position: relative;
          width: 100%;
        }
        
        .chat-widget__header-content {
          z-index: 1;
          display: flex;
          align-items: center;
          height: 68px;
          position: absolute;
          top: 34px;
          width: 342px;
        }
        
        .chat-widget__avatar {
          width: 68px;
          height: 68px;
        }
        
        .chat-widget__title-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-left: 15px;
        }
        
        .chat-widget__assistant-name {
          color: #ffffff;
          font-family: "Open Sans", Helvetica;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 22px;
          white-space: nowrap;
        }
        
        .chat-widget__assistant-subtitle {
          color: #ffffff;
          font-family: "Open Sans", Helvetica;
          font-size: 13px;
          font-weight: 300;
          line-height: 22px;
          white-space: nowrap;
        }
        
        .chat-widget__info-icon-container {
          position: absolute;
          padding: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          right: 34px;
          border-radius: 8px;
        }
        
        .chat-widget__close-icon-container {
          position: absolute;
          padding: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          right: -8px;
          border-radius: 8px;
        }
        
        .chat-widget__info-icon-container:hover, .chat-widget__close-icon-container:hover {
          background-color: rgba(128, 128, 128, 0.15);
        }
        
        .chat-widget__header-icon {
          width: 24px;
          height: 24px;
        }
        
        .chat-widget__body-container {
          top: -8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          height: 464px;
          padding-inline: 20px;
          overflow-y: scroll;
          scrollbar-width: none; /* For Firefox */
          -ms-overflow-style: none;  /* For Internet Explorer and Edge */
        }
        
        /* For Chrome, Safari and Opera */
        .chat-widget__body-container::-webkit-scrollbar {
          display: none;
        }

        .chat-widget__capabilities-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 40px;
          margin-bottom: 16px;
        }
        
        .chat-widget__capabilities-icon {
          height: 64px;
          width: 64px;
        }
        
        .chat-widget__capabilities-text {
          color: #969caa80;
          font-family: "Open Sans", Helvetica;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          margin-top: 12px;
          white-space: nowrap;
        }
        
        .chat-widget__example-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 16px;
          background-color: #d9d9d933;
          border-radius: 10px;
          position: relative;
          width: 332px;
          padding: 8px;
        }
        
        .chat-widget__example-heading {
          color: #969caab2;
          font-family: "Open Sans", Helvetica;
          font-size: 12px;
          font-weight: 400;
          line-height: 22px;
          white-space: nowrap;
          margin: 0;
        }
        
        .chat-widget__example-text {
          color: #969caa80;
          font-family: "Open Sans", Helvetica;
          font-size: 12px;
          font-weight: 400;
          line-height: 22px;
          letter-spacing: 0.01em;
          white-space: nowrap;
          margin: 0;
        }
        
        .chat-widget__footer-container {
          background-color: #ffffff;
          height: 120px;
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        
        .chat-widget__input-group {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 12px 4px;
        }
        
        .chat-widget__input-field {
          flex-grow: 1;
          height: 60px;
          max-height: 108px;
          border: none;
          outline: none;
          font-family: "Open Sans", Helvetica;
          font-size: 16px;
          font-weight: 400;
          color: #969caa;
          overflow-y: auto;
          resize: none;
          line-height: 1.3em;
          box-sizing: border-box;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
        }

        .chat-widget__input-field:focus {
          box-shadow: none;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .chat-widget__input-field::-webkit-scrollbar {
          display: none;
        }
        
        .chat-widget__send-button-container {
          height: 40px;
          width: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border-radius: 8px;
          border: none;
          margin-left: 10px;
        }
        
        .chat-widget__send-button-container:hover {
          background-color: rgba(128, 128, 128, 0.1);
        }

        .chat-widget__send-button-container.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }     
        
        .chat-widget__send-button {
          object-fit: cover;
          height: 32px;
          width: 32px;
        }   
        
        .chat-widget__footer-divider {
          width: 90%;
          height: 2px;
          background: lightgrey;
          margin: 0 auto;
        }
        
        .chat-widget__powered-by-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 24px;
          width: 124px;
          position: absolute;
          bottom: 16px;
          right: 24px;
        }
        
        .chat-widget__powered-by-text {
          color: #969caa;
          font-family: "Open Sans", Helvetica;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 22px;
          white-space: nowrap;
          margin-right: 5px;
        }
        
        .chat-widget__powered-by-name {
          color: #008bf5;
          text-decoration: none;
          font-family: "Open Sans", Helvetica;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 22px;
          white-space: nowrap;
        }

        .chat-widget__powered-by-name a:hover {
          text-decoration: underline;
        }

        .chat-widget__character-count-container {
          height: 24px;
          width: 64px;
          position: absolute;
          bottom: 16px;
          left: 24px;
        }
        
        .chat-widget__character-count-text {
          color: #969caa;
          font-family: "Open Sans", Helvetica;
          font-size: 10px;
          font-weight: 400;
          line-height: 22px;
        }

        .chat-widget__character-count-text.highlight {
          color: #E00000;
        }

        .chat-widget__first-message {
          margin-top: 32px;
        }
        
        .chat-widget__assistant-message {
          background-color: #f1f2f4;
          border-radius: 10px 10px 10px 0px;
          align-self: flex-start;
          padding: 10px;
          max-width: 85%;
          margin-bottom: 20px;
        }
        
        .chat-widget__user-message {
          background-color: #47afffce;
          border-radius: 10px 10px 0px 10px;
          align-self: flex-end;
          padding: 10px;
          max-width: 85%;
          margin-bottom: 20px;
        }
        
        .chat-widget__assistant-text {
          color: #2e3138cc;
          font-family: "Open Sans", Helvetica;
          font-size: 13px;
          font-weight: 400;
          line-height: 18px;
          letter-spacing: -0.005em;
          margin: 0;
        }
          
        .chat-widget__user-text {
            color: #ffffff;
            font-family: "Open Sans", Helvetica;
            font-size: 13px;
            font-weight: 400;
            line-height: 18px;
            letter-spacing: -0.005em;
            margin: 0;
        }
        
        .chat-widget__product-container {
          display: flex;
          gap: 10px;
          border-radius: 10px;
          align-self: flex-start;
          min-height: 238px;
          max-width: 90%;
          padding: 4px;
          margin-bottom: 16px;
          overflow-x: scroll;
          overflow-y: hidden;
        }
        
        .chat-widget__product-card {
          background-color: #ffffff;
          border-radius: 6px;
          box-shadow: 1px 1px 4px #999999;
          min-height: 210px;
          min-width: 156px;
          max-width: 156px;
          padding: 8px;
          display: flex;
          flex-direction: column;
        }
        
        .chat-widget__product-image {
          display: flex;
          justify-content: center;
          margin: auto;
          max-height: 140px;
          max-width: 140px;
          border-radius: 4px;
        }
        
        .chat-widget__product-title {
          color: #000000cc;
          font-family: "Open Sans", Helvetica;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -1%;
          line-height: 18px;
          white-space: normal;
          overflow: hidden; 
          text-overflow: ellipsis; 
          display: -webkit-box; 
          -webkit-line-clamp: 2; 
          -webkit-box-orient: vertical;
          margin-top: auto;
        }
        
        .chat-widget__product-action-container {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
        }
        
        .chat-widget__product-price {
          color: #2e3138cc;
          font-family: "Open Sans", Helvetica;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
          white-space: nowrap;
          margin-top: auto; /* Pushes price to the bottom */
        }      
        
        .chat-widget__product-addToCart-button {
          background-color: #47afffcc;
          border-radius: 4px;
          height: 20px;
          width: 72px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .chat-widget__product-addToCart-text {
          font-family: "Open Sans", Helvetica;
          color: #ffffff;
          font-size: 8px;
          font-weight: 400;
          white-space: nowrap;
        }

        .chat-widget__product-link {
          text-decoration: none;
          color: inherit;
          display: inline-block;
        }  
        
        .chat-widget__loading-animation {
          background-color: #f1f2f4;
          border-radius: 10px 10px 10px 0px;
          align-self: flex-start;
          display: flex;
          align-items: center;
          padding: 12px;
          max-width: 85%;
          margin-bottom: 20px;
        }
        
        .chat-widget__dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 2px;
          background-color: #2e3138cc;
          border-radius: 50%;
          opacity: 0;
          animation: chat-widget__fadeInOut 1.5s infinite;
        }
        
        @keyframes chat-widget__fadeInOut {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }  

        @media only screen and (max-width: 768px) {
          .chat-widget {
              bottom: 20px;
              right: 20px;
          }
      
          .chat-widget__toggle {
              bottom: 20px;
              right: 20px;
              top: auto;
              left: auto; 
          }
      
          .chat-widget__box {
              width: 100vw;
              height: 90vh;
              bottom: -20px;
              right: -20px;
              border-radius: 0px;
          }

          .chat-widget__header-background-round {
            width: 200vw;
            left: -50vw;
            border-radius: 100vw/66px;
          }

          .chat-widget__body-container {
            height: 62%;
          }
      }      

      </style>
      <div id="chat-widget" class="chat-widget"></div>
    `;

    const shop = this.getAttribute('data-domain');
    const cachedPreferences = sessionStorage.getItem(`preferences-${shop}`);

    // If preferences are in the cache, use them. Otherwise, fetch from API
    const preferencesPromise = cachedPreferences
      ? Promise.resolve(JSON.parse(cachedPreferences))
      : this.fetchPreferences(shop);

    preferencesPromise.then(preferences => {
      if (!preferences) {
        console.error('Failed to fetch shopping assistant preferences');
        return;  // Exit the function if no preferences are fetched
      }
      if (preferences.overLimit) {
        return; // Exit the funciton if shop is overlimit
      }

      const closeIconURL = this.getAttribute('data-close-icon-url');
      const closeIconDarkURL = this.getAttribute('data-close-icon-dark-url');
      const infoIconURL = this.getAttribute('data-info-icon-url');
      const infoIconDarkURL = this.getAttribute('data-info-icon-dark-url');
      const sendIconURL = this.getAttribute('data-send-icon-url');
      const capabilitiesIconURL = this.getAttribute('data-capabilities-icon-url');
      const xIconURL = this.getAttribute('data-x-icon-url');
      const xIconDarkURL = this.getAttribute('data-x-icon-dark-url');
      const chatIconURL = this.getAttribute('data-chat-icon-url');
      const chatIconDarkURL = this.getAttribute('data-chat-icon-dark-url');
      const autoOpen = this.getAttribute('data-auto-open'); // This is a string value when stored in session storage
      const position =  this.getAttribute('data-position');


      const widget = this.querySelector('#chat-widget');

      if (position === 'left') {
        widget.style.right = 'auto';
        widget.style.left = '20px';
      } else {
        widget.style.right = '20px';
        widget.style.left = 'auto';
      }

      // Create the toggle element
      const toggle = document.createElement('chat-toggle');
      toggle.classList.add('chat-widget__toggle');

      toggle.setAttribute('data-auto-open', autoOpen);
      toggle.setAttribute('data-accent-color', preferences.accentColour);
      toggle.setAttribute('data-x-icon-url', xIconURL);
      toggle.setAttribute('data-x-icon-dark-url', xIconDarkURL);
      toggle.setAttribute('data-chat-icon-url', chatIconURL);
      toggle.setAttribute('data-chat-icon-dark-url', chatIconDarkURL);

      // Create the ChatBox element using the custom constructor
      const box = document.createElement('chat-box');
      box.classList.add('chat-widget__box');

      box.setAttribute('data-shop', shop);
      box.setAttribute('data-auto-open', autoOpen);
      box.setAttribute('data-position', position);
      box.setAttribute('data-accent-color', preferences.accentColour);
      box.setAttribute('data-assistant-name', preferences.assistantName);
      box.setAttribute('data-home-screen', preferences.homeScreen);
      box.setAttribute('data-welcome-message', preferences.welcomeMessage);
      box.setAttribute('data-avatar-image-src', preferences.avatarImageSrc);
      box.setAttribute('data-info-icon-url', infoIconURL);
      box.setAttribute('data-info-icon-dark-url', infoIconDarkURL);
      box.setAttribute('data-close-icon-url', closeIconURL);
      box.setAttribute('data-close-icon-dark-url', closeIconDarkURL);
      box.setAttribute('data-send-icon-url', sendIconURL);
      box.setAttribute('data-capabilities-icon-url', capabilitiesIconURL);

      widget.append(toggle, box);


    }).catch(error => {
      console.error(`Error in processing preferences:`, error);
    });
  }

  async fetchPreferences(shop) {
    try {
      const response = await fetch(`https://y143kaik7d.execute-api.us-east-1.amazonaws.com/shop/preferences?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
    
      if (!response.ok) {
        console.error('Error fetching preferences:', error);
        return null;
      }

      const preferences = await response.json();
      // Save the fetched preferences to the cache
      sessionStorage.setItem(`preferences-${shop}`, JSON.stringify(preferences));
      return preferences;
  
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }
}
customElements.define('chat-widget', ChatWidget);

class ChatToggle extends HTMLElement  {
  constructor() {
    super();
    // Bind the toggleChatBox function to this instance.
    this.boundToggleChatBox = this.toggleChatBox.bind(this);
    
    // Add event listener to the instance itself.
    this.addEventListener('click', this.boundToggleChatBox);

    window.addEventListener('requestChatBoxClose', this.boundToggleChatBox);
  }

  connectedCallback() {
    // Initialize from attributes, these are set when the element is added to the DOM
    this.autoOpen = this.getAttribute('data-auto-open') === 'true';
    const accentColor = this.getAttribute('data-accent-color');
    this.style.backgroundColor = accentColor;
    this.accentRgb = hexToRgb(accentColor);
    this.luminance = calculateLuminance(this.accentRgb);

    const xIconURL = this.getAttribute('data-x-icon-url');
    const xIconDarkURL = this.getAttribute('data-x-icon-dark-url');
    const chatIconURL = this.getAttribute('data-chat-icon-url');
    const chatIconDarkURL = this.getAttribute('data-chat-icon-dark-url');
    this.xIconURL = this.luminance > 0.7 ? xIconDarkURL : xIconURL;
    this.chatIconURL = this.luminance > 0.7 ? chatIconDarkURL : chatIconURL;

    window.addEventListener('chatBoxClosed', this.boundToggleChatBox);

    // If there is a value of open/closed in the local storage use that to set the icon
    // Otherwise use the value from autoOpen to determine the correct icon
    if (sessionStorage.getItem('isChatBoxOpen') != null) {
      sessionStorage.getItem('isChatBoxOpen') === 'true' ? this.updateIcon(true) : this.updateIcon(false)
    } else {
      this.autoOpen? this.updateIcon(true) : this.updateIcon(false);
      sessionStorage.setItem('isChatBoxOpen', JSON.stringify(this.autoOpen))
    }
  }

  disconnectedCallback() {
    // Remove the global event listener when the element is removed from the DOM.
    window.removeEventListener('chatBoxClosed', this.boundToggleChatBox);
  }

  isChatBoxOpen() {
    return sessionStorage.getItem('isChatBoxOpen') === 'true'
  }
  
  updateIcon(isChatBoxOpen) {
    const iconElement = this.querySelector('.chat-widget__toggle-icon');
  
    if (iconElement) {
      // Begin rotation and start fading out.
      iconElement.classList.add('chat-widget__toggle-icon--rotate', 'chat-widget__toggle-icon--fade');
  
      // Once the icon is fully faded out (after 0.15s), switch the icon source.
      setTimeout(() => {
        if (isChatBoxOpen) {
          iconElement.src = this.xIconURL;
          iconElement.alt = "Close Icon";
        } else {
          iconElement.src = this.chatIconURL;
          iconElement.alt = "Open Chat Icon";
        }
        // Start fading in the new icon (removing the fade class).
        iconElement.classList.remove('chat-widget__toggle-icon--fade');
      }, 100); // This is the duration of the opacity transition.
  
      // After the rotation completes, remove the rotation class.
      setTimeout(() => {
        iconElement.classList.remove('chat-widget__toggle-icon--rotate');
      }, 200);
    } else {
      // Fallback for if there's no icon element.
      if (isChatBoxOpen) {
        this.innerHTML = `
          <img class="chat-widget__toggle-icon" alt="Toggle Icon" src="${this.xIconURL}" />
        `;
      } else {
        this.innerHTML = `
          <img class="chat-widget__toggle-icon" alt="Toggle Icon" src="${this.chatIconURL}" />
        `;
      }
    }
  }   

  toggleChatBox() {
    const chatBox = this.getRootNode().querySelector('.chat-widget__box');
    if (!chatBox) {
      return
    }
  
    if (this.isChatBoxOpen()) {
      this.updateIcon(false); // update icon before starting the close animation
      chatBox.style.opacity = '0';
      chatBox.style.transform = 'translateY(20px)';
      chatBox.style.pointerEvents = 'none';
      setTimeout(() => { 
        chatBox.style.display = 'none';
      }, 300);
      sessionStorage.setItem('isChatBoxOpen', JSON.stringify(false));

    } else {
      document.dispatchEvent(new CustomEvent('setupWebsocket')); // Dispatch an event to setup the websocket
       
      chatBox.style.display = 'block';
      this.updateIcon(true);
      setTimeout(() => { 
        chatBox.style.opacity = '1';
        chatBox.style.transform = 'translateY(0px)';
        chatBox.style.pointerEvents = 'auto';
      }, 50);
      sessionStorage.setItem('isChatBoxOpen', JSON.stringify(true));
    }
  } 
}
customElements.define('chat-toggle', ChatToggle);

class ChatBox extends HTMLElement  {
  constructor() {
    super();
    // Binding event handlers to this
    this.boundUpdatePosition = this.updatePosition.bind(this);
    this.boundInfoIconClick = this.handleInfoIconClick.bind(this);
    this.boundCloseIconClick = this.handleCloseIconClick.bind(this);
    this.boundInputEvent = this.handleInputEvent.bind(this);
    this.boundSendButtonClick = this.handleSendButtonClick.bind(this);
    this.boundKeyDownEvent = this.handleKeyDownEvent.bind(this);
    this.boundSetupWebSocket = this.setupWebSocket.bind(this);

    this.websocket = null;
    this.messageBuffer = [];
  }

  connectedCallback() {
    // Initialize properties using attributes
    this.shop = this.getAttribute('data-shop');
    this.autoOpen = this.getAttribute('data-auto-open') === 'true';
    this.position = this.getAttribute('data-position');
    this.accentColor = this.getAttribute('data-accent-color');
    this.assistantName = this.getAttribute('data-assistant-name');
    this.avatarImageSrc = this.getAttribute('data-avatar-image-src');
    this.welcomeMessage = this.getAttribute('data-welcome-message');
    this.sendIconURL = this.getAttribute('data-send-icon-url');
    this.capabilitiesIconURL = this.getAttribute('data-capabilities-icon-url');
    this.accentRgb = hexToRgb(this.accentColor);
    this.darkerAccentRgb = darkenRgb(this.accentRgb, 0.14);
    this.luminance = calculateLuminance(this.accentRgb);
    this.infoIconURL = this.luminance > 0.7 ? this.getAttribute('data-info-icon-dark-url') : this.getAttribute('data-info-icon-url');
    this.closeIconURL = this.luminance > 0.7 ? this.getAttribute('data-close-icon-dark-url') : this.getAttribute('data-close-icon-url');
    this.showHomeScreen = this.getAttribute('data-home-screen') === 'true';

    this.messages = [];
    this.isLoading = false;

    // Update position initally
    this.updatePosition();

    // Load previous messages from local storage if they exist
    if (sessionStorage.getItem('messages')) {
      this.messages = JSON.parse(sessionStorage.getItem('messages'));
    } else if (!this.showHomeScreen) {
      this.messages.push({ role: "assistant", content: this.welcomeMessage })
    }

    // Check session storage for open / closed state and set styling accordingly
    console.log(`Checking session storage`)
    if (sessionStorage.getItem('isChatBoxOpen') === 'true') {
      this.setupWebSocket();
      this.style.display = 'block';
      this.style.pointerEvents = 'auto';
      setTimeout(() => { 
        this.style.opacity = '1'; 
        this.style.transform = 'translateY(0px)';
      }, 50);
    }

    const bgGradientColorStyle = `
      background: linear-gradient(180deg, 
      rgb(${this.darkerAccentRgb[0]}, ${this.darkerAccentRgb[1]}, ${this.darkerAccentRgb[2]}) 0%, 
      rgb(${this.accentRgb[0]}, ${this.accentRgb[1]}, ${this.accentRgb[2]}) 100%);
    `;

    const bgColorStyle = `
      background-color: ${this.accentColor}
    `;

    const textColorStyle = `
      color: ${this.luminance > 0.7 ? '#2a2a2a' : '#ffffff'}
    `;

    const assistantNameStyle = `
      color: ${this.luminance > 0.7 ? '#2a2a2a' : '#ffffff'};
      font-size: ${this.assistantName.length > 16 ? '18px' : this.assistantName.length > 13 ? '20px' : '22px'};
    `;

    const poweredByNameStyle = `
      color: ${this.luminance > 0.7 ? '#2a2a2a' : this.accentColor}
    `;

    const infoIconPath = `${this.infoIconURL}`
    const closeIconPath = `${this.closeIconURL}`

    this.innerHTML = `
      <div class="chat-widget__header-container">
        <div class="chat-widget__header-background-round" style="${bgColorStyle}">&nbsp;</div>
        <div class="chat-widget__header-background-main" style="${bgGradientColorStyle}">&nbsp;</div>
        <div class="chat-widget__header-content">
          <img class="chat-widget__avatar" alt="Avatar" src="https://shopify-recommendation-app.s3.amazonaws.com/avatars/${this.avatarImageSrc}" />
          <div class='chat-widget__title-container'>
            <div class="chat-widget__assistant-name" style="${assistantNameStyle}">${this.assistantName}</div>
            <div class="chat-widget__assistant-subtitle" style="${textColorStyle}">AI Shopping Assistant</div>
          </div>
          <div class='chat-widget__info-icon-container'>
            <img class='chat-widget__header-icon' alt="Info icon" src="${infoIconPath}"/>
          </div>
          <div class='chat-widget__close-icon-container'>
            <img class='chat-widget__header-icon' alt="Close icon" src="${closeIconPath}"/>
          </div>
        </div>
      </div>
    
      <div class="chat-widget__body-container"></div>
    
      <div class="chat-widget__footer-container">
        <div class="chat-widget__footer-divider"/>
        <div class="chat-widget__input-group">
          <textarea id="chat-input" class="chat-widget__input-field" placeholder="Start typing..."></textarea>
          <button id="send-button" class="chat-widget__send-button-container">
            <img class='chat-widget__send-button' alt="Send icon" src="${this.sendIconURL}" />
          </button>
        </div>
        <div class="chat-widget__character-count-container">
          <div class="chat-widget__character-count-text">0/200</div>
        </div>
        <div class="chat-widget__powered-by-container">
          <div class="chat-widget__powered-by-text">Powered by</div>
          <div class="chat-widget__powered-by-name" style="${poweredByNameStyle}">
            <a href="https://apps.shopify.com/shopmate-1" target="_blank" style="${poweredByNameStyle}">ShopMate</a>
          </div>
        </div>
      </div>
    `;

    this.renderMessages();

    /* Add event listeners */
    window.addEventListener('resize', this.boundUpdatePosition);

    const infoIcon = this.querySelector('.chat-widget__info-icon-container');
    infoIcon.addEventListener('click', this.boundInfoIconClick);

    const closeIcon = this.querySelector('.chat-widget__close-icon-container');
    closeIcon.addEventListener('click', this.boundCloseIconClick);

    const input = this.querySelector('#chat-input');
    input.addEventListener('input', this.boundInputEvent);
    input.addEventListener('keydown', this.boundKeyDownEvent);

    const sendButton = this.querySelector('#send-button');
    sendButton.addEventListener('click', this.boundSendButtonClick);

    document.addEventListener('setupWebsocket', this.boundSetupWebSocket); // Websocket event listner
  }

  disconnectedCallback() {
    /* Remove event listeners */
    const infoIcon = this.querySelector('.chat-widget__info-icon-container');
    if (infoIcon) {
      infoIcon.removeEventListener('click', this.boundInfoIconClick);
    }

    const closeIcon = this.querySelector('.chat-widget__close-icon-container');
    if (closeIcon) {
      closeIcon.removeEventListener('click', this.boundCloseIconClick);
    }

    const input = this.querySelector('#chat-input');
    if (input) {
      input.removeEventListener('input', this.boundInputEvent);
      input.removeEventListener('keydown', this.boundKeyDownEvent);
    }

    const sendButton = this.querySelector('#send-button');
    if (sendButton) {
      sendButton.removeEventListener('click', this.boundSendButtonClick);
    }

    this.closeWebSocket();
    window.removeEventListener('resize', this.boundUpdatePosition);
    document.removeEventListener('setupWebsocket', this.boundSetupWebSocket);
  }

  /* Event handlers */
  handleInfoIconClick() {
    this.showHomeScreen = !this.showHomeScreen;
    this.renderMessages();
  }

  handleCloseIconClick() {
    window.dispatchEvent(new Event('chatBoxClosed'));
  }

  handleInputEvent(e) {
    let charCount = e.target.value.length;
    const charCountText = this.querySelector('.chat-widget__character-count-text');
    charCountText.textContent = `${charCount}/200`;
    if(charCount > 200) {
      charCountText.classList.add('highlight');
    } else {
      charCountText.classList.remove('highlight');
    }
  }

  handleSendButtonClick(e) {
    e.preventDefault();
    const sendButton = document.getElementById('send-button');
    // Only submit if the button is not disabled:
    if (!sendButton.disabled) {
      this.handleSubmit();
    }
  }  

  handleKeyDownEvent(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const sendButton = document.getElementById('send-button');
      console.log(`Send button disable state: ${sendButton.disabled}`)

      // Only submit if the button is not disabled:
      if (!sendButton.disabled) {
        this.handleSubmit();
      }
    }
  }  

  /* Other Functions */
  setupWebSocket() {
    console.log("Setting up websocket.")
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      const connectionId = JSON.parse(sessionStorage.getItem('websocketConnectionId'));
      const webSocketUrl = `wss://4af0m2aw8b.execute-api.us-east-1.amazonaws.com/production?shop=${this.shop}${connectionId ? `&connectionId=${connectionId}` : ''}`;
      this.websocket = new WebSocket(webSocketUrl);
      
      this.nextIndex = 0;
      this.lastIndex = null;

      this.messageHandlers = {
        stream: (payload) => {
          const data = payload.data;
          console.log(data.content, data.index)

          // If it is the first message, add a new message, check if there's anything in the buffer
          if (data.index === 0 || data.index === null || data.index === undefined) {
            this.addMessage(data.role, data.content);
            this.nextIndex = 1;
            this.checkBufferForNextMessage();
            return;
          }
          
          if (data.finish_reason){ // If it's the last message, set the final index
            console.log("FINAL INDEX IS:", data.index)
            this.lastIndex = data.index;
            this.checkBufferForNextMessage();
            return;
          } 

          /* If not first and not last */
          if (data.index === this.nextIndex) { // If this is the next segment to be added
            const lastMessage = this.messages[this.messages.length - 1]; // Get the last message
            lastMessage.content = `${lastMessage.content}${data.content}` // Add the new chunk to the last message
            this.nextIndex++;
            this.checkBufferForNextMessage();
          } else { // If not the next segment, buffer it for later.
            this.messageBuffer.push(data);
          }

          this.renderMessages();
        },
        message: (payload) => {
          console.log('Handle products...')
          const data = payload.data;
          this.addMessage(data.role, data.content);
          this.renderMessages();
        },
        sendConnectionId: (payload) => {
          sessionStorage.setItem('websocketConnectionId', JSON.stringify(payload.data.connectionId));
        },
        finish: (payload) => {
          sessionStorage.setItem('messages', JSON.stringify(this.messages));
          this.nextIndex = 0;
          this.lastIndex = null;
          this.messageBuffer = [];
          this.setDisableSendButton(false);
        }
      };

      this.checkBufferForNextMessage = () => {
        let foundIndex = null;

        for (let i = 0; i < this.messageBuffer.length; i++) {
          if (this.messageBuffer[i].index === this.nextIndex) {
            const lastMessage = this.messages[this.messages.length - 1];
            lastMessage.content = `${lastMessage.content}${this.messageBuffer[i].content}`; 
            this.nextIndex++;
            foundIndex = i;
            break;
          }
        }

        if (foundIndex !== null) {
          this.messageBuffer.splice(foundIndex, 1); // Remove the used message from the buffer
          this.checkBufferForNextMessage(); // Check again after removing a message from buffer
        }

        this.renderMessages();
      };

      this.handleOpen = (event) => {
        this.websocket.send(JSON.stringify({ 
          action: 'getConnectionId',
        }));
      };

      // Handle incoming messages
      this.handleMessage = (event) => {
        const dataFromServer = JSON.parse(event.data);
        if (this.isLoading) this.hideLoading(); 

        const actionType = dataFromServer.action;
        console.log(`Action type: ${actionType}`)
        if (typeof this.messageHandlers[actionType] === 'function') {
          this.messageHandlers[actionType](dataFromServer);
        } else {
          console.warn("No handler found for action type:", actionType);
        }
      };
    
      // Handle possible errors
      this.handleError = (event) => {
        console.error('WebSocket error:', event);
        this.setDisableSendButton(false);
        this.closeWebSocket(); // Close the websocket on error if not already closed
        this.websocket = null; // Reset the websocket instance to null
      };
    
      // Handle socket closure
      this.handleClose = (event) => {
        console.log('WebSocket closed:', event);
        this.removeWebsocketEventListeners();
        this.websocket = null;
      };

      // Add event listeners
      this.websocket.addEventListener('open', this.handleOpen);
      this.websocket.addEventListener('message', this.handleMessage);
      this.websocket.addEventListener('error', this.handleError);
      this.websocket.addEventListener('close', this.handleClose);
    } else {
      console.log('WebSocket is already open, not reconnecting.');
    }
  }

  removeWebsocketEventListeners() {
    // Check if the websocket exists and is not null
    if(this.websocket) {
      // Remove the event listeners
      this.websocket.removeEventListener('open', this.handleOpen);
      this.websocket.removeEventListener('message', this.handleMessage);
      this.websocket.removeEventListener('error', this.handleError);
      this.websocket.removeEventListener('close', this.handleClose);
    }
  }

  closeWebSocket() {
    this.removeWebsocketEventListeners();
    if (this.websocket) {
      this.websocket.close();
    }
  }  
  
  updatePosition() {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 768) {
      const transformValue = -20 + (windowWidth - 384) / 2

      if(this.position === 'left') {
          if (windowWidth < 524) {
              this.style.left = `${transformValue}px`;
              this.style.right = 'auto';
          } else {
              this.style.left = '50px';
              this.style.right = 'auto';
          }
      } else {
          if (windowWidth < 524) {
              this.style.right = `${transformValue}px`;
              this.style.left = 'auto';
          } else {
              this.style.right = '50px';
              this.style.left = 'auto';
          }
      }
    } else {
      this.style.left = 'auto';
      this.style.right = '-20px';
    }
  }

  addMessage(role, content) {
    this.messages.push({ role, content });

    // Check the length of the messages array, if there is more than X messages, remove the oldest one.
    if (this.messages.length > 30) {
      this.messages.shift()
    }
    // Update messages in session storage
    sessionStorage.setItem('messages', JSON.stringify(this.messages));
    // Render all messages again
    this.renderMessages();
  }

  renderMessages() {
    const bodyContainer = this.querySelector('.chat-widget__body-container');
    bodyContainer.innerHTML = '';

    if (this.messages.length === 0 || this.showHomeScreen) {
      // Show the empty state markup
      bodyContainer.innerHTML = `
        <div class="chat-widget__capabilities-container">
          <img class="chat-widget__capabilities-icon" alt="Capabilities icon" src="${this.capabilitiesIconURL}" />
          <div class="chat-widget__capabilities-text">Capabilities</div>
        </div>
        <div class="chat-widget__example-container">
            <p class="chat-widget__example-heading">Find exactly what your looking for</p>
            <p class="chat-widget__example-text">“Show me low-top white shoes”</p>
        </div>
        <div class="chat-widget__example-container">
            <div class="chat-widget__example-heading">Get smart product recommendations</div>
            <p class="chat-widget__example-text">“I need a top I can wear to a semi-formal event on a hot</p>
            <p class="chat-widget__example-text"> summer day and that will go with my beige pants”</p>
        </div>
      `;
    } else {
      // Display messages
      this.messages.forEach((message, index) => {
        this.appendMessage(message.role, message.content, index);
      });
    }
  }

  appendMessage(role, content, index) {
    const bodyContainer = this.querySelector('.chat-widget__body-container');
    let markup;

    const bgColorStyle = `
      background-color: ${this.accentColor};
    `;

    const textColorStyle = `
      color: ${this.luminance > 0.7 ? '#2a2a2a' : '#ffffff'};
    `;

    const firstMessageClass = index === 0 ? 'chat-widget__first-message' : '';

    if (role === 'assistant') {
      markup = `
      <div class="chat-widget__assistant-message ${firstMessageClass}">
        <p class="chat-widget__assistant-text">${content}</p>
      </div>
      `;
    } else if (role === 'user') {
      markup = `
      <div class="chat-widget__user-message ${firstMessageClass}" style="${bgColorStyle}">
        <p class="chat-widget__user-text" style="${textColorStyle}">${content}</p>
      </div>
      `;
    } else if (role === 'product') {
      const website_url = window.location.origin;
      markup = "<div class='chat-widget__product-container'>";

      content.forEach(product => {
        const productURL = `${website_url}/products/${product.producthandle}`;
        markup += `
          <a href="${productURL}" class="chat-widget__product-link" data-product-id="${product.productId}">
            <div class='chat-widget__product-card'>
              <img class="chat-widget__product-image" alt="${product.imagealt}" src="${product.imagesrc}" />
              <div class='chat-widget__product-title'>${product.title}</div>
              <div class='chat-widget__product-action-container'>
                <p class='chat-widget__product-price'>$${product.price}</p>
              </div>
            </div>
          </a>`;
      });
      
      markup += "</div>";
    }
  
    bodyContainer.insertAdjacentHTML('beforeend', markup);

    // Get all the product-link elements
    const productLinks = bodyContainer.querySelectorAll('.chat-widget__product-link');
    productLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const productId = e.currentTarget.getAttribute('data-product-id');
        this.addProductViewEvent(productId);

        // Dispatch an event to request the chat box to toggle/close.
        let closeRequestEvent = new Event('requestChatBoxClose');
        window.dispatchEvent(closeRequestEvent);

        sessionStorage.setItem('isChatBoxOpen', JSON.stringify(false));
      });
    });

    setTimeout(() => {
      bodyContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  showLoading() {
    if (!this.isLoading) {
      this.isLoading = true;
      const bodyContainer = this.querySelector('.chat-widget__body-container');
      const loadingMarkup = `
        <div class="chat-widget__loading-animation">
          <div class="chat-widget__dot" style="animation-delay: 0.2s;">&nbsp;</div>
          <div class="chat-widget__dot" style="animation-delay: 0.4s;">&nbsp;</div>
          <div class="chat-widget__dot" style="animation-delay: 0.6s;">&nbsp;</div>
        </div>`;
      bodyContainer.insertAdjacentHTML('beforeend', loadingMarkup);
      setTimeout(() => {
        bodyContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  hideLoading() {
    if (this.isLoading) {
      this.isLoading = false;
      const bodyContainer = this.querySelector('.chat-widget__body-container');
      const loadingElement = bodyContainer.querySelector('.chat-widget__loading-animation');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  setDisableSendButton = (disable) => {
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = disable;
    
    if (disable) {
      sendButton.classList.add('disabled');
    } else {
      sendButton.classList.remove('disabled');
    }
  };

  async addProductViewEvent(productId) {
    fetch(`https://y143kaik7d.execute-api.us-east-1.amazonaws.com/events/product-view`, {
      method: "POST",
      body: JSON.stringify({ shop: this.shop, productId: productId }),
      headers: { "Content-Type": "application/json" }
    })
  }

  async handleSubmit() {
    const input = this.querySelector('#chat-input');
    const charCountText = this.querySelector('.chat-widget__character-count-text');
    const text = input.value.trim();

    // Check if the text exceeds 200 characters
    if (text.length > 200) {
      console.log('Message is too long. Not sent.');
      return; // Exit the function early if the message is too long
    }

    // Check if the text is empty
    if (text === '') {
      return; // Exit the function early if the message is empty
    }
  
    this.setDisableSendButton(true);
    this.addMessage('user', text);

    this.showHomeScreen = false;  // Don't show the homescreen, show the messages instead
    this.renderMessages();
    this.showLoading(); // Show the ... animation

    input.value = '';
    charCountText.textContent = '0/200';

    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      // Initialize WebSocket connection if it's not already connected
      this.setupWebSocket();
      // Optional: Wait for connection to be established if needed
      while(this.websocket.readyState !== WebSocket.OPEN) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.log('websocket connection succesfull')
    }

    try {
      // Send the message through the WebSocket
      this.websocket.send(JSON.stringify({ 
        action: 'sendMessage',
        shop: this.shop, 
        messages: this.messages.slice(-9) // Only send the 9 most recent messages
      }));
    } catch (error) {
      console.error('Error sending message: ', error);
    }    
  }
}
customElements.define('chat-box', ChatBox);