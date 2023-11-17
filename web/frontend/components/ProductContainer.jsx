import React, { useState, useEffect } from 'react';
import './ProductContainer.css'
import { Box, Text } from '@shopify/polaris';
import CenteredDiv from './CenteredDiv';

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
      {isLoading && 
        <CenteredDiv minHeight='210px'>
          <p>Loading products...</p>
        </CenteredDiv>
      }

      {!isLoading && error && 
        <CenteredDiv minHeight='100px'>
          <p>An error occured while fetching product data.</p>
        </CenteredDiv>
      }

      {!isLoading && !error && products.length === 0 && (
        <CenteredDiv minHeight='100px'>
          <p>We couldn't find the products, they may have been deleted.</p>
        </CenteredDiv>
      )}

      {!isLoading && !error && 
        <div className='chat-widget__product-container'>
          {products.map((product, index) => {
            return (
              <div key={index} className="chat-widget__product-card">
                <img className="chat-widget__product-image" alt={product.imageAlt} src={product.imageSrc} />
                <div className='chat-widget__product-title'>{product.title}</div>
                <div className='chat-widget__product-action-container'>
                  <p className='chat-widget__product-price'>${product.price}</p>
                </div>
              </div>
            )
          })}
        </div>
      }
    </div>
  );
};