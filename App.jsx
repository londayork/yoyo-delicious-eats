import React, { useEffect, useState } from "react";

// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

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
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "", price: "", stock: "", image: "", link: ""
  });

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      alert("Login failed");
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
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock || "0")
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
        background: "white"
      }}>
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
        background: "linear-gradient(to right, pink, purple)",
        color: "white"
      }}>
        <h1>Fresh Homemade Desserts 💜</h1>
        <p>Cookies • Cakes • Sea Moss</p>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
          <h3>Admin Login</h3>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* FEATURED */}
      <h2 style={{ textAlign: "center", color: "#b06ab3" }}>⭐ Favorites</h2>
      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: 20 }}>
        {products.slice(0, 3).map(p => (
          <div key={p.id} style={{ minWidth: 200, background: "white", padding: 10 }}>
            <img src={p.image} style={{ width: "100%" }} />
            <p>{p.name}</p>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
        gap: 20,
        padding: 20
      }}>
        {products.map(p => (
          <div key={p.id} style={{ background: "white", padding: 15 }}>
            <img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart([...cart, p])}>
              Add to Cart
            </button>

            <button onClick={() => window.location.href = p.link}>
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* CART */}
      <div style={{ background: "white", padding: 20, margin: 20 }}>
        <h2>🛒 Cart</h2>

        {cart.map((item, i) => (
          <p key={i}>{item.name} - ${item.price}</p>
        ))}

        <h3>Total: ${total}</h3>

        <button onClick={() => {
          if (cart.length === 0) return alert("Cart empty");
          window.location.href = cart[0].link;
        }}>
          Checkout 💳
        </button>
      </div>

      {/* REVIEWS */}
      <h2 style={{ textAlign: "center" }}>💬 Reviews</h2>
      <div style={{ display: "flex", gap: 10, padding: 20 }}>
        <div>⭐⭐⭐⭐⭐ “Best desserts ever!”</div>
        <div>⭐⭐⭐⭐⭐ “Fresh and delicious!”</div>
      </div>

      {/* ADMIN */}
      {user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
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
