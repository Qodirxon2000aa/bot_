import { createContext, useContext, useEffect, useState, useRef } from "react";

const TelegramContext = createContext(null);

export const TelegramProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [apiUser, setApiUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  /* ========================= 👤 USER FETCH ========================= */
// ... oldingi kodning yuqori qismi o'zgarmaydi ...

const fetchUserFromApi = async (telegramId) => {
  try {
    setLoading(true);
    const url = `https://m4746.myxvest.ru/webapp/get_user.php?user_id=${telegramId}`;
    console.log("📡 Fetching user from API:", url);
    
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    console.log("📡 API Response:", data);
    
    if (!data.ok) {
      const fallback = { balance: "0", is_admin: false };
      setApiUser(fallback);
      return fallback;
    }

    // Muhim: is_admin ni to'g'ri saqlaymiz
    const userData = {
      ...data.data,                     // balance, profile, hash, referal, action, status, date va h.k.
      is_admin: !!data.is_admin,        // true/false ga aylantiramiz (boolean)
    };
    
    setApiUser(userData);
    console.log("✅ User data loaded:", userData);
    return userData;
  } catch (err) {
    console.error("❌ fetchUserFromApi error:", err);
    const fallback = { balance: "0", is_admin: false };
    setApiUser(fallback);
    return fallback;
  } finally {
    setLoading(false);
  }
};

// ... qolgan funksiyalar (fetchOrders, createOrder, refreshUser va h.k.) o'zgarmaydi ...

// useEffect ichida hech narsa o'zgarmaydi

  /* ========================= 📦 ORDERS ========================= */
  const fetchOrders = async (telegramId) => {
    try {
      const url = `https://m4746.myxvest.ru/webapp/history.php?user_id=${telegramId}`;
      console.log("📦 Fetching orders from:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      console.log("📦 Orders response:", data);
      
      setOrders(data.ok && Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("❌ fetchOrders error:", err);
      setOrders([]);
    }
  };

  /* ========================= 💳 PAYMENTS ========================= */
  const fetchPayments = async (telegramId) => {
    try {
      const url = `https://m4746.myxvest.ru/webapp/payments.php?user_id=${telegramId}`;
      console.log("💳 Fetching payments from:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      console.log("💳 Payments response:", data);
      
      setPayments(data.ok && Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      console.error("❌ fetchPayments error:", err);
      setPayments([]);
    }
  };

  /* ========================= ⭐ ORDER ========================= */
  const createOrder = async ({ amount, sent, type, overall }) => {
    try {
      if (!user?.id) throw new Error("User topilmadi");
      
      const url =
        `https://m4746.myxvest.ru/webapp/order.php` +
        `?user_id=${user.id}&amount=${amount}&sent=@${sent.replace("@ ", "")}` +
        `&type=${type}&overall=${overall}`;
        
      console.log("⭐ Creating order:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.ok) {
        await fetchUserFromApi(user.id);
        await fetchOrders(user.id);
        return { ok: true };
      }
      return { ok: false };
    } catch (err) {
      console.error("❌ createOrder error:", err);
      return { ok: false };
    }
  };

  /* ========================= 💎 PREMIUM ========================= */
  const createPremiumOrder = async ({ months, sent, overall }) => {
    try {
      if (!user?.id) throw new Error("User topilmadi");
      
      const url =
        `https://m4746.myxvest.ru/webapp/premium.php` +
        `?user_id=${user.id}&amount=${months}&sent=${sent.replace("@", "")}` +
        `&overall=${overall}`;
        
      console.log("💎 Creating premium order:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.ok) {
        await fetchUserFromApi(user.id);
        await fetchOrders(user.id);
        return { ok: true, ...data };
      }
      return { ok: false, message: data.message };
    } catch (e) {
      console.error("❌ createPremiumOrder error:", e);
      return { ok: false, message: e.message };
    }
  };

  /* ========================= 🎁 GIFT ORDER ========================= */
  const createGiftOrder = async ({ giftId, sent, price }) => {
    try {
      if (!user?.id) throw new Error("User topilmadi");
      
      const balance = Number(apiUser?.balance || 0);
      if (balance < price) {
        return { ok: false, message: "Balans yetarli emas" };
      }
      
      const cleanUsername = sent.startsWith("@") ? sent : `@${sent}`;
      const url =
        `https://m4746.myxvest.ru/webapp/gifting.php` +
        `?user_id=${user.id}` +
        `&gift_id=${giftId}` +
        `&sent=${encodeURIComponent(cleanUsername)}`;
        
      console.log("🎁 Creating gift order:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data?.ok) {
        return { ok: false, message: data?.message || "Gift xatosi" };
      }
      
      await fetchUserFromApi(user.id);
      await fetchOrders(user.id);
      return { ok: true, data };
    } catch (e) {
      console.error("❌ createGiftOrder error:", e);
      return { ok: false, message: e.message };
    }
  };

  /* ========================= 🔄 REFRESH ========================= */
  const refreshUser = async () => {
    if (user?.id) {
      console.log("🔄 Refreshing data for user:", user.id);
      await fetchUserFromApi(user.id);
      await fetchOrders(user.id);
      await fetchPayments(user.id);
    }
  };

  /* ========================= 👤 CHECK USERNAME ========================= */
  const checkUsername = async (username) => {
    try {
      if (!username) return { ok: false, message: "Username kiritilmagan" };
      
      // @ belgisini olib tashlash
      const cleanUsername = username.replace("@", "");
      
      const url = `https://tezpremium.uz/starsapi/user.php?username=${cleanUsername}`;
      console.log("👤 Checking username:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log("👤 Username check response:", data);
      
      if (data.username) {
        return {
          ok: true,
          data: {
            username: data.username,
            name: data.name,
            photo: data.photo,
            has_premium: data.has_premium
          }
        };
      }
      
      return { ok: false, message: "Foydalanuvchi topilmadi" };
    } catch (err) {
      console.error("❌ checkUsername error:", err);
      return { ok: false, message: "Username tekshirishda xatolik" };
    }
  };



  // ========================= 📲 TELEGRAM USER GETTER =========================
const getTelegramUser = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  // 1️⃣ Asosiy va eng ishonchli yo'l
  if (tg.initDataUnsafe?.user?.id) {
    return tg.initDataUnsafe.user;
  }

  // 2️⃣ Fallback — initData stringdan parse qilish
  if (tg.initData) {
    try {
      const params = new URLSearchParams(tg.initData);
      const userRaw = params.get("user");
      if (userRaw) {
        return JSON.parse(userRaw);
      }
    } catch (e) {
      console.error("❌ Telegram initData parse error:", e);
    }
  }

  return null;
};

  /* ========================= 🚀 INIT ========================= */
useEffect(() => {
  if (fetchedRef.current) return;
  fetchedRef.current = true;

  const telegram = window.Telegram?.WebApp;
  const tgUser = getTelegramUser();

  const isTelegramEnv =
    telegram &&
    typeof telegram.initData === "string" &&
    telegram.initData.length > 0;

  if (telegram) {
    telegram.ready();
    telegram.expand();
  }

  // ============================================
  // ✅ TELEGRAM MUHITI BOR
  // ============================================
  if (isTelegramEnv && tgUser?.id) {
    console.log("✅ REAL TELEGRAM USER");
    console.log("📱 ID:", tgUser.id);

    const realUserData = {
      id: String(tgUser.id),
      first_name: tgUser.first_name || "",
      last_name: tgUser.last_name || "",
      username: tgUser.username ? `@${tgUser.username}` : "",
      photo_url: tgUser.photo_url || null,
      isTelegram: true,
    };

    setUser(realUserData);

    (async () => {
      await fetchUserFromApi(tgUser.id);
      await fetchOrders(tgUser.id);
      await fetchPayments(tgUser.id);
    })();
  }

  // ============================================
  // ⚠️ FAQAT HAQIQIY BRAUZERDA DEV MODE
  // ============================================
  else {
    console.warn("⚠️ DEV MODE (REAL TELEGRAM EMAS)");

    const fakeId = "7521806735";

    setUser({
      id: fakeId,
      first_name: "Qodirxon",
      last_name: "Dev",
      username: "@behissiyot",
      photo_url: null,
      isTelegram: false,
    });

    (async () => {
      await fetchUserFromApi(fakeId);
      await fetchOrders(fakeId);
      await fetchPayments(fakeId);
    })();
  }
}, []);



  return (
    <TelegramContext.Provider
      value={{
        user,
        apiUser,
        orders,
        payments,
        loading,
        createOrder,
        createPremiumOrder,
        createGiftOrder,
        refreshUser,
        checkUsername,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error("useTelegram must be used inside provider");
  return ctx;
};