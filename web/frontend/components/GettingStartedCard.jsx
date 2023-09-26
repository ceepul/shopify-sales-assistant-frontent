import './GettingStartedCard.css';
import { Text } from '@shopify/polaris';

export default function GettingStartedCard({ title, body, onClick }) {
  return (
    <div className="border-wrapper">
      <button className="button-card" onClick={onClick}>
        <Text variant='headingXl'>{title}</Text>
        <Text variant='bodyLg'>{body}</Text>
      </button>
    </div>
  );
}