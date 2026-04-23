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

// Firebase config
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
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "", price: "", stock: "", image: "", link: ""
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, "products/" + Date.now() + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setNewProduct(prev => ({ ...prev, image: url }));
  };

  const addProduct = async () => {
    await addDoc(collection(db, "products"), {
      ...newProduct,
      price: parseFloat(newProduct.price)
    });
    setNewProduct({ name: "", price: "", stock: "", image: "", link: "" });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  // 🧾 SAVE ORDER
  const placeOrder = async () => {
    if (!customerName || !customerEmail) return alert("Enter info");
    if (!cart.length) return alert("Cart empty");

    await addDoc(collection(db, "orders"), {
      name: customerName,
      email: customerEmail,
      items: cart,
      total,
      date: new Date().toLocaleString()
    });

    alert("Order placed!");
    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
    loadOrders();
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>🍰 Yo-Yo's Delicious Eats</h1>

      {!user && (
        <div>
          <h3>Admin Login</h3>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {user && <button onClick={handleLogout}>Logout</button>}

      {/* PRODUCTS */}
      {products.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>${p.price}</p>
          <button onClick={() => setCart([...cart, p])}>Add</button>
          {user && <button onClick={() => deleteProduct(p.id)}>Delete</button>}
        </div>
      ))}

      {/* CART */}
      <h2>Cart</h2>
      {cart.map((item, i) => (
        <p key={i}>{item.name} - ${item.price}</p>
      ))}

      <h3>Total: ${total}</h3>

      <input placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
      <input placeholder="Your Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />

      <button onClick={placeOrder}>Place Order 📦</button>

      {/* ADMIN ORDERS VIEW */}
      {user && (
        <div>
          <h2>📦 Orders</h2>
          {orders.map((o, i) => (
            <div key={i}>
              <p><strong>{o.name}</strong> ({o.email})</p>
              <p>Total: ${o.total}</p>
              <p>{o.date}</p>
              <hr />
            </div>
          ))}
        </div>
      )}

      {/* ADMIN ADD PRODUCT */}
      {user && (
        <div>
          <h2>Add Product</h2>
          <input placeholder="Name" onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input type="file" onChange={handleImageUpload} />
          <button onClick={addProduct}>Add</button>
        </div>
      )}
    </div>
  );
}
