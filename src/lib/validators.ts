import { z } from "zod";

/**
 * Tüm input doğrulama şemaları tek yerde.
 * Her API route bu şemalardan birini kullanır.
 * Zod, hem tip güvenliği hem de runtime doğrulama sağlar.
 */

// ============================================================
//  Auth
// ============================================================

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(254),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(128, "Şifre çok uzun"),
});

// ============================================================
//  Menu Items
// ============================================================

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter").max(80, "İsim çok uzun"),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  description: z.string().trim().min(10, "Açıklama en az 10 karakter").max(500),
  priceCents: z.number().int().min(0, "Fiyat negatif olamaz").max(1_000_000, "Fiyat çok yüksek"),
  category: z.enum(["PIZZA", "SIGNATURE", "SIDES", "DRINKS", "DESSERTS"]),
  imageUrl: z.string().url("Geçerli bir URL girin").max(2048).optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  ingredients: z.array(z.string().trim().max(60)).max(30).default([]),
  tags: z
    .array(z.enum(["VEGETARIAN", "VEGAN", "SPICY", "NEW", "HALAL", "GLUTEN_FREE", "CHEF_SPECIAL"]))
    .default([]),
  allergens: z.array(z.string().trim().max(40)).max(20).default([]),
  sizes: z
    .array(
      z.object({
        size: z.string().max(40),
        diameter: z.number().int().min(0).max(100).optional(),
        priceCents: z.number().int().min(0),
      })
    )
    .max(5)
    .default([]),
  sortOrder: z.number().int().min(0).max(10000).default(0),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

// ============================================================
//  Orders
// ============================================================

export const orderItemSchema = z.object({
  menuItemId: z.string().cuid().optional(),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(50),
  unitPriceCents: z.number().int().min(0),
  extras: z
    .array(z.object({ name: z.string().max(60), priceCents: z.number().int().min(0) }))
    .max(10)
    .default([]),
  notes: z.string().trim().max(200).optional().or(z.literal("")),
});

export const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "İsim en az 2 karakter")
    .max(80, "İsim çok uzun")
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s']+$/, "İsim geçersiz karakter içeriyor"),
  customerPhone: z.string().trim().min(10, "Telefon geçersiz").max(20),
  customerEmail: z.string().trim().email("E-posta geçersiz").max(254).optional().or(z.literal("")),
  orderType: z.enum(["DELIVERY", "PICKUP", "DINE_IN"]),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "CARD_ON_DELIVERY", "ONLINE"]).default("CASH_ON_DELIVERY"),
  items: z.array(orderItemSchema).min(1, "En az 1 ürün olmalı").max(30, "Çok fazla ürün"),
  deliveryAddress: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

// ============================================================
//  Reservations
// ============================================================

export const reservationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "İsim en az 2 karakter")
    .max(80)
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s']+$/, "İsim geçersiz karakter içeriyor"),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(254),
  phone: z.string().trim().min(10, "Telefon geçersiz").max(20),
  date: z.string().refine(
    (val) => {
      const d = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(d.getTime()) && d >= today;
    },
    { message: "Geçerli bir gelecek tarih girin" }
  ),
  time: z.enum([
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  ]),
  partySize: z.number().int().min(1, "En az 1 kişi").max(20, "20+ kişi için arayın"),
  service: z.enum(["LUNCH", "DINNER"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

// ============================================================
//  Contact
// ============================================================

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "İsim en az 2 karakter")
    .max(80)
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s']+$/, "İsim geçersiz karakter içeriyor"),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(254),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Konu en az 2 karakter").max(120),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter").max(2000),
  // Honeypot — boş olmalı
  website: z.string().max(0, "Bot tespit edildi").optional().or(z.literal("")),
});

// ============================================================
//  Settings
// ============================================================

export const settingSchema = z.object({
  key: z.string().trim().min(1).max(80).regex(/^[A-Z0-9_]+$/),
  value: z.string().trim().max(5000),
});

// ============================================================
//  Admin user create
// ============================================================

export const adminCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

// ============================================================
//  Type exports
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SettingInput = z.infer<typeof settingSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
