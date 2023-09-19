import { Button, ButtonGroup, Text } from '@shopify/polaris'
import './FAQTableRow.css'

export default function FAQTableRow ({ question, onEdit }) {
  
  const handleRowClick = (event) => {
    if (window.innerWidth <= 768) { // Assuming 768px is your mobile breakpoint
      onEdit();
    }
  };

  return (
    <div className='tableRow' onClick={handleRowClick}>
      <div className='text-content'>{question}</div>
      <div className='button-container'>
        <Button size='slim' onClick={onEdit}>Edit</Button>
      </div>
    </div>
  )
}