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

// 🔥 Firebase config (keep yours)
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
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

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
    loadOrders();
    return () => unsub();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    setOrders(snap.docs.map(d => d.data()));
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

    setNewProduct(prev => ({ ...prev, image: url }));
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;

    await addDoc(collection(db, "products"), {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock || "0")
    });

    setNewProduct({ name: "", price: "", stock: "", image: "", link: "" });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  const placeOrder = async () => {
    if (!customerName || !customerEmail) return alert("Enter info");
    if (!cart.length) return alert("Cart empty");

    const total = cart.reduce((sum, i) => sum + i.price, 0);

    await addDoc(collection(db, "orders"), {
      name: customerName,
      email: customerEmail,
      items: cart,
      total,
      date: new Date().toLocaleString()
    });

    alert("Order placed!");

    window.location.href = cart[0].link;

    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
    loadOrders();
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
        <div style={{ display: "flex", gap: 10 }}>
          <img src="/logo.png" style={{ width: 50, borderRadius: "50%" }} />
          <h2 style={{ color: "#b06ab3" }}>Yo-Yo's Delicious Eats</h2>
        </div>
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: 40, background: "pink", color: "white" }}>
        <h1>Fresh Homemade Desserts 🍰</h1>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ background: "white", margin: 20, padding: 20 }}>
          <h3>Admin Login</h3>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 20, padding: 20 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: "white", padding: 15 }}>
            {p.image && <img src={p.image} style={{ width: "100%" }} />}
            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart([...cart, p])}>Add to Cart</button>
            <button onClick={() => window.location.href = p.link}>Buy</button>

            {user && <button onClick={() => deleteProduct(p.id)}>Delete</button>}
          </div>
        ))}
      </div>

      {/* CART */}
      <div style={{ background: "white", margin: 20, padding: 20 }}>
        <h2>Cart</h2>
        {cart.map((i, idx) => <p key={idx}>{i.name} - ${i.price}</p>)}
        <h3>Total: ${total}</h3>

        <input placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        <input placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />

        <button onClick={placeOrder}>Checkout 💳</button>
      </div>

      {/* ORDERS */}
      {user && (
        <div style={{ background: "white", margin: 20, padding: 20 }}>
          <h2>Orders</h2>
          {orders.map((o, i) => (
            <div key={i}>
              <p>{o.name} ({o.email})</p>
              <p>${o.total}</p>
              <hr />
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {user && (
        <div style={{ background: "white", margin: 20, padding: 20 }}>
          <h2>Add Product</h2>
          <input placeholder="Name" onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input type="file" onChange={handleImageUpload} />
          <input placeholder="Stripe Link" onChange={e => setNewProduct({ ...newProduct, link: e.target.value })} />
          <button onClick={addProduct}>Add</button>
        </div>
      )}
    </div>
  );
}
