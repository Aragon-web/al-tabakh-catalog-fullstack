export interface Product {
  id: string
  category_id: string | null
  name_en: string
  name_ar: string
  desc_en: string
  desc_ar: string
  weight: string
  pieces_per_carton: string
  price: number
  image_url: string
  is_new: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_en: string
  name_ar: string
  icon: string
  sort_order: number
  created_at: string
}

export interface Order {
  id: string
  items: OrderItem[]
  customer_name: string
  customer_phone: string
  notes: string
  total: number
  status: string
  created_at: string
}

export interface OrderItem {
  product_id: string
  name_en: string
  name_ar: string
  quantity: number
  price: number
  weight?: string
}

export interface Settings {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface CartItem extends OrderItem {}

export type Database = {
  public: {
    Tables: {
      products: { Row: Product; Insert: Omit<Product, "created_at" | "updated_at">; Update: Partial<Omit<Product, "id">> }
      categories: { Row: Category; Insert: Omit<Category, "created_at">; Update: Partial<Omit<Category, "id">> }
      orders: { Row: Order; Insert: Omit<Order, "id" | "created_at">; Update: Partial<Order> }
      settings: { Row: Settings; Insert: Settings; Update: Partial<Settings> }
    }
  }
}
