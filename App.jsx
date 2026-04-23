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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff0f6",
      fontFamily: "Poppins, sans-serif"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 30px",
        background: "white",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#b06ab3" }}>🍰 Yo-Yo's Delicious Eats</h1>

        {user && (
          <button onClick={handleLogout} style={{
            background: "#b06ab3",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "20px"
          }}>
            Logout
          </button>
        )}
      </div>

      {/* HERO */}
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        background: "linear-gradient(to right, #ff9ad5, #b06ab3)",
        color: "white"
      }}>
        <h1 style={{ fontSize: "40px" }}>Luxury Homemade Desserts 💜</h1>
        <p>Fresh • Sweet • Made With Love</p>
        <button style={{
          marginTop: 15,
          padding: "12px 25px",
          borderRadius: 30,
          border: "none",
          background: "white",
          color: "#b06ab3",
          fontWeight: "bold"
        }}>
          Shop Now
        </button>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{
          maxWidth: 400,
          margin: "40px auto",
          background: "white",
          padding: 20,
          borderRadius: 15,
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }}>
          <h3>Admin Login</h3>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={{ width: "100%", margin: 5 }} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={{ width: "100%", margin: 5 }} />
          <button onClick={handleLogin} style={{
            width: "100%",
            padding: 10,
            background: "#b06ab3",
            color: "white",
            border: "none",
            borderRadius: 10
          }}>
            Login
          </button>
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
            <img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            <div style={{ padding: 15 }}>
              <h3>{p.name}</h3>
              <p style={{ fontWeight: "bold", color: "#b06ab3" }}>${p.price}</p>

              <button
                onClick={() => window.location.href = p.link}
                style={{
                  width: "100%",
                  background: "#ff4da6",
                  color: "white",
                  border: "none",
                  padding: 10,
                  borderRadius: 10
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN */}
      {user && (
        <div style={{
          margin: 30,
          background: "white",
          padding: 20,
          borderRadius: 15
        }}>
          <h2>Add Product</h2>

          <input placeholder="Name" onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input placeholder="Stock" onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
          <input type="file" onChange={handleImageUpload} />
          <input placeholder="Stripe Link" onChange={e => setNewProduct({ ...newProduct, link: e.target.value })} />

          <button onClick={addProduct} style={{
            marginTop: 10,
            background: "#b06ab3",
            color: "white",
            border: "none",
            padding: 10,
            borderRadius: 10
          }}>
            Add Product
          </button>
        </div>
      )}
    </div>
  );
}
