import { useState, useEffect, useCallback } from "react";
import {
  DataTable,
  Button,
  LegacyCard,
} from "@shopify/polaris";

const ITEMS_PER_PAGE = 15;

// TO DO: Add error & loading UI
export default function ProductStatsTable({ shop }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [productData, setProductData] = useState([])
  const [sortedRows, setSortedRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/stats/products?shop=${shop}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          setError({
            status: true, 
            title: "Could not load products", 
            body: "There was a problem fetching the product data. Please try again later."
          })
          setIsLoading (false)
          return;
        }

        const data = await response.json();
        const formattedData = formatData(data)
        setProductData(formattedData)

        setError({ status: false, title: "", body: "" });
  
      } catch (error) {
        console.error('There was an error fetching product data:', error);
        setError({
          status: true, 
          title: "Could not load products", 
          body: "There was a problem fetching the product data. Please try again later."
        })
      }
  
      setIsLoading(false);
    };
  
    fetchData();
  }, []);

  const handleSort = useCallback(
    (index, direction) => {
      setSortedRows(sortData(productData, index, direction));
    },
    [productData],
  );

  const handleNext = () => {
    if (currentPage < Math.ceil(productData.length / ITEMS_PER_PAGE)) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  const TOTAL_PAGES = Math.ceil(productData.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const paginatedRows = sortedRows 
  ? sortedRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  : productData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <LegacyCard>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
        <Button plain onClick={handlePrev} disabled={currentPage === 1}>{`<`}</Button>

        {/* Render numbered buttons for pagination */}
        {[...Array(TOTAL_PAGES)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <Button 
              key={pageNumber}
              plain
              onClick={() => handlePageChange(pageNumber)}
              style={{ margin: '0 4px' }}
              disabled={pageNumber === currentPage}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button plain onClick={handleNext} disabled={currentPage === TOTAL_PAGES}>{`>`}</Button>
      </div>
      <DataTable 
        columnContentTypes={[
          'image',
          'text',
          'numeric',
          'numeric',
          'numeric',
        ]}
        headings={[
          'Product',
          'Total Recommendations',
          'Click-Through',
          'Click-Through Rate (CTR)',
        ]}
        sortable={[true, true, true, true]}
        defaultSortDirection="descending"
        initialSortColumnIndex={2}
        rows={paginatedRows}
        onSort={handleSort}
        stickyHeader
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button onClick={handlePrev} disabled={currentPage === 1}>Prev</Button>
        <span>Page {currentPage} of {Math.ceil(productData.length / ITEMS_PER_PAGE)}</span>
        <Button onClick={handleNext} disabled={currentPage === Math.ceil(productData.length / ITEMS_PER_PAGE)}>Next</Button>
      </div>
    </LegacyCard>
  );
}

const formatData = (products) => {
  return products.map(product => {
    let viewRate = '0.00';
    if (product.totalRecommendations !== 0) {
      viewRate = (product.totalProductViews / product.totalRecommendations).toFixed(2);
    }
    return [
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={product.imageSrc ? product.imageSrc : null} 
          alt={product.imageAlt ? product.imageAlt : null}
          style={{ width: '40px', height: '40px', marginRight: '10px' }} />
        {product.title}
      </div>,
      product.totalRecommendations,
      product.totalProductViews,
      viewRate
    ];
  });
}

const sortData = (rows, index, direction) => {
  return [...rows].sort((rowA, rowB) => {
    const valueA = parseFloat(rowA[index]);
    const valueB = parseFloat(rowB[index]);

    if (isNaN(valueA) || isNaN(valueB)) { // Ensure we're comparing numbers.
      return direction === 'descending' ? String(rowB[index]).localeCompare(String(rowA[index])) : String(rowA[index]).localeCompare(String(rowB[index]));
    }

    return direction === 'descending' ? valueB - valueA : valueA - valueB;
  });
}