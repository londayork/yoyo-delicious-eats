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
  apiKey: "AIzaSyBfGAT6RkXlVlQMN6RnwkY1abt3DxRM89w",
  authDomain: "yo-yo-delicious-eats.firebaseapp.com",
  projectId: "yo-yo-delicious-eats",
  storageBucket: "yo-yo-delicious-eats.appspot.com"
  messagingSenderId: "974812326876",
  appId: "1:974812326876:web:81a1ff84947a50880efd19",
  measurementId: "G-6E8R9XBF4C"
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

  const totalValue = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#ffe4ec" }}>

      {success && (
        <div style={{
          background: "green",
          color: "white",
          padding: 15,
          margin: 20,
          borderRadius: 10,
          textAlign: "center"
        }}>
          🎉 Payment successful! Your order has been placed.
        </div>
      )}

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        background: "white"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="logo"
            style={{ width: 60, borderRadius: "50%" }}
          />
          <h2 style={{ color: "#b06ab3" }}>
            Yo-Yo's Delicious Eats
          </h2>
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

      {/* PRODUCTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
        gap: 20,
        padding: 20
      }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "white", padding: 15 }}>
            {p.image && <img src={p.image} style={{ width: "100%" }} />}
            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart(prev => [...prev, p])}>
              Add to Cart
            </button>

            {user && (
              <button onClick={() => deleteProduct(p.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>

      {/* CART */}
      <div style={{ background: "white", margin: 20, padding: 20 }}>
        <h2>Cart</h2>

        {cart.map((item, i) => (
          <p key={i}>{item.name} - ${item.price}</p>
        ))}

        <h3>Total: ${totalValue}</h3>

        <input
          placeholder="Email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />

        <button
          onClick={async () => {

            if (!customerEmail) {
              return alert("Enter email");
            }

            const totalValue = cart.reduce((sum, i) => sum + i.price, 0);
            const orderId = "ORD-" + Date.now();

            await addDoc(collection(db, "orders"), {
              orderId,
              email: customerEmail,
              items: cart,
              total: totalValue,
              date: new Date().toLocaleString(),
              status: "Pending"
            });

            // ✅ FIXED CHECKOUT
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ items: cart })
            });

            const data = await res.json();

            console.log("FULL RESPONSE:", data);

            if (!data.url) {
              alert("Stripe error: " + (data.error || "No URL returned"));
              return;
            }

            window.location.href = data.url;
          }}
        >
          Checkout 💳
        </button>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ padding: 20 }}>
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* ADMIN */}
      {user && (
        <div style={{ background: "white", margin: 20, padding: 20 }}>
          <h3>Admin</h3>

          <input placeholder="Name" onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input type="file" onChange={handleImageUpload} />
          <input placeholder="Link" onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}

    </div>
  );
}
