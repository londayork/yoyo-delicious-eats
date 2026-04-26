signOut
} from "firebase/auth";

// 🔥 YOUR FIREBASE CONFIG (leave as-is)
// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC0bfI2ckY0QLsUwxt8dojAk4a65-0axU8",
  authDomain: "yoyo-delicious-eats.firebaseapp.com",
@@ -55,7 +55,6 @@ export default function YoYosStore() {
    link: ""
  });

  // 🔄 Load products + auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    loadProducts();
@@ -67,19 +66,16 @@ export default function YoYosStore() {
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
@@ -91,12 +87,8 @@ export default function YoYosStore() {
    setNewProduct((prev) => ({ ...prev, image: url }));
  };

  // ➕ Add product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Enter name and price");
      return;
    }
    if (!newProduct.name || !newProduct.price) return alert("Enter name & price");

    await addDoc(collection(db, "products"), {
      name: newProduct.name,
@@ -110,7 +102,6 @@ export default function YoYosStore() {
    loadProducts();
  };

  // 🗑 DELETE PRODUCT (THIS IS WHAT YOU WANTED)
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
@@ -119,7 +110,11 @@ export default function YoYosStore() {
  const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

  return (
    <div style={{ background: "#fff0f6", minHeight: "100vh", fontFamily: "sans-serif" }}>
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe4ec, #f9d6ff)",
      fontFamily: "sans-serif"
    }}>

      {/* HEADER */}
      <div style={{
@@ -136,6 +131,44 @@ export default function YoYosStore() {
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

      {/* DEALS */}
      <div style={{
        background: "white",
        margin: 20,
        padding: 20,
        borderRadius: 15
      }}>
        <h2 style={{ color: "#b06ab3" }}>🔥 Weekly Deals</h2>
        <p>🍓 Chocolate Strawberries (6) — $10</p>
        <p>🍰 3 Dessert Combo — $15</p>
        <p>🧁 Party Pack (10 items) — $30</p>
      </div>

      {/* SHIPPING */}
      <div style={{
        background: "white",
        margin: 20,
        padding: 15,
        borderRadius: 12,
        borderLeft: "5px solid #ff4da6"
      }}>
        <h3 style={{ color: "#b06ab3" }}>🚚 Shipping Policy</h3>
        <p>Small items require a minimum of <strong>3 or more items</strong> for shipping.</p>
      </div>

      {/* LOGIN */}
      {!user && (
        <div style={{ background: "white", padding: 20, margin: 20 }}>
@@ -154,32 +187,24 @@ export default function YoYosStore() {
        padding: 20
      }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "white", padding: 15 }}>
          <div key={p.id} style={{ background: "white", padding: 15, borderRadius: 15 }}>
            {p.image && (
              <img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            )}

            <h3>{p.name}</h3>
            <p>${p.price}</p>

            <button onClick={() => setCart((prev)=>[...prev, p])}>
            <button onClick={() => setCart((prev) => [...prev, p])}>
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
              <button onClick={() => deleteProduct(p.id)} style={{ background: "red", color: "white" }}>
                Delete ❌
              </button>
            )}
@@ -188,7 +213,7 @@ export default function YoYosStore() {
      </div>

      {/* CART */}
      <div style={{ background: "white", padding: 20, margin: 20 }}>
      <div style={{ background: "white", padding: 20, margin: 20, borderRadius: 15 }}>
        <h2>🛒 Cart</h2>

        {cart.map((item, i) => (
@@ -198,7 +223,7 @@ export default function YoYosStore() {
        <h3>Total: ${total}</h3>

        <button onClick={() => {
          if (cart.length === 0) return alert("Cart empty");
          if (!cart.length) return alert("Cart empty");
          window.location.href = cart[0].link;
        }}>
          Checkout 💳
@@ -221,6 +246,7 @@ export default function YoYosStore() {
          <button onClick={addProduct}>Add Product</button>
        </div>
      )}

    </div>
  );
}
