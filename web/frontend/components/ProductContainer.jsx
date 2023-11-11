import React, { useState, useEffect } from 'react';
import './ProductContainer.css'
import { Box, Text } from '@shopify/polaris';

export default function ProductContainer ({ productIds }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState([]);

  // Function to fetch product data
  const fetchProductData = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const joinedIds = productIds.join(',')

      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/products?productIds=${joinedIds}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setError(true)
        setIsLoading(false);
        return;
      }
      
      const productData = await response.json();
      setProducts(productData);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product data when component mounts or productIds change
  useEffect(() => {
    if (productIds && productIds.length > 0) {
      fetchProductData();
    } else {
      setProducts([]); // Clear products if no productIds provided
    }
  }, [productIds]);

  return (
    <div className='recommendation-event-container'>
      <p className='recommendation-event-text'>Recommendation Event</p>
      <Box minHeight='0.5rem'/>

      {isLoading && <p>Loading products...</p>}

      {!isLoading && error && <p>An error occured while fetching the product data.</p>}

      {!isLoading && !error && products.length === 0 && (
        <p>We couldn't find the products, they may have been deleted.</p>
      )}

      {!isLoading && !error && 
        <div className='product-container-border'>
          <div className='chat-widget__product-container'>
            {products.map(product => {
              return (
                <div key={product.id} className="chat-widget__product-card">
                  <img className="chat-widget__product-image" alt={product.imageAlt} src={product.imageSrc} />
                  <div className='chat-widget__product-title'>${product.title}</div>
                  <div className='chat-widget__product-action-container'>
                    <p className='chat-widget__product-price'>$${product.price}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      }
    </div>
  );
};