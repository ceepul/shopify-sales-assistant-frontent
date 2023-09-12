import { 
  Icon,
} from "@shopify/polaris"
import {
  CircleTickMajor
} from '@shopify/polaris-icons';
import './PricingCard.css'

export default function PricingCard({ planId, active, primary, planName, planPrice, features, trialDuration, handleSubscribe }) {

  const onClick = () => {
    handleSubscribe({
      planId: planId,
      planName: planName,
      planPrice: planPrice,
      trialDuration: trialDuration
    })
  }

  return (
    <div className="pricing-card">
      {primary && <div className="banner-active">Most Popular</div>}
      <div className="pricing-card-top">
        <h2 className="pricing-title">{planName}</h2>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span className='pricing-currency'>$</span>
          <span className="pricing-price">{planPrice}</span>
          <span className="pricing-month">/month</span>
        </div>
      </div>
      <div className="pricing-card-bottom">
        <ul className="pricing-features">
          {features.map((feature, index) => (
            <li key={index}>
              <div className="pricing-icon"><Icon source={CircleTickMajor} color="primary"/></div>
              <p>{feature}</p>
            </li>
          ))}
        </ul>
        { active ? 
          primary ? 
            <button className="pricing-btn pricing-btn-active" onClick={onClick} disabled>Active Plan</button> :
            <button className="pricing-btn pricing-btn-active" onClick={onClick} disabled>Active Plan</button> 
        :
          primary ? 
            <button className="pricing-btn pricing-btn-primary" onClick={onClick}>Choose Plan</button> :
            <button className="pricing-btn" onClick={onClick}>Choose Plan</button>
        }
      </div>
    </div>
  );
}