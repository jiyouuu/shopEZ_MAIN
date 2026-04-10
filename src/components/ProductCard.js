//src/components/ProductCard.js
import React from 'react';
import './ProductCard.css'; // 스타일 파일

function ProductCard({ product }) {
  return (
    <tr className="product-row">
      <td className="image-con"><img src={product.imageUrl} alt={product.name} className="product-image" /></td>
      <td className="product-name">{product.name}</td>
      <td className="product-count">{product.count}</td>
      <td className="product-price">{(product.price * product.count).toLocaleString()}원</td>
    </tr>
  );
}

export default ProductCard;
