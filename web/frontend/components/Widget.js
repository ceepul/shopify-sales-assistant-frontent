import './Widget.css';

export default function Widget() {
  const welcomeMessage = "Hello, this is a welcome message now i am making it very very long to see the behaviour and whether ot not it wraps."
  const homeScreen = false;

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

  const assistantTextMarkup = (
    <div className="assistant-message">
      <p className="assistant-text">{welcomeMessage}</p>
    </div>
  )

  const userTextMarkup  = (
    <div className="user-message">
      <p className="user-text">{welcomeMessage}</p>
    </div>
  )

  const productMarkup = (
    <div className='product-container'>
      <div className='product-card'>
        <img className="product-image" alt="Avatar" src="../assets/demo-shirt1.png" />
        <div className='product-title'>Slim-Fit-Charcoal-Flannel</div>
        <div className='product-action-container'>
          <p className='product-price'>$79</p>
          <div className='product-addToCart-button'>
            <div className='product-addToCart-text'>ADD TO CART</div>
          </div>
        </div>
      </div>
      <div className='product-card'>
        <img className="product-image" alt="Avatar" src="../assets/demo-shirt-2.png" />
        <div className='product-title'>Slim-Fit-Charcoal-Flannel</div>
        <div className='product-action-container'>
          <p className='product-price'>$79</p>
          <div className='product-addToCart-button'>
            <div className='product-addToCart-text'>ADD TO CART</div>
          </div>
        </div>
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
        <div className="header-background-round" />
        <div className="header-background-main" />
        <div className="header-content">
          <img className="avatar" alt="Avatar" src="../assets/avatar.png" />
          <div className='title-container'>
            <div className="assistant-name">ShopMate</div>
            <div className="assistant-subtitle">AI Shopping Assistant</div>
          </div>
          <div class='info-icon-container'>
            <img className='header-icon' alt="Info icon" src="../assets/info-circle.svg"/>
          </div>
          <div class='close-icon-container'>
            <img className='header-icon' alt="Close icon" src="../assets/down-chevron.svg"/>
          </div>
        </div>
      </div>

      {homeScreen ? emptyMarkup : populatedMarkup}

      <footer className="footer-container">
        <div className="input-field">
          <div className="input-placeholder">Start typing...</div>
          <div class='send-button-container'>
            <img className='send-button' alt="Send icon" src="../assets/send2.svg" />
          </div>
        </div>
        <div className="footer-divider"/>
        <div className="powered-by-container">
          <div className="powered-by-text">Powered by</div>
          <div className="powered-by-name">ShopMate</div>
        </div>
      </footer>

    </div>
  );
}

