import { 
  AlphaCard,
  Box,
  Icon,
  Text,
  VerticalStack
} from "@shopify/polaris"
import {
  CircleTickMajor
} from '@shopify/polaris-icons';
import './PricingCard.css'

export default function PricingCard({ active, primary, title, price, features }) {

  const featuresMarkup = (
    <VerticalStack gap="4">
      {features.map(feature => {
        return (
          <Text>{feature.text}</Text>
        )
      })}
    </VerticalStack>
  )

  return (
    <div className="pricing-card">
      {primary && <div className="banner-active">Most Popular</div>}
      <div className="pricing-card-top">
        <h2 className="pricing-title">{title}</h2>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span className='pricing-currency'>$</span>
          <span className="pricing-price">{price}</span>
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
            <button className="pricing-btn pricing-btn-active" disabled>Active Plan</button> :
            <button className="pricing-btn pricing-btn-active" disabled>Active Plan</button> 
        :
          primary ? 
            <button className="pricing-btn pricing-btn-primary">Choose Plan</button> :
            <button className="pricing-btn">Choose Plan</button>
        }
      </div>
    </div>
  );
}