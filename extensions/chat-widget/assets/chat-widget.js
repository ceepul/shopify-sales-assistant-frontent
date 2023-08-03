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

class ChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <style>
      #chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }

      button[is="chat-toggle"] {
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
        box-shadow: box-shadow: 0px 0px 4px #616161;
        ;
      }

      .toggle-icon {
        width: 36px;
        height: 36px;
      }

      button[is="chat-toggle"]:hover {
        transform: scale(1.10);
      }

      button[is="chat-toggle"]:active {
        transform: scale(0.95);
      }

      div[is="chat-box"] {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: absolute;
        border: none;
        border-radius: 20px;
        width: 384px;
        height: 600px;
        bottom: 72px;
        right: 50px;
        background-color: #ffffff;
        overflow: hidden;
        transition: opacity 0.3s, transform 0.3s;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .header-container {
        display: flex;
        justify-content: center;
        border: 0px none;
        height: 128px;
        width: 100%;
        top: 0;
        overflow: hidden;
      }
      
      .header-background-round {
        z-index: 1;
        background-color: #47afff;
        border-radius: 396px/66px;
        box-shadow: 0px 0px 4px #8b8680;
        height: 128px;
        left:-204px;
        position: absolute;
        width: 792px;
      }
      
      .header-background-main {
        z-index: 1;
        background: linear-gradient(180deg, rgb(0, 139, 245) 0%, rgb(71, 175, 255) 100%);
        height: 120px;
        position: relative;
        width: 100%;
      }
      
      .header-content {
        z-index: 1;
        display: flex;
        align-items: center;
        height: 68px;
        position: absolute;
        top: 34px;
        width: 334px;
      }
      
      .avatar {
        width: 68px;
        height: 68px;
      }
      
      .title-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-left: 15px;
      }
      
      .assistant-name {
        color: #ffffff;
        font-family: "Open Sans", Helvetica;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 22px;
        white-space: nowrap;
      }
      
      .assistant-subtitle {
        color: #ffffff;
        font-family: "Open Sans", Helvetica;
        font-size: 13px;
        font-weight: 300;
        line-height: 22px;
        white-space: nowrap;
      }
      
      .info-icon-container {
        padding: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        margin-left: 34px;
        border-radius: 8px;
      }
      
      .close-icon-container {
        padding: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        margin-left: 4px;
        border-radius: 8px;
      }
      
      .info-icon-container:hover,  .close-icon-container:hover {
        background-color: rgba(128, 128, 128, 0.15);
      }
      
      .header-icon {
        width: 24px;
        height: 24px;
      }
      
      .body-container {
        top: -8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        height: 364px;
        padding-inline: 20px;
        overflow-y: scroll;
        scrollbar-width: none; /* For Firefox */
        -ms-overflow-style: none;  /* For Internet Explorer and Edge */
      }
      
      /* For Chrome, Safari and Opera */
      .body-container::-webkit-scrollbar {
        display: none;
      }

      .capabilities-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 40px;
        margin-bottom: 16px;
      }
      
      .capabilities-icon {
        height: 64px;
        width: 64px;
      }
      
      .capabilities-text {
        color: #969caa80;
        font-family: "Open Sans", Helvetica;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.01em;
        margin: 0;
        margin-top: 12px;
        white-space: nowrap;
      }
      
      .example-container {
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
      
      .example-heading {
        color: #969caab2;
        font-family: "Open Sans", Helvetica;
        font-size: 12px;
        font-weight: 400;
        line-height: 22px;
        white-space: nowrap;
        margin: 0;
      }
      
      .example-text {
        color: #969caa80;
        font-family: "Open Sans", Helvetica;
        font-size: 12px;
        font-weight: 400;
        line-height: 22px;
        letter-spacing: 0.01em;
        white-space: nowrap;
        margin: 0;
      }
      
      .footer-container {
        background-color: #ffffff;
        height: 120px;
        position: absolute;
        bottom: 0;
        width: 100%;
      }
      
      .input-group {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 12px 4px;
      }
      
      .input-field {
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
      
      /* Hide scrollbar for Chrome, Safari and Opera */
      .input-field::-webkit-scrollbar {
        display: none;
      }
      
      .send-button-container {
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
      
      .send-button-container:hover {
        background-color: rgba(128, 128, 128, 0.1);
      }
      
      .send-button {
        object-fit: cover;
        height: 32px;
        width: 32px;
      }      
      
      .footer-divider {
        width: 90%;
        height: 2px;
        background: lightgrey;
        margin: 0 auto;
      }
      
      .powered-by-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 24px;
        width: 124px;
        position: absolute;
        bottom: 16px;
        right: 24px;
      }
      
      .powered-by-text {
        color: #969caa;
        font-family: "Open Sans", Helvetica;
        font-size: 10px;
        font-weight: 400;
        letter-spacing: 0;
        line-height: 22px;
        white-space: nowrap;
        margin-right: 5px;
      }
      
      .powered-by-name {
        color: #008bf5;
        font-family: "Open Sans", Helvetica;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0;
        line-height: 22px;
        white-space: nowrap;
      }

      .first-message {
        margin-top: 32px;
      }
      
      .assistant-message {
        background-color: #f1f2f4;
        border-radius: 10px 10px 10px 0px;
        align-self: flex-start;
        padding: 10px;
        max-width: 85%;
        margin-bottom: 20px;
      }
      
      .user-message {
        background-color: #47afffce;
        border-radius: 10px 10px 0px 10px;
        align-self: flex-end;
        padding: 10px;
        max-width: 85%;
        margin-bottom: 20px;
      }
      
      .assistant-text {
        color: #2e3138cc;
        font-family: "Open Sans", Helvetica;
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: -0.005em;
        margin: 0;
    }
      
    .user-text {
        color: #ffffff;
        font-family: "Open Sans", Helvetica;
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: -0.005em;
        margin: 0;
    }
      
      .product-container {
        display: flex;
        gap: 10px;
        background-color: #f1f2f4;
        border-radius: 10px;
        align-self: flex-start;
        min-height: 238px;
        max-width: 90%;
        margin-top: 8px;
        padding: 10px;
        overflow-x: scroll;
        overflow-y: hidden;
      }
      
      .product-card {
        background-color: #ffffff;
        border-radius: 6px;
        min-height: 210px;
        min-width: 156px;
        max-width: 156px;
        padding: 8px;
      }
      
      .product-image {
        display: flex;
        justify-content: center;
        margin: auto;
        max-height: 140px;
        max-width: 140px;
        border-radius: 4px;
      }
      
      .product-title {
        color: #000000cc;
        font-family: "Open Sans", Helvetica;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: -1%;
        line-height: 18px;
        white-space: nowrap;
        overflow: hidden;
        margin-top: 8px;
      }
      
      .product-action-container {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
      }
      
      .product-price {
        color: #2e3138cc;
        font-family: "Open Sans", Helvetica;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        white-space: nowrap;
      }
      
      .product-addToCart-button {
        background-color: #47afffcc;
        border-radius: 4px;
        height: 20px;
        width: 72px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .product-addToCart-text {
        font-family: "Open Sans", Helvetica;
        color: #ffffff;
        font-size: 8px;
        font-weight: 400;
        white-space: nowrap;
      }

    </style>
    <div id="chat-widget"></div>
    `;
  }

  connectedCallback() {
    const shop = this.getAttribute('data-domain');
    const cachedPreferences = sessionStorage.getItem(`preferences-${shop}`);

    // If preferences are in the cache, use them. Otherwise, fetch from API
    const preferencesPromise = cachedPreferences
      ? Promise.resolve(JSON.parse(cachedPreferences))
      : this.fetchPreferences(shop);

    preferencesPromise.then(preferences => {
      console.log(preferences)
      if (!preferences) {
        console.error('Failed to fetch shopping assistant preferences');
        return;  // Exit the function if no preferences are fetched
      }

      const avatarURL = this.getAttribute('data-avatar-url');
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

      // This determines whether the chatbot opens automatically.
      // TODO: Setup and fetch from store preferences
      const autoOpen = true;

      const toggle = new ChatToggle(
        autoOpen,
        preferences.accentColour,
        xIconURL,
        xIconDarkURL,
        chatIconURL,
        chatIconDarkURL
      );
      toggle.setAttribute('is', 'chat-toggle');
  
      const box = new ChatBox(
        autoOpen,
        preferences.accentColour,
        preferences.assistantName,
        preferences.homeScreen,
        preferences.welcomeMessage,
        avatarURL, 
        infoIconURL, 
        infoIconDarkURL,
        closeIconURL,
        closeIconDarkURL,
        sendIconURL,
        capabilitiesIconURL
      );
      box.setAttribute('is', 'chat-box');
  
      this.shadowRoot.querySelector('#chat-widget').append(toggle, box);
    });
  }

  async fetchPreferences(shop) {
    console.log(shop)
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/preferences?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
    
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

class ChatToggle extends HTMLButtonElement {
  constructor(
    autoOpen,
    accentColor,
    xIconURL,
    xIconDarkURL,
    chatIconURL,
    chatIconDarkURL
  ) {
    super();
    this.autoOpen = autoOpen;
    this.style.backgroundColor = accentColor;
    this.addEventListener('click', this.toggleChatBox.bind(this));
    this.xIconURL = xIconURL;
    this.xIconDarkURL = xIconDarkURL;
    this.chatIconURL = chatIconURL;
    this.chatIconDarkURL = chatIconDarkURL;
    this.accentRgb = hexToRgb(accentColor);
    this.luminance = calculateLuminance(this.accentRgb);
    window.addEventListener('chatBoxClosed', () => this.updateIcon(false));
  }

  connectedCallback() {
    // If there is a value of open/closed in the local storage use that to set the icon
    // Otherwise use the value from autoOpen to determine the correct icon
    if (sessionStorage.getItem('isChatBoxOpen') != null) {
      this.updateIcon(sessionStorage.getItem('isChatBoxOpen') === 'true' ? true : false)
    } else {
      this.autoOpen? this.updateIcon(true) : this.updateIcon(false);
    }
  }
  
  isChatBoxOpen() {
    const chatBox = this.getRootNode().querySelector('div[is="chat-box"]');
    return chatBox.style.display === 'block';
  }
  
  updateIcon(isChatBoxOpen) {
    if(isChatBoxOpen) {
      this.innerHTML = `
        <img class="toggle-icon" alt="Toggle Icon" src="${this.luminance > 0.7 ? this.xIconDarkURL : this.xIconURL}" />
      `;
    } else {
      this.innerHTML = `
        <img class="toggle-icon" alt="Toggle Icon" src="${this.luminance > 0.7 ? this.chatIconDarkURL : this.chatIconURL}" />
      `;
    }
  }
  
  toggleChatBox() {
    const chatBox = this.getRootNode().querySelector('div[is="chat-box"]');
    if (this.isChatBoxOpen()) {
      this.updateIcon(false); // update before starting the close animation
      chatBox.style.opacity = '0';
      chatBox.style.transform = 'translateY(20px)';
      setTimeout(() => { 
        chatBox.style.display = 'none';
      }, 300);
      sessionStorage.setItem('isChatBoxOpen', JSON.stringify(false));
    } else {
      chatBox.style.display = 'block';
      this.updateIcon(true);
      setTimeout(() => { 
        chatBox.style.opacity = '1';
        chatBox.style.transform = 'translateY(0px)';
      }, 50);
      sessionStorage.setItem('isChatBoxOpen', JSON.stringify(true));
    }
  } 
}  

customElements.define('chat-toggle', ChatToggle, { extends: "button" });

class ChatBox extends HTMLDivElement {
  constructor(
    autoOpen,
    accentColor, 
    assistantName,  
    homeScreen,
    welcomeMessage,
    avatarURL, 
    infoIconURL, 
    infoIconDarkURL, 
    closeIconURL, 
    closeIconDarkURL, 
    sendIconURL, 
    capabilitiesIconURL
  ) {
    super();
    this.messages = [];
    this.accentColor = accentColor
    this.assistantName = assistantName;
    this.autoOpen = autoOpen;
    this.avatarURL = avatarURL;
    this.infoIconURL = infoIconURL;
    this.infoIconDarkURL = infoIconDarkURL;
    this.closeIconURL = closeIconURL;
    this.closeIconDarkURL = closeIconDarkURL;
    this.sendIconURL = sendIconURL;
    this.capabilitiesIconURL = capabilitiesIconURL;

    // Load previous messages from local storage if they exist
    if (sessionStorage.getItem('messages')) {
      this.messages = JSON.parse(sessionStorage.getItem('messages'));
    } else if (!homeScreen) {
      this.messages.push({ type: "user", content: welcomeMessage })
    }

    // Load autoOpen state from local storage if it exists
    if(sessionStorage.getItem('autoOpen')) {
      this.autoOpen = JSON.parse(sessionStorage.getItem('autoOpen'));
    }

  }

  connectedCallback() {
    // If there is a value for open/closed in the session storage use that to set initial display value,
    // Otherwise use value of autoOpen to determine open/closed
    if (sessionStorage.getItem('isChatBoxOpen') != null) {
      if (sessionStorage.getItem('isChatBoxOpen') === 'true') {
        this.style.display = 'block';
        setTimeout(() => { 
          this.style.opacity = '1'; 
          this.style.transform = 'translateY(0px)';
        }, 50);
      }
    } else {
      if (this.autoOpen) {
        this.style.display = 'block';
        setTimeout(() => { 
          this.style.opacity = '1'; 
          this.style.transform = 'translateY(0px)';
        }, 50);
      } 
    }

    const accentRgb = hexToRgb(this.accentColor);
    const darkerAccentRgb = darkenRgb(accentRgb, 0.20);
    const luminance = calculateLuminance(accentRgb)

    const headerBgMainStyle = `
      background: linear-gradient(180deg, 
      rgb(${darkerAccentRgb[0]}, ${darkerAccentRgb[1]}, ${darkerAccentRgb[2]}) 0%, 
      rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}) 100%);
    `;

    const headerBgRoundStyle = `
      background-color: ${this.accentColor}
    `;

    const textColorStyle = `
    color: ${luminance > 0.7 ? '#2a2a2a' : '#ffffff'}
  `;

    const poweredByNameStyle = `
      color: ${luminance > 0.7 ? '#2a2a2a' : this.accentColor}
    `;

    const infoIconPath = `${luminance > 0.7 ? this.infoIconDarkURL : this.infoIconURL}`
    const closeIconPath = `${luminance > 0.7 ? this.closeIconDarkURL : this.closeIconURL}`

    this.innerHTML = `
      <div class="header-container">
        <div class="header-background-round" style="${headerBgRoundStyle}"></div>
        <div class="header-background-main" style="${headerBgMainStyle}"></div>
        <div class="header-content">
          <img class="avatar" alt="Avatar" src="${this.avatarURL}" />
          <div class='title-container'>
            <div class="assistant-name" style="${textColorStyle}">${this.assistantName}</div>
            <div class="assistant-subtitle" style="${textColorStyle}">AI Shopping Assistant</div>
          </div>
          <div class='info-icon-container'>
            <img class='header-icon' alt="Info icon" src="${infoIconPath}"/>
          </div>
          <div class='close-icon-container'>
            <img class='header-icon' alt="Close icon" src="${closeIconPath}"/>
          </div>
        </div>
      </div>
    
      <div class="body-container"></div>
    
      <div class="footer-container">
        <div class="footer-divider"/>
        <div class="input-group">
          <textarea id="chat-input" class="input-field" placeholder="Start typing..."></textarea>
          <button id="send-button" class="send-button-container">
            <img class='send-button' alt="Send icon" src="${this.sendIconURL}" />
          </button>
        </div>
        <div class="powered-by-container">
          <div class="powered-by-text">Powered by</div>
          <div class="powered-by-name" style="${poweredByNameStyle}">ShopMate</div>
        </div>
      </div>
    `;

    this.renderMessages();
    
    const sendButton = this.querySelector('#send-button');
    sendButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    const input = this.querySelector('#chat-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    const infoIcon = this.querySelector('.info-icon-container');
    infoIcon.addEventListener('click', () => {
      this.messages = [];
      sessionStorage.setItem('messages', JSON.stringify(this.messages));
      this.renderMessages();
    })

    const closeIcon = this.querySelector('.close-icon-container');
    closeIcon.addEventListener('click', () => {
      window.dispatchEvent(new Event('chatBoxClosed'));
      this.style.opacity = '0'; 
      this.style.transform = 'translateY(100px)';
      setTimeout(() => { 
        this.style.display = 'none'; 
      }, 300);
    });

    //Additional chat box code can be added here
  }

  addMessage(type, content) {
    // Add a new message to the list
    this.messages.push({ type, content });
    sessionStorage.setItem('messages', JSON.stringify(this.messages));
    // Render all messages again
    this.renderMessages();
  }

  renderMessages() {
    const bodyContainer = this.querySelector('.body-container');
    bodyContainer.innerHTML = '';

    if (this.messages.length === 0) {
      // Show the empty state markup
      bodyContainer.innerHTML = `
        <div class="capabilities-container">
          <img class='capabilities-icon' alt="Capabilities icon" src="${this.capabilitiesIconURL}" />
          <div class="capabilities-text">Capabilities</div>
        </div>
        <div class="example-container">
            <p class="example-heading">Find exactly what your looking for</p>
            <p class="example-text">“Show me low-top white shoes”</p>
        </div>
        <div class="example-container">
            <div class="example-heading">Get smart style recommendations</div>
            <p class="example-text">“I need a top I can wear to a semi-formal event on a hot</p>
            <p class="example-text"> summer day and that will go with my beige dress pants”</p>
        </div>
      `;
    } else {
      // Display messages
      this.messages.forEach((message, index) => {
        this.appendMessage(message.type, message.content, index);
      });
    }
  }

  appendMessage(type, content, index) {
    const bodyContainer = this.querySelector('.body-container');
    let markup;

    const firstMessageClass = index === 0 ? 'first-message' : '';
    
    if (type === 'assistant') {
      markup = `
      <div class="assistant-message ${firstMessageClass}">
        <p class="assistant-text">${content}</p>
      </div>
      `;
    } else if (type === 'user') {
      markup = `
      <div class="user-message ${firstMessageClass}">
        <p class="user-text">${content}</p>
      </div>
      `;
    } else if (type === 'product') {
      markup = `
      <div class='product-container'>
        <div class='product-card'>
          <img class="product-image" alt="Avatar" src="../assets/demo-shirt1.png" />
          <div class='product-title'>Slim-Fit-Charcoal-Flannel</div>
          <div class='product-action-container'>
            <p class='product-price'>$79</p>
            <div class='product-addToCart-button'>
              <div class='product-addToCart-text'>ADD TO CART</div>
            </div>
          </div>
        </div>
        <div class='product-card'>
          <img class="product-image" alt="Avatar" src="../assets/demo-shirt-2.png" />
          <div class='product-title'>Slim-Fit-Charcoal-Flannel</div>
          <div class='product-action-container'>
            <p class='product-price'>$79</p>
            <div class='product-addToCart-button'>
              <div class='product-addToCart-text'>ADD TO CART</div>
            </div>
          </div>
        </div>
      </div>
      `;
    }
  
    bodyContainer.insertAdjacentHTML('beforeend', markup);
    setTimeout(() => {
      bodyContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  handleSubmit() {
    const input = this.querySelector('#chat-input');
    const text = input.value.trim();

    if (text !== '') {
      this.addMessage('user', text);
      console.log(text)

      // After sending the message, clear the input field
      input.value = '';
    } else {
        console.log('Input is empty. Message not sent.');
    }

    // Send the message to API and process the response
    // ...
    // Once the response is received, add the assistant's message or product recommendation to the list
    // this.addMessage('assistant', response.text);
    // Or
    // this.addMessage('product', response.products);
  
/*     const url = 'http://example.com/api';  // replace with your API endpoint
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    };
  
    fetch(url, options)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(err => console.error('Error:', err)); */
  }
}

customElements.define('chat-box', ChatBox, { extends: 'div' });
