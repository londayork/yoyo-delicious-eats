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

// 🔥 YOUR FIREBASE CONFIG (leave as-is)
const firebaseConfig = {
  apiKey: "AIzaSyC0bfI2ckY0QLsUwxt8dojAk4a65-0axU8",
  authDomain: "yoyo-delicious-eats.firebaseapp.com",
  projectId: "yoyo-delicious-eats",
  storageBucket: "yoyo-delicious-eats.firebasestorage.app",
  messagingSenderId: "107422339618",
  appId: "1:107422339618:web:ab40e45ae2238241efb07b"
};

// Init Firebase
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

  // 🔄 Load products + auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    loadProducts();
    return () => unsub();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // 🔐 LOGIN
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
      alert("Enter name and price");
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

  // 🗑 DELETE PRODUCT (THIS IS WHAT YOU WANTED)
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

  return (
    <div style={{ background: "#fff0f6", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 20,
        background: "white"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" style={{ width: 50, borderRadius: "50%" }} />
          <h2 style={{ color: "#b06ab3" }}>Yo-Yo's Delicious Eats</h2>
        </div>

        {user && <button onClick={handleLogout}>Logout</button>}
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
          <h3>Admin Login</h3>
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
          <div key={p.id} style={{ background: "white", padding: 15 }}>
            {p.image && (
              <img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            )}

            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart((prev)=>[...prev, p])}>
              Add to Cart 🛒
            </button>

            <button onClick={() => window.location.href = p.link}>
              Buy Now 💳
            </button>

            {/* 🗑 DELETE BUTTON */}
            {user && (
              <button
                onClick={() => deleteProduct(p.id)}
                style={{
                  background: "red",
                  color: "white",
                  marginTop: 5
                }}
              >
                Delete ❌
              </button>
            )}
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

      {/* ADMIN */}
      {user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
          <h2>Add Product</h2>

          <input placeholder="Name" onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input placeholder="Stock" onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />

          <input type="file" onChange={handleImageUpload} />

          <input placeholder="Stripe Link" onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
    </div>
  );
}
