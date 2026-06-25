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

function mapDbOrder(row: any): Order {
  return {
    id: row.id,
    date: row.date,
    status: row.status,
    paymentStatus: row.payment_status || "pending",
    items: row.items || [],
    total: Number(row.total),
    address: row.address,
    payment: row.payment,
    tracking: row.tracking || undefined,
    customer_id: row.customer_id || undefined,
  };
}

function mapOrderToDb(o: Order): any {
  return {
    id: o.id,
    date: o.date,
    status: o.status,
    payment_status: o.paymentStatus || "pending",
    items: o.items,
    total: o.total,
    address: o.address,
    payment: o.payment,
    tracking: o.tracking || null,
    customer_id: o.customer_id || null,
  };
}

function mapDbCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    orders: Number(row.orders_count),
    spent: Number(row.spent),
    joined: row.joined,
    avatar: row.avatar,
  };
}

function mapCustomerToDb(c: Customer): any {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    orders_count: c.orders,
    spent: c.spent,
    joined: c.joined,
    avatar: c.avatar,
  };
}

// ─── API SERVICES ─────────────────────────────────────────────────────────────

export const supabaseService = {
  // PRODUCTS
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

  async updateProductStock(id: string, newStock: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);

    if (error) {
      console.error("Error updating stock in Supabase:", error);
      throw error;
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching orders from Supabase:", error);
      throw error;
    }
    return (data || []).map(mapDbOrder);
  },

  async createOrder(o: Order): Promise<Order> {
    const dbOrder = mapOrderToDb(o);
    const { data, error } = await supabase
      .from("orders")
      .insert(dbOrder)
      .select()
      .single();

    if (error) {
      console.error("Error creating order in Supabase:", error);
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
    // Store locally only (payment_status column may not exist in DB yet)
    // This is a local-only operation handled in App state
    console.log("Payment status update (local):", id, paymentStatus);
  },

  // CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("spent", { ascending: false });

    if (error) {
      console.error("Error fetching customers from Supabase:", error);
      throw error;
    }
    return (data || []).map(mapDbCustomer);
  },

  async saveCustomer(c: Customer): Promise<Customer> {
    const dbCust = mapCustomerToDb(c);
    const { data, error } = await supabase
      .from("customers")
      .upsert(dbCust)
      .select()
      .single();

    if (error) {
      console.error("Error saving customer to Supabase:", error);
      throw error;
    }
    return mapDbCustomer(data);
  },

  // CONTENT SETTINGS
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

  // SEEDER
  async seedDatabaseIfEmpty(
    defaultProducts: Product[],
    defaultOrders: Order[],
    defaultCustomers: Customer[]
  ): Promise<boolean> {
    try {
      // 1. Check products count
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error checking products table for seeding:", countError);
        return false;
      }

      if (count !== null && count > 0) {
        console.log("Database already has data. Skipping seeder.");
        return false;
      }

      console.log("Database is empty. Seeding initial data...");

      // Seed Products
      const dbProds = defaultProducts.map(mapProductToDb);
      const { error: prodErr } = await supabase.from("products").insert(dbProds);
      if (prodErr) throw prodErr;

      // Seed Customers
      const dbCusts = defaultCustomers.map(mapCustomerToDb);
      const { error: custErr } = await supabase.from("customers").insert(dbCusts);
      if (custErr) throw custErr;

      // Seed Orders
      const dbOrds = defaultOrders.map(mapOrderToDb);
      const { error: ordErr } = await supabase.from("orders").insert(dbOrds);
      if (ordErr) throw ordErr;

      // Seed Content Settings
      const defaultBanners = [
        { title: "Alpha Mobile", sub: "Best quality secondhand phones at the best prices!", img: "1592750475338-74b7b21085ab" },
        { title: "Secondhand Phones", sub: "Quality used phones you can trust. Phone Secondhand rintlak leh chhe lo ber ber kan kawl e.", img: "1600294037681-c80b4cb5b434" },
        { title: "Accessories & Chargers", sub: "Premium quality phone accessories, chargers, and cases.", img: "1609091839311-d5365f9ff1c5" },
      ];
      await this.saveContentSettings("banners", defaultBanners);

      const defaultShopInfo = {
        name: "Alpha Mobile",
        subName: "Mizoram's Trusted Secondhand Phone Shop",
        description: "Phone Secondhand leh a hmanruate lei tur kan kawl e! Your one-stop shop for quality secondhand phones and accessories at the best prices.",
        location: "Mizoram, India",
        phone: "9612217093",
        instagram: "@alpha_mobile_mizoram",
        upiId: "9612217093@paytm",
      };
      await this.saveContentSettings("shop_info", defaultShopInfo);

      const defaultCoupons = [
        { code: "EXCART10", discountPercent: 10, description: "10% off entire order" },
        { code: "SAVE20", discountPercent: 20, description: "20% off entire order" },
      ];
      await this.saveContentSettings("coupons", defaultCoupons);

      console.log("Seeding completed successfully!");
      return true;
    } catch (err) {
      console.error("Seeding failed:", err);
      return false;
    }
  },
};
