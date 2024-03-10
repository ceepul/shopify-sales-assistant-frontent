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

  setVHProperty() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        /* Block */
        .chat-widget {
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 9999;
        }
        
        /* Element: Toggle Button */
        .chat-widget__toggle {
          display: flex;
          align-items: center;
        }

        .chat-widget__toggle-button {
            width: 60px;
            height: 60px;
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
        
        .chat-widget__toggle-icon {
          width: 38px;
          height: 38px;
          transition: transform 0.2s ease, opacity 0.10s ease;
          opacity: 1;
        }
        
        .chat-widget__toggle-icon--rotate {
            transform: rotate(15deg);
        }
        
        .chat-widget__toggle-icon--fade {
            opacity: 0;
        }

        .chat-widget__toggle-button:hover {
            transform: scale(1.10);
        }
        
        .chat-widget__toggle-button:active {
            transform: scale(0.95);
        } 
        
        .chat-widget__hidden {
          display: none;
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

        .chat-widget__home-page {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .chat-widget__message-page {
          position: absolute;
          width: 100%;
        }

        .chat-widget__home-background {
          position: absolute;
          top: 0;
          width: 100%;
          height: 480px;
          background: linear-gradient(
            #F32132 0%, 
            rgba(237, 110, 120, 0.60) 70%, 
            #FFFFFF 100%
          );        
        }

        .chat-widget__home-header {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          height: 68px;
          width: 100%;
          margin-top: 24px;
          padding-inline: 16px;
        }

        .chat-widget__home-card-container {
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          width: 85%;
          height: calc(100% - 260px);
          background: rgba(255, 255, 255, 1);;
          box-shadow: 0 4px 6px rgba(128, 128, 128, 0.3);
          margin-left: auto;
          margin-right: auto;
          margin-top: 32px;
          border-radius: 10px;
        }

        .chat-widget__card-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 20px;
          overflow: hidden;
          transform: translateX(100%);
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        .chat-widget__card-image {
          border-radius: 10px;
        }
        
        .chat-widget__card-content.slide-in {
            opacity: 1;
            transform: translateX(0);
        }
        
        .chat-widget__card-content.slide-out {
            opacity: 0;
            transform: translateX(-100%);
        }

        .chat-widget__faq-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #bbbbbb;
          box-shadow: 0 2px 6px rgba(128, 128, 128, 0.6);
          border-radius: 10px;
          padding: 10px;
          width: 100%;
          margin-top: 12px;
        }

        .chat-widget__faq-button:hover {
          transform: scale(1.04);
          box-shadow: 0 2px 6px rgba(128, 128, 128, 1);
        }

        .chat-widget__faq-text {
          color: #ffffff;
          font-family: "Open Sans", Helvetica;
          font-size: 13px;
          font-weight: 400;
          line-height: 18px;
          letter-spacing: -0.005em;
          margin: 0;
          padding-right: 6px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .chat-widget__card-footer-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
        }

        .chat-widget__card-title {
          font-weight: 600;
          font-size: 18px;
          text-align: center;
        }
        
        .chat-widget__card-subtitle {
          font-size: 14px;
          text-align: center;
        }

        .chat-widget__card-button-container {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .chat-widget__card-button {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 36px;
          width: 36px;
          border-radius: 8px;
        }

        .chat-widget__dot-container {
          display: flex;
          align-items: center;
        }

        .chat-widget__card-dot {
          width: 8px;
          height: 8px;
          margin: 2px;
          background-color: #2e3138cc;
          border-radius: 50%;
          opacity: 0.4;
        }

        .chat-widget__card-dot.active {
          opacity: 1;
        }

        .chat-widget__flip {
          transform: rotate(180deg);
        }

        .chat-widget__rotate90 {
          transform: rotate(90deg);
        }

        .chat-widget__card-button:hover {
          background-color: rgba(128, 128, 128, 0.15);
        }
        
        .chat-widget__header-container {
          display: flex;
          justify-content: center;
          border: 0px none;
          height: 124px;
          width: 100%;
          top: 0;
          overflow: hidden;
          position: relative;
        }

        .chat-widget__header-container.fade-in {
          opacity: 1;
          transition: opacity 0.2s ease-in-out;
        }

        .chat-widget__header-container.fade-out {
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
        
        .chat-widget__header-background-round {
          z-index: 1;
          background-color: #47afff;
          border-radius: 396px/66px;
          box-shadow: 0px 0px 4px #8b8680;
          height: 116px;
          left:-60%;
          position: absolute;
          width: 220%;
        }
        
        .chat-widget__header-background-main {
          z-index: 1;
          background: linear-gradient(180deg, rgb(0, 139, 245) 0%, rgb(71, 175, 255) 100%);
          height: 106px;
          position: relative;
          width: 100%;
        }
        
        .chat-widget__header-content {
          z-index: 1;
          display: flex;
          align-items: center;
          height: 68px;
          position: absolute;
          top: 24px;
          width: 88%;
        }
        
        .chat-widget__avatar {
          width: 64px;
          height: 64px;
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
          font-size: 14px;
          font-weight: 300;
          line-height: 22px;
          white-space: nowrap;
        }

        .chat-widget__icon-container {
          padding: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border-radius: 8px;
        }
        
        .chat-widget__right-icon-container {
          cursor: pointer;
          padding: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border-radius: 8px;
          margin-left: auto;
        }

        .chat-widget__right-icon-container.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }     
        
        .chat-widget__right-icon-container:hover, .chat-widget__icon-container:hover{
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
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border-radius: 8px;
          border: none;
          margin-left: 10px;
          padding: 4px;
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

        .chat-widget__animated-message-left {
          background-color: #f1f2f4;
          border-radius: 10px 10px 10px 0px;
          align-self: flex-start;
          padding: 10px;
          margin-left: 20px;
          margin-bottom: 16px;
        }

        .chat-widget__animated-message-right {
          background-color: #f1f2f4;
          border-radius: 10px 10px 0px 10px;
          align-self: flex-end;
          padding: 10px;
          margin-right: 20px;
          margin-bottom: 16px;
        }

        #animatedMessage {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 1s forwards;
          animation-delay: 2s;
        }        

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
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

        .chat-widget__date-text {
          font-size: 14px;
          font-weight: 400;
          margin: 14px;
        }

        .chat-widget__loading-text {
          color: #2e3138cc;
          font-family: "Open Sans", Helvetica;
          font-size: 13px;
          font-weight: 400;
          margin: 0;
          margin-right: 8px;
        }

        .chat-widget__contact-form-container {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 10px;
          align-self: flex-start;
          padding: 20px;
          max-width: 50%;
          margin-bottom: 20px;
        }

        .chat-widget__contact-form-container:hover {
          transform: scale(1.05);
        }

        .chat-widget__contact-form-image {
          width: 100px;
        }

        .chat-widget__contact-form-text {
          font-family: "Open Sans", Helvetica;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          margin-top: 6px;
        }
        
        .chat-widget__product-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-self: flex-start;
          max-width: 90%;
          padding: 4px;
          margin-bottom: 16px;
        }
        
        .chat-widget__product-card {
          background-color: #ffffff;
          border-radius: 6px;
          box-shadow: 1px 1px 4px #999999;
          min-height: 210px;
          flex: 1 1 140px;  /* Grow, shrink, base width */
          max-width: 140px;  /* Optional: Max width */
          padding: 8px;
          display: flex;
          flex-direction: column;
        }
        
        .chat-widget__product-link:only-child .chat-widget__product-card {
          max-width: 70%;
          flex-grow: 1;
        }
        
        .chat-widget__product-image {
          display: flex;
          justify-content: center;
          margin: auto;
          max-height: 100%;
          max-width: 100%;
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
          cursor: pointer;
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
            bottom: 32px;
            right: 32px;
          }
        
          .chat-widget__toggle {
            bottom: 32px;
            right: 32px;
            top: auto;
            left: auto;
          }
        
          .chat-widget__box {
            width: 100vw;
            height: calc(var(--vh, 1vh) * 100);
            bottom: -31px;
            right: 0;
            border-radius: 0;
          }
        
          .chat-widget__body-container {
            height: calc((var(--vh, 1vh) * 100) - 248px);
          }
        }
      }      

      </style>
      <div id="chat-widget" class="chat-widget"></div>
    `;

    const shop = this.getAttribute('data-domain');
    const cachedPreferences = sessionStorage.getItem(`shopmate-preferences-${shop}`);

    // If preferences are in the cache, use them. Otherwise, fetch from API
    const preferencesPromise = cachedPreferences
      ? Promise.resolve(JSON.parse(cachedPreferences))
      : this.fetchPreferences(shop);

    preferencesPromise.then(preferences => {
      if (!preferences) {
        console.warn('Failed to fetch shopping assistant preferences');
        return;  // Exit the function if no preferences are fetched
      }
      if (preferences.overLimit) {
        return; // Exit the funciton if shop is overlimit
      }

      const accentRgb = hexToRgb(preferences.accentColour);
      const luminance = calculateLuminance(accentRgb);
      const isDark = luminance > 0.7 ? `-dark` : ``;

      const closeIconURL = this.getAttribute(`data-close-icon${isDark}-url`);
      const backIconURL = this.getAttribute(`data-back-icon${isDark}-url`)
      const backIconDarkURL = this.getAttribute(`data-back-icon-dark-url`)
      const resetIconURL = this.getAttribute(`data-reset-icon${isDark}-url`);
      const sendIconURL = this.getAttribute('data-send-icon-url');
      const xIconURL = this.getAttribute(`data-x-icon${isDark}-url`);
      const chatIconURL = this.getAttribute(`data-chat-icon${isDark}-url`);
      const autoOpen = this.getAttribute('data-auto-open'); // This is a string value when stored in session storage
      const position =  this.getAttribute('data-position');

      const widget = this.querySelector('#chat-widget');

      if (position === 'left') {
        widget.style.right = 'auto';
        widget.style.left = '32px';
      } else {
        widget.style.right = '32px';
        widget.style.left = 'auto';
      }

      // Create the toggle element
      const toggle = document.createElement('chat-toggle');
      toggle.classList.add('chat-widget__toggle');
      toggle.setAttribute('data-auto-open', autoOpen);
      toggle.setAttribute('data-accent-color', preferences.accentColour);
      toggle.setAttribute('data-show-launcher-text', preferences.showLauncherText);
      toggle.setAttribute('data-launcher-text', preferences.launcherText);
      toggle.setAttribute('data-x-icon-url', xIconURL);
      toggle.setAttribute('data-chat-icon-url', chatIconURL);
      toggle.setAttribute('data-position', position);

      // Create the ChatBox element using the custom constructor
      const box = document.createElement('chat-box');
      box.classList.add('chat-widget__box');
      box.setAttribute('data-shop', shop);
      box.setAttribute('data-auto-open', autoOpen);
      box.setAttribute('data-position', position);
      box.setAttribute('data-accent-color', preferences.accentColour);
      box.setAttribute('data-assistant-name', preferences.assistantName);
      box.setAttribute('data-greeting-line-one', preferences.greetingLineOne);
      box.setAttribute('data-greeting-line-two', preferences.greetingLineTwo);
      box.setAttribute('data-close-icon-url', closeIconURL);
      box.setAttribute('data-back-icon-url', backIconURL);
      box.setAttribute('data-back-icon-dark-url', backIconDarkURL);
      box.setAttribute('data-reset-icon-url', resetIconURL);
      box.setAttribute('data-send-icon-url', sendIconURL);
      box.setAttribute('data-show-support-form', preferences.showSupportForm);
      box.setAttribute('data-support-page-path', preferences.supportUrlPath);

      widget.append(toggle, box);

    }).catch(error => {
      console.error(`Error in processing preferences:`, error);
    });

    this.setVHProperty();
    window.addEventListener('resize', this.setVHProperty);
  }

  disconnectedCallback() {
    // Remove the event listener to avoid potential memory leaks
    window.removeEventListener('resize', this.setVHProperty);
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
      sessionStorage.setItem(`shopmate-preferences-${shop}`, JSON.stringify(preferences));
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
    this.accentColor = this.getAttribute('data-accent-color');
    this.accentRgb = hexToRgb(this.accentColor);
    this.luminance = calculateLuminance(this.accentRgb);
    this.showLauncherText = this.getAttribute('data-show-launcher-text');
    this.launcherText = this.getAttribute('data-launcher-text');
    this.position = this.getAttribute('data-position');

    this.xIconURL = this.getAttribute('data-x-icon-url');
    this.chatIconURL = this.getAttribute('data-chat-icon-url');

    window.addEventListener('chatBoxClosed', this.boundToggleChatBox);

    // If there is a value of open/closed in the local storage use that to set the icon
    // Otherwise use the value from autoOpen to determine the correct icon
    if (sessionStorage.getItem('shopmate-isChatBoxOpen') != null) {
      sessionStorage.getItem('shopmate-isChatBoxOpen') === 'true' ? this.updateIcon(true) : this.updateIcon(false)
    } else {
      this.autoOpen? this.updateIcon(true) : this.updateIcon(false);
      sessionStorage.setItem('shopmate-isChatBoxOpen', JSON.stringify(this.autoOpen))
    }
  }

  disconnectedCallback() {
    // Remove the global event listener when the element is removed from the DOM.
    window.removeEventListener('chatBoxClosed', this.boundToggleChatBox);
  }

  isChatBoxOpen() {
    return sessionStorage.getItem('shopmate-isChatBoxOpen') === 'true'
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
          <div class="chat-widget__toggle-button">
            <img class="chat-widget__toggle-icon" alt="Toggle Icon" src="${this.xIconURL}" />
          </div>
        `;
      } else {
        const ctaClass = this.position === 'left' ? 'chat-widget__animated-message-left' : 'chat-widget__animated-message-right';
        const ctaText = this.showLauncherText === 'true' && sessionStorage.getItem('shopmate-hasBeenOpened') != 'true' ? `
          <div class=${ctaClass} id="animatedMessage">
            <p class="chat-widget__assistant-text">${this.launcherText}</p>
          </div>
        ` : ``;
        this.innerHTML = this.position === 'left' ? `
          <div class="chat-widget__toggle-button">
            <img class="chat-widget__toggle-icon" alt="Toggle Icon" src="${this.chatIconURL}" />
          </div>
          ${ctaText}
        ` : `
          ${ctaText}
          <div class="chat-widget__toggle-button">
            <img class="chat-widget__toggle-icon" alt="Toggle Icon" src="${this.chatIconURL}" />
          </div>
        `;
      }

      const toggleButton = this.querySelector('.chat-widget__toggle-button');
      if (toggleButton) {
          toggleButton.style.backgroundColor = this.accentColor;
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
      sessionStorage.setItem('shopmate-isChatBoxOpen', JSON.stringify(false));

    } else {
      document.dispatchEvent(new CustomEvent('setupWebsocket')); // Dispatch an event to setup the websocket

      // Remove the text since the chat has now been opened
      sessionStorage.setItem('shopmate-hasBeenOpened', 'true');
      const animatedMessage = document.getElementById('animatedMessage');
      if (animatedMessage) {
          animatedMessage.style.animation = 'fadeInUp 0.4as reverse forwards';
          setTimeout(() => {
            animatedMessage.remove();
        }, 400);
      }
       
      chatBox.style.display = 'block';
      this.updateIcon(true);
      setTimeout(() => { 
        chatBox.style.opacity = '1';
        chatBox.style.transform = 'translateY(0px)';
        chatBox.style.pointerEvents = 'auto';
      }, 50);
      sessionStorage.setItem('shopmate-isChatBoxOpen', JSON.stringify(true));
    }
  } 
}
customElements.define('chat-toggle', ChatToggle);

class ChatBox extends HTMLElement  {
  constructor() {
    super();
    // Binding event handlers to this
    this.boundUpdatePosition = this.updatePosition.bind(this);
    this.boundBackIconClick = this.handleBackIconClick.bind(this);
    this.boundResetIconClick = this.handleResetIconClick.bind(this);
    this.boundCloseIconClick = this.handleCloseIconClick.bind(this);
    this.boundInputEvent = this.handleInputEvent.bind(this);
    this.boundSendButtonClick = this.handleSendButtonClick.bind(this);
    this.boundNextCardClick = this.handleNextCardClick.bind(this);
    this.boundPrevCardClick = this.handlePrevCardClick.bind(this);
    this.boundCardClick = this.handleCardClick.bind(this);
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
    this.greetingLineOne = this.getAttribute('data-greeting-line-one');
    this.greetingLineTwo = this.getAttribute('data-greeting-line-two');
    this.sendIconURL = this.getAttribute('data-send-icon-url');
    this.accentRgb = hexToRgb(this.accentColor);
    this.darkerAccentRgb = darkenRgb(this.accentRgb, 0.14);
    this.luminance = calculateLuminance(this.accentRgb);
    this.closeIconURL = this.getAttribute('data-close-icon-url');
    this.backIconURL = this.getAttribute('data-back-icon-url');
    this.backIconDarkURL = this.getAttribute('data-back-icon-dark-url');
    this.resetIconURL = this.getAttribute('data-reset-icon-url');
    this.showSupportForm = this.getAttribute('data-show-support-form');
    this.supportPagePath = this.getAttribute('data-support-page-path');
    
    this.isLoading = false;
    this.messages = sessionStorage.getItem('shopmate-messages') ? 
      JSON.parse(sessionStorage.getItem('shopmate-messages')) : [];

    this.threadId = sessionStorage.getItem('shopmate-threadId') ? 
      JSON.parse(sessionStorage.getItem('shopmate-threadId')) : null;
  
    this.currentPage = sessionStorage.getItem('shopmate-currentPage') ? 
      JSON.parse(sessionStorage.getItem('shopmate-currentPage')) : 'home';

    this.currentCardIndex = 0;
    this.autoSwitch = true;
    this.cardChangeInterval = null;

    // Update position initally
    this.updatePosition();

    const cachedFaqs = sessionStorage.getItem(`shopmate-faqs-${this.shop}`);
    this.faqs = cachedFaqs ? JSON.parse(cachedFaqs) : [];

    this.faqContent = this.setFaqContent();
    this.cardsData = this.setCardsData();
    // If faqs are in the cache, use them. Otherwise, fetch from API
    const faqsPromise = cachedFaqs
      ? Promise.resolve(JSON.parse(cachedFaqs))
      : this.fetchFaqs(this.shop);

    faqsPromise.then(data => {
      this.faqs = data;
      this.faqContent = this.setFaqContent();
      this.cardsData = this.setCardsData();
    });

    // Check session storage for open / closed state and set styling accordingly
    if (sessionStorage.getItem('shopmate-isChatBoxOpen') === 'true') {
      this.setupWebSocket();
      this.style.display = 'block';
      this.style.pointerEvents = 'auto';
      setTimeout(() => { 
        this.style.opacity = '1'; 
        this.style.transform = 'translateY(0px)';
      }, 50);
    }

    const homeBgGradientStyle = `
      background: linear-gradient(
        ${this.accentColor} 0%, 
        ${this.accentColor} 25%,
        rgb(${this.accentRgb[0]}, ${this.accentRgb[1]}, ${this.accentRgb[2]}, 0.60) 75%, 
        #FFFFFF 100%
      );        
    `;

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

    this.innerHTML = `
      <div id="home-page" class='chat-widget__hidden'>
        <div class="chat-widget__home-background" style="${homeBgGradientStyle}">&nbsp</div>
        <div id="home-page-content" class="chat-widget__home-page">
          <div class="chat-widget__home-header">
            <div class='chat-widget__title-container'>
              <div class="chat-widget__assistant-name" style="${textColorStyle}">${this.greetingLineOne}</div>
              <div class="chat-widget__assistant-subtitle" style="${textColorStyle}">${this.greetingLineTwo}</div>
            </div>
            <div id="home-page-close-button" class='chat-widget__right-icon-container'>
              <img class='chat-widget__header-icon' alt="Close icon" src="${this.closeIconURL}"/>
            </div>
          </div>
  
          <div id="card-container" class="chat-widget__home-card-container">
            <div class="chat-widget__card-content"></div>
            <div class="chat-widget__card-footer-container">
              <div class="chat-widget__card-title">Title</div>
              <div class="chat-widget__card-subtitle">Subtitle</div>
              <div class="chat-widget__card-button-container">
                <div id="prev-card-button" class="chat-widget__card-button">
                  <img class='chat-widget__header-icon' alt="Prev Page" src="${this.backIconDarkURL}"/>
                </div>
                <div class="chat-widget__dot-container">
                  <div class="chat-widget__card-dot">&nbsp;</div>
                  <div class="chat-widget__card-dot">&nbsp;</div>
                </div>
                <div id="next-card-button" class="chat-widget__card-button chat-widget__flip">
                  <img class='chat-widget__header-icon' alt="Next Page" src="${this.backIconDarkURL}"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="message-page" class="chat-widget__message-page chat-widget__hidden">
        <div class="chat-widget__header-container">
          <div class="chat-widget__header-background-round" style="${bgColorStyle}">&nbsp;</div>
          <div class="chat-widget__header-background-main" style="${bgGradientColorStyle}">&nbsp;</div>
          <div class="chat-widget__header-content">
            <div id="message-page-back-button" class='chat-widget__icon-container'>
              <img class='chat-widget__header-icon chat-widget__rotate90' alt="Back icon" src="${this.closeIconURL}"/>
            </div>
            <div class='chat-widget__title-container'>
              <div class="chat-widget__assistant-name" style="${assistantNameStyle}">${this.assistantName}</div>
              <div class="chat-widget__assistant-subtitle" style="${textColorStyle}">AI Shopping Assistant</div>
            </div>
            <div id="message-page-reset-button" class='chat-widget__right-icon-container'>
              <img class='chat-widget__header-icon' alt="Info icon" src="${this.resetIconURL}"/>
            </div>
          </div>
        </div>
      
        <div id="message-page-body" class="chat-widget__body-container"></div>
      </div>

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

    this.currentPage === 'home' ? (
      this.querySelector('#home-page').classList.remove('chat-widget__hidden')
    ) : (
      this.querySelector('#message-page').classList.remove('chat-widget__hidden')
    )

    this.renderMessages();
    this.setupCarousel();

    /* Add event listeners */
    window.addEventListener('resize', this.boundUpdatePosition);

    // Attach a single event listener to the bodyContainer
    const bodyContainer = this.querySelector('#message-page-body');
    
    bodyContainer.addEventListener('click', (e) => {
      const productLink = e.target.closest('.chat-widget__product-link');
      if (productLink) {
        const productId = productLink.getAttribute('data-product-id');
        this.addProductViewEvent(productId);

        let closeRequestEvent = new Event('requestChatBoxClose');
        window.dispatchEvent(closeRequestEvent);
        sessionStorage.setItem('shopmate-isChatBoxOpen', JSON.stringify(false));
        return;
      } 
      const contactLink = e.target.closest('.chat-widget__contact-form-container');
      if (contactLink) {
        let closeRequestEvent = new Event('requestChatBoxClose');
        window.dispatchEvent(closeRequestEvent);
        sessionStorage.setItem('shopmate-isChatBoxOpen', JSON.stringify(false));
        return;
      }
    });

    this.querySelector('#next-card-button').addEventListener('click', this.boundNextCardClick);
    this.querySelector('#prev-card-button').addEventListener('click', this.boundPrevCardClick);
    this.querySelector('#card-container').addEventListener('click', this.boundCardClick);
    this.querySelector('#message-page-back-button').addEventListener('click', this.boundBackIconClick);
    this.querySelector('#message-page-reset-button').addEventListener('click', this.boundResetIconClick);
    this.querySelector('#home-page-close-button').addEventListener('click', this.boundCloseIconClick);
    this.querySelector('#send-button').addEventListener('click', this.boundSendButtonClick);

    const input = this.querySelector('#chat-input');
    input.addEventListener('input', this.boundInputEvent);
    input.addEventListener('keydown', this.boundKeyDownEvent);

    document.addEventListener('setupWebsocket', this.boundSetupWebSocket); // Websocket event listner
  }

  disconnectedCallback() {
    /* Remove event listeners attached to Window or Document*/
    this.closeWebSocket();
    window.removeEventListener('resize', this.boundUpdatePosition);
    document.removeEventListener('setupWebsocket', this.boundSetupWebSocket);
  }

  async fetchFaqs(shop) {
    try {
        const response = await fetch(`https://y143kaik7d.execute-api.us-east-1.amazonaws.com/shop/faqs?shop=${shop}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        // Check if the response is not OK
        if (!response.ok) {
            console.error('Error fetching FAQs:', response.statusText);
            return [];
        }

        const jsonResponse = await response.json();
        // Extract the FAQs array from the response
        const faqs = jsonResponse.faqs || []; // Default to an empty array if faqs is not present

        sessionStorage.setItem(`shopmate-faqs-${shop}`, JSON.stringify(faqs));
        return faqs;

    } catch (error) {
        // Handle any exceptions during the fetch call
        console.error('Error fetching FAQs:', error);
        return [];
    }
  }

  setFaqContent() {
    const bgColorStyle = `
      background-color: ${this.accentColor}
    `;
    const content = this.faqs.length ? `
      <div id="faq-content">
        ${this.faqs.map((faq, index) => {
          return (
            `
              <div data-faq-index="${index}" class="chat-widget__faq-button" style="${bgColorStyle}">
                <div class="chat-widget__faq-text">${faq.question}</div>
                <img class='chat-widget__header-icon chat-widget__flip' alt="Next Page" src="${this.backIconURL}"/>
              </div>
            `)
        }).join('')}
      </div>
    ` : `
      <img class='chat-widget__card-image' 
        src='https://shopify-recommendation-app.s3.amazonaws.com/illustrations/faq-card-illustration.svg'
        alt='Illustration of a women standing with a question bubble above her head'
      />
    `;

    return content
  }

  setCardsData() {
    return [
      { 
        title: "AI Product Recommendations", 
        subtitle: "Tell us what you need and we’ll help find the perfect product!", 
        content: `
          <img class='chat-widget__card-image' 
            src='https://shopify-recommendation-app.s3.amazonaws.com/illustrations/recommendation-card-illustration.svg'
            alt='Illustration of a women sitting using a computer'
          />
        `,
        message: "What can I help you find?",
        page: "recommendation"
      },
      { 
        title: "FAQ", 
        subtitle: "Have a question? Ask away for immediate answers to frequently asked questions.", 
        content: this.faqContent,
        message: "Let me know if you have any questions!",
        page: "faq"
      },
    ]
  }

  /* Event handlers */
  handleBackIconClick() {
    this.switchPage('home');
  }

  handleResetIconClick() {
    const resetButton = document.getElementById('message-page-reset-button');
    
    if (!resetButton.disabled) {
      this.threadId = null;
      sessionStorage.setItem('shopmate-threadId', this.threadId);

      this.messages = [{role: 'assistant', content: 'How can I help you today?'}];
      sessionStorage.setItem('shopmate-messages', JSON.stringify(this.messages));
      this.renderMessages();
    }
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
      // Only submit if the button is not disabled:
      if (!sendButton.disabled) {
        this.handleSubmit();
      }
    }
  }
  
  handleNextCardClick(e) {
    e.stopPropagation();
    this.autoSwitch = false;
    clearInterval(this.cardChangeInterval);
    this.moveToNextCard();
  }

  handlePrevCardClick(e) {
    e.stopPropagation();
    this.autoSwitch = false;
    clearInterval(this.cardChangeInterval);
    this.currentCardIndex = (this.currentCardIndex - 1 + this.cardsData.length) % this.cardsData.length;
    this.updateCardContent(this.currentCardIndex);
  }

  handleCardClick() {
    this.autoSwitch = false;
    clearInterval(this.cardChangeInterval);
    this.switchPage('message');
    if (this.messages.length <= 1) {
      this.messages = [{role: 'assistant', content: this.cardsData[this.currentCardIndex].message}];
      sessionStorage.setItem('shopmate-messages', JSON.stringify(this.messages));
      this.renderMessages();
    }
  }

  /* Other Functions */
  setupCarousel() {
    this.cardChangeInterval = setInterval(() => {
        if (this.autoSwitch) this.moveToNextCard();
    }, 5000);

    this.updateCardContent(this.currentCardIndex);
  }

  setupWebSocket() {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      const connectionId = JSON.parse(sessionStorage.getItem('shopmate-websocketConnectionId'));
      const webSocketUrl = `wss://4af0m2aw8b.execute-api.us-east-1.amazonaws.com/production?shop=${this.shop}${connectionId ? `&connectionId=${connectionId}` : ''}`;
      this.websocket = new WebSocket(webSocketUrl);
      
      this.nextIndex = 0;
      this.lastIndex = null;

      this.messageHandlers = {
        stream: (payload) => {
          const data = payload.data;
          // If it is the first message, add a new message, check if there's anything in the buffer
          if (data.index === 0 || data.index === null || data.index === undefined) {
            this.addMessage(data.role, data.content);
            this.nextIndex = 1;
            this.checkBufferForNextMessage();
            return;
          }
          
          if (data.finish_reason){ // If it's the last message, set the final index
            this.lastIndex = data.index;
            this.checkBufferForNextMessage();
            return;
          } 

          /* If not first and not last */
          if (data.index === this.nextIndex) { // If this is the next segment to be added
            const lastAssistantMessage = this.messages.slice().reverse().find(msg => msg.role === 'assistant');
            lastAssistantMessage.content = `${lastAssistantMessage.content}${data.content}` // Add the new chunk to the last message
            this.nextIndex++;
            this.checkBufferForNextMessage();
          } else { // If not the next segment, buffer it for later.
            this.messageBuffer.push(data);
          }

          this.renderMessages(false);
        },
        message: (payload) => {
          const data = payload.data;
          this.addMessage(data.role, data.content);
        },
        sendConnectionId: (payload) => {
          sessionStorage.setItem('shopmate-websocketConnectionId', JSON.stringify(payload.data.connectionId));
        },
        sendThreadId: (payload) => {
          this.threadId = payload.data.threadId;
          sessionStorage.setItem('shopmate-threadId', JSON.stringify(payload.data.threadId));
        },
        showContactForm: () => {
          this.messages.push({ role: 'contact_form', content: '' });
          this.renderMessages();
        },
        showLoadingState: (payload) => {
          const data = payload.data;
          this.showLoading(data.text);
        },
        finish: (payload) => {
          if (this.isLoading) this.hideLoading(); 
          sessionStorage.setItem('shopmate-messages', JSON.stringify(this.messages));
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
            const lastAssistantMessage = this.messages.slice().reverse().find(msg => msg.role === 'assistant');
            lastAssistantMessage.content = `${lastAssistantMessage.content}${this.messageBuffer[i].content}`; 
            this.nextIndex++;
            foundIndex = i;
            break;
          }
        }

        if (foundIndex !== null) {
          this.messageBuffer.splice(foundIndex, 1); // Remove the used message from the buffer
          this.checkBufferForNextMessage(); // Check again after removing a message from buffer
        }

        this.renderMessages(false);
      };

      this.handleOpen = (event) => {
        this.websocket.send(JSON.stringify({ 
          action: 'getConnectionId',
        }));
      };

      // Handle incoming messages
      this.handleMessage = (event) => {
        const dataFromServer = JSON.parse(event.data);
        const actionType = dataFromServer.action;

        if (typeof this.messageHandlers[actionType] === 'function') {
          this.messageHandlers[actionType](dataFromServer);
        } else {
          console.warn("No handler found for action type:", actionType);
          if (this.isLoading) this.hideLoading(); 
          this.setDisableSendButton(false);
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
        this.removeWebsocketEventListeners();
        this.websocket = null;
      };

      // Add event listeners
      this.websocket.addEventListener('open', this.handleOpen);
      this.websocket.addEventListener('message', this.handleMessage);
      this.websocket.addEventListener('error', this.handleError);
      this.websocket.addEventListener('close', this.handleClose);
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

  switchPage(page) {
    const homePage = this.querySelector('#home-page');
    const homePageContent = this.querySelector('#home-page-content');
    const messagePage = this.querySelector('#message-page');
    const homeBackground = this.querySelector('.chat-widget__home-background');

    this.currentPage = page;
    sessionStorage.setItem('shopmate-currentPage', JSON.stringify(page));

    switch (page) {
      case('home'):
        homePageContent.style.opacity = '0';
        homePageContent.style.transition = 'opacity 0.2s ease-in-out'; 
        homePage.classList.remove('chat-widget__hidden');
        homeBackground.style.height = '124px';    
        homeBackground.style.transition = 'height 0.3s ease-in-out, background 0.3s ease-in-out';
        messagePage.style.opacity = '1';
        messagePage.style.transition = 'opacity 0.3s ease-in-out'
        setTimeout(() => {
          homeBackground.style.height = '480px';
          homePageContent.style.opacity = '1';
          messagePage.style.opacity = '0';
        }, 10);
        setTimeout(() => {
          messagePage.classList.add('chat-widget__hidden');
        }, 300);
        break;
      case('message'): 
        messagePage.style.opacity = '0';
        messagePage.style.transition = 'opacity 0.3s ease-in-out'; 
        messagePage.classList.remove('chat-widget__hidden'); 
        homeBackground.style.height = '480px';  
        homeBackground.style.transition = 'height 0.3s ease-in-out, background 0.3s ease-in-out';
        homePageContent.style.opacity = '1';
        homePageContent.style.transition = 'opacity 0.2s ease-in-out'
        setTimeout(() => {
          homeBackground.style.height = '124px';
          messagePage.style.opacity = '1';
          homePageContent.style.opacity = '0';
        }, 10);
        setTimeout(() => {
          homePage.classList.add('chat-widget__hidden');
        }, 300);
        break; 
    }
  }

  // Function to bind event listeners to FAQ buttons
  bindFaqButtonListeners() {
    const faqButtons = this.querySelectorAll('.chat-widget__faq-button');
    faqButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Retrieve the index from the data attribute
        const index = e.currentTarget.getAttribute('data-faq-index');
        const faqItem = this.faqs[index];

        this.switchPage('message');
        this.messages.length <= 1 ? 
          this.messages = [{role: 'user', content: faqItem.question}] : this.messages.push({role: 'user', content: faqItem.question});

        this.setDisableSendButton(true);
        this.renderMessages();
        this.showLoading();
        setTimeout(() => {
          this.hideLoading();
          this.messages.push({role: 'assistant', content: faqItem.answer});
          this.renderMessages();
          this.setDisableSendButton(false);
          sessionStorage.setItem('shopmate-messages', JSON.stringify(this.messages));
        }, 1000);
      });
    });
  }

  updateCardContent(index) {
    const cardContent = this.querySelector('.chat-widget__card-content');

    // Start sliding out and fading out the old content
    cardContent.classList.add('slide-out');

    // After the old content has slid out, update and slide in the new content
    setTimeout(() => {
        const cardData = this.cardsData[index];
        const cardTitle = this.querySelector('.chat-widget__card-title');
        const cardSubtitle = this.querySelector('.chat-widget__card-subtitle');

        cardTitle.textContent = cardData.title;
        cardSubtitle.textContent = cardData.subtitle;
        cardContent.innerHTML = cardData.content;

        if (cardData.page === 'faq') {
          this.bindFaqButtonListeners();
        }

        const dotList = this.querySelectorAll('.chat-widget__card-dot');
        dotList.forEach((dot, i) => {
          dot.classList.remove('active');
          if (i === index) {
            dot.classList.add('active')
          }
        })

        // Reset to starting position (off-screen to the right) without transition
        cardContent.classList.remove('slide-in', 'slide-out');
        cardContent.style.transition = 'none';
        cardContent.getBoundingClientRect(); // Trigger reflow to apply the changes without transition

        // Start sliding in and fading in the new content with transition
        cardContent.style.transition = '';
        cardContent.classList.add('slide-in');
    }, 250); // Delay should match the CSS transition duration
  }

  moveToNextCard() {
    this.currentCardIndex = (this.currentCardIndex + 1) % this.cardsData.length;
    this.updateCardContent(this.currentCardIndex);
  }
  
  updatePosition() {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 768) {
      // const transformValue = -32 + (windowWidth - 384) / 2 --> FOR CENTERING (NO LONGER NEEDED)
      if(this.position === 'left') {
        this.style.left = '50px';
        this.style.right = 'auto';
      } else {
        this.style.right = '50px';
        this.style.left = 'auto';
      }
    } else {
      if(this.position === 'left') {
        this.style.right = 'auto';
        this.style.left = '-32px';
      } else {
        this.style.left = 'auto';
        this.style.right = '-32px';
      }
    }
  }

  addMessage(role, content) {
    this.messages.push({ role, content });

    // Check the length of the messages array, if there is more than X messages, remove the oldest one.
    if (this.messages.length > 30) {
      this.messages.shift()
    }
    // Update messages in session storage
    sessionStorage.setItem('shopmate-messages', JSON.stringify(this.messages));
    // Render all messages again
    this.renderMessages();
  }

  renderMessages(updateAll = true) {
    const bodyContainer = this.querySelector('#message-page-body');
  
    // Display messages
    if (updateAll) {
      // Re-render all messages
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      bodyContainer.innerHTML = `
        <p class="chat-widget__date-text">${formattedDate}</p>
      `;
      this.messages.forEach((message, index) => {
        this.appendMessage(message.role, message.content, index);
      });
    } else {
      // Remove the last message
      const lastMessageElement = bodyContainer.lastElementChild;
      if (lastMessageElement) {
        lastMessageElement.remove();
      }
      // Append only the last message
      const lastMessageIndex = this.messages.length - 1;
      const lastMessage = this.messages[lastMessageIndex];
      this.appendMessage(lastMessage.role, lastMessage.content, lastMessageIndex);
    }
  }  

  appendMessage(role, content) {
    const bodyContainer = this.querySelector('#message-page-body');
    let markup;

    const bgColorStyle = `
      background-color: ${this.accentColor};
    `;

    const textColorStyle = `
      color: ${this.luminance > 0.7 ? '#2a2a2a' : '#ffffff'};
    `;

    if (role === 'assistant') {
      markup = `
      <div class="chat-widget__assistant-message">
        <p class="chat-widget__assistant-text">${content}</p>
      </div>
      `;
    } else if (role === 'user') {
      markup = `
      <div class="chat-widget__user-message" style="${bgColorStyle}">
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
    } else if (role === 'contact_form') {
      const contactFormStyle = `
        border: 2px solid rgba(${this.accentRgb[0]}, ${this.accentRgb[1]}, ${this.accentRgb[2]}, 0.80);
        box-shadow: 0px 4px 6px 2px rgba(${this.accentRgb[0]}, ${this.accentRgb[1]}, ${this.accentRgb[2]}, 0.80);
      `;
      const website_url = window.location.origin;
      const contactFormURL = `${website_url}${this.supportPagePath}`;
      markup = `
        <a href="${contactFormURL}" class="chat-widget__contact-form-container" style="${contactFormStyle}">
          <img class="chat-widget__contact-form-image" 
            src="https://shopify-recommendation-app.s3.amazonaws.com/illustrations/sent-message-illustration.svg"
            alt="Image of a letter"
          />
          <p class="chat-widget__contact-form-text">Contact Us</p>
        </a>
      `;
    }
  
    bodyContainer.insertAdjacentHTML('beforeend', markup);

    setTimeout(() => {
      bodyContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  showLoading(text) {
    const bodyContainer = this.querySelector('#message-page-body');

    if (text) {
      this.hideLoading();
      this.isLoading = true;
      const loadingMarkup = `
        <div class="chat-widget__loading-animation">
          <p class="chat-widget__loading-text">${text}</p>
          <div class="chat-widget__dot" style="animation-delay: 0.2s;">&nbsp;</div>
          <div class="chat-widget__dot" style="animation-delay: 0.4s;">&nbsp;</div>
          <div class="chat-widget__dot" style="animation-delay: 0.6s;">&nbsp;</div>
        </div>`;
      bodyContainer.insertAdjacentHTML('beforeend', loadingMarkup);
      setTimeout(() => {
        bodyContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (!this.isLoading) {
        this.isLoading = true;
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
  }

  hideLoading() {
    if (this.isLoading) {
      this.isLoading = false;
      const bodyContainer = this.querySelector('#message-page-body');
      const loadingElement = bodyContainer.querySelector('.chat-widget__loading-animation');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  setDisableSendButton = (disable) => {
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = disable;
    const resetButton = document.getElementById('message-page-reset-button')
    resetButton.disabled = disable;

    if (disable) {
      sendButton.classList.add('disabled');
      resetButton.classList.add('disabled');
    } else {
      sendButton.classList.remove('disabled');
      resetButton.classList.remove('disabled');
    }
  };

  async addProductViewEvent(productId) {
    const connectionId = JSON.parse(sessionStorage.getItem('shopmate-websocketConnectionId'));
    if (!connectionId) return;

    fetch(`https://y143kaik7d.execute-api.us-east-1.amazonaws.com/events/product-view`, {
      method: "POST",
      body: JSON.stringify({ shop: this.shop, productId, connectionId }),
      headers: { "Content-Type": "application/json" }
    })
  }

  async handleSubmit() {
    const input = this.querySelector('#chat-input');
    const charCountText = this.querySelector('.chat-widget__character-count-text');
    const text = input.value.trim();

    // Check if the text exceeds 200 characters
    if (text.length > 200) {
      return; // Exit the function early if the message is too long
    }

    // Check if the text is empty
    if (text === '') {
      return; // Exit the function early if the message is empty
    }

    if (this.currentPage != 'message') this.switchPage('message'); // Switch to the messaging page (if not already on it)
  
    this.setDisableSendButton(true);
    this.addMessage('user', text);

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
    }

    try {
      // Send the message through the WebSocket
      this.websocket.send(JSON.stringify({ 
        action: 'sendMessage',
        shop: this.shop, 
        message: this.messages[this.messages.length - 1], // Only send the most recent message (user)
        thread: this.threadId,
        showSupportForm: (this.showSupportForm === 'true')
      }));
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  }
}
customElements.define('chat-box', ChatBox);