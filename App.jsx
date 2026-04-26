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
  apiKey: "AIzaSyC0bfI2ckY0QLsUwxt8dojAk4a65-0axU8",
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

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    link: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    loadProducts();
    return () => unsub();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, "products/" + Date.now() + "_" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setNewProduct((prev) => ({ ...prev, image: url }));
  };

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
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe4ec, #f9d6ff)",
      fontFamily: "sans-serif"
    }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: 20, background: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" style={{ width: 50, borderRadius: "50%" }} />
          <h2 style={{ color: "#b06ab3" }}>Yo-Yo's Delicious Eats</h2>
        </div>
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>

      {/* HERO */}
      <div style={{
        textAlign: "center",
        padding: 50,
        background: "linear-gradient(to right, #ff7eb3, #b06ab3)",
        color: "white",
        margin: 20,
        borderRadius: 20
      }}>
        <h1>Fresh Homemade Desserts 🍰</h1>
        <p>Made with love • Baked fresh daily 💜</p>
      </div>

      {/* DEALS */}
      <div style={{ background: "white", margin: 20, padding: 20, borderRadius: 15 }}>
        <h2 style={{ color: "#b06ab3" }}>🔥 Weekly Deals</h2>
        <p>🍓 Strawberries (6) — $10</p>
        <p>🍰 Combo — $15</p>
        <p>🧁 Party Pack — $30</p>
      </div>

      {/* SHIPPING */}
      <div style={{
        background: "white",
        margin: 20,
        padding: 15,
        borderRadius: 12,
        borderLeft: "5px solid #ff4da6"
      }}>
        <p>🚚 Minimum 3 items required for shipping</p>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
        gap: 20,
        padding: 20
      }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "white", padding: 15, borderRadius: 15 }}>

            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 10
                }}
              />
            )}

            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart(prev => [...prev, p])}>
              Add to Cart 🛒
            </button>

            <button onClick={() => window.location.href = p.link}>
              Buy Now 💳
            </button>

            {user && (
              <button onClick={() => deleteProduct(p.id)} style={{ background: "red", color: "white" }}>
                Delete ❌
              </button>
            )}
          </div>
        ))}
      </div>
{/* CART */}
<div style={{
  background: "white",
  padding: 20,
  margin: 20,
  borderRadius: 15,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
}}>

  <h2 style={{ color: "#b06ab3" }}>🛒 Your Cart</h2>

  {cart.length === 0 && <p>No items yet</p>}

  {cart.map((item, i) => (
    <p key={i}>
      {item.name} - ${item.price}
    </p>
  ))}

  <h3>Total: ${total}</h3>

  {/* EMAIL */}
  <input
    placeholder="Enter your email for tracking"
    value={customerEmail}
    onChange={(e) => setCustomerEmail(e.target.value)}
    style={{
      marginTop: 10,
      padding: 10,
      width: "100%",
      borderRadius: 8,
      border: "1px solid #ccc"
    }}
  />
{/* CHECKOUT */}
<button
  onClick={async () => {
    if (cart.length < 3) {
      return alert("Minimum 3 items required for checkout 🚚");
    }

    if (!customerEmail) return alert("Enter email");

    const total = cart.reduce((sum, i) => sum + i.price, 0);

    await addDoc(collection(db, "orders"), {
      email: customerEmail,
      items: cart,
      total,
      date: new Date().toLocaleString(),
      status: "Pending"
    });

    alert("Order saved! 📦");

    // 🔥 REAL MULTI ITEM CHECKOUT
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items: cart })
    });

    const data = await res.json();

    window.location.href = data.url;
  }}
  style={{
    marginTop: 10,
    width: "100%",
    padding: 12,
    background: "#ff4da6",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold"
  }}
>
  Checkout 💳
</button>

</div>

</div>

      {/* ADMIN */}
      {user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
          <input placeholder="Name" onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input type="file" onChange={handleImageUpload} />
          <input placeholder="Link" onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} />
          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
{/* TRACK ORDER */}
<div style={{ background: "white", margin: 20, padding: 20 }}>
  <h2>📦 Track Your Order</h2>

  <input
    placeholder="Enter your email"
    onChange={(e) => setCustomerEmail(e.target.value)}
    style={{ padding: 8, width: "100%", marginBottom: 10 }}
  />

  <button
    onClick={async () => {
      const snap = await getDocs(collection(db, "orders"));
      const results = snap.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
      const filtered = results.filter(o => o.email === customerEmail);

      if (!filtered.length) {
        alert("No orders found");
      } else {
        setOrders(filtered);
      }
    }}
  >
    Track Order 🔍
  </button>
{orders.map((o, i) => (
  <div key={i} style={{ marginTop: 10, borderTop: "1px solid #eee", paddingTop: 10 }}>
    <p><strong>Total:</strong> ${o.total}</p>
    <p><strong>Date:</strong> {o.date}</p>
  </div>
))}
 
</div>
    </div>
  );
}
