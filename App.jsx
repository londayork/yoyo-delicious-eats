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
  apiKey: "YOUR_API_KEY",
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

  const totalValue = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#ffe4ec" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: 20, background: "white" }}>
        <h2>Yo-Yo's Delicious Eats</h2>
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ padding: 20 }}>
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 20, padding: 20 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "white", padding: 15 }}>
            {p.image && <img src={p.image} style={{ width: "100%" }} />}
            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart(prev => [...prev, p])}>Add to Cart</button>

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
            if (cart.length < 3) return alert("Minimum 3 items required");

            await addDoc(collection(db, "orders"), {
              email: customerEmail,
              items: cart,
              total: totalValue,
              date: new Date().toLocaleString(),
              status: "Pending"
            });

            alert("Order saved!");
          }}
        >
          Checkout
        </button>
      </div>

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

      {/* TRACK ORDER */}
      <div style={{ background: "white", margin: 20, padding: 20 }}>
        <h2>Track Order</h2>

        <input
          placeholder="Enter email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />

        <button
          onClick={async () => {
            const snap = await getDocs(collection(db, "orders"));
            const results = snap.docs.map(doc => doc.data());
            setOrders(results.filter(o => o.email === customerEmail));
          }}
        >
          Track
        </button>

        {orders.map((o, i) => (
          <div key={i}>
            <p>Total: ${o.total}</p>
            <p>{o.date}</p>
            <p>{o.status}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
