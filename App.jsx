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
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

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
    if (!newProduct.name || !newProduct.price) return alert("Enter name & price");

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

  const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe4ec, #f9d6ff)",
      fontFamily: "Poppins, sans-serif"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 30px",
        background: "white",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        borderRadius: "0 0 20px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }} />
          <h2 style={{ color: "#b06ab3" }}>
            Yo-Yo's Delicious Eats
          </h2>
        </div>

        {user && <button onClick={handleLogout}>Logout</button>}
      </div>

      {/* HERO */}
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "white",
        background: "linear-gradient(to right, #ff7eb3, #b06ab3)",
        borderRadius: 20,
        margin: 20
      }}>
        <h1>Fresh Homemade Desserts 🍰</h1>
        <p>Made with love • Delivered fresh</p>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 15 }}>
          <h3>Admin Login</h3>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
        gap: 25,
        padding: 30
      }}>
        {products.map(p => (
          <div key={p.id} style={{
            background: "white",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}>
            {p.image && (
              <img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            )}

            <div style={{ padding: 15 }}>
              <h3>{p.name}</h3>
              <p style={{ color: "#ff4da6", fontWeight: "bold" }}>${p.price}</p>

              <button
                onClick={() => setCart([...cart, p])}
                style={{
                  width: "100%",
                  marginTop: 10,
                  background: "linear-gradient(to right, #ff4da6, #b06ab3)",
                  color: "white",
                  border: "none",
                  padding: 12,
                  borderRadius: 12
                }}
              >
                Add to Cart 🛒
              </button>

              <button
                onClick={() => window.location.href = p.link}
                style={{ width: "100%", marginTop: 5 }}
              >
                Buy Now 💳
              </button>

              {user && (
                <button
                  onClick={() => deleteProduct(p.id)}
                  style={{ background: "red", color: "white", marginTop: 5 }}
                >
                  Delete ❌
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CART */}
      <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 15 }}>
        <h2>🛒 Cart</h2>

        {cart.map((item, i) => (
          <p key={i}>{item.name} - ${item.price}</p>
        ))}

        <h3>Total: ${total}</h3>

        <button onClick={() => {
          if (!cart.length) return alert("Cart empty");
          window.location.href = cart[0].link;
        }}>
          Checkout 💳
        </button>
      </div>

      {/* ADMIN */}
      {user && (
        <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 15 }}>
          <h2>Add Product</h2>

          <input placeholder="Name" onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input placeholder="Stock" onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
          <input type="file" onChange={handleImageUpload} />
          <input placeholder="Stripe Link" onChange={e => setNewProduct({ ...newProduct, link: e.target.value })} />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
    </div>
  );
}
