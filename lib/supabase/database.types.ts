export type ServiceType =
  | "ride"
  | "send"
  | "food"
  | "laundry"
  | "titip"
  | "mart";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type MerchantCategory = "makanan" | "laundry" | "mart";

export type SosCategory = "darurat" | "kecelakaan" | "pelecehan" | "lainnya";

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          role: "admin" | "operator";
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: "admin" | "operator";
          created_at?: string;
        };
        Update: {
          role?: "admin" | "operator";
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          email_verified: boolean;
          phone: string | null;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          email_verified?: boolean;
          phone?: string | null;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          email_verified?: boolean;
          phone?: string | null;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      places: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category:
            | "landmark"
            | "kampus"
            | "pasar"
            | "pelabuhan"
            | "bandara"
            | "terminal"
            | "kota"
            | "lainnya";
          address: string | null;
          latitude: number;
          longitude: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?:
            | "landmark"
            | "kampus"
            | "pasar"
            | "pelabuhan"
            | "bandara"
            | "terminal"
            | "kota"
            | "lainnya";
          address?: string | null;
          latitude: number;
          longitude: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          category?:
            | "landmark"
            | "kampus"
            | "pasar"
            | "pelabuhan"
            | "bandara"
            | "terminal"
            | "kota"
            | "lainnya";
          address?: string | null;
          latitude?: number;
          longitude?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      merchants: {
        Row: {
          id: string;
          owner_user_id: string | null;
          place_id: string | null;
          name: string;
          slug: string;
          category: MerchantCategory;
          description: string | null;
          phone: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id?: string | null;
          place_id?: string | null;
          name: string;
          slug: string;
          category: MerchantCategory;
          description?: string | null;
          phone?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_user_id?: string | null;
          place_id?: string | null;
          name?: string;
          slug?: string;
          category?: MerchantCategory;
          description?: string | null;
          phone?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          description: string | null;
          price: number;
          category: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          description?: string | null;
          price: number;
          category?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          merchant_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fares: {
        Row: {
          id: string;
          service_type: ServiceType;
          base_fare: number;
          per_km: number;
          minimum_fare: number;
          max_distance_km: number;
          is_active: boolean;
          effective_from: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_type: ServiceType;
          base_fare: number;
          per_km: number;
          minimum_fare: number;
          max_distance_km?: number;
          is_active?: boolean;
          effective_from?: string;
          created_at?: string;
        };
        Update: {
          service_type?: ServiceType;
          base_fare?: number;
          per_km?: number;
          minimum_fare?: number;
          max_distance_km?: number;
          is_active?: boolean;
          effective_from?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          id: string;
          user_id: string;
          vehicle_type: "motor" | "mobil";
          vehicle_plate: string | null;
          status: "offline" | "available" | "busy";
          is_verified: boolean;
          verified_at: string | null;
          last_place_id: string | null;
          last_latitude: number | null;
          last_longitude: number | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_type?: "motor" | "mobil";
          vehicle_plate?: string | null;
          status?: "offline" | "available" | "busy";
          is_verified?: boolean;
          verified_at?: string | null;
          last_place_id?: string | null;
          last_latitude?: number | null;
          last_longitude?: number | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          vehicle_type?: "motor" | "mobil";
          vehicle_plate?: string | null;
          status?: "offline" | "available" | "busy";
          last_place_id?: string | null;
          last_latitude?: number | null;
          last_longitude?: number | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          driver_id: string | null;
          merchant_id: string | null;
          service_type: ServiceType;
          status: OrderStatus;
          pickup_place_id: string | null;
          dropoff_place_id: string | null;
          pickup_address: string | null;
          dropoff_address: string | null;
          distance_km: number;
          delivery_fee: number;
          items_total: number;
          total_amount: number;
          notes: string | null;
          scheduled_at: string | null;
          accepted_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          driver_id?: string | null;
          merchant_id?: string | null;
          service_type: ServiceType;
          status?: OrderStatus;
          pickup_place_id?: string | null;
          dropoff_place_id?: string | null;
          pickup_address?: string | null;
          dropoff_address?: string | null;
          distance_km?: number;
          notes?: string | null;
          scheduled_at?: string | null;
        };
        Update: {
          notes?: string | null;
          scheduled_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          name?: string;
          unit_price?: number;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          method: "cash" | "qris";
          status: "pending" | "paid" | "failed" | "refunded";
          amount: number;
          reference: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method: "cash" | "qris";
          status?: "pending" | "paid" | "failed" | "refunded";
          amount: number;
          reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "paid" | "failed" | "refunded";
          reference?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      sos_reports: {
        Row: {
          id: string;
          order_id: string | null;
          reported_by: string | null;
          category: SosCategory;
          message: string | null;
          latitude: number | null;
          longitude: number | null;
          status: "open" | "acknowledged" | "resolved";
          handled_by: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          reported_by?: string | null;
          category?: SosCategory;
          message?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?: "open" | "acknowledged" | "resolved";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: SosCategory;
          message?: string | null;
          status?: "open" | "acknowledged" | "resolved";
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          order_id: string;
          sender_id: string | null;
          sender_role: "customer" | "driver" | "system";
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sender_id?: string | null;
          sender_role: "customer" | "driver" | "system";
          message: string;
          created_at?: string;
        };
        Update: {
          message?: string;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          order_id: string;
          rater_id: string;
          driver_id: string;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          rater_id: string;
          driver_id: string;
          score: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          score?: number;
          comment?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      calculate_fare: {
        Args: { p_service_type: string; p_distance_km: number };
        Returns: number;
      };
      cancel_order: {
        Args: { p_order_id: string; p_reason?: string | null };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      accept_order: {
        Args: { p_order_id: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      update_order_status: {
        Args: { p_order_id: string; p_status: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      admin_set_driver_verified: {
        Args: { p_driver_id: string; p_verified: boolean };
        Returns: Database["public"]["Tables"]["drivers"]["Row"];
      };
      admin_set_merchant_verified: {
        Args: { p_merchant_id: string; p_verified: boolean };
        Returns: Database["public"]["Tables"]["merchants"]["Row"];
      };
      admin_set_sos_status: {
        Args: { p_report_id: string; p_status: string };
        Returns: Database["public"]["Tables"]["sos_reports"]["Row"];
      };
      admin_create_fare: {
        Args: {
          p_service_type: string;
          p_base_fare: number;
          p_per_km: number;
          p_minimum_fare: number;
          p_max_distance_km: number;
          p_effective_from: string;
        };
        Returns: Database["public"]["Tables"]["fares"]["Row"];
      };
      admin_set_fare_active: {
        Args: { p_fare_id: string; p_active: boolean };
        Returns: Database["public"]["Tables"]["fares"]["Row"];
      };
      admin_cancel_order: {
        Args: { p_order_id: string; p_reason?: string | null };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      admin_record_payment: {
        Args: {
          p_order_id: string;
          p_method: string;
          p_status?: string;
          p_reference?: string | null;
        };
        Returns: Database["public"]["Tables"]["payments"]["Row"];
      };
      admin_set_payment_status: {
        Args: { p_payment_id: string; p_status: string };
        Returns: Database["public"]["Tables"]["payments"]["Row"];
      };
    };
  };
};

export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type AdminRow = TableRow<"admins">;
export type OrderRow = TableRow<"orders">;
export type PlaceRow = TableRow<"places">;
export type MerchantRow = TableRow<"merchants">;
export type MenuItemRow = TableRow<"menu_items">;
export type DriverRow = TableRow<"drivers">;
export type OrderItemRow = TableRow<"order_items">;
export type ChatMessageRow = TableRow<"chat_messages">;
export type RatingRow = TableRow<"ratings">;
export type UserRow = TableRow<"users">;
export type FareRow = TableRow<"fares">;
export type PaymentRow = TableRow<"payments">;
export type SosReportRow = TableRow<"sos_reports">;
