import { useState, useRef, useEffect } from "react";
import {
  Home, ShoppingBag, Clock, Settings, Search,
  Heart, ShoppingCart, Star, ChevronRight, ChevronLeft, MapPin,
  Phone, MessageCircle, ArrowLeft, Plus, Minus, X,
  Check, Bell, BellOff, LogOut, Pencil, Trash2, Eye, EyeOff,
  Filter, Mic, Share2, Shield, HelpCircle,
  Globe, Moon, Sun, Truck, CheckCircle, Package,
  TrendingUp, Users, BarChart2,
  DollarSign, Lock, Mail, Wrench,
  Tag, Download, FileText, LayoutGrid, List,
  Zap, CreditCard, AlertCircle
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import shopLogo from "@/imports/image.png";
import { supabaseService, Product, Order, Customer, CartItem } from "./services/supabaseService";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Screen =
  | "home" | "shop" | "product" | "cart" | "checkout"
  | "order-success" | "orders" | "order-detail" | "settings"
  | "admin-login" | "admin" | "customer-auth";

type Tab = "home" | "shop" | "orders" | "settings";
type AdminTab = "dashboard" | "products" | "orders" | "customers" | "analytics" | "content" | "payments";


export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  type: "admin" | "customer";
  orderId: string;
  customerEmail?: string;
}

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    welcomeBack: "Welcome back",
    shop: "Shop",
    myCart: "My Cart",
    checkout: "Checkout",
    myOrders: "My Orders",
    settings: "Settings",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    language: "Language",
    account: "Account",
    changePassword: "Change Password",
    privacySettings: "Privacy Settings",
    termsConditions: "Terms & Conditions",
    support: "Support",
    helpCenter: "Help Center",
    contactSupport: "Contact Support",
    logOut: "Log Out",
    loginRegister: "Login / Register",
    guestSession: "Guest Session",
    guestDesc: "Create an account to track your orders, save shipping info, and access full features.",
    popularPhones: "Popular Phones",
    quickCategories: "Quick Categories",
    shopNow: "Shop Now",
    searchPlaceholder: "Search phones, accessories...",
    emptyCart: "Your cart is empty",
    proceedCheckout: "Proceed to Checkout",
    orderSummary: "Order Summary",
    total: "Total",
    deliveryAddress: "Delivery Address",
    paymentMethod: "Payment Method",
    reviewOrder: "Review Order",
    placeOrder: "Place Order",
    continue: "Continue",
    orderPlaced: "Order Placed! 🎉",
    continueShopping: "Continue Shopping",
    pendingConfirmation: "Pending Confirmation",
    trackOrder: "Track Order",
    homeTab: "Home",
    shopTab: "Shop",
    ordersTab: "Orders",
    profileTab: "Profile",
    memberSince: "Member since",
    editStoreInfo: "Edit Store Settings",
    saveStoreInfo: "Save Store Info",
    payingTo: "Payee UPI ID",
    amountToPay: "Amount to Pay",
    openUpiApp: "⚡ Open GPay / UPI App",
    scanQrCode: "Scan QR code to pay or use button below"
  },
  mz: {
    welcomeBack: "Chibai le",
    shop: "Dawr",
    myCart: "Ka Cart",
    checkout: "Pekna",
    myOrders: "Ka Order-te",
    settings: "Siamremna",
    preferences: "Duhthlan turte",
    darkMode: "Thim Mode",
    notifications: "Hriattirna",
    language: "Tawng",
    account: "Account",
    changePassword: "Password Thlakna",
    privacySettings: "Privacy Siamremna",
    termsConditions: "Kaihruaina Te",
    support: "Tanpuina",
    helpCenter: "Zawhna & Chhanna",
    contactSupport: "Biak Pawhna",
    logOut: "Chhuahna",
    loginRegister: "Luhna / Account Siamna",
    guestSession: "Mikhual Session",
    guestDesc: "Order-te track zui a, thawnna address save nan leh features dang hman nan account siam rawh.",
    popularPhones: "Phone Deihlawhte",
    quickCategories: "Khaikhawm Category",
    shopNow: "En nghal rawh",
    searchPlaceholder: "Phone leh accessories zawnna...",
    emptyCart: "I cart a ruak e",
    proceedCheckout: "Proceed to Checkout",
    orderSummary: "Order Khaikhawmna",
    total: "A vaiin",
    deliveryAddress: "Thawnna Address",
    paymentMethod: "Payment Thlanna",
    reviewOrder: "Order Ennawnna",
    placeOrder: "Order Siam Rawh",
    continue: "Kal zel rawh",
    orderPlaced: "Order Siam A Ni Ta! 🎉",
    continueShopping: "Dawr chhunzawm rawh",
    pendingConfirmation: "Nemngheh nghah mek",
    trackOrder: "Order Chhuihna",
    homeTab: "Home",
    shopTab: "Dawr",
    ordersTab: "Order-te",
    profileTab: "Profile",
    memberSince: "Member nih tanna",
    editStoreInfo: "Store Settings Siamremna",
    saveStoreInfo: "Save Store Info",
    payingTo: "Payee UPI ID",
    amountToPay: "Pek tur zat",
    openUpiApp: "⚡ Open GPay / UPI App",
    scanQrCode: "QR code scan-in emaw a hnuai button click-in pay rawh"
  }
};

const t = (key: keyof typeof TRANSLATIONS.en, lang: "en" | "mz"): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
};

// ─── INITIAL SEED MOCK DATA ──────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1", name: "iPhone 15 Pro Max", brand: "Apple", category: "iPhones",
    price: 1199, originalPrice: 1299, rating: 4.9, reviews: 2847,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&auto=format",
    stock: 24, badge: "Hot",
    description: "The most powerful iPhone ever with titanium design, A17 Pro chip, and the most advanced camera system Apple has ever made.",
    specs: { "Display": "6.7\" Super Retina XDR", "Chip": "A17 Pro", "Camera": "48MP + 12MP + 12MP", "Battery": "4422 mAh", "Storage": "256GB", "OS": "iOS 17" },
  },
  {
    id: "p2", name: "iPhone 14", brand: "Apple", category: "iPhones",
    price: 699, originalPrice: 799, rating: 4.7, reviews: 1923,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop&auto=format",
    stock: 18, badge: "Sale",
    description: "iPhone 14 with Crash Detection, Emergency SOS via satellite, and an advanced dual-camera system.",
    specs: { "Display": "6.1\" Super Retina XDR", "Chip": "A15 Bionic", "Camera": "12MP + 12MP", "Battery": "3279 mAh", "Storage": "128GB", "OS": "iOS 17" },
  },
  {
    id: "p3", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "Android Phones",
    price: 1299, originalPrice: 1399, rating: 4.8, reviews: 1456,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format",
    stock: 12, badge: "New",
    description: "Galaxy AI is here. Galaxy S24 Ultra redefines what's possible with the most advanced Galaxy AI experience.",
    specs: { "Display": "6.8\" QHD+ Dynamic AMOLED", "Chip": "Snapdragon 8 Gen 3", "Camera": "200MP + 12MP + 50MP + 10MP", "Battery": "5000 mAh", "Storage": "256GB", "OS": "Android 14 / One UI 6.1" },
  },
  {
    id: "p4", name: "Google Pixel 8 Pro", brand: "Google", category: "Android Phones",
    price: 899, originalPrice: 999, rating: 4.6, reviews: 892,
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop&auto=format",
    stock: 15, badge: "Sale",
    description: "Google Pixel 8 Pro with Tensor G3 chip delivers the most sophisticated Pixel camera yet with Magic Eraser and Best Take.",
    specs: { "Display": "6.7\" LTPO OLED", "Chip": "Google Tensor G3", "Camera": "50MP + 48MP + 48MP", "Battery": "5050 mAh", "Storage": "128GB", "OS": "Android 14" },
  },
  {
    id: "p5", name: "AirPods Pro (2nd Gen)", brand: "Apple", category: "AirPods",
    price: 249, originalPrice: 279, rating: 4.9, reviews: 4521,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop&auto=format",
    stock: 50, badge: "Hot",
    description: "AirPods Pro deliver up to 2x more Active Noise Cancellation and revolutionary Adaptive Audio that continuously adapts to sound.",
    specs: { "ANC": "2x Active Noise Cancellation", "Battery": "Up to 30hrs total", "Chip": "H2", "Water Resistance": "IPX4", "Connectivity": "Bluetooth 5.3" },
  },
  {
    id: "p6", name: "Sony WH-1000XM5", brand: "Sony", category: "Headphones",
    price: 349, originalPrice: 399, rating: 4.8, reviews: 3102,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format",
    stock: 30, badge: "Sale",
    description: "Industry-leading noise canceling headphones with Dual Noise Sensor technology and 30-hour battery life.",
    specs: { "ANC": "Industry-leading", "Battery": "30 hours", "Drivers": "30mm", "Connectivity": "Bluetooth 5.2", "Foldable": "Yes" },
  },
  {
    id: "p7", name: "Anker PowerCore 20000", brand: "Anker", category: "Power Banks",
    price: 49, originalPrice: 65, rating: 4.7, reviews: 8934,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop&auto=format",
    stock: 100, badge: "Sale",
    description: "Anker PowerCore 20000 with high-speed Power IQ charging and an ultra-compact form factor to charge all your devices.",
    specs: { "Capacity": "20000 mAh", "Input": "USB-C 18W", "Output": "2x USB-A + 1x USB-C", "Weight": "356g" },
  },
  {
    id: "p8", name: "Samsung 65W Super Fast Charger", brand: "Samsung", category: "Chargers",
    price: 35, originalPrice: 45, rating: 4.6, reviews: 2341,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop&auto=format",
    stock: 75, badge: "New",
    description: "65W USB-C Super Fast Charging adapter for Samsung Galaxy devices — charge from 0 to 50% in about 20 minutes.",
    specs: { "Power": "65W", "Protocol": "Super Fast Charging 2.0", "Connector": "USB-C", "Input": "100-240V" },
  },
  {
    id: "p9", name: "JBL Charge 5 Speaker", brand: "JBL", category: "Speakers",
    price: 179, originalPrice: 199, rating: 4.7, reviews: 1678,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop&auto=format",
    stock: 40, badge: "Hot",
    description: "JBL Charge 5 delivers powerful JBL Pro Sound, 20 hours of playtime, and serves as a portable charger for your devices.",
    specs: { "Battery": "20 hours", "Water Resistance": "IP67", "Power Output": "40W", "Connectivity": "Bluetooth 5.1" },
  },
  {
    id: "p10", name: "iPhone 15 Pro Clear Case", brand: "Apple", category: "iPhone Accessories",
    price: 49, originalPrice: 49, rating: 4.5, reviews: 3241,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop&auto=format",
    stock: 200, badge: "New",
    description: "Apple Clear Case for iPhone 15 Pro with MagSafe — showcases the natural beauty of titanium while protecting your phone.",
    specs: { "Material": "Polycarbonate", "MagSafe": "Yes", "Compatibility": "iPhone 15 Pro" },
  },
  {
    id: "p11", name: "Samsung Galaxy Buds2 Pro", brand: "Samsung", category: "Earphones",
    price: 229, originalPrice: 249, rating: 4.6, reviews: 1890,
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&auto=format",
    stock: 35, badge: "Sale",
    description: "Galaxy Buds2 Pro deliver 360 Audio and premium sound powered by a 2-way speaker system in a compact ergonomic design.",
    specs: { "ANC": "Yes", "Battery": "8hr + 21hr (case)", "Driver": "11mm woofer + 6.5mm tweeter", "Water Resistance": "IPX7" },
  },
  {
    id: "p12", name: "OnePlus 12", brand: "OnePlus", category: "Android Phones",
    price: 799, originalPrice: 899, rating: 4.7, reviews: 724,
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=400&fit=crop&auto=format",
    stock: 20, badge: "New",
    description: "OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad Camera System, and 100W SuperVOOC fast charging.",
    specs: { "Display": "6.82\" LTPO AMOLED", "Chip": "Snapdragon 8 Gen 3", "Camera": "50MP + 64MP + 48MP", "Battery": "5400 mAh", "Charging": "100W SuperVOOC" },
  },
];

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-2024-001", date: "2024-01-15T10:30:00Z", status: "delivered", items: [{ product: INITIAL_PRODUCTS[0], qty: 1 }], total: 1199, address: "123 Main Street, New York, NY 10001", payment: "UPI Payment", tracking: "1Z999AA10123456784" },
  { id: "ORD-2024-002", date: "2024-01-20T14:45:00Z", status: "shipped", items: [{ product: INITIAL_PRODUCTS[4], qty: 1 }, { product: INITIAL_PRODUCTS[6], qty: 2 }], total: 347, address: "456 Broadway, New York, NY 10013", payment: "Cash On Delivery", tracking: "1Z999AA10987654321" },
  { id: "ORD-2024-003", date: "2024-01-25T11:15:00Z", status: "processing", items: [{ product: INITIAL_PRODUCTS[5], qty: 1 }], total: 349, address: "789 5th Ave, New York, NY 10022", payment: "UPI Payment" },
  { id: "ORD-2024-004", date: "2024-01-28T09:20:00Z", status: "pending", items: [{ product: INITIAL_PRODUCTS[2], qty: 1 }], total: 1299, address: "321 Park Ave, New York, NY 10016", payment: "Cash On Delivery" },
  { id: "ORD-2024-005", date: "2024-01-10T16:00:00Z", status: "cancelled", items: [{ product: INITIAL_PRODUCTS[8], qty: 1 }], total: 179, address: "555 Lexington Ave, New York, NY 10022", payment: "UPI Payment" },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Sarah Johnson", email: "sarah@gmail.com", orders: 8, spent: 4299, joined: "2023-08", avatar: "SJ" },
  { id: "c2", name: "Michael Chen", email: "mchen@gmail.com", orders: 5, spent: 2891, joined: "2023-09", avatar: "MC" },
  { id: "c3", name: "Emily Rodriguez", email: "emily.r@gmail.com", orders: 12, spent: 6120, joined: "2023-07", avatar: "ER" },
  { id: "c4", name: "James Wilson", email: "jwilson@gmail.com", orders: 3, spent: 1450, joined: "2023-11", avatar: "JW" },
  { id: "c5", name: "Aisha Patel", email: "aisha.p@gmail.com", orders: 7, spent: 3870, joined: "2023-10", avatar: "AP" },
];

const CATEGORIES = ["All", "iPhones", "Android Phones", "AirPods", "Headphones", "Earphones", "Chargers", "Power Banks", "Speakers", "iPhone Accessories"];

const CHART_COLORS = ["#2563EB", "#0B1D3A", "#60A5FA", "#93C5FD", "#BFDBFE"];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const fmtPrice = (p: number) => `$${p.toLocaleString()}`;
const calcDiscount = (orig: number, curr: number) => Math.round(((orig - curr) / orig) * 100);

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );
}

function Badge({ status }: { status: Order["status"] }) {
  const m: Record<Order["status"], { label: string; cls: string }> = {
    pending: { label: "Pending Confirmation", cls: "bg-amber-100 text-amber-700" },
    confirmed: { label: "Confirmed", cls: "bg-sky-100 text-sky-700" },
    processing: { label: "Processing", cls: "bg-blue-100 text-blue-700" },
    shipped: { label: "Shipped", cls: "bg-indigo-100 text-indigo-700" },
    "out-for-delivery": { label: "Out For Delivery", cls: "bg-orange-100 text-orange-700" },
    delivered: { label: "Delivered", cls: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = m[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: () => void }) {
  const firstImage = product.image ? product.image.split(",")[0].trim() : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format";
  return (
    <button onClick={onSelect} className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden text-left cursor-pointer">
      <div className="relative w-full aspect-[3/4] bg-white/5 overflow-hidden">
        <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2 mb-1.5">{product.name}</p>
        <p className="font-black text-accent text-sm mt-1">{fmtPrice(product.price)}</p>
      </div>
    </button>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="relative w-full aspect-[3/4] bg-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/5 rounded w-5/6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
        <div className="h-3 bg-white/5 rounded w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER COMPONENT ──────────────────────────────────────────────────────────

function Footer({ lang, onNavigateTab }: { lang: "en" | "mz"; onNavigateTab?: (tab: Tab) => void }) {
  return (
    <footer className="w-full bg-[#0B1D3A] text-white border-t border-white/5 py-12 px-6 mt-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex items-center justify-center p-1.5 shadow-md">
            <img src={shopLogo} alt="Alpha Mobile Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h4 className="font-black text-base tracking-wide uppercase text-white leading-tight">Alpha Mobile</h4>
            <p className="text-white/40 text-xs mt-0.5">{lang === "mz" ? "Aizawl, Mizoram" : "Aizawl, Mizoram"}</p>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-4">{lang === "mz" ? "ZAWNNA" : "QUICK LINKS"}</h5>
            <ul className="space-y-2.5 font-bold text-white/70">
              <li>
                <button onClick={() => onNavigateTab?.("home")} className="hover:text-white transition-colors text-left cursor-pointer">
                  {lang === "mz" ? "Home" : "Home"}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab?.("shop")} className="hover:text-white transition-colors text-left cursor-pointer">
                  {lang === "mz" ? "Dawr (Shop)" : "Shop"}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab?.("orders")} className="hover:text-white transition-colors text-left cursor-pointer">
                  {lang === "mz" ? "Order-te" : "Orders"}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab?.("settings")} className="hover:text-white transition-colors text-left cursor-pointer">
                  {lang === "mz" ? "Profile & Siamremna" : "Profile / Settings"}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-4">{lang === "mz" ? "TANPUINA" : "SUPPORT"}</h5>
            <ul className="space-y-2.5 font-bold text-white/70">
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "about" }))} 
                  className="hover:text-white transition-colors block text-left bg-transparent border-0 p-0 cursor-pointer text-xs"
                >
                  {lang === "mz" ? "Kan chanchin" : "About Us"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "privacy" }))} 
                  className="hover:text-white transition-colors block text-left bg-transparent border-0 p-0 cursor-pointer text-xs"
                >
                  {lang === "mz" ? "Privacy Policy" : "Privacy Policy"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "terms" }))} 
                  className="hover:text-white transition-colors block text-left bg-transparent border-0 p-0 cursor-pointer text-xs"
                >
                  {lang === "mz" ? "Terms of Service" : "Terms of Service"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "faq" }))} 
                  className="hover:text-white transition-colors block text-left bg-transparent border-0 p-0 cursor-pointer text-xs"
                >
                  {lang === "mz" ? "Zawhna Te" : "FAQ"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Follow us & Contact */}
        <div className="space-y-5">
          <div>
            <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-4">{lang === "mz" ? "MIN ZUI RAWH" : "FOLLOW US"}</h5>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all active:scale-95 bg-white/5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com/alpha_mobile_mizoram" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all active:scale-95 bg-white/5"
              >
                <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all active:scale-95 bg-white/5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/919612217093" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all active:scale-95 bg-white/5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.725-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.069.99 11.45.99c-5.438 0-9.863 4.37-9.868 9.8-.001 1.77.463 3.5 1.34 5.028l-.994 3.63 3.73-.974zm13.11-7.29c-.29-.145-1.716-.848-1.98-.943-.265-.096-.458-.145-.65.145-.193.29-.747.943-.916 1.137-.168.193-.337.217-.626.072-2.882-1.44-3.882-2.39-4.887-4.113-.265-.453.265-.42.758-1.405.08-.163.04-.306-.02-.45-.06-.145-.65-1.564-.89-2.14-.236-.566-.475-.49-.65-.498-.17-.008-.363-.01-.557-.01-.19 0-.508.07-.773.356-.266.29-1.013.99-1.013 2.412 0 1.42 1.037 2.793 1.18 2.986.145.193 2.04 3.115 4.94 4.375.69.3 1.23.48 1.65.613.694.22 1.328.19 1.83.115.558-.08 1.716-.7 1.958-1.378.24-.677.24-1.257.17-1.378-.07-.12-.26-.195-.55-.34z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-1">EMAIL:</span>
            <a href="mailto:alphamobilemizoram@gmail.com" className="text-sm font-semibold hover:underline text-white">
              alphamobilemizoram@gmail.com
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white/30 font-bold uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Alpha Mobile. All Rights Reserved.</p>
          <p>powered by eXfirm</p>
        </div>

      </div>
    </footer>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

function HomeScreen({
  products,
  banners,
  shopInfo,
  onProductSelect,
  onLogoTap,
  cartCount,
  onCartOpen,
  onAddToCart,
  onNavigateShop,
  lang,
  onLanguageChange,
  unreadCount,
  onNotifOpen,
  showShopPhone,
  onShowPhone,
  loading,
  onNavigateTab,
}: {
  products: Product[];
  banners: any[];
  shopInfo: any;
  onProductSelect: (p: Product) => void;
  onLogoTap: () => void;
  cartCount: number;
  onCartOpen: () => void;
  onAddToCart: (p: Product) => void;
  onNavigateShop: (category?: string) => void;
  lang: "en" | "mz";
  onLanguageChange: (l: "en" | "mz") => void;
  unreadCount: number;
  onNotifOpen: () => void;
  showShopPhone: boolean;
  onShowPhone: () => void;
  loading?: boolean;
  onNavigateTab?: (tab: Tab) => void;
}) {
  const [heroIdx, setHeroIdx] = useState(0);

  const activeBanners = banners && banners.length > 0 ? banners : [
    { title: "Alpha Mobile", sub: lang === "mz" ? "Secondhand phone tha ber ber te tlawm takin!" : "Best quality secondhand phones at the best prices!", img: "1592750475338-74b7b21085ab" },
    { title: "Secondhand Phones", sub: lang === "mz" ? "Quality used phones rintlak leh chhe lo ber ber kan kawl e." : "Quality used phones you can trust.", img: "1600294037681-c80b4cb5b434" },
    { title: "Accessories & Chargers", sub: lang === "mz" ? "Phone hmanrua leh charger brand name chi hrang hrang kan kawl." : "Premium quality phone accessories, chargers, and cases.", img: "1609091839311-d5365f9ff1c5" },
  ];

  const activeShopInfo = shopInfo || {
    name: "Alpha Mobile",
    subName: lang === "mz" ? "Secondhand Phone Shop Rintlak" : "Mizoram's Trusted Secondhand Phone Shop",
    description: lang === "mz" 
      ? "Phone Secondhand leh a hmanruate lei tur kan kawl e! Quality secondhand phone leh accessories man tlawm ber mai." 
      : "Your one-stop shop for quality secondhand phones and accessories at the best prices.",
    location: "Mizoram, India",
    phone: "9612217093",
    instagram: "@alpha_mobile_mizoram",
  };

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % activeBanners.length), 4000);
    return () => clearInterval(t);
  }, [activeBanners.length]);

  return (
    <div className="flex-1 overflow-y-auto pb-4 md:pb-6" style={{ scrollbarWidth: "none" }}>
      {/* Header — mobile only (tablet uses sidebar + topbar) */}
      <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-3 gap-3">
        {/* Logo top-left */}
        <button onClick={onLogoTap} className="w-12 h-12 rounded-2xl overflow-hidden bg-black shadow-lg active:scale-90 transition-transform flex-shrink-0 border border-black/10">
          <ImageWithFallback src={shopLogo} alt="Alpha Mobile logo" className="w-full h-full object-contain" />
        </button>
        {/* Shop name */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground font-semibold">{t("welcomeBack", lang)} 👋</p>
          <p className="text-base font-black text-foreground leading-tight">{activeShopInfo.name}</p>
        </div>
        {/* Actions (Language Switcher, Bell & Cart) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button 
            onClick={() => onLanguageChange(lang === "mz" ? "en" : "mz")}
            className="w-11 h-11 rounded-2xl glass-button flex items-center justify-center font-black text-xs hover:scale-95 duration-200 active:scale-90 transition-all"
            title={lang === "mz" ? "Switch to English" : "Tawng Mizo tawngah thlak rawh"}
          >
            {lang === "mz" ? "EN" : "MZ"}
          </button>
          <button onClick={onNotifOpen} className="relative w-11 h-11 rounded-2xl glass-button flex items-center justify-center hover:scale-95 duration-200 active:scale-90 transition-all">
            <Bell size={18} className="text-foreground" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">{unreadCount}</span>}
          </button>
          <button onClick={onCartOpen} className="relative w-11 h-11 rounded-2xl glass-button flex items-center justify-center hover:scale-95 duration-200 active:scale-90 transition-all">
            <ShoppingCart size={18} className="text-foreground" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mb-5 rounded-3xl overflow-hidden relative h-52 border border-white/10 shadow-2xl">
        {activeBanners.map((h: any, i: number) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? "opacity-100" : "opacity-0"}`}>
            <img src={h.img.startsWith("http") ? h.img : `https://images.unsplash.com/photo-${h.img}?w=800&h=450&fit=crop&auto=format`} alt={h.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-950/40 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">{lang === "mz" ? "Thlanchhuahte" : "Featured"}</p>
              <h2 className="text-white text-xl font-black leading-tight">{h.title}</h2>
              <p className="text-blue-100/80 text-xs mt-0.5 mb-3">{h.sub}</p>
              <button onClick={() => onNavigateShop()} className="self-start bg-blue-600 text-white text-xs font-black px-5 py-2 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                {t("shopNow", lang)}
              </button>
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {activeBanners.map((_: any, i: number) => (
            <button key={i} onClick={() => setHeroIdx(i)} className={`rounded-full transition-all ${i === heroIdx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* Quick Categories */}
      <div className="px-4 mb-5">
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
          {[
            { l: "iPhones", e: "📱", cat: "iPhones" },
            { l: "Android", e: "🤖", cat: "Android Phones" },
            { l: "AirPods", e: "🎧", cat: "AirPods" },
            { l: lang === "mz" ? "Headphone" : "Headphones", e: "🎧", cat: "Headphones" },
            { l: lang === "mz" ? "Earphone" : "Earphones", e: "🎧", cat: "Earphones" },
            { l: lang === "mz" ? "Charger" : "Chargers", e: "🔌", cat: "Chargers" },
            { l: "Power Banks", e: "🔋", cat: "Power Banks" },
            { l: lang === "mz" ? "Speaker" : "Speakers", e: "🔊", cat: "Speakers" },
            { l: lang === "mz" ? "Hmanruate" : "Accessories", e: "⚡", cat: "iPhone Accessories" }
          ].map(c => (
            <button key={c.l} onClick={() => onNavigateShop(c.cat)} className="flex-shrink-0 flex flex-col items-center gap-2 glass-card rounded-2xl p-3 w-18 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                {c.e}
              </div>
              <span className="text-[9px] font-bold text-foreground text-center leading-tight">{c.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-base text-foreground">{lang === "mz" ? "Product Thlanchhuahte" : "Featured Products"}</h3>
          <button onClick={() => onNavigateShop()} className="text-xs text-accent font-bold flex items-center gap-0.5">{lang === "mz" ? "A vaiin en" : "See all"} <ChevronRight size={12} /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} onSelect={() => onProductSelect(p)} />
            ))
          )}
        </div>
      </div>

      {/* Powered by eXfirm Sliding Marquee */}
      <div className="overflow-hidden w-full py-4 border-y border-border/40 bg-card/20 mb-5 relative flex items-center">
        <style>{`
          @keyframes marquee-left-to-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee-left-to-right 25s linear infinite;
          }
        `}</style>
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="marquee-track">
          {/* First loop */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`m1-${i}`} className="flex items-center gap-2 mx-8 flex-shrink-0">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">POWERED BY</span>
              <a href="https://instagram.com/exfirm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <div className="w-4 h-4 rounded-[5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-2.5 h-2.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-wide">eXfirm</span>
              </a>
            </div>
          ))}
          {/* Second loop (exact duplicate for infinite scroll) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`m2-${i}`} className="flex items-center gap-2 mx-8 flex-shrink-0">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">POWERED BY</span>
              <a href="https://instagram.com/exfirm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <div className="w-4 h-4 rounded-[5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-2.5 h-2.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-wide">eXfirm</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer lang={lang} onNavigateTab={onNavigateTab} />
    </div>
  );
}

// ─── SHOP SCREEN ──────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  All: "🛍️",
  iPhones: "📱",
  "Android Phones": "🤖",
  AirPods: "🎧",
  Headphones: "🎧",
  Earphones: "🎧",
  Chargers: "🔌",
  "Power Banks": "🔋",
  Speakers: "🔊",
  "iPhone Accessories": "⚡",
};

const getPriceRanges = (lang: "en" | "mz") => [
  { id: "All", label: lang === "mz" ? "A vaiin" : "All Prices", min: 0, max: Infinity },
  { id: "below_7000", label: lang === "mz" ? "$7,000 hnuai lam" : "Below $7,000", min: 0, max: 6999 },
  { id: "7000_10000", label: "$7,000 - $10,000", min: 7000, max: 10000 },
  { id: "10000_15000", label: "$10,000 - $15,000", min: 10000, max: 15000 },
  { id: "15000_20000", label: "$15,000 - $20,000", min: 15000, max: 20000 },
  { id: "20000_25000", label: "$20,000 - $25,000", min: 20000, max: 25000 },
  { id: "above_25000", label: lang === "mz" ? "$25,000 chung lam" : "Above $25,000", min: 25001, max: Infinity },
];

function ShopScreen({
  products,
  onProductSelect,
  initialCategory,
  lang,
  loading,
  searchQuery,
  onSearchQueryChange,
  onNavigateTab
}: {
  products: Product[];
  onProductSelect: (p: Product) => void;
  initialCategory?: string;
  lang: "en" | "mz";
  loading?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (s: string) => void;
  onNavigateTab?: (tab: Tab) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory && initialCategory !== "All" ? initialCategory : null
  );
  const [activePriceRange, setActivePriceRange] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update category when initialCategory changes (e.g. navigating from Home)
  useEffect(() => {
    if (initialCategory) {
      if (initialCategory === "All") {
        setSelectedCategory("All");
      } else {
        setSelectedCategory(initialCategory);
      }
    } else {
      setSelectedCategory(null);
    }
    setActivePriceRange("All");
  }, [initialCategory]);

  // Sync local search with searchQuery prop (e.g. from desktop topbar)
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  const handleBack = () => {
    setSearch("");
    if (onSearchQueryChange) onSearchQueryChange("");
    setSelectedCategory(null);
    setActivePriceRange("All");
  };

  const ranges = getPriceRanges(lang);
  const activeRange = ranges.find(r => r.id === activePriceRange) || ranges[0];
  const getRangeLabel = (id: string) => {
    const r = ranges.find(x => x.id === id);
    return r ? r.label : (lang === "mz" ? "Man bit" : "Price Range");
  };

  const isBrowsingProducts = selectedCategory !== null || search.trim() !== "";

  const filtered = products
    .filter(p => {
      const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()) : true;
      const matchCategory = !selectedCategory || selectedCategory === "All" || p.category === selectedCategory;
      const matchPrice = p.price >= activeRange.min && p.price <= activeRange.max;
      return matchSearch && matchCategory && matchPrice;
    });

  return (
    <div className="flex-1 overflow-y-auto pb-4 md:pb-6" style={{ scrollbarWidth: "none" }}>
      <div className="px-4 pb-3 sticky top-0 z-10 pt-4 md:pt-2 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between mb-3 min-h-[38px]">
          {isBrowsingProducts ? (
            <button 
              onClick={handleBack} 
              className="flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-foreground transition-colors cursor-pointer glass-button px-3.5 py-2 rounded-full shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>{lang === "mz" ? "Category thlanna" : "Back to Categories"}</span>
            </button>
          ) : (
            <h2 className="text-xl font-black text-foreground">{t("shop", lang)}</h2>
          )}
          
          {/* Price Filter Button - only visible when browsing products */}
          {isBrowsingProducts && (
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                  activePriceRange !== "All" 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                    : "glass-button hover:border-white/20"
                }`}
              >
                <Filter size={13} />
                <span>
                  {activePriceRange === "All" 
                    ? (lang === "mz" ? "Man bit" : "Price Range") 
                    : getRangeLabel(activePriceRange)}
                </span>
              </button>
              
              {/* Filter Dropdown */}
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 glass-card rounded-2xl shadow-2xl z-20 py-2 animate-fade-in backdrop-blur-3xl">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-1.5 border-b border-white/5">
                      {lang === "mz" ? "Man bit zat thlanna" : "Price Filter"}
                    </p>
                    <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                      {ranges.map(range => (
                        <button
                          key={range.id}
                          onClick={() => {
                            setActivePriceRange(range.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white/5 flex items-center justify-between cursor-pointer ${
                            activePriceRange === range.id ? "text-blue-400 bg-white/5" : "text-foreground"
                          }`}
                        >
                          <span>{range.label}</span>
                          {activePriceRange === range.id && <Check size={12} className="text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title of the Category or Search Results */}
        {isBrowsingProducts && (
          <h2 className="text-xl font-black text-foreground mb-3 capitalize">
            {selectedCategory ? (
              selectedCategory === "All" ? (lang === "mz" ? "A vaiin" : "All Products") : selectedCategory
            ) : (
              lang === "mz" ? "Zawn hmuhte" : "Search Results"
            )}
          </h2>
        )}

        <div className="mb-3">
          <div className="w-full flex items-center gap-2 glass-input rounded-xl px-3 py-2.5 shadow-sm">
            <Search size={15} className="text-muted-foreground flex-shrink-0" />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder", lang)} 
              value={search} 
              onChange={handleSearchChange} 
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" 
            />
            {search && (
              <button 
                onClick={() => { setSearch(""); if (onSearchQueryChange) onSearchQueryChange(""); }} 
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {!isBrowsingProducts ? (
        /* Category Cards View */
        <div className="px-4 py-2 flex-1 animate-fade-in">
          <div className="mb-5">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-2">
              {lang === "mz" ? "Category Thlanna" : "Categories"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === "mz" ? "I duh ber thlangin han browse teh" : "Select a category to browse products"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => {
              const icon = CATEGORY_ICONS[cat] || "🛍️";
              const count = products.filter(p => cat === "All" ? true : p.category === cat).length;
              const displayLabel = cat === "All" ? (lang === "mz" ? "A vaiin" : "All Products") : cat;
              
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex flex-col justify-between items-start p-5 h-36 glass-card rounded-2xl cursor-pointer transition-all duration-200 text-left relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex items-center justify-between w-full">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {icon}
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <div className="mt-3">
                    <p className="font-black text-[15px] text-foreground tracking-tight group-hover:text-blue-400 transition-colors duration-200 leading-tight">
                      {displayLabel}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mt-1 uppercase tracking-wider">
                      {count} {lang === "mz" ? "thilte" : count === 1 ? "product" : "products"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Products Grid View */
        <>
          <div className="px-4 mb-3">
            <p className="text-xs text-muted-foreground font-medium">
              {loading ? (lang === "mz" ? "Zawn mek..." : "Loading...") : `${filtered.length} ${lang === "mz" ? "thilte" : "products"}`}
            </p>
          </div>

          <div className="product-grid px-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-muted-foreground border border-white/10">
                  <Search size={24} />
                </div>
                <h3 className="font-bold text-base text-foreground mb-1">
                  {lang === "mz" ? "Zawn hmuh a awm lo" : "No results found"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {lang === "mz" 
                    ? `"${search}" nen a inmil thil kan hmu lo e. Thildang tawngin han zawng chhin teh.` 
                    : `We couldn't find any products matching "${search}". Try searching for something else.`}
                </p>
                <button 
                  onClick={() => { setSearch(""); if (onSearchQueryChange) onSearchQueryChange(""); setActivePriceRange("All"); }} 
                  className="mt-4 text-xs font-bold text-blue-400 hover:underline cursor-pointer"
                >
                  {lang === "mz" ? "Reset filter-te" : "Clear filters"}
                </button>
              </div>
            ) : (
              filtered.map(p => (
                <ProductCard key={p.id} product={p} onSelect={() => onProductSelect(p)} />
              ))
            )}
          </div>
        </>
      )}
      <Footer lang={lang} onNavigateTab={onNavigateTab} />
    </div>
  );
}


// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────

function ProductDetail({ product, onBack, onAddToCart, onBuyNow, wishlist, onWishlist, lang }: {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product, qty: number) => void;
  onBuyNow: (p: Product) => void;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  lang: "en" | "mz";
}) {
  const isWished = wishlist.has(product.id);
  const images = product.image ? product.image.split(",").map(img => img.trim()).filter(Boolean) : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format"];
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  return (
    <div className="flex-1 overflow-y-auto pb-28 md:pb-6" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 md:p-6 items-stretch">
        
        {/* Left Side: Image Carousel */}
        <div className="relative w-full aspect-[3/4] md:aspect-square bg-white/5 overflow-hidden md:rounded-3xl group flex-shrink-0 shadow-md border border-white/10">
          <img src={images[activeImgIdx]} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button onClick={onBack} className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const shareData = {
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  };
                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    navigator.share(shareData).catch(err => console.log("Share failed:", err));
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(lang === "mz" ? "Link copy a ni e!" : "Link copied to clipboard!");
                  }
                }}
                className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all"
              >
                <Share2 size={16} />
              </button>
              <button onClick={() => onWishlist(product.id)} className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all">
                <Heart size={16} className={isWished ? "fill-red-500 text-red-500" : "text-white"} />
              </button>
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button 
                onClick={() => setActiveImgIdx(prev => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setActiveImgIdx(prev => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === activeImgIdx ? "bg-white w-4" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Details & Specifications */}
        <div className="px-5 pt-5 pb-10 md:p-2 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground leading-tight mb-2">{product.name}</h1>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black text-blue-400">{fmtPrice(product.price)}</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>
            
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-6 border-t border-white/5 pt-4">
                <h3 className="font-bold text-sm text-foreground mb-3">{lang === "mz" ? "Technical Specs" : "Specifications"}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="text-muted-foreground block text-[9px] uppercase font-black tracking-wider mb-0.5">{k}</span>
                      <span className="font-semibold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop inline Actions */}
          <div className="hidden md:grid grid-cols-2 gap-3 mt-8">
            <button 
              onClick={() => onAddToCart(product, 1)} 
              className="w-full bg-white/5 hover:bg-white/10 text-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 active:scale-[0.98] transition-all"
            >
              <ShoppingCart size={18} /> {lang === "mz" ? "Cart-ah dah rawh" : "Add to Cart"}
            </button>
            <button 
              onClick={() => onBuyNow(product)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Zap size={18} /> {lang === "mz" ? "Lei nghal rawh" : "Buy Now"}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-6 pt-3 bg-background/80 backdrop-blur-md border-t border-white/5 z-20 grid grid-cols-2 gap-3">
        <button 
          onClick={() => onAddToCart(product, 1)} 
          className="w-full bg-white/5 text-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 active:scale-[0.98] transition-all"
        >
          <ShoppingCart size={17} /> {lang === "mz" ? "Cart-ah" : "Add to Cart"}
        </button>
        <button 
          onClick={() => onBuyNow(product)} 
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all"
        >
          <Zap size={17} /> {lang === "mz" ? "Lei nghal" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

// ─── CART SCREEN ──────────────────────────────────────────────────────────────

function CartScreen({ cart, onQtyChange, onRemove, onCheckout, onBack, coupons, lang }: {
  cart: CartItem[];
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onBack: () => void;
  coupons: any[];
  lang: "en" | "mz";
}) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping - discount;

  const applyCoupon = () => {
    const code = coupon.toUpperCase().trim();
    const found = coupons.find((c: any) => c.code?.toUpperCase() === code);
    if (found) {
      const disc = subtotal * (found.discountPercent / 100);
      setDiscount(disc);
      setCouponMsg(lang === "mz" ? `✓ ${found.description || found.discountPercent + '% off'} hman a ni e!` : `✓ ${found.description || found.discountPercent + '% off'} applied!`);
    } else {
      setDiscount(0);
      setCouponMsg(lang === "mz" ? '❌ Coupon code a dik lo' : '❌ Invalid coupon code');
    }
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full relative">
      <div className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button onClick={onBack} className="w-11 h-11 rounded-xl glass-button flex items-center justify-center hover:scale-95 duration-200 active:scale-90 transition-all"><ArrowLeft size={18} /></button>
          <div><h2 className="text-xl font-black">{t("myCart", lang)}</h2><p className="text-xs text-muted-foreground">{cart.reduce((s, i) => s + i.qty, 0)} {lang === "mz" ? "thilte" : "items"}</p></div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-sm"><ShoppingCart size={40} className="text-muted-foreground" /></div>
            <h3 className="text-xl font-black mb-2">{t("emptyCart", lang)}</h3>
            <p className="text-muted-foreground text-sm">{lang === "mz" ? "I cart-ah thil thlangin dah lut rawh." : "Add products to your cart to get started."}</p>
            <button 
              onClick={onBack} 
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-transform"
            >
              {lang === "mz" ? "Dawr tlawh rawh →" : "Browse phones →"}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 px-4 mb-4">
              {cart.map(({ product, qty }) => (
                <div key={product.id} className="glass-card rounded-2xl p-3 shadow-sm flex gap-3">
                  <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-white/5 border border-white/5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0"><p className="text-[10px] text-muted-foreground">{product.brand}</p><p className="font-bold text-sm text-foreground leading-tight line-clamp-2">{product.name}</p></div>
                      <button onClick={() => onRemove(product.id)} className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors"><X size={16} /></button>
                    </div>
                    <p className="font-black text-blue-400 mt-1">{fmtPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
                        <button onClick={() => onQtyChange(product.id, Math.max(1, qty - 1))} className="w-6 h-6 rounded-md glass-button flex items-center justify-center shadow-sm active:scale-90 transition-transform"><Minus size={11} /></button>
                        <span className="font-black text-xs w-4 text-center">{qty}</span>
                        <button onClick={() => onQtyChange(product.id, qty + 1)} className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shadow-sm active:scale-90 transition-transform"><Plus size={11} className="text-white" /></button>
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold">{fmtPrice(product.price * qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-4 mb-4 flex gap-2">
              <div className="flex-1 flex items-center gap-2 glass-input rounded-xl px-3 py-2.5 shadow-sm">
                <Tag size={13} className="text-muted-foreground flex-shrink-0" />
                <input type="text" placeholder={lang === "mz" ? "Coupon code (EXCART10 han chhin rawh)" : "Coupon code (try EXCART10)"} value={coupon} onChange={e => setCoupon(e.target.value)} className="flex-1 text-sm outline-none bg-transparent" />
              </div>
              <button onClick={applyCoupon} className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-md active:scale-95 transition-all">{lang === "mz" ? "Hmanna" : "Apply"}</button>
            </div>
            {couponMsg && <p className={`text-xs font-bold mx-4 mb-3 flex items-center gap-1 ${discount > 0 ? 'text-green-400' : 'text-red-500'}`}>{couponMsg} {discount > 0 && `— ${lang === "mz" ? "I khawlkhawm zat" : "Saved"} ${fmtPrice(discount)}`}</p>}

            <div className="mx-4 mb-4 glass-card rounded-2xl p-4 shadow-sm">
              <h4 className="font-black text-sm mb-3">{t("orderSummary", lang)}</h4>
              {[
                { label: lang === "mz" ? "Subtotal" : "Subtotal", val: fmtPrice(subtotal) },
                { label: lang === "mz" ? "Thawn man" : "Shipping", val: shipping === 0 ? (lang === "mz" ? "A thlawn 🎉" : "Free 🎉") : fmtPrice(shipping) },
                ...(discount > 0 ? [{ label: lang === "mz" ? "Tlawmna" : "Discount", val: `-${fmtPrice(discount)}` }] : []),
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className={`text-sm font-bold ${r.label === "Discount" || r.label === "Tlawmna" ? "text-green-400" : "text-foreground"}`}>{r.val}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-white/5"><span className="font-black text-base">{t("total", lang)}</span><span className="font-black text-base text-blue-400">{fmtPrice(total)}</span></div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="bg-background/80 backdrop-blur-md border-t border-white/5 px-4 pb-6 pt-3 z-20 flex-shrink-0">
          <button onClick={onCheckout} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all">
            {t("proceedCheckout", lang)} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────

function CheckoutScreen({
  cart,
  shopInfo,
  paymentSettings,
  currentUser,
  onBack,
  onSuccess,
  lang
}: {
  cart: CartItem[];
  shopInfo: any;
  paymentSettings?: any;
  currentUser: any;
  onBack: () => void;
  onSuccess: (
    payment: "gpay" | "cod",
    address: string,
    fullName: string,
    phone: string,
    utr?: string,
    screenshot?: string
  ) => void;
  lang: "en" | "mz";
}) {
  const enableUpi = paymentSettings?.enableUpi !== false;
  const enableCod = paymentSettings?.enableCod !== false;
  const shippingFeeValue = paymentSettings?.shippingFee ?? 9.99;

  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState<"gpay" | "cod">(enableUpi ? "gpay" : "cod");
  const [copied, setCopied] = useState(false);
  
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [street, setStreet] = useState(currentUser?.address || "");
  const [city, setCity] = useState("");
  const [stateZip, setStateZip] = useState(currentUser?.pincode || "");

  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(lang === "mz" ? "File hi 2MB aiin a lian tur a ni lo" : "File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const totalAmount = total + (total > 100 ? 0 : shippingFeeValue);
  const steps = lang === "mz" ? ["A thawnna", "Pek dan tur", "Ennawnna"] : ["Address", "Payment", "Review"];

  const upiId = shopInfo?.upiId || "9612217093@paytm";
  const shopName = shopInfo?.name || "Alpha Mobile";
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${totalAmount.toFixed(2)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full relative">
      <div className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-4">
          <button onClick={onBack} className="w-11 h-11 rounded-xl glass-button flex items-center justify-center hover:scale-95 duration-200 active:scale-90 transition-all"><ArrowLeft size={18} /></button>
          <h2 className="font-black text-xl">{t("checkout", lang)}</h2>
        </div>

        <div className="flex items-center px-4 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10 text-muted-foreground"}`}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded transition-colors ${i < step ? "bg-green-500" : "bg-white/5"}`} />}
            </div>
          ))}
        </div>

        <div className="px-4">
          {step === 0 && (
            <div className="space-y-3">
              <h3 className="font-black text-lg mb-4">{t("deliveryAddress", lang)}</h3>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{lang === "mz" ? "Hming Pum" : "Full Name"}</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors shadow-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{lang === "mz" ? "Phone Number" : "Phone"}</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors shadow-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{lang === "mz" ? "Address Kimchang" : "Street Address"}</label>
                <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{lang === "mz" ? "Khua / Veng" : "City"}</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors shadow-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{lang === "mz" ? "Pincode" : "Pincode"}</label>
                  <input type="text" value={stateZip} onChange={e => setStateZip(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors shadow-sm" />
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h3 className="font-black text-lg mb-4">{t("paymentMethod", lang)}</h3>
              <div className="space-y-3">
                {[
                  enableUpi ? { id: "gpay" as const, label: "UPI / Google Pay", icon: "💳", desc: lang === "mz" ? "GPay, PhonePe, QR hmanga pay nghalna" : "Instant payment with GPay, PhonePe, QR" } : null,
                  enableCod ? { id: "cod" as const, label: "Cash On Delivery", icon: "💵", desc: lang === "mz" ? "Thil a thlen huna pawisa pek mai tur" : "Pay when your order arrives" } : null,
                ].filter(Boolean).map(m => m && (
                  <button key={m.id} onClick={() => setPayment(m.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${payment === m.id ? "border-blue-500 bg-white/10" : "border-white/10 bg-white/5"}`}>
                    <span className="text-3xl">{m.icon}</span>
                    <div className="flex-1"><p className="font-black text-sm">{m.label}</p><p className="text-xs text-muted-foreground">{m.desc}</p></div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === m.id ? "border-blue-500 bg-blue-600" : "border-white/20"}`}>
                      {payment === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
                {!enableUpi && !enableCod && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm font-bold">No payment methods available</p>
                    <p className="text-xs mt-1">Please contact the shop</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="font-black text-lg mb-4">{t("reviewOrder", lang)}</h3>
              
              {/* Show UPI Details if selected */}
              {payment === "gpay" && (
                <div className="glass-card rounded-2xl p-4 mb-4 shadow-sm text-center flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2.5">
                    <span className="bg-[#1A73E8] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">GPay</span>
                    <span className="bg-[#5f259f] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">PhonePe</span>
                    <span className="bg-[#00baf2] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">Paytm</span>
                    <span className="text-[10px] font-black text-muted-foreground ml-1">UPI</span>
                  </div>
                  
                  <p className="text-xs font-bold text-muted-foreground mb-3">{t("scanQrCode", lang)}</p>
                  
                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-2xl border border-white/10 shadow-sm inline-block mb-3.5 relative group">
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI Payment QR Code" 
                      className="w-36 h-36 object-contain"
                    />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none">
                      <span className="text-white text-[10px] bg-black/70 px-2 py-1 rounded-full font-bold">GPay QR Code</span>
                    </div>
                  </div>

                  {/* Heads-up Note */}
                  <div className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-left p-3 rounded-xl flex items-start gap-2 mb-3.5">
                    <AlertCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-semibold leading-relaxed">
                      {lang === "mz" 
                        ? "⚠️ Hriattirna: UPI app-ah i pay laiin description/note-ah khan product hming hi chhu rawh." 
                        : "⚠️ Heads up: Enter the product name on upi app description when paying."}
                    </p>
                  </div>

                  <div className="w-full bg-white/5 rounded-xl p-3 mb-4 text-left border border-white/5">
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-0.5">{t("payingTo", lang)}</p>
                    <p className="font-mono text-xs font-black text-foreground flex items-center justify-between">
                      <span>{upiId}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(upiId);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }} 
                        className="text-[9px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded font-sans uppercase font-black transition-colors"
                      >
                        {copied ? (lang === "mz" ? "Copy a ni ta!" : "Copied!") : "Copy"}
                      </button>
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mt-2.5 mb-0.5">{t("amountToPay", lang)}</p>
                    <p className="text-xs font-black text-blue-400">{fmtPrice(totalAmount)}</p>
                  </div>

                  {/* Mobile Pay deep link button */}
                  <a 
                    href={upiUri}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all mb-4 text-center"
                  >
                    {t("openUpiApp", lang)}
                  </a>

                  {/* UTR ID and Screenshot Upload fields */}
                  <div className="w-full text-left space-y-3.5 pt-3.5 border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5">
                      <span>📝</span> Upload Payment Proof
                    </p>
                    
                    <div>
                      <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block mb-1.5">UTR / Transaction ID (12 digits)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 123456789012" 
                        value={utr} 
                        onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30 font-mono shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block mb-1.5">Payment Screenshot</label>
                      {screenshot ? (
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                          <img src={screenshot} alt="Payment Screenshot" className="max-w-full max-h-full object-contain" />
                          <button 
                            type="button" 
                            onClick={() => setScreenshot("")} 
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-28 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-blue-500 transition-all flex flex-col items-center justify-center cursor-pointer gap-1 p-4 text-center">
                          <Download size={22} className="text-muted-foreground/70 mb-1" />
                          <span className="text-[11px] font-bold text-foreground">{lang === "mz" ? "Screenshot thlang rawh" : "Click to upload screenshot"}</span>
                          <span className="text-[9px] text-muted-foreground/40">{lang === "mz" ? "A size 2MB aiin a tlem tur a ni" : "File size must be under 2MB"}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {cart.map(({ product, qty }) => (
                  <div key={product.id} className="flex gap-3 glass-card rounded-xl p-3 shadow-sm">
                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-white/5 border border-white/5" />
                    <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{product.name}</p><p className="text-xs text-muted-foreground">{lang === "mz" ? "Zat:" : "Qty:"} {qty}</p><p className="font-black text-blue-400">{fmtPrice(product.price * qty)}</p></div>
                  </div>
                ))}
              </div>
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{lang === "mz" ? "Pek dan tur" : "Payment"}</span><span className="font-bold">{payment === "gpay" ? "UPI Payment" : (lang === "mz" ? "Cash on Delivery" : "Cash on Delivery")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Address</span><span className="font-bold text-right">{street}, {city}</span></div>
                <div className="flex justify-between font-black pt-1 border-t border-white/5"><span>{t("total", lang)}</span><span className="text-blue-400">{fmtPrice(totalAmount)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-md border-t border-white/5 px-4 pb-6 pt-3 z-20 flex-shrink-0">
        <button 
          onClick={() => {
            if (step < 2) {
              if (step === 0) {
                if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !stateZip.trim()) {
                  alert(lang === "mz" ? "Khawngaihin hming, phone number, address, khua, leh pincode dah vek rawh." : "Please fill in all address details.");
                  return;
                }
              }
              setStep(s => s + 1);
            } else {
              if (payment === "gpay") {
                if (!utr || utr.trim().length < 6) {
                  alert(lang === "mz" ? "Khawngaihin UTR ID dik tak chhut rawh (a tlem berah digit 6)." : "Please enter a valid UTR transaction ID (at least 6 characters).");
                  return;
                }
                if (!screenshot) {
                  alert(lang === "mz" ? "Khawngaihin payment screenshot upload rawh." : "Please upload a payment screenshot.");
                  return;
                }
              }
              onSuccess(payment, `${street}, ${city}, ${stateZip}`, fullName, phone, utr, screenshot);
            }
          }} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          {step === 2 ? <><Check size={18} /> {t("placeOrder", lang)}</> : <>{t("continue", lang)} <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── ORDER SUCCESS ────────────────────────────────────────────────────────────

function OrderSuccess({ onContinue, lang }: { onContinue: () => void; lang: "en" | "mz" }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fade-in">
      <div className="w-28 h-28 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/5">
        <CheckCircle size={54} className="text-green-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-foreground mb-2">{t("orderPlaced", lang)}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        {lang === "mz" ? "I order nemnghet a ni ta e. Order-te tab ah i order i chhui zui thei ang." : "Your order has been confirmed. You can track your order in the Orders tab."}
      </p>
      <div className="glass-card rounded-2xl p-4 w-full mb-6">
        <p className="text-xs text-muted-foreground mb-1 font-semibold">{lang === "mz" ? "Order Dinhmun" : "Order Status"}</p>
        <p className="font-black text-lg text-green-400">{t("pendingConfirmation", lang)}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {lang === "mz" ? "Thlen hun tur chhut lawk: Hna thawh ni 3-5 chhungin" : "Estimated delivery: 3–5 business days"}
        </p>
      </div>
      <button onClick={onContinue} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all">
        {t("continueShopping", lang)}
      </button>
    </div>
  );
}

// ─── ORDERS SCREEN ────────────────────────────────────────────────────────────

function OrdersScreen({
  orders,
  onOrderSelect,
  lang,
  onTabChange
}: {
  orders: Order[];
  onOrderSelect: (o: Order) => void;
  lang: "en" | "mz";
  onTabChange?: (t: Tab) => void;
}) {
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const filtered = orders.filter(o => filter === "all" || o.status === filter);

  return (
    <div className="flex-1 overflow-y-auto pb-4 md:pb-6" style={{ scrollbarWidth: "none" }}>
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-xl font-black text-foreground">{t("myOrders", lang)}</h2>
        <p className="text-muted-foreground text-sm">
          {lang === "mz" ? `Order zawng zawng ${orders.length}` : `${orders.length} total orders`}
        </p>
      </div>
      <div className="flex gap-2 px-4 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {(["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all capitalize ${filter === f ? "bg-blue-600 text-white shadow-md" : "glass-button hover:border-white/20"}`}>
            {f === "all" ? (lang === "mz" ? "Order zawng zawng" : "All Orders") : (lang === "mz" ? (f === "pending" ? "A la chhuak lo" : f === "confirmed" ? "Nemnghet tawh" : f === "processing" ? "Tih mek" : f === "shipped" ? "Thawn chhuah" : f === "delivered" ? "Thleng tawh" : "Sut lehna") : f)}
          </button>
        ))}
      </div>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-sm"><Package size={36} className="text-muted-foreground" /></div>
          <h3 className="font-bold text-base text-foreground mb-1">{lang === "mz" ? "Order i la nei lo" : "No orders yet"}</h3>
          <p className="text-xs text-muted-foreground max-w-xs">{lang === "mz" ? "Alpha Mobile atangin secondhand phone tha tak tak i thlang thei ang." : "You haven't placed any orders yet. Check out our amazing collection of used phones!"}</p>
          {onTabChange && (
            <button 
              onClick={() => onTabChange("shop")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-transform"
            >
              {lang === "mz" ? "Dawr en rawh →" : "Shop now →"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {filtered.map(o => (
            <button key={o.id} onClick={() => onOrderSelect(o)} className="w-full glass-card rounded-2xl p-4 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-left">
              <div className="flex items-start justify-between mb-3">
                <div><p className="font-black text-sm">{o.id}</p><p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p></div>
                <Badge status={o.status} />
              </div>
              <div className="flex gap-2 mb-3">
                {o.items.slice(0, 3).map(({ product }) => <img key={product.id} src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-white/5 border border-white/5" />)}
                {o.items.length > 3 && <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><span className="text-sm font-black text-muted-foreground">+{o.items.length - 3}</span></div>}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)} {lang === "mz" ? "thilte" : "items"} · {o.payment === "gpay" ? "UPI" : (lang === "mz" ? "COD" : "COD")}</p>
                <div className="flex items-center gap-1"><span className="font-black text-blue-400">{fmtPrice(o.total)}</span><ChevronRight size={14} className="text-muted-foreground" /></div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center py-16"><Package size={48} className="text-muted-foreground mx-auto mb-3" /><p className="font-bold text-muted-foreground">{lang === "mz" ? `Order a awm lo` : `No ${filter} orders`}</p></div>}
        </div>
      )}
      <Footer lang={lang} onNavigateTab={onTabChange} />
    </div>
  );
}

// ─── ORDER DETAIL ─────────────────────────────────────────────────────────────

function OrderDetail({ order, onBack, lang }: { order: Order; onBack: () => void; lang: "en" | "mz" }) {
  const steps = [
    { label: lang === "mz" ? "Order Siam A Ni" : "Order Placed", done: true },
    { label: lang === "mz" ? "Tih Mek A Ni" : "Processing", done: ["processing", "shipped", "delivered"].includes(order.status) },
    { label: lang === "mz" ? "Thawn Chhuah A Ni" : "Shipped", done: ["shipped", "delivered"].includes(order.status) },
    { label: lang === "mz" ? "Thleng Tawh A Ni" : "Delivered", done: order.status === "delivered" },
  ];
  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full relative">
      <div className="flex items-center gap-3 px-4 pt-4 pb-4 bg-background/80 backdrop-blur-md z-10 border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="w-11 h-11 rounded-xl glass-button flex items-center justify-center hover:scale-95 duration-200 active:scale-90 transition-all"><ArrowLeft size={18} /></button>
        <h2 className="font-black text-lg">{lang === "mz" ? "Order Kimchang" : "Order Details"}</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: "none" }}>
        <div className="glass-card rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1"><p className="font-black">{order.id}</p><Badge status={order.status} /></div>
          <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>

        {order.status !== "cancelled" && (
          <div className="glass-card rounded-2xl p-4 shadow-sm">
            <h4 className="font-black text-sm mb-4">{lang === "mz" ? "Order Chhuihna" : "Order Tracking"}</h4>
            {steps.map((s, i) => (
              <div key={s.label} className="flex gap-3 mb-4 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-green-500" : "bg-white/5 border border-white/10"}`}>
                    {s.done ? <Check size={14} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                  </div>
                  {i < steps.length - 1 && <div className={`w-0.5 h-8 mt-1 ${s.done ? "bg-green-500" : "bg-white/5"}`} />}
                </div>
                <div className="pt-1.5"><p className={`text-sm font-bold ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>{s.done && <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>}</div>
              </div>
            ))}
            {order.tracking && <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-white/5">{lang === "mz" ? "Chhui zuihna:" : "Tracking:"} <span className="font-mono font-bold text-foreground">{order.tracking}</span></p>}
          </div>
        )}

        <div className="glass-card rounded-2xl p-4 shadow-sm">
          <h4 className="font-black text-sm mb-3">{lang === "mz" ? "Thilte" : "Items"}</h4>
          <div className="space-y-3">
            {order.items.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3">
                <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-white/5 border border-white/5" />
                <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{product.name}</p><p className="text-xs text-muted-foreground">{lang === "mz" ? "Zat:" : "Qty:"} {qty}</p><p className="font-black text-blue-400">{fmtPrice(product.price * qty)}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex gap-3"><MapPin size={16} className="text-blue-400 flex-shrink-0 mt-0.5" /><div><p className="text-xs font-bold text-muted-foreground mb-0.5">{t("deliveryAddress", lang)}</p><p className="text-sm">{order.address}</p></div></div>
          <div className="flex gap-3"><CreditCard size={16} className="text-blue-400 flex-shrink-0 mt-0.5" /><div><p className="text-xs font-bold text-muted-foreground mb-0.5">{lang === "mz" ? "Pek dan tur" : "Payment"}</p><p className="text-sm">{order.payment === "gpay" ? "UPI" : (lang === "mz" ? "COD" : "COD")}</p></div></div>
          <div className="flex justify-between font-black pt-3 border-t border-white/5"><span>{t("total", lang)}</span><span className="text-blue-400">{fmtPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────

function SettingsScreen({
  currentUser,
  darkMode,
  onDarkMode,
  onLogout,
  onOpenLogin,
  lang,
  setLang,
  showShopPhone,
  onShowPhone,
  onNavigateTab
}: {
  currentUser: any;
  darkMode: boolean;
  onDarkMode: (v: boolean) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  lang: "en" | "mz";
  setLang: (l: "en" | "mz") => void;
  showShopPhone: boolean;
  onShowPhone: () => void;
  onNavigateTab?: (tab: Tab) => void;
}) {
  const [notifs, setNotifs] = useState(true);
  
  // Modal states
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isChangePwOpen, setIsChangePwOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const sections = [
    {
      title: t("preferences", lang),
      items: [
        { 
          icon: Bell, 
          label: t("notifications", lang), 
          onClick: () => { setNotifs(!notifs); },
          right: <button onClick={(e) => { e.stopPropagation(); setNotifs(!notifs); }} type="button" className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifs ? "bg-accent" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifs ? "translate-x-6" : "translate-x-0.5"}`} /></button> 
        },
        { 
          icon: Globe, 
          label: t("language", lang), 
          onClick: () => setIsLangOpen(true),
          right: <span className="text-sm text-muted-foreground font-semibold flex items-center gap-0.5">{lang === "mz" ? "Mizo" : "English"} <ChevronRight size={13} /></span> 
        },
      ],
    },
    {
      title: t("account", lang),
      items: [
        { 
          icon: Lock, 
          label: t("changePassword", lang), 
          onClick: () => {
            if (!currentUser) {
              alert(lang === "mz" ? "Password thlak turin khawngaihin account siam la, emaw lut phawt rawh." : "Please register or log in to change your password.");
            } else {
              setIsChangePwOpen(true);
            }
          },
          right: <ChevronRight size={16} className="text-muted-foreground" /> 
        },
        { 
          icon: Shield, 
          label: t("privacySettings", lang), 
          onClick: () => setIsPrivacyOpen(true),
          right: <ChevronRight size={16} className="text-muted-foreground" /> 
        },
        { 
          icon: FileText, 
          label: t("termsConditions", lang), 
          onClick: () => setIsTermsOpen(true),
          right: <ChevronRight size={16} className="text-muted-foreground" /> 
        },
      ],
    },
    {
      title: t("support", lang),
      items: [
        { 
          icon: HelpCircle, 
          label: t("helpCenter", lang), 
          onClick: () => setIsHelpOpen(true),
          right: <ChevronRight size={16} className="text-muted-foreground" /> 
        },
        { 
          icon: MessageCircle, 
          label: t("contactSupport", lang), 
          onClick: () => setIsSupportOpen(true),
          right: <ChevronRight size={16} className="text-muted-foreground" /> 
        },
        { 
          icon: MessageCircle, 
          label: lang === "mz" ? "WhatsApp ah be rawh" : "Chat on WhatsApp", 
          onClick: () => {
            if (showShopPhone) {
              window.open("https://wa.me/919612217093", "_blank");
            } else {
              onShowPhone();
            }
          },
          right: !showShopPhone ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onShowPhone(); }}
              className="text-[11px] bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg font-black active:scale-95 transition-all flex items-center gap-0.5"
            >
              {lang === "mz" ? "Enna" : "Show"}
            </button>
          ) : (
            <span className="text-[11px] text-green-500 font-black flex items-center gap-0.5">9612217093 <ChevronRight size={14} className="text-muted-foreground" /></span>
          )
        },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-4 md:pb-6" style={{ scrollbarWidth: "none" }}>
      {!currentUser ? (
        <div className="mx-4 mt-4 mb-5 glass-card rounded-3xl p-5 flex flex-col items-center text-center shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <Users size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-black text-base text-foreground mb-1">{t("guestSession", lang)}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("guestDesc", lang)}</p>
          <button onClick={onOpenLogin} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md active:scale-95 transition-all">
            {t("loginRegister", lang)}
          </button>
        </div>
      ) : (
        <div className="mx-4 mt-4 mb-5 glass-card bg-gradient-to-tr from-blue-600/20 to-indigo-600/10 rounded-3xl p-5 flex items-center gap-4 shadow-2xl border border-blue-500/20 text-left">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xl">{currentUser.avatar || "JD"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg truncate">{currentUser.name}</p>
            <p className="text-blue-300 text-sm truncate">{currentUser.email}</p>
            <p className="text-blue-300/60 text-xs mt-0.5">{t("memberSince", lang)} {currentUser.joined || "Jun 2026"}</p>
          </div>
          <button onClick={onOpenLogin} className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/20 transition-all"><Pencil size={15} className="text-white" /></button>
        </div>
      )}

      {sections.map(section => (
        <div key={section.title} className="px-4 mb-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">{section.title}</p>
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            {section.items.map((item, i) => (
              <div 
                key={item.label} 
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer ${i < section.items.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0"><item.icon size={15} className="text-foreground" /></div>
                <span className="flex-1 text-sm font-semibold text-left text-foreground">{item.label}</span>
                {item.right}
              </div>
            ))}
          </div>
        </div>
      ))}

      {currentUser && (
        <div className="px-4 mb-3">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 font-black py-4 rounded-2xl border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] transition-all">
            <LogOut size={17} /> {t("logOut", lang)}
          </button>
        </div>
      )}
      <Footer lang={lang} onNavigateTab={onNavigateTab} />

      {/* Language Dialog */}
      {isLangOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card rounded-3xl w-full max-w-xs p-6 shadow-2xl space-y-4 animate-scale-in text-left backdrop-blur-3xl">
            <h3 className="font-black text-lg text-foreground">{lang === "mz" ? "Tawng thlang rawh" : "Select Language"}</h3>
            <div className="space-y-2">
              {[
                { code: "en", name: "English" },
                { code: "mz", name: "Mizo" }
              ].map((item) => (
                <button 
                  key={item.code}
                  onClick={() => { setLang(item.code as "en" | "mz"); setIsLangOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${lang === item.code ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                >
                  <span>{item.name}</span>
                  {lang === item.code && <Check size={14} />}
                </button>
              ))}
            </div>
            <button onClick={() => setIsLangOpen(false)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-black py-2.5 rounded-xl transition-all text-xs">
              {lang === "mz" ? "Sut lehna" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {isChangePwOpen && (
        <ChangePasswordModal 
          currentUser={currentUser} 
          onClose={() => setIsChangePwOpen(false)} 
        />
      )}

      {/* Privacy Settings Dialog */}
      {isPrivacyOpen && (
        <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />
      )}

      {/* Terms & Conditions Dialog */}
      {isTermsOpen && (
        <TermsModal onClose={() => setIsTermsOpen(false)} />
      )}

      {/* Help Center Dialog */}
      {isHelpOpen && (
        <HelpCenterModal onClose={() => setIsHelpOpen(false)} />
      )}

      {/* Contact Support Dialog */}
      {isSupportOpen && (
        <ContactSupportModal currentUser={currentUser} onClose={() => setIsSupportOpen(false)} />
      )}
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────

function AdminLogin({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("admin@gmail.com");
  const [pw, setPw] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (email === "admin@gmail.com" && pw === "admin123") onLogin();
    else setError("Invalid credentials. Try admin@gmail.com / admin123");
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full relative justify-center">
      <button onClick={onBack} className="absolute top-6 left-4 w-11 h-11 rounded-xl glass-button flex items-center justify-center z-10 active:scale-95 transition-all">
        <ArrowLeft size={17} />
      </button>
      <div className="flex flex-col items-center justify-center px-4 py-8">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-2xl">
          <ImageWithFallback src={shopLogo} alt="Alpha Mobile logo" className="w-14 h-14 object-contain" />
        </div>
        <h2 className="text-foreground font-black text-2xl mb-1">Admin Access</h2>
        <p className="text-muted-foreground text-xs mb-8 font-medium">Alpha Mobile · Staff Portal</p>

        <div className="w-full max-w-xs glass-card rounded-3xl p-6 shadow-2xl space-y-4">
          <div>
            <label className="text-muted-foreground text-[10px] font-black mb-1.5 block uppercase tracking-wide">Email</label>
            <div className="flex items-center gap-3 glass-input rounded-xl px-4 py-3">
              <Mail size={15} className="text-muted-foreground flex-shrink-0" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40" />
            </div>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] font-black mb-1.5 block uppercase tracking-wide">Password</label>
            <div className="flex items-center gap-3 glass-input rounded-xl px-4 py-3">
              <Lock size={15} className="text-muted-foreground flex-shrink-0" />
              <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40" />
              <button onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff size={15} className="text-muted-foreground" /> : <Eye size={15} className="text-muted-foreground" />}</button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-blue-500/10 mt-2">
            Login to Dashboard
          </button>
        </div>
        <p className="text-muted-foreground/30 text-[10px] mt-6 text-center">Hint: admin@gmail.com · admin123</p>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboard({
  onLogout,
  products,
  onProductSave,
  onProductDelete,
  orders,
  onOrderStatusUpdate,
  onPaymentStatusUpdate,
  customers,
  banners,
  shopInfo,
  coupons,
  paymentSettings,
  onContentSave,
  unreadNotifCount,
  onNotifOpen
}: {
  onLogout: () => void;
  products: Product[];
  onProductSave: (p: Product) => Promise<void>;
  onProductDelete: (id: string) => Promise<void>;
  orders: Order[];
  onOrderStatusUpdate: (id: string, status: Order["status"], tracking?: string) => Promise<void>;
  onPaymentStatusUpdate: (orderId: string, paymentStatus: Order["paymentStatus"]) => void;
  customers: Customer[];
  banners: any[];
  shopInfo: any;
  coupons: any[];
  paymentSettings: any;
  onContentSave: (key: string, value: any) => Promise<void>;
  unreadNotifCount: number;
  onNotifOpen: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");

  const tabLabels: Record<AdminTab, string> = {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    analytics: "Analytics",
    content: "Content",
    payments: "Payments",
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full relative">
      {/* Admin nav */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg">
            <ImageWithFallback src={shopLogo} alt="Alpha Mobile" className="w-8 h-8 object-contain" />
          </div>
          <div><p className="text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">Admin Panel</p><h2 className="text-foreground font-black text-lg leading-tight">Alpha Mobile</h2></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onNotifOpen} className="relative w-9 h-9 rounded-xl glass-button flex items-center justify-center hover:bg-white/10 transition-all">
            <Bell size={16} className="text-foreground" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">{unreadNotifCount}</span>
            )}
          </button>
          <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center text-red-400"><LogOut size={15} /></button>
        </div>
      </div>

      <div className="flex gap-2 px-5 overflow-x-auto pb-2 mb-1 flex-shrink-0" style={{ scrollbarWidth: "none" }}>
        {(["dashboard", "products", "orders", "customers", "analytics", "content", "payments"] as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-shrink-0 text-xs font-black px-4 py-2 rounded-full transition-all capitalize ${tab === t ? "bg-blue-600 text-white shadow-lg" : "glass-button border border-white/10 hover:bg-white/10"}`}>{tabLabels[t]}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ scrollbarWidth: "none" }}>
        {tab === "dashboard" && <AdminDashboardTab orders={orders} products={products} customers={customers} />}
        {tab === "products" && <AdminProductsTab products={products} onProductSave={onProductSave} onProductDelete={onProductDelete} />}
        {tab === "orders" && <AdminOrdersTab orders={orders} onStatusUpdate={onOrderStatusUpdate} onPaymentStatusUpdate={onPaymentStatusUpdate} />}
        {tab === "customers" && <AdminCustomersTab customers={customers} />}
        {tab === "analytics" && <AdminAnalyticsTab products={products} orders={orders} />}
        {tab === "content" && <AdminContentTab banners={banners} shopInfo={shopInfo} coupons={coupons} onContentSave={onContentSave} />}
        {tab === "payments" && <AdminPaymentsTab paymentSettings={paymentSettings} shopInfo={shopInfo} onContentSave={onContentSave} />}
      </div>
    </div>
  );
}

function AdminDashboardTab({ orders, products, customers }: { orders: Order[]; products: Product[]; customers: Customer[] }) {
  const activeOrders = orders.filter(o => o.status !== "cancelled");
  const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderVal = activeOrders.length > 0 ? (revenue / activeOrders.length).toFixed(0) : "0";

  // Sales group by month (mock + real for chart)
  const baselineSales = [
    { month: "Aug", sales: 42000 }, { month: "Sep", sales: 58000 },
    { month: "Oct", sales: 49000 }, { month: "Nov", sales: 72000 },
    { month: "Dec", sales: 95000 }, { month: "Jan", sales: 81000 },
  ];
  
  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "short" });
  const realCurrentMonthSales = orders
    .filter(o => {
      const date = new Date(o.date);
      const mName = date.toLocaleDateString("en-US", { month: "short" });
      return mName === currentMonthName && o.status !== "cancelled";
    })
    .reduce((sum, o) => sum + o.total, 0);

  const salesData = baselineSales.map(item => {
    if (item.month === currentMonthName) {
      return { ...item, sales: item.sales + realCurrentMonthSales };
    }
    return item;
  });

  const categoriesMap: Record<string, number> = {};
  products.forEach(p => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });
  const totalProds = products.length || 1;
  const categoryData = Object.entries(categoriesMap).map(([name, count]) => ({
    name,
    value: Math.round((count / totalProds) * 100),
  })).slice(0, 5);

  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: "Revenue", value: fmtPrice(revenue), change: "+12.5%", icon: DollarSign },
    { label: "Orders", value: orders.length.toString(), change: "+8.2%", icon: ShoppingBag },
    { label: "Products", value: products.length.toString(), change: "Live DB", icon: Package },
    { label: "Customers", value: customers.length.toString(), change: "+5.1%", icon: Users },
    { label: "Conv. Rate", value: "3.24%", change: "+0.8%", icon: TrendingUp },
    { label: "Avg. Order", value: fmtPrice(Number(avgOrderVal)), change: "+$12", icon: BarChart2 },
  ];

  const weeklyOrdersData = [
    { day: "Mon", orders: orders.filter(o => new Date(o.date).getDay() === 1).length * 4 + 2 },
    { day: "Tue", orders: orders.filter(o => new Date(o.date).getDay() === 2).length * 4 + 5 },
    { day: "Wed", orders: orders.filter(o => new Date(o.date).getDay() === 3).length * 4 + 4 },
    { day: "Thu", orders: orders.filter(o => new Date(o.date).getDay() === 4).length * 4 + 6 },
    { day: "Fri", orders: orders.filter(o => new Date(o.date).getDay() === 5).length * 4 + 8 },
    { day: "Sat", orders: orders.filter(o => new Date(o.date).getDay() === 6).length * 4 + 10 },
    { day: "Sun", orders: orders.filter(o => new Date(o.date).getDay() === 0).length * 4 + 3 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 mt-2">
        {stats.map(s => (
          <div key={s.label} className="glass-card hover:border-white/25 transition-all duration-300 rounded-2xl p-4 shadow-sm border border-white/5">
            <div className="flex justify-between items-start mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><s.icon size={16} className="text-blue-400" /></div>
              <span className="text-[10px] font-black bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full">{s.change}</span>
            </div>
            <p className="text-foreground font-black text-xl leading-none mb-0.5">{s.value}</p>
            <p className="text-muted-foreground text-[11px] font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-foreground font-black text-sm">Monthly Revenue</p>
          <span className="text-blue-400 text-[10px] bg-blue-500/10 px-2.5 py-1 rounded-full font-bold">Last 6 months</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "rgba(10, 20, 45, 0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 12, color: "#fff", fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2.5} fill="url(#rg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card rounded-2xl p-3 shadow-sm">
          <p className="text-foreground font-black text-xs mb-3">Weekly Orders</p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={weeklyOrdersData}>
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(10, 20, 45, 0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 8, fontSize: 11, color: "#fff" }} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <p className="text-white font-black text-xs mb-3">By Category</p>
          <ResponsiveContainer width="100%" height={90}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-black text-sm">Recent Orders</p>
          <span className="text-white/40 text-xs">Live Updates</span>
        </div>
        {recentOrders.map(o => (
          <div key={o.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 text-left">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><ShoppingBag size={13} className="text-blue-300" /></div>
            <div className="flex-1 min-w-0"><p className="text-white text-xs font-bold truncate">{o.id}</p><p className="text-white/40 text-[10px]">{new Date(o.date).toLocaleDateString()}</p></div>
            <div className="text-right"><p className="text-white text-xs font-black">{fmtPrice(o.total)}</p><Badge status={o.status} /></div>
          </div>
        ))}
      </div>
    </>
  );
}

function AdminProductsTab({
  products,
  onProductSave,
  onProductDelete
}: {
  products: Product[];
  onProductSave: (p: Product) => Promise<void>;
  onProductDelete: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add/edit states
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("iPhones");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setBrand(editingProduct.brand);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price.toString());
      setOriginalPrice(editingProduct.originalPrice.toString());
      setStock(editingProduct.stock.toString());
      setDescription(editingProduct.description);
      setImage(editingProduct.image);
      setImageUrls(editingProduct.image ? editingProduct.image.split(",").map(x => x.trim()).filter(Boolean) : [""]);
    } else {
      setName("");
      setBrand("");
      setCategory("iPhones");
      setPrice("");
      setOriginalPrice("");
      setStock("");
      setDescription("");
      setImage("");
      setImageUrls([""]);
    }
  }, [editingProduct, showAdd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !price) return;

    const joinedImages = imageUrls.map(x => x.trim()).filter(Boolean).join(",");

    const p: Product = {
      id: editingProduct ? editingProduct.id : `p-${Date.now()}`,
      name,
      brand,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews: editingProduct ? editingProduct.reviews : 0,
      image: joinedImages || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format",
      stock: Number(stock || 0),
      description: description || `${name} by ${brand}`,
      specs: editingProduct ? editingProduct.specs : { "Brand": brand, "Category": category },
      badge: editingProduct ? editingProduct.badge : "New",
    };

    await onProductSave(p);
    setShowAdd(false);
    setEditingProduct(null);
  };
  return (
    <div className="mt-2 text-left">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-foreground font-black text-base">Products</p><p className="text-muted-foreground text-xs">{products.length} total</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-transform"><Plus size={13} /> Add</button>
      </div>
      <div className="flex items-center gap-2 glass-input rounded-xl px-3 py-2.5 mb-4">
        <Search size={14} className="text-muted-foreground flex-shrink-0" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40" />
      </div>
      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="flex gap-3 glass-card rounded-2xl p-3 items-center border border-white/5">
            <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-white/5 border border-white/10 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-xs font-bold truncate">{p.name}</p>
              <p className="text-muted-foreground text-[10px]">{p.brand} · {p.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-400 font-black text-sm">{fmtPrice(p.price)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${p.stock > 20 ? "bg-green-500/10 border-green-500/20 text-green-400" : p.stock > 5 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>Stock: {p.stock}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => setEditingProduct(p)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><Pencil size={11} className="text-muted-foreground" /></button>
              <button onClick={() => onProductDelete(p.id)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"><Trash2 size={11} className="text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {(showAdd || editingProduct) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 overflow-y-auto pt-10">
          <form onSubmit={handleSubmit} className="w-full max-w-[390px] mx-auto glass-card rounded-t-3xl p-6 border-t border-white/10 shadow-2xl space-y-4 backdrop-blur-3xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-foreground font-black text-lg">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button type="button" onClick={() => { setShowAdd(false); setEditingProduct(null); }} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            
            <div>
              <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Product Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full glass-input rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Brand</label>
                <input required type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full glass-input rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
              </div>
              <div>
                <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-blue-500">
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Price ($)</label>
                <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full glass-input rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Original Price ($)</label>
                <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full glass-input rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Stock Qty</label>
              <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full glass-input rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-blue-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-muted-foreground text-[11px] font-black uppercase tracking-wide">Product Images (3:4 ratio)</label>
                <button 
                  type="button" 
                  onClick={() => setImageUrls(prev => [...prev, ""])}
                  className="text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-wider"
                >
                  + Add Image
                </button>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      type="text" 
                      value={url} 
                      onChange={e => {
                        const next = [...imageUrls];
                        next[index] = e.target.value;
                        setImageUrls(next);
                      }} 
                      placeholder={`Image URL ${index + 1}`} 
                      className="flex-1 glass-input rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" 
                    />
                    {imageUrls.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                        className="px-2 text-red-400 hover:text-red-300 font-black text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-muted-foreground text-[11px] font-black mb-1.5 block uppercase tracking-wide">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full glass-input rounded-xl px-4 py-2 text-foreground text-sm outline-none focus:border-blue-500 placeholder:text-muted-foreground/30 h-16 resize-none" />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl mt-2 active:scale-[0.98] transition-transform shadow-md">
              {editingProduct ? "Save Changes" : "Add Product"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function AdminOrdersTab({
  orders,
  customers,
  onStatusUpdate,
  onPaymentStatusUpdate
}: {
  orders: Order[];
  customers: Customer[];
  onStatusUpdate: (id: string, status: Order["status"], tracking?: string) => Promise<void>;
  onPaymentStatusUpdate: (orderId: string, paymentStatus: Order["paymentStatus"]) => void;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visibleOrders = orders.filter(o => !deletedIds.has(o.id));

  const orderStatusOptions: { value: Order["status"]; label: string }[] = [
    { value: "pending",          label: "Pending"          },
    { value: "confirmed",        label: "Confirmed"        },
    { value: "processing",       label: "Processing"       },
    { value: "shipped",          label: "Shipped"          },
    { value: "out-for-delivery", label: "Out For Delivery" },
    { value: "delivered",        label: "Delivered"        },
    { value: "cancelled",        label: "Cancelled"        },
  ];

  const paymentStatusOptions: { value: NonNullable<Order["paymentStatus"]>; label: string }[] = [
    { value: "pending",  label: "Pending"  },
    { value: "paid",     label: "Paid"     },
    { value: "refunded", label: "Refunded" },
  ];

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const ordStatusStyle = (s: Order["status"]) => {
    if (s === "delivered")        return { bg: "rgba(34,197,94,0.1)",  bd: "rgba(34,197,94,0.2)",  cl: "#86efac" };
    if (s === "cancelled")        return { bg: "rgba(239,68,68,0.1)",  bd: "rgba(239,68,68,0.2)",  cl: "#fca5a5" };
    if (s === "out-for-delivery") return { bg: "rgba(249,115,22,0.1)", bd: "rgba(249,115,22,0.2)", cl: "#fdba74" };
    if (s === "confirmed")        return { bg: "rgba(59,130,246,0.1)", bd: "rgba(59,130,246,0.2)", cl: "#93c5fd" };
    if (s === "shipped")          return { bg: "rgba(139,92,246,0.1)", bd: "rgba(139,92,246,0.2)", cl: "#c4b5fd" };
    return                               { bg: "rgba(99,102,241,0.1)", bd: "rgba(99,102,241,0.2)", cl: "#a5b4fc" };
  };

  const payStatusStyle = (s: string) => {
    if (s === "paid")     return { bg: "rgba(34,197,94,0.1)",  bd: "rgba(34,197,94,0.2)",  cl: "#86efac" };
    if (s === "refunded") return { bg: "rgba(239,68,68,0.1)",  bd: "rgba(239,68,68,0.2)",  cl: "#fca5a5" };
    return                       { bg: "rgba(245,158,11,0.1)", bd: "rgba(245,158,11,0.2)", cl: "#fcd34d" };
  };

  return (
    <div className="mt-2 text-left">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-foreground font-black text-base flex items-center gap-2">
            <span>📋</span> Manage Orders
          </p>
          <p className="text-muted-foreground text-xs mt-0.5">{visibleOrders.length} orders total</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-1.5 text-[11px] font-black px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="space-y-4" key={refreshKey}>
        {visibleOrders.map(o => {
          const curPayStat = o.paymentStatus || "pending";
          const curOrdStat = o.status;
          const oss = ordStatusStyle(curOrdStat);
          const pss = payStatusStyle(curPayStat);

          return (
            <div key={o.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
                <div>
                  <p className="text-blue-400 font-black text-sm">Order #{o.id.split("-").slice(-1)[0] || o.id}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{fmtDate(o.date)}</p>
                </div>
                <button
                  onClick={() => setDeletedIds(prev => new Set([...prev, o.id]))}
                  className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  title="Remove from view"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Customer + Address row */}
                {(() => {
                  const dbCust = o.customer_id ? customers.find(c => c.id === o.customer_id) : null;
                  const displayCustName = o.customerName || dbCust?.name || "Guest User";
                  const displayCustPhone = o.customerPhone || "N/A";
                  const displayCustEmail = dbCust?.email || "Guest Email";
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="glass-card bg-white/[0.01] rounded-xl p-3 border border-white/5 space-y-1">
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Customer</p>
                          <p className="text-foreground font-black text-[11px] leading-tight">{displayCustName}</p>
                          <p className="text-muted-foreground text-[10px]">{displayCustPhone}</p>
                          {dbCust && <p className="text-muted-foreground/60 text-[9px] truncate">{displayCustEmail}</p>}
                        </div>
                        <div className="glass-card bg-white/[0.01] rounded-xl p-3 border border-white/5">
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Address</p>
                          <p className="text-foreground/70 text-[10px] leading-snug line-clamp-3">{o.address || "—"}</p>
                        </div>
                      </div>

                      {o.payment === "UPI Payment" && (o.utr || o.screenshot) && (
                        <div className="glass-card bg-white/[0.02] border border-white/10 rounded-xl p-3 space-y-2">
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Payment Proof (UPI)</p>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground font-semibold">UTR ID (12-digit):</span>
                            <span className="font-mono font-black text-foreground bg-white/5 px-2 py-0.5 rounded tracking-wider">{o.utr || "N/A"}</span>
                          </div>
                          {o.screenshot && (
                            <div>
                              <p className="text-[9px] text-muted-foreground mb-1 font-semibold">Screenshot:</p>
                              <a 
                                href={o.screenshot} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="block relative group overflow-hidden rounded-lg border border-white/10 aspect-[4/3] max-h-36 bg-black/40"
                              >
                                <img src={o.screenshot} alt="Payment Receipt" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-white text-[9px] font-black bg-black/60 px-2 py-1 rounded uppercase tracking-wider">Open Full Image</span>
                                </div>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Items list */}
                <div className="glass-card bg-white/[0.01] rounded-xl p-3 border border-white/5">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2">Items</p>
                  <div className="space-y-1">
                    {o.items.map(({ product, qty }) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <span className="text-foreground/75 text-[11px]">{product.name} × {qty}</span>
                        <span className="text-foreground font-bold text-[11px]">₹{(product.price * qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
                    <span className="text-foreground font-black text-xs">Total</span>
                    <span className="text-blue-400 font-black">₹{o.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment method badge */}
                <span className={`inline-flex items-center text-[10px] font-black px-3 py-1 rounded-full border ${
                  o.payment === "Cash On Delivery"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {o.payment === "Cash On Delivery" ? "💵 COD" : "💳 UPI"}
                </span>

                {/* Dropdowns */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1.5">Payment Status</p>
                    <div className="relative">
                      <select
                        value={curPayStat}
                        onChange={e => onPaymentStatusUpdate(o.id, e.target.value as Order["paymentStatus"])}
                        className="w-full appearance-none rounded-xl px-3 py-2.5 text-xs font-bold border outline-none cursor-pointer"
                        style={{ background: pss.bg, borderColor: pss.bd, color: pss.cl }}
                      >
                        {paymentStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} style={{ background: "#111827", color: "#fff" }}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1.5">Order Status</p>
                    <div className="relative">
                      <select
                        value={curOrdStat}
                        onChange={e => onStatusUpdate(o.id, e.target.value as Order["status"])}
                        className="w-full appearance-none rounded-xl px-3 py-2.5 text-xs font-bold border outline-none cursor-pointer"
                        style={{ background: oss.bg, borderColor: oss.bd, color: oss.cl }}
                      >
                        {orderStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} style={{ background: "#111827", color: "#fff" }}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {visibleOrders.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-muted-foreground font-bold">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCustomersTab({ customers }: { customers: Customer[] }) {
  const handleExport = () => {
    const headers = ["Customer ID", "Name", "Email", "Orders Count", "Total Spent (INR)", "Joined Date"];
    const rows = customers.map(c => [
      c.id, 
      c.name.replace(/,/g, " "), 
      c.email.replace(/,/g, " "), 
      c.orders, 
      c.spent, 
      c.joined
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-2 text-left">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-foreground font-black text-base">Customers</p><p className="text-muted-foreground text-xs">{customers.length} registered</p></div>
        <button onClick={handleExport} className="text-xs font-bold px-3 py-1.5 glass-button rounded-full border border-white/10 hover:bg-white/10 active:scale-95 transition-all">Export</button>
      </div>
      <div className="space-y-3">
        {customers.map(c => (
          <div key={c.id} className="glass-card border border-white/5 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg"><span className="text-white font-black text-sm">{c.avatar}</span></div>
              <div className="flex-1 min-w-0"><p className="text-foreground font-bold text-sm">{c.name}</p><p className="text-muted-foreground text-xs">{c.email}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 glass-card bg-white/[0.01] rounded-xl p-3 border border-white/5">
              <div className="text-center"><p className="text-foreground font-black text-base">{c.orders}</p><p className="text-muted-foreground text-[10px]">Orders</p></div>
              <div className="text-center border-x border-white/10"><p className="text-blue-400 font-black text-base">${c.spent.toLocaleString()}</p><p className="text-muted-foreground text-[10px]">Spent</p></div>
              <div className="text-center"><p className="text-foreground font-black text-sm">{c.joined}</p><p className="text-muted-foreground text-[10px]">Joined</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAnalyticsTab({ products, orders }: { products: Product[]; orders: Order[] }) {
  const activeOrders = orders.filter(o => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  
  // Calculate conversion rates
  const cartAdds = activeOrders.length * 4;
  const sessionsCount = activeOrders.length * 15;
  const conversionRate = sessionsCount > 0 ? ((activeOrders.length / sessionsCount) * 100).toFixed(2) : "0.00";
  const addToCartRate = sessionsCount > 0 ? ((cartAdds / sessionsCount) * 100).toFixed(1) : "0.0";
  const checkoutRate = sessionsCount > 0 ? ((activeOrders.length / sessionsCount) * 100).toFixed(1) : "0.0";

  const metrics = [
    { label: "Daily Active Users", value: (sessionsCount > 0 ? Math.round(sessionsCount / 4) : 0).toString(), change: "+8.2%" }, 
    { label: "Monthly Active Users", value: (sessionsCount > 0 ? Math.round(sessionsCount * 3) : 0).toString(), change: "+12.5%" },
    { label: "Conversion Rate", value: `${conversionRate}%`, change: "+0.8%" }, 
    { label: "Add-to-Cart Rate", value: `${addToCartRate}%`, change: "+2.1%" },
    { label: "Checkout Rate", value: `${checkoutRate}%`, change: "+1.4%" }, 
    { label: "Avg Session", value: "4m 32s", change: "+15s" },
  ];

  // Group by category
  const categoriesMap: Record<string, number> = {};
  products.forEach(p => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });
  const totalProds = products.length || 1;
  const categoryData = Object.entries(categoriesMap).map(([name, count]) => ({
    name,
    value: Math.round((count / totalProds) * 100),
  })).slice(0, 5);

  // Top products from orders
  const productSalesMap: Record<string, { product: Product; qty: number; revenue: number }> = {};
  orders.forEach(o => {
    if (o.status === "cancelled") return;
    o.items.forEach(item => {
      const pid = item.product.id;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = { product: item.product, qty: 0, revenue: 0 };
      }
      productSalesMap[pid].qty += item.qty;
      productSalesMap[pid].revenue += item.product.price * item.qty;
    });
  });

  const sortedTopProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProductsList = sortedTopProducts.length > 0
    ? sortedTopProducts
    : products.slice(0, 5).map((p, i) => ({ product: p, qty: 10 - i, revenue: p.price * (10 - i) }));

  const weeklyRevenueData = [
    { day: "Mon", revenue: orders.filter(o => new Date(o.date).getDay() === 1).length * 800 + 400 },
    { day: "Tue", revenue: orders.filter(o => new Date(o.date).getDay() === 2).length * 800 + 1200 },
    { day: "Wed", revenue: orders.filter(o => new Date(o.date).getDay() === 3).length * 800 + 600 },
    { day: "Thu", revenue: orders.filter(o => new Date(o.date).getDay() === 4).length * 800 + 1500 },
    { day: "Fri", revenue: orders.filter(o => new Date(o.date).getDay() === 5).length * 800 + 2200 },
    { day: "Sat", revenue: orders.filter(o => new Date(o.date).getDay() === 6).length * 800 + 3100 },
    { day: "Sun", revenue: orders.filter(o => new Date(o.date).getDay() === 0).length * 800 + 800 },
  ];

  return (
    <div className="mt-2 text-left">
      <div className="flex items-center justify-between mb-4">
        <p className="text-foreground font-black text-base">Analytics</p>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="text-[10px] font-black px-2.5 py-1.5 glass-button rounded-full border border-white/10 flex items-center gap-1 hover:bg-white/10 active:scale-95 transition-all"><Download size={10} /> PDF</button>
          <button 
            onClick={() => {
              const headers = ["Metric", "Value", "Growth/Change"];
              const rows = metrics.map(m => [m.label, m.value, m.change]);
              const csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `analytics_metrics_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-[10px] font-black px-2.5 py-1.5 glass-button rounded-full border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
          >
            CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {metrics.map(m => (
          <div key={m.label} className="glass-card rounded-2xl p-3 border border-white/5 shadow-sm">
            <p className="text-blue-400 font-black text-lg leading-none mb-0.5">{m.value}</p>
            <p className="text-muted-foreground text-[10px] leading-tight mb-1.5">{m.label}</p>
            <p className="text-green-400 text-[10px] font-black">{m.change}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-4 mb-4 shadow-sm border border-white/5">
        <p className="text-foreground font-black text-sm mb-3">Revenue Trend</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={weeklyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "rgba(10, 20, 45, 0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 8, fontSize: 11, color: "#fff" }} />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-card rounded-2xl p-4 mb-4 shadow-sm border border-white/5">
        <p className="text-foreground font-black text-sm mb-3">Sales by Category</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="40%" height={110}>
            <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value">{categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie></PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-muted-foreground text-[10px] flex-1">{c.name}</span>
                <span className="text-foreground font-black text-[10px]">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-4 shadow-sm border border-white/5">
        <p className="text-foreground font-black text-sm mb-3">Top Products</p>
        {topProductsList.map((item: any, i: number) => (
          <div key={item.product.id} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-muted-foreground text-xs font-black w-4">#{i+1}</span>
            <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover bg-white/5 border border-white/10 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-xs font-bold truncate">{item.product.name}</p>
              <div className="w-full bg-white/5 border border-white/10 rounded-full h-1 mt-1"><div className="h-1 rounded-full bg-blue-500 transition-all" style={{ width: `${100 - i * 15}%` }} /></div>
            </div>
            <span className="text-blue-400 text-xs font-black flex-shrink-0">{fmtPrice(item.revenue || item.product.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminContentTab({
  banners,
  shopInfo,
  coupons,
  onContentSave
}: {
  banners: any[];
  shopInfo: any;
  coupons: any[];
  onContentSave: (key: string, value: any) => Promise<void>;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Shop Info state
  const [shopName, setShopName] = useState(shopInfo?.name || "Alpha Mobile");
  const [shopSub, setShopSub] = useState(shopInfo?.subName || "Mizoram's Trusted Phone Shop");
  const [shopDesc, setShopDesc] = useState(shopInfo?.description || "");
  const [shopPhone, setShopPhone] = useState(shopInfo?.phone || "9612217093");
  const [shopLoc, setShopLoc] = useState(shopInfo?.location || "Mizoram, India");
  const [shopInsta, setShopInsta] = useState(shopInfo?.instagram || "@alpha_mobile_mizoram");
  const [shopUpiId, setShopUpiId] = useState(shopInfo?.upiId || "9612217093@paytm");

  // Banners state
  const [localBanners, setLocalBanners] = useState<any[]>(banners);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerSub, setNewBannerSub] = useState("");
  const [newBannerImg, setNewBannerImg] = useState("");

  // Coupons state
  const [localCoupons, setLocalCoupons] = useState<any[]>(coupons);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPct, setNewCouponPct] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");

  const handleSaveShopInfo = async () => {
    setSaving(true);
    await onContentSave("shop_info", {
      name: shopName,
      subName: shopSub,
      description: shopDesc,
      phone: shopPhone,
      location: shopLoc,
      instagram: shopInsta,
      upiId: shopUpiId,
    });
    setSaving(false);
    setEditingKey(null);
  };

  const handleAddBanner = async () => {
    if (!newBannerTitle) return;
    const updated = [...localBanners, { title: newBannerTitle, sub: newBannerSub, img: newBannerImg || "1592750475338-74b7b21085ab" }];
    setLocalBanners(updated);
    await onContentSave("banners", updated);
    setNewBannerTitle(""); setNewBannerSub(""); setNewBannerImg("");
  };

  const handleRemoveBanner = async (idx: number) => {
    const updated = localBanners.filter((_, i) => i !== idx);
    setLocalBanners(updated);
    await onContentSave("banners", updated);
  };

  const handleAddCoupon = async () => {
    if (!newCouponCode || !newCouponPct) return;
    const updated = [...localCoupons, { code: newCouponCode.toUpperCase(), discountPercent: Number(newCouponPct), description: newCouponDesc || `${newCouponPct}% off entire order` }];
    setLocalCoupons(updated);
    await onContentSave("coupons", updated);
    setNewCouponCode(""); setNewCouponPct(""); setNewCouponDesc("");
  };

  const handleRemoveCoupon = async (idx: number) => {
    const updated = localCoupons.filter((_, i) => i !== idx);
    setLocalCoupons(updated);
    await onContentSave("coupons", updated);
  };

  return (
    <div className="mt-2 text-foreground text-left space-y-3">
      <p className="text-foreground font-black text-base mb-4">Content Management</p>

      {/* Store Settings */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-bold text-sm">Store Settings</p>
            <p className="text-muted-foreground text-xs">Edit shop name, phone, location, UPI ID</p>
          </div>
          <button onClick={() => setEditingKey(editingKey === "shop" ? null : "shop")} className="w-8 h-8 rounded-xl glass-button flex items-center justify-center hover:bg-white/10 transition-colors"><Pencil size={12} className="text-blue-400" /></button>
        </div>
        {editingKey !== "shop" && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p><span className="text-foreground font-bold">{shopName}</span> · {shopSub}</p>
            <p>📍 {shopLoc} · 📞 {shopPhone}</p>
            <p>💳 UPI ID: <span className="text-foreground font-bold">{shopUpiId}</span></p>
          </div>
        )}
        {editingKey === "shop" && (
          <div className="space-y-3 mt-3 pt-3 border-t border-white/5">
            {[{label:"Shop Name",val:shopName,set:setShopName},{label:"Sub Title",val:shopSub,set:setShopSub},{label:"Phone",val:shopPhone,set:setShopPhone},{label:"Location",val:shopLoc,set:setShopLoc},{label:"Instagram",val:shopInsta,set:setShopInsta},{label:"UPI ID (for Payment)",val:shopUpiId,set:setShopUpiId}].map(field => (
              <div key={field.label}>
                <label className="text-[10px] text-muted-foreground block mb-1">{field.label}</label>
                <input type="text" value={field.val} onChange={e => field.set(e.target.value)} className="w-full glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Description</label>
              <textarea value={shopDesc} onChange={e => setShopDesc(e.target.value)} className="w-full glass-input rounded-lg p-2 text-xs text-foreground h-16 resize-none outline-none focus:border-blue-500" />
            </div>
            <button onClick={handleSaveShopInfo} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold disabled:opacity-60">{saving ? "Saving..." : "Save Store Info"}</button>
          </div>
        )}
      </div>

      {/* Banners */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-bold text-sm">Hero Banners</p>
            <p className="text-muted-foreground text-xs">{localBanners.length} slides active</p>
          </div>
          <button onClick={() => setEditingKey(editingKey === "banners" ? null : "banners")} className="w-8 h-8 rounded-xl glass-button flex items-center justify-center hover:bg-white/10"><Plus size={13} className="text-blue-400" /></button>
        </div>
        <div className="space-y-2">
          {localBanners.map((b, i) => (
            <div key={i} className="flex items-center gap-2 glass-card bg-white/[0.01] rounded-xl p-2.5 border border-white/5">
              <img src={b.img?.startsWith('http') ? b.img : `https://images.unsplash.com/photo-${b.img}?w=80&h=45&fit=crop`} alt={b.title} className="w-12 h-8 rounded-lg object-cover flex-shrink-0 bg-white/5 border border-white/10" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{b.title}</p>
                <p className="text-muted-foreground text-[10px] truncate">{b.sub}</p>
              </div>
              <button onClick={() => handleRemoveBanner(i)} className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 hover:bg-red-500/20"><X size={10} className="text-red-400" /></button>
            </div>
          ))}
        </div>
        {editingKey === "banners" && (
          <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wide">Add New Banner</p>
            <input placeholder="Banner title" value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} className="w-full glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
            <input placeholder="Subtitle text" value={newBannerSub} onChange={e => setNewBannerSub(e.target.value)} className="w-full glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
            <input placeholder="Image URL (or Unsplash ID)" value={newBannerImg} onChange={e => setNewBannerImg(e.target.value)} className="w-full glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
            <button onClick={handleAddBanner} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold">Add Banner</button>
          </div>
        )}
      </div>

      {/* Coupons */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-bold text-sm">Discount Coupons</p>
            <p className="text-muted-foreground text-xs">{localCoupons.length} active codes</p>
          </div>
          <button onClick={() => setEditingKey(editingKey === "coupons" ? null : "coupons")} className="w-8 h-8 rounded-xl glass-button flex items-center justify-center hover:bg-white/10"><Plus size={13} className="text-blue-400" /></button>
        </div>
        <div className="space-y-2">
          {localCoupons.map((c, i) => (
            <div key={i} className="flex items-center gap-2 glass-card bg-white/[0.01] rounded-xl p-2.5 border border-white/5">
              <span className="font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-black flex-shrink-0">{c.code}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{c.description || `${c.discountPercent}% Off`}</p>
              </div>
              <button onClick={() => handleRemoveCoupon(i)} className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 hover:bg-red-500/20"><X size={10} className="text-red-400" /></button>
            </div>
          ))}
        </div>
        {editingKey === "coupons" && (
          <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wide">Add New Coupon</p>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Code (e.g. SAVE15)" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} className="glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
              <input type="number" placeholder="Discount %" value={newCouponPct} onChange={e => setNewCouponPct(e.target.value)} className="glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
            </div>
            <input placeholder="Description (optional)" value={newCouponDesc} onChange={e => setNewCouponDesc(e.target.value)} className="w-full glass-input rounded-lg p-2 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30" />
            <button onClick={handleAddCoupon} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold">Add Coupon</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PAYMENTS TAB ───────────────────────────────────────────────────────

function AdminPaymentsTab({
  paymentSettings,
  shopInfo,
  onContentSave
}: {
  paymentSettings: any;
  shopInfo: any;
  onContentSave: (key: string, value: any) => Promise<void>;
}) {
  const [enableUpi, setEnableUpi] = useState<boolean>(paymentSettings?.enableUpi !== false);
  const [enableCod, setEnableCod] = useState<boolean>(paymentSettings?.enableCod !== false);
  const [shippingFee, setShippingFee] = useState<string>(String(paymentSettings?.shippingFee ?? 9.99));
  const [upiId, setUpiId] = useState<string>(shopInfo?.upiId || "9612217093@paytm");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Save payment settings
    await onContentSave("payment_settings", {
      enableUpi,
      enableCod,
      shippingFee: Number(shippingFee) || 0,
    });
    // Save UPI ID back to shop_info
    await onContentSave("shop_info", {
      ...(shopInfo || {}),
      upiId,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopInfo?.name || "Alpha Mobile")}&am=0&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="mt-2 text-foreground text-left space-y-4">
      <p className="text-foreground font-black text-base mb-1 flex items-center gap-2">
        <span>💳</span> Payment Settings
      </p>
      <p className="text-muted-foreground text-xs -mt-3 mb-3">Control payment methods shown to customers at checkout.</p>

      {/* UPI Payment */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💳</span>
            </div>
            <div>
              <p className="font-bold text-sm">UPI / Google Pay</p>
              <p className="text-muted-foreground text-xs">GPay, PhonePe, Paytm QR</p>
            </div>
          </div>
          <button
            onClick={() => setEnableUpi(v => !v)}
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${enableUpi ? "bg-blue-600" : "bg-white/10"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enableUpi ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>

        {enableUpi && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest block mb-1.5">UPI ID (Customers pay to this)</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="e.g. 9612217093@paytm"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground/30 font-mono"
              />
              <p className="text-muted-foreground/30 text-[10px] mt-1.5">This UPI ID is shown to customers during checkout and used to generate the QR code.</p>
            </div>

            {/* Live QR Preview */}
            <div className="flex items-center gap-4 glass-card bg-white/[0.01] rounded-xl p-3 border border-white/5">
              <div className="bg-white p-2 rounded-xl flex-shrink-0">
                <img src={qrUrl} alt="UPI QR Preview" className="w-20 h-20 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1">Live QR Preview</p>
                <p className="text-foreground font-mono text-xs break-all">{upiId}</p>
                <p className="text-muted-foreground/30 text-[10px] mt-1">Updates when you save</p>
              </div>
            </div>

            {/* Supported apps */}
            <div className="flex gap-2">
              {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                <span key={app} className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10">{app}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cash on Delivery */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💵</span>
            </div>
            <div>
              <p className="font-bold text-sm">Cash On Delivery</p>
              <p className="text-muted-foreground text-xs">Pay when order arrives</p>
            </div>
          </div>
          <button
            onClick={() => setEnableCod(v => !v)}
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${enableCod ? "bg-blue-600" : "bg-white/10"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enableCod ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Shipping Fee */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Truck size={18} className="text-indigo-400" />
          </div>
          <div>
            <p className="font-bold text-sm">Shipping Fee</p>
            <p className="text-muted-foreground text-xs">Charged when order total &lt; ₹100</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm font-bold">₹</span>
          <input
            type="number"
            value={shippingFee}
            onChange={e => setShippingFee(e.target.value)}
            className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500"
            min="0"
            step="0.01"
          />
          <span className="text-muted-foreground text-xs font-semibold">per order</span>
        </div>
        <p className="text-muted-foreground/30 text-[10px]">Set to 0 for always-free shipping.</p>
      </div>

      {/* Status preview */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3">What customers will see at checkout</p>
        <div className="space-y-2">
          {enableUpi ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-xl">💳</span>
              <div>
                <p className="text-white font-bold text-xs">UPI / Google Pay</p>
                <p className="text-white/50 text-[10px]">Pay to {upiId}</p>
              </div>
              <span className="ml-auto text-green-400 text-[10px] font-black">✓ Enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 opacity-50">
              <span className="text-xl">💳</span>
              <p className="text-white/40 text-xs">UPI — Hidden from checkout</p>
            </div>
          )}
          {enableCod ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xl">💵</span>
              <div>
                <p className="text-white font-bold text-xs">Cash On Delivery</p>
                <p className="text-white/50 text-[10px]">Pay when order arrives</p>
              </div>
              <span className="ml-auto text-green-400 text-[10px] font-black">✓ Enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 opacity-50">
              <span className="text-xl">💵</span>
              <p className="text-white/40 text-xs">COD — Hidden from checkout</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full font-black py-4 rounded-2xl text-sm transition-all active:scale-[0.98] ${
          saved
            ? "bg-green-500 text-white"
            : "bg-white text-primary hover:bg-blue-50"
        } disabled:opacity-60`}
      >
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Payment Settings"}
      </button>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ active, onTab, cartCount, lang }: { active: Tab; onTab: (t: Tab) => void; cartCount: number; lang: "en" | "mz" }) {
  const tabs = [
    { id: "home" as Tab, label: t("homeTab", lang), Icon: Home },
    { id: "shop" as Tab, label: t("shopTab", lang), Icon: ShoppingBag },
    { id: "orders" as Tab, label: t("ordersTab", lang), Icon: Clock },
    { id: "settings" as Tab, label: t("profileTab", lang), Icon: Settings },
  ];

  return (
    <div className="flex-shrink-0 px-4 pb-5 pt-2 pointer-events-none relative z-30">
      <div
        className="pointer-events-auto flex items-center justify-between rounded-[28px] px-3 py-2.5 shadow-2xl backdrop-blur-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          const isShop = id === "shop";

          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              className="relative flex items-center transition-all duration-300 active:scale-90"
              style={{ flex: isActive ? "0 0 auto" : "1" }}
            >
              {isActive ? (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl animate-fade-in"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                    boxShadow: "0 4px 20px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <Icon size={18} className="text-white flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-white text-xs font-black whitespace-nowrap">{label}</span>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center w-full py-2 rounded-xl hover:bg-white/5 transition-colors">
                  {isShop && cartCount > 0 && (
                    <span className="absolute -top-0.5 right-1/2 -translate-y-0.5 translate-x-3.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center z-10 shadow-md">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                  <Icon size={20} className="text-white/40" strokeWidth={1.8} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)", filter: "blur(8px)" }}
      />
    </div>
  );
}

// ─── TABLET SIDEBAR ───────────────────────────────────────────────────────────

function TabletSidebar({ active, onTab, cartCount, onLogoTap, darkMode, onDarkMode, shopInfo, products, orders, lang, showShopPhone, onShowPhone }: {
  active: Tab; onTab: (t: Tab) => void; cartCount: number;
  onLogoTap: () => void; darkMode: boolean; onDarkMode: (v: boolean) => void;
  shopInfo: any; products: Product[]; orders: Order[]; lang: "en" | "mz";
  showShopPhone: boolean; onShowPhone: () => void;
}) {
  const tabs = [
    { id: "home" as Tab, label: t("homeTab", lang), Icon: Home, desc: lang === "mz" ? "Dashboard" : "Dashboard" },
    { id: "shop" as Tab, label: t("shopTab", lang), Icon: ShoppingBag, desc: lang === "mz" ? "Products enna" : "Browse products" },
    { id: "orders" as Tab, label: t("ordersTab", lang), Icon: Clock, desc: lang === "mz" ? "Order chhuihna" : "Track orders" },
    { id: "settings" as Tab, label: t("profileTab", lang), Icon: Settings, desc: lang === "mz" ? "Siamremna" : "Settings" },
  ];

  return (
    <div
      className="hidden md:flex flex-col w-[220px] flex-shrink-0 h-full relative overflow-hidden backdrop-blur-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.015)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border border-white/[0.02] pointer-events-none" />
      <div className="absolute top-20 -right-10 w-32 h-32 rounded-full border border-white/[0.02] pointer-events-none" />

      <button
        onClick={onLogoTap}
        className="flex flex-col items-center gap-3 px-5 pt-6 pb-5 border-b border-white/[0.06] active:opacity-80 transition-opacity w-full"
      >
        <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shadow-xl border border-white/10 flex-shrink-0">
          <ImageWithFallback src={shopLogo} alt="Alpha Mobile" className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <p className="text-white font-black text-sm leading-tight">Alpha Mobile</p>
          <p className="text-blue-400 text-[10px] font-semibold mt-0.5">Mizoram's #1 Phone Shop</p>
        </div>
      </button>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ id, label, Icon, desc }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left group ${isActive ? "shadow-lg" : "hover:bg-white/5"}`}
              style={isActive ? {
                background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
              } : {}}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                {id === "shop" && cartCount > 0 ? (
                  <div className="relative">
                    <Icon size={18} className={isActive ? "text-white" : "text-white/50"} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">{cartCount > 9 ? "9+" : cartCount}</span>
                  </div>
                ) : (
                  <Icon size={18} className={isActive ? "text-white" : "text-white/50"} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-black leading-tight ${isActive ? "text-white" : "text-white/60"}`}>{label}</p>
                <p className={`text-[10px] font-medium leading-tight ${isActive ? "text-blue-100/70" : "text-white/30"}`}>{desc}</p>
              </div>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-2xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest px-1">Quick Stats</p>
        {[
          { label: "Products", value: products.length },
          { label: "Orders Today", value: orders.filter(o => new Date(o.date).getDate() === new Date().getDate()).length },
          { label: "Active Users", value: "2.8k" },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between px-1">
            <span className="text-white/40 text-[10px]">{s.label}</span>
            <span className="text-blue-300 font-black text-xs">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="px-3 pb-4 space-y-2">

        <div className="flex items-center gap-2 px-4 py-2.5">
          <Phone size={13} className="text-green-400 flex-shrink-0" />
          {!showShopPhone ? (
            <button 
              onClick={() => onShowPhone()} 
              className="text-white/30 text-[10px] underline hover:text-white/60 font-semibold text-left"
            >
              {lang === "mz" ? "Phone enna" : "Show Phone"}
            </button>
          ) : (
            <span className="text-white/30 text-[10px]">{shopInfo?.phone || "9612217093"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<"en" | "mz">(() => {
    const cached = localStorage.getItem("e_commerce_language");
    return (cached === "mz" || cached === "en") ? cached : "en";
  });
  const handleLanguageChange = (lang: "en" | "mz") => {
    setLanguage(lang);
    localStorage.setItem("e_commerce_language", lang);
  };

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const cached = localStorage.getItem("e_commerce_notifications");
    return cached ? JSON.parse(cached) : [];
  });

  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: "admin" | "customer" } | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isAdminNotifDrawerOpen, setIsAdminNotifDrawerOpen] = useState(false);

  const [showFooterAbout, setShowFooterAbout] = useState(false);
  const [showFooterPrivacy, setShowFooterPrivacy] = useState(false);
  const [showFooterTerms, setShowFooterTerms] = useState(false);
  const [showFooterFaq, setShowFooterFaq] = useState(false);

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const type = (e as CustomEvent).detail;
      if (type === "about") setShowFooterAbout(true);
      if (type === "privacy") setShowFooterPrivacy(true);
      if (type === "terms") setShowFooterTerms(true);
      if (type === "faq") setShowFooterFaq(true);
    };
    window.addEventListener("open-footer-modal", handleOpenModal);
    return () => window.removeEventListener("open-footer-modal", handleOpenModal);
  }, []);

  const addNotification = (title: string, message: string, type: "admin" | "customer", orderId: string, customerEmail?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      orderId,
      customerEmail,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem("e_commerce_notifications", JSON.stringify(updated));
      return updated;
    });
    setActiveToast({ id: newNotif.id, title, message, type });
  };

  const [screen, setScreen] = useState<Screen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [logoTaps, setLogoTaps] = useState(0);
  const [showShopPhone, setShowShopPhone] = useState(false);
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [darkMode] = useState(true);
  const setDarkMode = () => {};

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const [shopInitCategory, setShopInitCategory] = useState<string | undefined>(undefined);

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const cached = localStorage.getItem("e_commerce_current_user");
    return cached ? JSON.parse(cached) : null;
  });

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("e_commerce_current_user", JSON.stringify(user));
    setScreen("checkout");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("e_commerce_current_user");
    setActiveTab("home");
    setScreen("home");
  };

  const customerUnreadCount = notifications.filter(
    n => n.type === "customer" && n.customerEmail === currentUser?.email && !n.read
  ).length;

  const adminUnreadCount = notifications.filter(
    n => n.type === "admin" && !n.read
  ).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("e_commerce_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = (type: "admin" | "customer") => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (n.type === type) {
          if (type === "customer" && n.customerEmail !== currentUser?.email) {
            return n;
          }
          return { ...n, read: true };
        }
        return n;
      });
      localStorage.setItem("e_commerce_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = (type: "admin" | "customer") => {
    setNotifications(prev => {
      const updated = prev.filter(n => {
        if (n.type === type) {
          if (type === "customer" && n.customerEmail !== currentUser?.email) {
            return true;
          }
          return false;
        }
        return true;
      });
      localStorage.setItem("e_commerce_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Apply dark class to <html> so CSS variables in theme.css take effect
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Supabase states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>({
    enableUpi: true,
    enableCod: true,
    shippingFee: 9.99,
  });
  const [dbLoading, setDbLoading] = useState(true);

  // Initialize DB and load
  useEffect(() => {
    async function initDb() {
      try {
        setDbLoading(true);
        // Seed if empty
        await supabaseService.seedDatabaseIfEmpty(INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS);
        
        // Fetch
        const [dbProds, dbOrds, dbCusts, dbBanners, dbShopInfo, dbCoupons, dbPaymentSettings] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getOrders(),
          supabaseService.getCustomers(),
          supabaseService.getContentSettings("banners", []),
          supabaseService.getContentSettings("shop_info", null),
          supabaseService.getContentSettings("coupons", []),
          supabaseService.getContentSettings("payment_settings", { enableUpi: true, enableCod: true, shippingFee: 9.99 }),
        ]);
        
        setProducts(dbProds);
        setOrders(dbOrds);
        setCustomers(dbCusts);
        setBanners(dbBanners);
        setShopInfo(dbShopInfo);
        setCoupons(dbCoupons);
        setPaymentSettings(dbPaymentSettings);
      } catch (err) {
        console.error("Failed loading Supabase data, falling back to local mocks", err);
        setProducts(INITIAL_PRODUCTS);
        setOrders(INITIAL_ORDERS);
        setCustomers(INITIAL_CUSTOMERS);
      } finally {
        setDbLoading(false);
      }
    }
    initDb();
  }, []);

  const handleLogoTap = () => {
    const next = logoTaps + 1;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    if (next >= 5) {
      setScreen("admin-login");
      setLogoTaps(0);
    } else {
      setLogoTaps(next);
      logoTimer.current = setTimeout(() => setLogoTaps(0), 2000);
    }
  };

  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      return ex ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i) : [...prev, { product, qty }];
    });
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setScreen(tab);
    if (tab === "shop") {
      setShopInitCategory(undefined);
    }
  };

  // CHECKOUT MUTATION
  const handleCheckoutSuccess = async (
    paymentMethod: "gpay" | "cod",
    addressInfo: string,
    fullName: string,
    phone: string,
    utr?: string,
    screenshot?: string
  ) => {
    const newOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    const checkoutTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const shippingCost = checkoutTotal > 100 ? 0 : 9.99;
    
    const newOrder: Order = {
      id: newOrderId,
      date: new Date().toISOString(),
      status: "pending",
      items: cart,
      total: checkoutTotal + shippingCost,
      address: addressInfo,
      payment: paymentMethod === "gpay" ? "UPI Payment" : "Cash On Delivery",
      customer_id: currentUser?.id || undefined,
      utr,
      screenshot,
      customerName: fullName,
      customerPhone: phone,
    };

    try {
      // 1. Create order in DB
      await supabaseService.createOrder(newOrder);

      // 2. Decrement stock in DB
      for (const item of cart) {
        const newStock = Math.max(0, item.product.stock - item.qty);
        await supabaseService.updateProductStock(item.product.id, newStock);
      }

      // 3. Update customer info in DB and local state
      const customerEmail = currentUser?.email || "john.doe@email.com";
      const customerName = currentUser?.name || "John Doe";
      const existingCust = customers.find(c => c.email === customerEmail);
      if (existingCust) {
        const updatedCust: Customer = {
          ...existingCust,
          orders: existingCust.orders + 1,
          spent: existingCust.spent + newOrder.total,
        };
        await supabaseService.saveCustomer(updatedCust);
        setCustomers(prev => prev.map(c => c.email === customerEmail ? updatedCust : c));
      } else {
        const newCust: Customer = {
          id: currentUser?.id || `c-${Date.now()}`,
          name: customerName,
          email: customerEmail,
          orders: 1,
          spent: newOrder.total,
          joined: currentUser?.joined || new Date().toISOString().substring(0, 7),
          avatar: currentUser?.avatar || customerName.substring(0, 2).toUpperCase(),
        };
        await supabaseService.saveCustomer(newCust);
        setCustomers(prev => [newCust, ...prev]);
      }
    } catch (err) {
      console.error("Error writing checkout transaction to Supabase, running local fallback:", err);
      // Fallback local updates if DB failed
      const customerEmail = currentUser?.email || "john.doe@email.com";
      const customerName = currentUser?.name || "John Doe";
      const existingCust = customers.find(c => c.email === customerEmail);
      if (existingCust) {
        const updatedCust: Customer = {
          ...existingCust,
          orders: existingCust.orders + 1,
          spent: existingCust.spent + newOrder.total,
        };
        setCustomers(prev => prev.map(c => c.email === customerEmail ? updatedCust : c));
      } else {
        const newCust: Customer = {
          id: currentUser?.id || `c-${Date.now()}`,
          name: customerName,
          email: customerEmail,
          orders: 1,
          spent: newOrder.total,
          joined: currentUser?.joined || new Date().toISOString().substring(0, 7),
          avatar: currentUser?.avatar || customerName.substring(0, 2).toUpperCase(),
        };
        setCustomers(prev => [newCust, ...prev]);
      }
    }

    // Local state updates always run to guarantee UI updates
    setOrders(prev => [newOrder, ...prev]);
    setProducts(prev =>
      prev.map(p => {
        const item = cart.find(i => i.product.id === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
      })
    );

    // Dispatch admin notification
    addNotification(
      language === "mz" ? "Order thar a awm e! 📦" : "New Order Received! 📦",
      language === "mz" 
        ? `Order thar ${newOrderId} siam a ni, a vaiin ${fmtPrice(newOrder.total)}` 
        : `New order ${newOrderId} has been placed for ${fmtPrice(newOrder.total)}`,
      "admin",
      newOrderId,
      currentUser?.email || undefined
    );

    setCart([]);
    setScreen("order-success");
  };

  // ADMIN PRODUCTS SAVING
  const handleProductSave = async (p: Product) => {
    try {
      const savedProd = await supabaseService.saveProduct(p);
      setProducts(prev => {
        const idx = prev.findIndex(x => x.id === savedProd.id);
        if (idx >= 0) {
          return prev.map(x => x.id === savedProd.id ? savedProd : x);
        } else {
          return [savedProd, ...prev];
        }
      });
    } catch (err) {
      console.error("Error saving product to Supabase, updating local state only:", err);
      // Update local state directly so the admin form functions offline
      setProducts(prev => {
        const idx = prev.findIndex(x => x.id === p.id);
        if (idx >= 0) {
          return prev.map(x => x.id === p.id ? p : x);
        } else {
          return [p, ...prev];
        }
      });
    }
  };

  // ADMIN PRODUCTS DELETING
  const handleProductDelete = async (id: string) => {
    try {
      await supabaseService.deleteProduct(id);
    } catch (err) {
      console.error("Error deleting product from Supabase, updating local state only:", err);
    }
    // Update local state directly
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  // ADMIN ORDER STATUS UPDATE
  const handleOrderStatusUpdate = async (id: string, status: Order["status"], tracking?: string) => {
    try {
      await supabaseService.updateOrderStatus(id, status, tracking);
    } catch (err) {
      console.error("Error updating order status in Supabase, updating local state only:", err);
    }
    // Update local state directly
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status, tracking: tracking || o.tracking } : o))
    );

    // Get associated customer email to notify
    const order = orders.find(o => o.id === id);
    let targetEmail: string | undefined = undefined;
    if (order && order.customer_id) {
      const cust = customers.find(c => c.id === order.customer_id);
      if (cust) {
        targetEmail = cust.email;
      }
    }

    const getStatusLabel = (s: Order["status"], l: "en" | "mz") => {
      const labels: Record<string, { en: string; mz: string }> = {
        pending:          { en: "Pending Confirmation",   mz: "Nemngheh nghah mek"       },
        confirmed:        { en: "Confirmed",               mz: "Pawm a ni ta"             },
        processing:       { en: "Processing",              mz: "Tih mek a ni"             },
        shipped:          { en: "Shipped",                 mz: "Thawn chhuah a ni ta"     },
        "out-for-delivery": { en: "Out For Delivery",     mz: "A hlawhchhuah mek a ni"   },
        delivered:        { en: "Delivered",               mz: "Thleng tawh a ni"         },
        cancelled:        { en: "Cancelled",               mz: "Sut leh a ni ta"          },
      };
      return labels[s]?.[l] || s;
    };

    const statusLabelEn = getStatusLabel(status, "en");
    const statusLabelMz = getStatusLabel(status, "mz");

    addNotification(
      language === "mz" ? "Order Dinhmun Thlak A Ni 📦" : "Order Status Updated 📦",
      language === "mz" 
        ? `I order ${id} dinhmun chu '${statusLabelMz}' ah thlak a ni e.` 
        : `Your order ${id} status has been updated to '${statusLabelEn}'.`,
      "customer",
      id,
      targetEmail
    );
  };

  // ADMIN CONTENT SETTINGS UPDATING
  const handleContentSave = async (key: string, value: any) => {
    try {
      await supabaseService.saveContentSettings(key, value);
    } catch (err) {
      console.error("Error updating content in Supabase, updating local state only:", err);
    }
    // Update local state directly
    if (key === "shop_info") setShopInfo(value);
    if (key === "banners") setBanners(value);
    if (key === "coupons") setCoupons(value);
    if (key === "payment_settings") setPaymentSettings(value);
  };

  // ADMIN PAYMENT STATUS UPDATE (local only)
  const handlePaymentStatusUpdate = (orderId: string, paymentStatus: Order["paymentStatus"]) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, paymentStatus } : o))
    );
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isAdmin = screen === "admin-login" || screen === "admin";
  const showBottomNav = !isAdmin && screen !== "product" && screen !== "cart" && screen !== "checkout" && screen !== "order-success" && screen !== "order-detail";


  return (
    <>
      <div
        className="h-[100dvh] md:min-h-screen overflow-hidden md:overflow-visible flex items-stretch md:items-center justify-center p-0 md:py-6"
        style={{ background: "var(--background)" }}
      >
        <style>{`
          @media (min-width: 768px) { .page-bg { background: radial-gradient(circle at 50% 50%, #0d1a3a 0%, #060d1f 100%) !important; } }
          @keyframes slideDown {
            0% { transform: translate(-50%, -100%); opacity: 0; }
            100% { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes slideLeft {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }
          @keyframes progressBar {
            0% { width: 100%; }
            100% { width: 0%; }
          }
          .animate-slide-down {
            animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-slide-left {
            animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-progress-bar {
            animation: progressBar 5s linear forwards;
          }
        `}</style>
        
        <div
          className="page-bg relative w-full md:max-w-[1280px] h-full md:h-[85vh] md:min-h-[680px] bg-background flex flex-col md:flex-row overflow-hidden md:rounded-[36px] md:shadow-[0_0_0_1.5px_rgba(255,255,255,0.08),0_40px_100px_rgba(0,0,0,0.7)] animate-fade-in"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {/* Animated Background Orbs */}
          {darkMode && (
            <>
              <div className="bg-orb w-[300px] h-[300px] bg-blue-600/10 top-[10%] left-[-5%]" />
              <div className="bg-orb w-[400px] h-[400px] bg-purple-600/10 bottom-[5%] right-[-10%] animate-[drift_35s_infinite_alternate_ease-in-out_2s]" />
              <div className="bg-orb w-[250px] h-[250px] bg-teal-600/10 top-[50%] left-[20%] animate-[drift_30s_infinite_alternate_ease-in-out_1s]" />
            </>
          )}

          {/* Floating Rising Particles */}
          {darkMode && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="bg-particle w-1 h-1 left-[10%] [animation-delay:0s] [animation-duration:8s]" />
              <div className="bg-particle w-1.5 h-1.5 left-[25%] [animation-delay:2s] [animation-duration:12s]" />
              <div className="bg-particle w-1 h-1 left-[45%] [animation-delay:1.5s] [animation-duration:10s]" />
              <div className="bg-particle w-2 h-2 left-[60%] [animation-delay:4s] [animation-duration:14s]" />
              <div className="bg-particle w-1 h-1 left-[75%] [animation-delay:3s] [animation-duration:9s]" />
              <div className="bg-particle w-1.5 h-1.5 left-[90%] [animation-delay:5.5s] [animation-duration:11s]" />
            </div>
          )}

          {/* Cursor Glow */}
          <div
            className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.07), transparent 80%)`,
              opacity: darkMode ? 1 : 0,
            }}
          />
          {/* ── TABLET SIDEBAR ── */}
          {!isAdmin && (
            <TabletSidebar
              active={activeTab}
              onTab={handleTabChange}
              cartCount={cartCount}
              onLogoTap={handleLogoTap}
              darkMode={darkMode}
              onDarkMode={setDarkMode}
              shopInfo={shopInfo}
              products={products}
              orders={orders}
              lang={language}
              showShopPhone={showShopPhone}
              onShowPhone={() => setShowShopPhone(true)}
            />
          )}

          {/* ── MAIN CONTENT COLUMN ── */}
          <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 bg-background">



            {/* Tablet top bar */}
            {!isAdmin && (
              <div className="hidden md:flex items-center justify-between px-6 pt-5 pb-3 border-b border-border bg-background flex-shrink-0">
                <div className="flex-1 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">{shopInfo?.name || "Alpha Mobile"}</p>
                    <p className="text-base font-black text-foreground capitalize">
                      {activeTab === "settings" ? (language === "mz" ? "Profile & Siamremna" : "Profile & Settings") : t(activeTab === "home" ? "homeTab" : activeTab === "shop" ? "shopTab" : "ordersTab", language)}
                    </p>
                  </div>
                  
                  {/* Search Bar - desktop only */}
                  {activeTab !== "settings" && (
                    <div className="max-w-md w-72 flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border shadow-sm focus-within:border-accent transition-colors ml-4">
                      <Search size={14} className="text-muted-foreground flex-shrink-0" />
                      <input 
                        type="text" 
                        placeholder={t("searchPlaceholder", language)} 
                        value={searchQuery} 
                        onChange={e => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          if (activeTab !== "shop" || screen !== "shop") {
                            setActiveTab("shop");
                            setScreen("shop");
                          }
                        }} 
                        className="flex-1 text-xs outline-none bg-transparent placeholder:text-muted-foreground" 
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")} 
                          className="text-muted-foreground hover:text-foreground text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => setScreen("cart")} className="relative w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <ShoppingCart size={16} className="text-foreground" />
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">{cartCount}</span>}
                  </button>
                  <button onClick={() => setIsNotifDrawerOpen(true)} className="relative w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Bell size={16} className="text-foreground" />
                    {customerUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">{customerUnreadCount}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Screens */}
            <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
              {screen === "home" && (
                <HomeScreen
                  products={products}
                  banners={banners}
                  shopInfo={shopInfo}
                  onProductSelect={p => { setSelectedProduct(p); setScreen("product"); }}
                  onLogoTap={handleLogoTap}
                  cartCount={cartCount}
                  onCartOpen={() => setScreen("cart")}
                  onAddToCart={addToCart}
                  onNavigateShop={(cat) => { setShopInitCategory(cat && cat !== "All" ? cat : undefined); setActiveTab("shop"); setScreen("shop"); }}
                  lang={language}
                  onLanguageChange={handleLanguageChange}
                  unreadCount={customerUnreadCount}
                  onNotifOpen={() => setIsNotifDrawerOpen(true)}
                  showShopPhone={showShopPhone}
                  onShowPhone={() => setShowShopPhone(true)}
                  loading={dbLoading}
                  onNavigateTab={handleTabChange}
                />
              )}
              {screen === "shop" && (
                <ShopScreen 
                  products={products} 
                  onProductSelect={p => { setSelectedProduct(p); setScreen("product"); }} 
                  initialCategory={shopInitCategory} 
                  lang={language} 
                  loading={dbLoading}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onNavigateTab={handleTabChange}
                />
              )}
              {screen === "product" && selectedProduct && (
                <ProductDetail
                  product={selectedProduct}
                  onBack={() => setScreen(activeTab)}
                  onAddToCart={(p, qty) => { addToCart(p, qty); setScreen(activeTab); }}
                  onBuyNow={(p) => {
                    const exists = cart.some(item => item.product.id === p.id);
                    if (!exists) {
                      setCart(prev => [...prev, { product: p, qty: 1 }]);
                    }
                    if (currentUser) {
                      setScreen("checkout");
                    } else {
                      setScreen("customer-auth");
                    }
                  }}
                  wishlist={wishlist}
                  onWishlist={id => setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                  lang={language}
                />
              )}
              {screen === "cart" && <CartScreen cart={cart} onQtyChange={(id, qty) => setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i))} onRemove={id => setCart(prev => prev.filter(i => i.product.id !== id))} onCheckout={() => { if (currentUser) { setScreen("checkout"); } else { setScreen("customer-auth"); } }} onBack={() => setScreen(activeTab)} coupons={coupons} lang={language} />}
              {screen === "checkout" && <CheckoutScreen cart={cart} shopInfo={shopInfo} paymentSettings={paymentSettings} currentUser={currentUser} onBack={() => setScreen("cart")} onSuccess={handleCheckoutSuccess} lang={language} />}
              {screen === "customer-auth" && <CustomerAuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setScreen(cart.length > 0 ? "cart" : "settings")} lang={language} />}
              {screen === "order-success" && <OrderSuccess onContinue={() => { setActiveTab("home"); setScreen("home"); }} lang={language} />}
              {screen === "orders" && (
                <OrdersScreen 
                  orders={orders} 
                  onOrderSelect={o => { setSelectedOrder(o); setScreen("order-detail"); }} 
                  lang={language} 
                  onTabChange={handleTabChange}
                />
              )}
              {screen === "order-detail" && selectedOrder && <OrderDetail order={selectedOrder} onBack={() => setScreen("orders")} lang={language} />}
              {screen === "settings" && <SettingsScreen currentUser={currentUser} darkMode={darkMode} onDarkMode={setDarkMode} onLogout={handleLogout} onOpenLogin={() => setScreen("customer-auth")} lang={language} setLang={handleLanguageChange} showShopPhone={showShopPhone} onShowPhone={() => setShowShopPhone(true)} onNavigateTab={handleTabChange} />}
              {screen === "admin-login" && <AdminLogin onLogin={() => { setAdminLoggedIn(true); setScreen("admin"); }} onBack={() => setScreen("home")} />}
              {screen === "admin" && adminLoggedIn && (
                <AdminDashboard
                  products={products}
                  orders={orders}
                  customers={customers}
                  banners={banners}
                  shopInfo={shopInfo}
                  coupons={coupons}
                  paymentSettings={paymentSettings}
                  onLogout={() => { setAdminLoggedIn(false); setScreen("home"); setActiveTab("home"); }}
                  onProductSave={handleProductSave}
                  onProductDelete={handleProductDelete}
                  onOrderStatusUpdate={handleOrderStatusUpdate}
                  onPaymentStatusUpdate={handlePaymentStatusUpdate}
                  onContentSave={handleContentSave}
                  unreadNotifCount={adminUnreadCount}
                  onNotifOpen={() => setIsAdminNotifDrawerOpen(true)}
                />
              )}
            </div>

            {/* Mobile bottom nav */}
            {showBottomNav && (
              <div className="flex-shrink-0 md:hidden">
                <BottomNav active={activeTab} onTab={handleTabChange} cartCount={cartCount} lang={language} />
              </div>
            )}
          </div>

          {/* Hidden Admin Login Logo Tap Hint */}
          {logoTaps > 0 && logoTaps < 5 && (
            <div className="absolute top-16 right-4 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-50 animate-pulse">
              🔒 {5 - logoTaps} more taps for staff login
            </div>
          )}

          {/* Toast Notification */}
          {activeToast && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[360px] bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 flex gap-3.5 animate-slide-down pointer-events-auto cursor-pointer"
              onClick={() => {
                if (activeToast.type === "admin") {
                  setIsAdminNotifDrawerOpen(true);
                } else {
                  setIsNotifDrawerOpen(true);
                }
                setActiveToast(null);
              }}
            >
              {/* Progress bar line at the bottom */}
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-2xl animate-progress-bar" style={{ width: "100%" }} />
              
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground leading-tight">{activeToast.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{activeToast.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToast(null);
                }}
                className="text-muted-foreground hover:text-foreground self-start p-0.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Customer Notifications Drawer */}
          {isNotifDrawerOpen && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[999] flex justify-end">
              <div className="absolute inset-0" onClick={() => setIsNotifDrawerOpen(false)} />
              
              <div className="relative w-full max-w-[340px] h-full bg-background border-l border-border flex flex-col animate-slide-left shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    <span className="font-black text-sm text-foreground">
                      {language === "mz" ? "Hriattirnate" : "Notifications"}
                    </span>
                    {customerUnreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {customerUnreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsNotifDrawerOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
                  {notifications.filter(n => n.type === "customer" && n.customerEmail === currentUser?.email).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground/50">
                        <BellOff size={22} />
                      </div>
                      <p className="text-xs font-bold">{language === "mz" ? "Hriattirna thar a awm lo" : "No notifications yet"}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {language === "mz" ? "I order chanchin update kan neih hunah helai hian a lo lang thin ang." : "Your order status updates will appear here."}
                      </p>
                    </div>
                  ) : (
                    notifications
                      .filter(n => n.type === "customer" && n.customerEmail === currentUser?.email)
                      .map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            const ord = orders.find(o => o.id === n.orderId);
                            if (ord) {
                              setSelectedOrder(ord);
                              setScreen("order-detail");
                            } else {
                              setScreen("orders");
                              setActiveTab("orders");
                            }
                            setIsNotifDrawerOpen(false);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex gap-3 ${
                            n.read
                              ? "bg-card/50 border-border/50 opacity-75 hover:opacity-100"
                              : "bg-card border-blue-500/20 shadow-md hover:shadow-lg"
                          }`}
                        >
                          {!n.read && (
                            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                          )}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            n.read ? "bg-muted text-muted-foreground" : "bg-blue-500/10 text-blue-500"
                          }`}>
                            <ShoppingBag size={16} />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-black text-foreground leading-tight">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground/90 mt-1 leading-snug">{n.message}</p>
                            <span className="text-[9px] text-muted-foreground/50 mt-1.5 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {notifications.filter(n => n.type === "customer" && n.customerEmail === currentUser?.email).length > 0 && (
                  <div className="p-3 border-t border-border bg-card flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => markAllAsRead("customer")}
                      className="flex-1 text-[10px] font-black py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all"
                    >
                      {language === "mz" ? "Chhiar vek anga chhinchhiah" : "Mark all as read"}
                    </button>
                    <button
                      onClick={() => clearNotifications("customer")}
                      className="text-[10px] font-black py-2.5 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all"
                    >
                      {language === "mz" ? "Nuaibo vek" : "Clear all"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notifications Drawer */}
          {isAdminNotifDrawerOpen && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[999] flex justify-end">
              <div className="absolute inset-0" onClick={() => setIsAdminNotifDrawerOpen(false)} />
              
              <div className="relative w-full max-w-[340px] h-full bg-[#060E1D] text-white border-l border-white/10 flex flex-col animate-slide-left shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-blue-400" />
                    <span className="font-black text-sm text-white">
                      {language === "mz" ? "Admin Hriattirnate" : "Admin Notifications"}
                    </span>
                    {adminUnreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                        {adminUnreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsAdminNotifDrawerOpen(false)}
                    className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
                  {notifications.filter(n => n.type === "admin").length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-white/20">
                        <BellOff size={22} />
                      </div>
                      <p className="text-xs font-bold">{language === "mz" ? "Hriattirna thar a awm lo" : "No notifications yet"}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {language === "mz" ? "Client-te'n order an siam hunah helai hian a lo lang ang." : "New orders placed by clients will show up here."}
                      </p>
                    </div>
                  ) : (
                    notifications
                      .filter(n => n.type === "admin")
                      .map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            const ord = orders.find(o => o.id === n.orderId);
                            if (ord) {
                              setSelectedOrder(ord);
                            }
                            setIsAdminNotifDrawerOpen(false);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex gap-3 ${
                            n.read
                              ? "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                              : "bg-white/10 border-blue-500/30 shadow-md"
                          }`}
                        >
                          {!n.read && (
                            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                          )}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            n.read ? "bg-white/5 text-white/40" : "bg-blue-500/20 text-blue-400"
                          }`}>
                            <ShoppingCart size={16} />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-black text-white leading-tight">{n.title}</p>
                            <p className="text-[11px] text-white/70 mt-1 leading-snug">{n.message}</p>
                            {n.customerEmail && (
                              <p className="text-[9px] text-blue-400 mt-1 font-mono">{n.customerEmail}</p>
                            )}
                            <span className="text-[9px] text-white/30 mt-1.5 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {notifications.filter(n => n.type === "admin").length > 0 && (
                  <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => markAllAsRead("admin")}
                      className="flex-1 text-[10px] font-black py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                      {language === "mz" ? "Chhiar vek anga chhinchhiah" : "Mark all as read"}
                    </button>
                    <button
                      onClick={() => clearNotifications("admin")}
                      className="text-[10px] font-black py-2.5 px-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      {language === "mz" ? "Nuaibo vek" : "Clear all"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Global Support Modals */}
          {showFooterAbout && <AboutUsModal onClose={() => setShowFooterAbout(false)} />}
          {showFooterPrivacy && <PrivacyPolicyModal onClose={() => setShowFooterPrivacy(false)} />}
          {showFooterTerms && <TermsModal onClose={() => setShowFooterTerms(false)} />}
          {showFooterFaq && <HelpCenterModal onClose={() => setShowFooterFaq(false)} />}
        </div>
      </div>
    </>
  );
}

// ─── CUSTOMER AUTH SCREEN ──────────────────────────────────────────────────────

function CustomerAuthScreen({
  onAuthSuccess,
  onBack,
  lang
}: {
  onAuthSuccess: (user: any) => void;
  onBack: () => void;
  lang: "en" | "mz";
}) {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = () => {
    setError("");

    // Validate email
    if (!email.trim() || !email.toLowerCase().endsWith("@gmail.com")) {
      setError(lang === "mz" ? "Gmail address @gmail.com a ni tur a ni." : "Gmail address ending with @gmail.com is required.");
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError(lang === "mz" ? "Password chu character 4 aia tlem lo a ni tur a ni." : "Password must be at least 4 characters.");
      return;
    }

    if (isRegister) {
      if (!name.trim()) { setError(lang === "mz" ? "Hming ziak a ngai e." : "Name is required."); return; }
      if (!phone.trim()) { setError(lang === "mz" ? "Phone number ziak a ngai e." : "Phone number is required."); return; }
      if (!pincode.trim()) { setError(lang === "mz" ? "Pincode ziak a ngai e." : "Pincode is required."); return; }
      if (!address.trim()) { setError(lang === "mz" ? "Address ziak a ngai e." : "Address is required."); return; }
      if (!acceptedTerms) {
        setError(lang === "mz" ? "Terms leh Privacy Policy i pawm hmasak a ngai e." : "You must accept the Terms of Service and Privacy Policy to continue.");
        return;
      }

      // Register new user locally
      const newUser = {
        id: `c-${Date.now()}`,
        name,
        email: email.toLowerCase().trim(),
        password,
        phone,
        pincode,
        address,
        orders: 0,
        spent: 0,
        joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        avatar: name.substring(0, 2).toUpperCase(),
      };

      // Add to registered users list in localStorage
      const users = JSON.parse(localStorage.getItem("e_commerce_users") || "[]");
      if (users.find((u: any) => u.email === newUser.email)) {
        setError(lang === "mz" ? "He email hmang hian account a awm tawh." : "User with this email already exists.");
        return;
      }
      users.push(newUser);
      localStorage.setItem("e_commerce_users", JSON.stringify(users));
      onAuthSuccess(newUser);
    } else {
      // Login
      const users = JSON.parse(localStorage.getItem("e_commerce_users") || "[]");
      const user = users.find((u: any) => u.email === email.toLowerCase().trim() && u.password === password);
      if (!user) {
        setError(lang === "mz" ? "Email emaw password a dik lo." : "Invalid email or password.");
        return;
      }
      onAuthSuccess(user);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center gap-3 pb-6 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center"><ArrowLeft size={17} /></button>
        <h2 className="font-black text-xl">{isRegister ? (lang === "mz" ? "Account Siamna" : "Create Account") : (lang === "mz" ? "Luhna" : "Log In")}</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pb-8">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4 animate-scale-in">
          <div className="text-center mb-2">
            <h3 className="font-black text-lg text-foreground">
              {isRegister ? (lang === "mz" ? "Alpha Mobile Zawm Rawh" : "Join Alpha Mobile") : (lang === "mz" ? "Chibai le" : "Welcome Back")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRegister ? (lang === "mz" ? "Order siam zo turin account siam rawh" : "Create an account to complete your order") : (lang === "mz" ? "Check out vat turin lut rawh" : "Log in to check out quickly")}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-500 text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 block">{lang === "mz" ? "Hming Pum" : "Full Name"}</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors shadow-sm" />
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 block">Gmail Address</label>
            <input type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors shadow-sm" />
          </div>

          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
            <input type="password" placeholder="••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors shadow-sm" />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 block">{lang === "mz" ? "Phone Number" : "Phone Number"}</label>
                <input type="tel" placeholder="9612217093" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors shadow-sm" />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 block">{lang === "mz" ? "Address" : "Address"}</label>
                <input type="text" placeholder="Bazar Bungkawn, Aizawl" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors shadow-sm" />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 block">{lang === "mz" ? "Pincode" : "Pincode"}</label>
                <input type="text" placeholder="796001" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors shadow-sm" />
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input 
                  type="checkbox" 
                  id="acceptTerms" 
                  checked={acceptedTerms} 
                  onChange={e => setAcceptedTerms(e.target.checked)} 
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-accent"
                />
                <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-tight select-none">
                  {lang === "mz" ? (
                    <>
                      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "terms" }))} className="text-primary font-bold hover:underline">Terms of Service</button>
                      {" leh "}
                      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "privacy" }))} className="text-primary font-bold hover:underline">Privacy Policy</button>
                      {" te hi ka pawm e."}
                    </>
                  ) : (
                    <>
                      I accept the {" "}
                      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "terms" }))} className="text-primary font-bold hover:underline">Terms of Service</button>
                      {" and "}
                      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: "privacy" }))} className="text-primary font-bold hover:underline">Privacy Policy</button>
                      {"."}
                    </>
                  )}
                </label>
              </div>
            </>
          )}

          <button onClick={handleAuth} className="w-full bg-primary text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all mt-2">
            {isRegister ? (lang === "mz" ? "Siam la, kal zel rawh" : "Register & Continue") : (lang === "mz" ? "Lut la, kal zel rawh" : "Log In & Continue")}
          </button>

          <div className="text-center pt-2">
            <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="text-xs text-primary font-bold hover:underline">
              {isRegister ? (lang === "mz" ? "Account i nei tawh em? Lut rawh" : "Already have an account? Log In") : (lang === "mz" ? "Alpha Mobile-ah i thar em? Account siam rawh" : "New to Alpha Mobile? Register")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS MODALS ──────────────────────────────────────────────────────────

function ChangePasswordModal({ currentUser, onClose }: { currentUser: any; onClose: () => void }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = () => {
    setError("");
    setSuccess("");
    if (currentPw !== currentUser.password) {
      setError("Current password is incorrect.");
      return;
    }
    if (newPw.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }

    // Update locally stored user password
    const users = JSON.parse(localStorage.getItem("e_commerce_users") || "[]");
    const updated = users.map((u: any) => u.email === currentUser.email ? { ...u, password: newPw } : u);
    localStorage.setItem("e_commerce_users", JSON.stringify(updated));

    // Update session
    const updatedSession = { ...currentUser, password: newPw };
    localStorage.setItem("e_commerce_current_user", JSON.stringify(updatedSession));
    
    setSuccess("Password updated successfully!");
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground">Change Password</h3>
        {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded-lg">{error}</p>}
        {success && <p className="text-xs text-green-600 font-bold bg-green-500/10 p-2 rounded-lg">{success}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs outline-none focus:border-accent" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 bg-secondary text-foreground text-xs font-black py-2.5 rounded-xl border border-border">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md">Update</button>
        </div>
      </div>
    </div>
  );
}

function PrivacyModal({ onClose }: { onClose: () => void }) {
  const [ads, setAds] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [visibility, setVisibility] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground">Privacy Settings</h3>
        <p className="text-xs text-muted-foreground">Manage your privacy preferences and data sharing.</p>
        <div className="space-y-4">
          {[
            { label: "Personalized Ads", desc: "Allow tailor-made offers & recommendations", val: ads, set: setAds },
            { label: "Share Analytics", desc: "Help us improve by sharing usage data", val: analytics, set: setAnalytics },
            { label: "Profile Visibility", desc: "Make your reviews visible to others", val: visibility, set: setVisibility }
          ].map(opt => (
            <div key={opt.label} className="flex items-center justify-between gap-4 p-1">
              <div className="flex-1">
                <p className="font-bold text-xs text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </div>
              <button onClick={() => opt.set(!opt.val)} className={`w-11 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${opt.val ? "bg-accent" : "bg-slate-300"}`}>
                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${opt.val ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md mt-2">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground">Terms & Conditions</h3>
        <div className="max-h-60 overflow-y-auto text-xs text-muted-foreground leading-relaxed pr-2 space-y-3" style={{ scrollbarWidth: "thin" }}>
          <p className="font-bold text-foreground">1. Introduction</p>
          <p>Welcome to Alpha Mobile. By purchasing electronics or services from us, you agree to comply with our Terms of Service.</p>
          <p className="font-bold text-foreground">2. Warranty Policy</p>
          <p>All brand new phones carry a 1-year official brand warranty. Secondhand phones carry a 1-month shop warranty covering screen, motherboard and battery, excluding physical or water damage.</p>
          <p className="font-bold text-foreground">3. Payments & Orders</p>
          <p>Payments must be completed via UPI (Google Pay, PhonePe, Paytm) or Cash on Delivery. Order placement does not guarantee product availability, orders may be canceled due to stock limitations.</p>
          <p className="font-bold text-foreground">4. Refund & Returns</p>
          <p>No refund is offered unless the product is defective upon receipt. Returns are only accepted within 7 days in original, unopened packaging.</p>
        </div>
        <button onClick={onClose} className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md">
          I Accept
        </button>
      </div>
    </div>
  );
}

function HelpCenterModal({ onClose }: { onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I track my order?", a: "Navigate to the 'Orders' tab at the bottom to check the live status of all your pending and completed orders." },
    { q: "What is the delivery time?", a: "Standard delivery across Mizoram takes 3 to 5 business days depending on your township or pincode." },
    { q: "Can I pay using Google Pay?", a: "Yes, select 'UPI / Google Pay' payment option. Scan the QR code with GPay/PhonePe or click 'Open UPI App' to pay directly." },
    { q: "How do secondhand phone warranties work?", a: "We provide a 1-month shop warranty covering software bugs, hardware defects, and battery issues on pre-owned devices." }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground text-left">Help & FAQs</h3>
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-border bg-secondary/35 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : idx)} 
                  className="w-full flex items-center justify-between p-3.5 text-xs font-black text-foreground hover:bg-secondary/50 text-left transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight size={13} className={`transform transition-transform ${isOpen ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 border-t border-border/20 text-xs text-muted-foreground leading-relaxed bg-card animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md">
          Close Help
        </button>
      </div>
    </div>
  );
}

function ContactSupportModal({ currentUser, onClose }: { currentUser: any; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !msg.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground">Contact Support</h3>
        
        {success ? (
          <div className="text-center py-4 space-y-3 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-500 font-bold text-xl">✓</div>
            <h4 className="font-black text-sm text-foreground">Message Sent!</h4>
            <p className="text-xs text-muted-foreground px-2">Support ticket created. We will reach back to {currentUser?.email || "your email"} within 24 hours.</p>
            <button onClick={onClose} className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md pt-2 mt-2">Close</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Send a support ticket to the Alpha Mobile staff team.</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Subject</label>
                <input type="text" placeholder="Query / Order issue..." value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Message</label>
                <textarea placeholder="Please describe your problem in detail..." value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs h-24 resize-none outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 bg-secondary text-foreground text-xs font-black py-2.5 rounded-xl border border-border">Cancel</button>
              <button onClick={handleSend} className="flex-1 bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md">Send Message</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AboutUsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground">About Us</h3>
        <div className="max-h-60 overflow-y-auto text-xs text-muted-foreground leading-relaxed pr-2 space-y-3" style={{ scrollbarWidth: "thin" }}>
          <p className="font-bold text-foreground">Welcome to Alpha Mobile!</p>
          <p>Located in Bazar Bungkawn, Aizawl, Mizoram, Alpha Mobile is your premier destination for high-quality secondhand and brand new mobile phones, premium chargers, and authentic accessories.</p>
          <p>We pride ourselves on offering reliable, thoroughly tested pre-owned smartphones at competitive prices, backed by our local shop warranty and dedicated customer service.</p>
          <p>Whether you're looking to upgrade to the latest model, purchase premium accessories, or require professional mobile repairs, Alpha Mobile has you covered. Visit us or browse our store online to experience the best deals today!</p>
        </div>
        <button onClick={onClose} className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md">
          Close
        </button>
      </div>
    </div>
  );
}

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
        <h3 className="font-black text-lg text-foreground">Privacy Policy</h3>
        <div className="max-h-60 overflow-y-auto text-xs text-muted-foreground leading-relaxed pr-2 space-y-3" style={{ scrollbarWidth: "thin" }}>
          <p className="font-bold text-foreground">Last Updated: June 25, 2026</p>
          <p>Alpha Mobile values your privacy. This Privacy Policy details how we collect, use, and protect your information when you purchase from our store or use our online application.</p>
          <p className="font-bold text-foreground">1. Information We Collect</p>
          <p>We collect personal information that you provide to us, including your full name, Gmail address, contact number, delivery address, and pincode when you create an account or place an order.</p>
          <p className="font-bold text-foreground">2. How We Use Your Information</p>
          <p>Your details are used solely to process your orders, contact you for delivery coordinates, manage your account, and provide updates regarding your order status via notifications.</p>
          <p className="font-bold text-foreground">3. Information Sharing</p>
          <p>We do not sell, lease, or share your personal information with third parties. Your data is kept strictly secure on our databases and only accessed by authorized Alpha Mobile administrators for processing order fulfillments.</p>
          <p className="font-bold text-foreground">4. Security of Data</p>
          <p>We implement standard, modern security measures to safeguard your credentials and personal info. You are responsible for keeping your login password confidential.</p>
        </div>
        <button onClick={onClose} className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl shadow-md">
          Close
        </button>
      </div>
    </div>
  );
}
