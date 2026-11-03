import { supabase } from "../lib/supabase";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  description: string;
  specs: Record<string, string>;
  badge?: "New" | "Hot" | "Sale" | "Limited" | null;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "paid" | "refunded";
  items: CartItem[];
  total: number;
  address: string;
  payment: string;
  tracking?: string;
  customer_id?: string;
  utr?: string;
  /** Storage path inside the private `payment-proofs` bucket (new orders). */
  screenshotPath?: string;
  /** Old orders kept a base64 screenshot inside the `payment` JSON. */
  hasLegacyScreenshot?: boolean;
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  couponCode?: string;
  shipping?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  avatar: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  pincode: string;
  address: string;
  avatar: string;
  joined: string;
}

export interface PlaceOrderInput {
  items: { product_id: string; qty: number }[];
  payment: "UPI Payment" | "Cash On Delivery";
  address: string;
  customerName: string;
  customerPhone: string;
  utr?: string;
  screenshotPath?: string;
  couponCode?: string;
}

// Columns for order lists. The legacy `payment` column is NOT selected because
// old rows carry a base64 screenshot in it; `payment_meta` is a computed column
// (see supabase/migrations/001_security.sql) that returns the same JSON minus
// the screenshot.
const ORDER_LIST_COLUMNS =
  "id,date,status,payment_status,items,total,address,tracking,customer_id,utr,screenshot_url,customer_name,customer_phone,discount,coupon_code,shipping,payment_meta";

// ─── MAPPERS ──────────────────────────────────────────────────────────────────

function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    image: row.image,
    stock: Number(row.stock),
    description: row.description,
    specs: row.specs || {},
    badge: row.badge,
  };
}

function mapProductToDb(p: Product): any {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice,
    rating: p.rating,
    reviews: p.reviews,
    image: p.image,
    stock: p.stock,
    description: p.description,
    specs: p.specs,
    badge: p.badge || null,
  };
}

/** Reads the old JSON-in-`payment` format (or `payment_meta`) for existing rows. */
function legacyPaymentInfo(row: any): any {
  if (row.payment_meta && typeof row.payment_meta === "object") return row.payment_meta;
  if (typeof row.payment === "string" && row.payment.startsWith("{")) {
    try {
      const parsed = JSON.parse(row.payment);
      return { ...parsed, hasScreenshot: !!parsed.screenshot };
    } catch {
      return { method: row.payment };
    }
  }
  return row.payment ? { method: row.payment } : {};
}

export function mapDbOrder(row: any): Order {
  const legacy = legacyPaymentInfo(row);
  return {
    id: row.id,
    date: row.date,
    status: row.status,
    paymentStatus: row.payment_status || "pending",
    items: row.items || [],
    total: Number(row.total),
    address: row.address,
    payment: legacy.method || "UPI Payment",
    tracking: row.tracking || undefined,
    customer_id: row.customer_id || undefined,
    utr: row.utr || legacy.utr || undefined,
    screenshotPath: row.screenshot_url || undefined,
    hasLegacyScreenshot: !row.screenshot_url && !!legacy.hasScreenshot,
    customerName: row.customer_name || legacy.customerName || undefined,
    customerPhone: row.customer_phone || legacy.customerPhone || undefined,
    discount: row.discount != null ? Number(row.discount) : 0,
    couponCode: row.coupon_code || undefined,
    shipping: row.shipping != null ? Number(row.shipping) : undefined,
  };
}

function mapDbProfile(row: any, fallbackEmail = ""): Profile {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || fallbackEmail,
    phone: row.phone || "",
    pincode: row.pincode || "",
    address: row.address || "",
    avatar: row.avatar || (row.name || "").substring(0, 2).toUpperCase(),
    joined: row.joined || "",
  };
}

// ─── API SERVICES ─────────────────────────────────────────────────────────────

export const supabaseService = {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  async signUp(input: { email: string; password: string; name: string; phone: string; pincode: string; address: string; redirectTo?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, phone: input.phone, pincode: input.pincode, address: input.address },
        emailRedirectTo: input.redirectTo,
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendPasswordReset(email: string, redirectTo?: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc("is_admin");
    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
    return data === true;
  },

  async getProfile(userId: string, fallbackEmail = ""): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
    return data ? mapDbProfile(data, fallbackEmail) : null;
  },

  /** Admin only (RLS): every customer profile. */
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
    return (data || []).map(r => mapDbProfile(r));
  },

  /** Deletes the signed-in user's payment screenshots, profile and auth user. */
  async deleteMyAccount(userId: string): Promise<void> {
    const { data: files } = await supabase.storage.from("payment-proofs").list(userId, { limit: 1000 });
    if (files && files.length > 0) {
      await supabase.storage.from("payment-proofs").remove(files.map(f => `${userId}/${f.name}`));
    }
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
    await supabase.auth.signOut({ scope: "local" });
  },

  // ── PRODUCTS ──────────────────────────────────────────────────────────────
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products from Supabase:", error);
      throw error;
    }
    return (data || []).map(mapDbProduct);
  },

  async saveProduct(p: Product): Promise<Product> {
    const dbProduct = mapProductToDb(p);
    const { data, error } = await supabase
      .from("products")
      .upsert(dbProduct)
      .select()
      .single();

    if (error) {
      console.error("Error saving product to Supabase:", error);
      throw error;
    }
    return mapDbProduct(data);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product from Supabase:", error);
      throw error;
    }
  },

  // ── ORDERS ────────────────────────────────────────────────────────────────
  /** The signed-in customer's own orders. */
  async getMyOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_LIST_COLUMNS)
      .eq("customer_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching orders from Supabase:", error);
      throw error;
    }
    return (data || []).map(mapDbOrder);
  },

  /** Admin only (RLS): every order. */
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_LIST_COLUMNS)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching orders from Supabase:", error);
      throw error;
    }
    return (data || []).map(mapDbOrder);
  },

  /** Creates the order server-side (prices, coupon, shipping, stock all checked in the DB). */
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const { data, error } = await supabase.rpc("place_order", {
      p_items: input.items,
      p_payment: input.payment,
      p_address: input.address,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_utr: input.utr || null,
      p_screenshot_path: input.screenshotPath || null,
      p_coupon_code: input.couponCode || null,
    });
    if (error) {
      console.error("Error placing order:", error);
      throw error;
    }
    return mapDbOrder(data);
  },

  async updateOrderStatus(id: string, status: Order["status"], tracking?: string): Promise<void> {
    const updates: any = { status };
    if (tracking !== undefined) {
      updates.tracking = tracking;
    }
    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating order status in Supabase:", error);
      throw error;
    }
  },

  async updatePaymentStatus(id: string, paymentStatus: Order["paymentStatus"]): Promise<void> {
    // Phase 2: saved to the DB (was local-only before).
    console.log("Payment status update (local):", id, paymentStatus);
  },

  // ── PAYMENT PROOFS (private bucket) ───────────────────────────────────────
  async uploadPaymentProof(userId: string, file: File): Promise<string> {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("payment-proofs")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || "image/jpeg" });
    if (error) {
      console.error("Error uploading payment proof:", error);
      throw error;
    }
    return path;
  },

  async removePaymentProof(path: string): Promise<void> {
    await supabase.storage.from("payment-proofs").remove([path]);
  },

  /** Admin: a short-lived URL for one order's screenshot (new or legacy rows). */
  async getPaymentProofUrl(order: Order): Promise<string | null> {
    if (order.screenshotPath) {
      const { data, error } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(order.screenshotPath, 60 * 60);
      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }
      return data.signedUrl;
    }
    if (order.hasLegacyScreenshot) {
      const { data, error } = await supabase.from("orders").select("payment").eq("id", order.id).maybeSingle();
      if (error || !data?.payment) return null;
      try {
        return JSON.parse(data.payment).screenshot || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  // ── CONTENT SETTINGS ──────────────────────────────────────────────────────
  async getContentSettings(key: string, defaultValue: any): Promise<any> {
    const { data, error } = await supabase
      .from("content_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching settings for ${key}:`, error);
      return defaultValue;
    }
    return data ? data.value : defaultValue;
  },

  async saveContentSettings(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from("content_settings")
      .upsert({ key, value });

    if (error) {
      console.error(`Error saving settings for ${key}:`, error);
      throw error;
    }
  },

  // ── STORAGE — product images (public bucket, admin-only write) ────────────
  async uploadProductImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
