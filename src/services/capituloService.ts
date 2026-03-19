import { Capitulo } from '@/types';
import { supabase } from '@/lib/supabase';

export const capituloService = {
  async getAll(): Promise<Capitulo[]> {
    const { data, error } = await supabase
      .from('capitulos')
      .select('*')
      .order('numero', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Capitulo | null> {
    const { data, error } = await supabase
      .from('capitulos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(capitulo: Omit<Capitulo, 'id' | 'created_at'>): Promise<Capitulo> {
    const { data, error } = await supabase
      .from('capitulos')
      .insert([capitulo])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Capitulo>): Promise<void> {
    const { error } = await supabase
      .from('capitulos')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('capitulos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
