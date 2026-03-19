import { Financeiro } from '@/types';
import { supabase } from '@/lib/supabase';

export const financeiroService = {
  async getAll(): Promise<Financeiro[]> {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .order('data_lancamento', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(financeiro: Omit<Financeiro, 'id' | 'created_at'>): Promise<Financeiro> {
    const { data, error } = await supabase
      .from('financeiro')
      .insert([financeiro])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createMany(lancamentos: Omit<Financeiro, 'id' | 'created_at'>[]): Promise<void> {
    const { error } = await supabase
      .from('financeiro')
      .insert(lancamentos);

    if (error) throw error;
  },

  async getByIrmaoId(irmaoId: string): Promise<Financeiro[]> {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('tipo_entidade', 'irmao')
      .eq('entidade_id', irmaoId)
      .order('data_lancamento', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: Partial<Financeiro>): Promise<void> {
    const { error } = await supabase
      .from('financeiro')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }
};
