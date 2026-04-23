import React, { useEffect, useState } from "react";

// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// 🔥 Firebase config (keep yours)
const firebaseConfig = {
  apiKey: "AIzaSyC0bfI2ckY0QLsUwxt8dojAk4a65-0axU8",
  authDomain: "yoyo-delicious-eats.firebaseapp.com",
  projectId: "yoyo-delicious-eats",
  storageBucket: "yoyo-delicious-eats.firebasestorage.app",
  messagingSenderId: "107422339618",
  appId: "1:107422339618:web:ab40e45ae2238241efb07b"
};

// 🔥 Init
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

  // 🔄 Load products + listen for auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    loadProducts();
    return () => unsub();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(items);
  };

  // 🔐 LOGIN (shows REAL error)
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // 📸 Upload image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, "products/" + Date.now() + "_" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setNewProduct((prev) => ({ ...prev, image: url }));
  };

  // ➕ Add product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Add name and price");
      return;
    }

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

  const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

  return (
    <div style={{ background: "#fff0f6", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        background: "white",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="logo" style={{ width: 50, borderRadius: "50%" }} />
          <h2 style={{ color: "#b06ab3" }}>Yo-Yo's Delicious Eats</h2>
        </div>

        {user && (
          <button onClick={handleLogout} style={{ padding: "6px 12px" }}>
            Logout
          </button>
        )}
      </div>

      {/* HERO */}
      <div style={{
        textAlign: "center",
        padding: 50,
        background: "linear-gradient(to right, pink, purple)",
        color: "white"
      }}>
        <h1>Fresh Homemade Desserts 💜</h1>
        <p>Cookies • Cakes • Sea Moss</p>
      </div>

      {/* 🔐 LOGIN (only shows when NOT logged in) */}
      {!user && (
        <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 10 }}>
          <h3>Admin Login</h3>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />

          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* ⭐ FEATURED */}
      <h2 style={{ textAlign: "center", color: "#b06ab3" }}>⭐ Favorites</h2>
      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: 20 }}>
        {products.slice(0, 3).map((p) => (
          <div key={p.id} style={{ minWidth: 200, background: "white", padding: 10, borderRadius: 10 }}>
            {p.image && <img src={p.image} style={{ width: "100%" }} />}
            <p>{p.name}</p>
          </div>
        ))}
      </div>

      {/* 🧁 PRODUCTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
        gap: 20,
        padding: 20
      }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "white", padding: 15, borderRadius: 10 }}>
            {p.image && (
              <img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            )}

            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart([...cart, p])}>
              Add to Cart 🛒
            </button>

            <button
              onClick={() => {
                if (!p.link) return alert("No payment link set");
                window.location.href = p.link;
              }}
              style={{ marginLeft: 8 }}
            >
              Buy Now 💳
            </button>
          </div>
        ))}
      </div>

      {/* 🛒 CART */}
      <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 10 }}>
        <h2>🛒 Cart</h2>

        {cart.length === 0 && <p>No items yet</p>}

        {cart.map((item, i) => (
          <p key={i}>
            {item.name} - ${item.price}
          </p>
        ))}

        <h3>Total: ${total}</h3>

        <button
          onClick={() => {
            if (cart.length === 0) return alert("Cart empty");
            // simple checkout (first item's link)
            window.location.href = cart[0].link;
          }}
        >
          Checkout 💳
        </button>
      </div>

      {/* 💬 REVIEWS */}
      <h2 style={{ textAlign: "center" }}>💬 Reviews</h2>
      <div style={{ display: "flex", gap: 10, padding: 20, justifyContent: "center" }}>
        <div>⭐⭐⭐⭐⭐ “Best desserts ever!”</div>
        <div>⭐⭐⭐⭐⭐ “Fresh and delicious!”</div>
      </div>

      {/* 🔧 ADMIN (only shows when logged in) */}
      {user && (
        <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 10 }}>
          <h2>Add Product</h2>

          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />

          <input
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />

          <input
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />

          <input type="file" onChange={handleImageUpload} />

          <input
            placeholder="Stripe Link"
            value={newProduct.link}
            onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
          />

          <br /><br />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
    </div>
  );
}
