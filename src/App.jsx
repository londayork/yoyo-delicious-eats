import React, { useEffect, useState } from "react";

// Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

// CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yoyo-delicious-eats.firebaseapp.com",
  projectId: "yoyo-delicious-eats",
  storageBucket: "yoyo-delicious-eats.firebasestorage.app",
  messagingSenderId: "107422339618",
  appId: "1:107422339618:web:ab40e45ae2238241efb07b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function YoYosStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customerEmail, setCustomerEmail] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const params = new URLSearchParams(window.location.search);
  const success = params.get("success");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    loadProducts();
    return () => unsub();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, "products/" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setNewProduct(prev => ({ ...prev, image: url }));
  };

  const addProduct = async () => {
    await addDoc(collection(db, "products"), {
      ...newProduct,
      price: parseFloat(newProduct.price)
    });

    setNewProduct({ name: "", price: "", image: "" });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  const handleCheckout = async () => {
    try {
      if (!customerEmail) {
        alert("Enter your email");
        return;
      }

      const total = cart.reduce((sum, i) => sum + i.price, 0);

      // Save order
      await addDoc(collection(db, "orders"), {
        email: customerEmail,
        items: cart,
        total,
        date: new Date().toLocaleString(),
        status: "Pending"
      });

      // Stripe
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cart,
          email: customerEmail
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed");
      }

    } catch (err) {
      console.error(err);
      alert("Checkout error");
    }
  };

  return (
    <div style={{ padding: 20 }}>

      {success && <h3>✅ Payment successful!</h3>}

      {/* LOGIN */}
      {!user && (
        <div>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {user && <button onClick={handleLogout}>Logout</button>}

      {/* PRODUCTS */}
      <h2>Products</h2>
      {products.map(p => (
        <div key={p.id}>
          <p>{p.name} - ${p.price}</p>
          <button onClick={() => setCart(prev => [...prev, p])}>Add</button>
          {user && <button onClick={() => deleteProduct(p.id)}>Delete</button>}
        </div>
      ))}

      {/* CART */}
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
  Yo-Yo’s Delicious Eats 🍰
</h1>

<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 20
}}>
  {products.map(p => (
    <div key={p.id} style={{
      border: "1px solid #ddd",
      padding: 15,
      borderRadius: 12,
      textAlign: "center",
      background: "#fff",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      
<img
  src={p.image || "https://via.placeholder.com/200"}
  alt={p.name}
  style={{
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: 10
  }}
/>
      )}

      <h3 style={{ margin: "10px 0" }}>{p.name}</h3>
      <p style={{ fontWeight: "bold" }}>${p.price}</p>

      <button
        onClick={() => setCart(prev => [...prev, p])}
        style={{
          padding: "8px 12px",
          background: "#ff4d6d",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        Add to Cart
      </button>
    </div>
  ))}
</div>
      {/* ADMIN */}
      {user && (
        <div>
          <h3>Add Product</h3>
          <input placeholder="Name" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input placeholder="Price" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          <input type="file" onChange={handleImageUpload} />
          <button onClick={addProduct}>Add</button>
        </div>
      )}

    </div>
  );
}
