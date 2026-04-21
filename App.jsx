import React, { useEffect, useState } from "react";

const STORAGE_KEY = "yoyo_products_v1";

const defaultProducts = [
  { id: 1, name: "Chocolate Chip Cookies", price: 12.99, stock: 10, image: "", link: "https://buy.stripe.com/REPLACE_COOKIE_LINK" },
];

function loadProducts() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : defaultProducts;
}

export default function YoYosStore() {
  const [products, setProducts] = useState(loadProducts());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Yo-Yo's Delicious Eats</h1>

      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <h3>{p.name}</h3>
          <p>${p.price}</p>
          <p>{p.stock > 0 ? `Stock: ${p.stock}` : "Sold Out"}</p>

          <button
            disabled={p.stock <= 0}
            onClick={() => window.location.href = p.link}
          >
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}
