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
        bottom: 15px;
        right: 15px;
        z-index: 9999;
      }

      button[is="chat-toggle"] {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: none;
        border: none;
        box-shadow: box-shadow: 0px 0px 4px #616161;
        ;
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
        bottom: -8px;
        right: 0px;
        background-color: #ffffff;
        overflow: hidden;
        transition: opacity 0.3s, transform 0.3s;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .header-container {
        z-index: 1;
        display: flex;
        justify-content: center;
        border: 0px none;
        height: 136px;
        width: 100%;
        top: 0;
        position: absolute;
        overflow: hidden;
      }
      
      .header-background-round {
        background-color: #47afff;
        border-radius: 396px/66px;
        box-shadow: 0px 0px 4px #8b8680;
        height: 128px;
        left:-204px;
        position: absolute;
        width: 792px;
      }
      
      .header-background-main {
        background: linear-gradient(180deg, rgb(0, 139, 245) 0%, rgb(71, 175, 255) 100%);
        height: 120px;
        position: relative;
        width: 100%;
      }
      
      .header-content {
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
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 356px;
        position: relative;
        width: 100%;
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
        letter-spacing: -1%;
        margin-top: 12px;
        white-space: nowrap;
      }
      
      .example-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
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
      }
      
      .example-text {
        color: #969caa80;
        font-family: "Open Sans", Helvetica;
        font-size: 12px;
        font-weight: 400;
        line-height: 22px;
        white-space: nowrap;
      }
      
      .footer-container {
        background-color: #ffffff;
        height: 120px;
        position: absolute;
        bottom: 0;
        width: 100%;
      }
      
      .input-field {
        height: 36px;
        left: 26px;
        position: absolute;
        top: 12px;
        width: 334px;
      }
      
      .send-button-container {
        height: 40px;
        width: 40px;
        position: absolute;
        top: 4px;
        left: 292px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        border-radius: 8px;
      }
      
      .send-button-container:hover {
        background-color: rgba(128, 128, 128, 0.1);
      }
      
      .send-button {
        object-fit: cover;
        height: 32px;
        width: 32px;
      }
      
      
      .input-placeholder {
        color: #969caa;
        font-family: "Open Sans", Helvetica;
        font-size: 16px;
        font-weight: 400;
        height: 22px;
        left: 14px;
        line-height: 22px;
        position: absolute;
        top: 7px;
        white-space: nowrap;
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
      
      .assistant-message {
        background-color: #f1f2f4;
        border-radius: 10px 10px 10px 0px;
        align-self: flex-start;
        padding: 10px;
        max-width: 85%;
        margin-top: 20px;
      }
      
      .user-message {
        background-color: #47afffce;
        border-radius: 10px 10px 0px 10px;
        align-self: flex-end;
        padding: 10px;
        max-width: 85%;
        margin-top: 20px;
      }
      
      .assistant-text {
        color: #2e3138cc;
        font-family: "Open Sans", Helvetica;
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
      }
      
      .user-text {
        color: #ffffff;
        font-family: "Open Sans", Helvetica;
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
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
    this.fetchPreferences().then(preferences => {
      const avatarURL = this.getAttribute('data-avatar-url');
      const closeIconURL = this.getAttribute('data-close-icon-url');
      const closeIconDarkURL = this.getAttribute('data-close-icon-dark-url');
      const infoIconURL = this.getAttribute('data-info-icon-url');
      const infoIconDarkURL = this.getAttribute('data-info-icon-dark-url');
      const sendIconURL = this.getAttribute('data-send-icon-url');
  
      const toggle = new ChatToggle(preferences.accentColor);
      toggle.setAttribute('is', 'chat-toggle');
  
      const box = new ChatBox(
        preferences.accentColor,
        preferences.assistantName,
        true, 
        avatarURL, 
        infoIconURL, 
        infoIconDarkURL,
        closeIconURL,
        closeIconDarkURL,
        sendIconURL
      );
      box.setAttribute('is', 'chat-box');
  
      this.shadowRoot.querySelector('#chat-widget').append(toggle, box);
    });
  }

  async fetchPreferences() {
    return ({
      accentColor:"#47AFFF",
      assistantName: "ShopMate"
    })
  }
}

customElements.define('chat-widget', ChatWidget);

class ChatToggle extends HTMLButtonElement {
  constructor(color) {
    super();
    this.style.backgroundColor = color;
    this.addEventListener('click', this.toggleChatBox.bind(this));
  }

  toggleChatBox() {
    const chatBox = this.getRootNode().querySelector('div[is="chat-box"]');
    if (chatBox.style.display === 'none' || chatBox.style.display === '') {
      chatBox.style.display = 'block';
      setTimeout(() => { 
        chatBox.style.opacity = '1';
        chatBox.style.transform = 'translateY(0px)';
      }, 50);
    } else {
      chatBox.style.opacity = '0';
      chatBox.style.transform = 'translateY(20px)';
      setTimeout(() => { chatBox.style.display = 'none'; }, 500);
    }
  }
}

customElements.define('chat-toggle', ChatToggle, { extends: "button" });

class ChatBox extends HTMLDivElement {
  constructor(accentColor, assistantName, autoOpen, avatarURL, infoIconURL, infoIconDarkURL, closeIconURL, closeIconDarkURL, sendIconURL) {
    super();
    this.accentColor = accentColor
    this.assistantName = assistantName;
    this.autoOpen = autoOpen;
    this.avatarURL = avatarURL;
    this.infoIconURL = infoIconURL;
    this.infoIconDarkURL = infoIconDarkURL;
    this.closeIconURL = closeIconURL;
    this.closeIconDarkURL = closeIconDarkURL;
    this.sendIconURL = sendIconURL;
  }

  connectedCallback() {
    if (this.autoOpen) {
      this.style.display = 'block';
      setTimeout(() => { 
        this.style.opacity = '1'; 
        this.style.transform = 'translateY(0px)';
      }, 50);
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
        <div class="input-field">
          <div class="input-placeholder">Start typing...</div>
          <div class='send-button-container'>
            <img class='send-button' alt="Send icon" src="${this.sendIconURL}" />
          </div>
        </div>
        <div class="footer-divider"/>
        <div class="powered-by-container">
          <div class="powered-by-text">Powered by</div>
          <div class="powered-by-name" style="${poweredByNameStyle}">ShopMate</div>
        </div>
      </div>
    `;
  
    //Additional chat box code can be added here
  }  
}

customElements.define('chat-box', ChatBox, { extends: 'div' });
