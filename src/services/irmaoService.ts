import { Irmao } from '@/types';
import { supabase } from '@/lib/supabase';

export const irmaoService = {
  async getAll(): Promise<Irmao[]> {
    const { data, error } = await supabase
      .from('irmaos')
      .select('*')
      .order('nome_completo', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Irmao | null> {
    const { data, error } = await supabase
      .from('irmaos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByCapituloId(capituloId: string): Promise<Irmao[]> {
    const { data, error } = await supabase
      .from('irmaos')
      .select('*')
      .eq('capitulo_id', capituloId)
      .order('nome_completo', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(irmao: Omit<Irmao, 'id' | 'created_at'>): Promise<Irmao> {
    const { data, error } = await supabase
      .from('irmaos')
      .insert([irmao])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Irmao>): Promise<void> {
    const { error } = await supabase
      .from('irmaos')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('irmaos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
