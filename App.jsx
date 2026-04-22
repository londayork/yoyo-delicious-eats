import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; import React, { useEffect, useState } from "react";

// 🔥 Firebase imports
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// 🔥 YOUR Firebase config (already added)
const firebaseConfig = {
  apiKey: "AIzaSyC0bfI2ckY0QLsUwxt8dojAk4a65-0axU8",
  authDomain: "yoyo-delicious-eats.firebaseapp.com",
  projectId: "yoyo-delicious-eats",
  storageBucket: "yoyo-delicious-eats.firebasestorage.app",
  messagingSenderId: "107422339618",
  appId: "1:107422339618:web:ab40e45ae2238241efb07b",
  measurementId: "G-PQ88RKGGHE"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function YoYosStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    link: ""
  });

  // 🔄 LOAD PRODUCTS FROM FIREBASE
  useEffect(() => {
    const loadProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(items);
    };

    loadProducts();
  }, []);

  // 📸 IMAGE UPLOAD (temporary base64 for now)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ➕ ADD PRODUCT TO FIREBASE
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;

    await addDoc(collection(db, "products"), {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock || "0"),
      image: newProduct.image,
      link: newProduct.link
    });

    setNewProduct({ name: "", price: "", stock: "", image: "", link: "" });

    // reload products
    const querySnapshot = await getDocs(collection(db, "products"));
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(items);
  };

  // ❌ REMOVE PRODUCT
  const removeProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter(p => p.id !== id));
  };

  // 🛒 CART
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  return (
    <div style={{ background: "linear-gradient(to right, pink, purple)", minHeight: "100vh", padding: 20 }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="logo" style={{ width: 60, borderRadius: "50%" }} />
          <h1 style={{ color: "white" }}>Yo-Yo's Delicious Eats</h1>
        </div>

        <button
          onClick={() => {
            const password = prompt("Enter admin password");
            if (password === "yoyo123") {
              setShowAdmin(!showAdmin);
            } else {
              alert("Wrong password");
            }
          }}
        >
          Admin
        </button>
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", color: "white", margin: "20px 0" }}>
        <h2>Cookies • Sweets • Sea Moss 🍪</h2>
        <p>Order fresh homemade treats today 💜</p>
      </div>

      {/* PRODUCTS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 20 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "white", padding: 15, borderRadius: 10 }}>
            
            {p.image && (
              <img src={p.image} alt={p.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
            )}

            <h3>{p.name}</h3>
            <p>${p.price}</p>
            <p>{p.stock > 0 ? `Stock: ${p.stock}` : "Sold Out"}</p>

            <button onClick={() => addToCart(p)}>Add to Cart</button>

            <button
              disabled={p.stock <= 0}
              onClick={() => window.location.href = p.link}
              style={{ marginTop: 5 }}
            >
              Buy Now
            </button>

            <button onClick={() => removeProduct(p.id)} style={{ marginTop: 5 }}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* CART */}
      <div style={{ background: "white", padding: 15, marginTop: 20, borderRadius: 10 }}>
        <h2>Cart</h2>
        {cart.map((item, i) => (
          <p key={i}>{item.name} - ${item.price}</p>
        ))}
        <h3>Total: ${total}</h3>
      </div>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div style={{ background: "white", padding: 20, marginTop: 20 }}>
          <h2>Add Product</h2>

          <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />

          <input type="file" onChange={handleImageUpload} />

          <input placeholder="Stripe Link" value={newProduct.link} onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} />

          <br /><br />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: 30, color: "white" }}>
        <p>Contact: yoyodeats@gmail.com</p>
        <p>© 2026 Yo-Yo's Delicious Eats</p>
      </div>

    </div>
  );
}
}

