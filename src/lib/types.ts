export interface Product {
  id: string
  category_id: string | null
  name_en: string
  name_ar: string
  desc_en: string
  desc_ar: string
  weight: string
  pieces_per_carton: string
  image_url: string
  is_new: boolean
  is_featured: boolean
  stock: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_en: string
  name_ar: string
  icon: string
  image_url: string
  sort_order: number
  created_at: string
}

export interface Order {
  id: string
  items: OrderItem[]
  customer_name: string
  customer_phone: string
  notes: string
  status: string
  customer_id: number | null
  created_at: string
}

export interface OrderItem {
  product_id: string
  name_en: string
  name_ar: string
  quantity: number
  weight?: string
  pieces_per_carton?: string
}

export interface Settings {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export type CartItem = OrderItem

export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  password_hash: string
  auth_token: string | null
  points: number
  created_at: string
  updated_at: string
}

export interface LoyaltyTransaction {
  id: number
  customer_id: number
  points: number
  type: "earn" | "redeem"
  reason: string
  created_at: string
}

export interface Recipe {
  id: string
  title_en: string
  title_ar: string
  slug: string
  excerpt_en: string
  excerpt_ar: string
  content_en: string
  content_ar: string
  image_url: string
  author: string
  published: boolean
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      products: { Row: Product; Insert: Omit<Product, "created_at" | "updated_at" | "sort_order"> & { sort_order?: number }; Update: Partial<Omit<Product, "id">> }
      categories: { Row: Category; Insert: Omit<Category, "created_at">; Update: Partial<Omit<Category, "id">> }
      orders: { Row: Order; Insert: Omit<Order, "id" | "created_at">; Update: Partial<Order> }
      settings: { Row: Settings; Insert: Settings; Update: Partial<Settings> }
      customers: { Row: Customer; Insert: Omit<Customer, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Customer, "id">> }
      loyalty_transactions: { Row: LoyaltyTransaction; Insert: Omit<LoyaltyTransaction, "id" | "created_at">; Update: Partial<LoyaltyTransaction> }
      recipes: { Row: Recipe; Insert: Omit<Recipe, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Recipe, "id">> }
    }
  }
}