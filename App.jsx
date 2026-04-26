import React, { useEffect, useState } from "react";

// Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
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

const firebaseConfig = {
  apiKey: "AIzaSyC0bf...",
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
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  const [customerName, setCustomerName] = useState("");
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
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // ADD PRODUCT
  const addProduct = async () => {
    await addDoc(collection(db, "products"), {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock || "0")
    });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  // PLACE ORDER
  const placeOrder = async () => {
    if (!customerName || !customerEmail) return alert("Enter info");
    if (!cart.length) return alert("Cart empty");

    const total = cart.reduce((sum, i) => sum + i.price, 0);

    await addDoc(collection(db, "orders"), {
      name: customerName,
      email: customerEmail,
      items: cart,
      total,
      date: new Date().toLocaleString(),
      status: "Pending",
      trackingNumber: ""
    });

    alert("Order placed!");
    setCart([]);
  };

  // TRACK ORDER
  const trackOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    const results = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setOrders(results.filter(o => o.email === customerEmail));
  };

  const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

  return (
    <div style={{ padding: 20 }}>

      <h1>🍰 Yo-Yo's Delicious Eats</h1>

      {/* PRODUCTS */}
      {products.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>${p.price}</p>

          <button onClick={() => setCart(prev => [...prev, p])}>
            Add to Cart 🛒
          </button>

          <button onClick={() => window.location.href = p.link}>
            Buy Now 💳
          </button>

          {user && <button onClick={() => deleteProduct(p.id)}>Delete</button>}
        </div>
      ))}

      {/* CART */}
      <h2>Cart</h2>
      {cart.map((item, i) => (
        <p key={i}>{item.name} - ${item.price}</p>
      ))}
      <h3>Total: ${total}</h3>

      <input placeholder="Name" onChange={e => setCustomerName(e.target.value)} />
      <input placeholder="Email" onChange={e => setCustomerEmail(e.target.value)} />

      <button onClick={placeOrder}>Place Order 📦</button>

      {/* TRACKING */}
      <h2>📦 Track Order</h2>
      <input placeholder="Enter email" onChange={e => setCustomerEmail(e.target.value)} />
      <button onClick={trackOrders}>Track</button>

      {orders.map((o, i) => (
        <div key={i} style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}>
          <p><strong>Name:</strong> {o.name}</p>
          <p><strong>Total:</strong> ${o.total}</p>
          <p><strong>Status:</strong> {o.status}</p>
          <p><strong>Tracking #:</strong> {o.trackingNumber || "Not assigned"}</p>

          {/* PROGRESS BAR */}
          <div style={{ background: "#eee", height: 10 }}>
            <div style={{
              width: o.status === "Delivered" ? "100%" : "50%",
              height: "100%",
              background: "purple"
            }} />
          </div>

          {/* ADMIN CONTROLS */}
          {user && (
            <>
              <button onClick={async () => {
                await updateDoc(doc(db, "orders", o.id), {
                  status: "Delivered"
                });
                alert("Updated");
                trackOrders();
              }}>
                Mark Delivered
              </button>
            </>
          )}
        </div>
      ))}

    </div>
  );
}
