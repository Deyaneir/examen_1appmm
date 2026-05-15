export type Dish = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  photo_uri: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type CreateDishInput = Omit<Dish, 'id' | 'user_id' | 'created_at'>;
