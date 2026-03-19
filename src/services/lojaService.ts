import { Produto, Venda } from '@/types';
import { supabase } from '@/lib/supabase';

export const lojaService = {
  async getProdutos(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getVendas(): Promise<Venda[]> {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        itens:venda_itens(*)
      `)
      .order('data_venda', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createVenda(venda: Omit<Venda, 'id' | 'created_at'>): Promise<Venda> {
    const { itens, ...vendaData } = venda;

    // 1. Create the sale record
    const { data: newVenda, error: vendaError } = await supabase
      .from('vendas')
      .insert([vendaData])
      .select()
      .single();

    if (vendaError) throw vendaError;

    // 2. Create the sale items
    const itemsWithVendaId = itens.map(item => ({
      ...item,
      venda_id: newVenda.id
    }));

    const { error: itemsError } = await supabase
      .from('venda_itens')
      .insert(itemsWithVendaId);

    if (itemsError) throw itemsError;

    // 3. Update product stock (simplified)
    for (const item of itens) {
      const { data: product } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', item.produto_id)
        .single();
      
      if (product) {
        await supabase
          .from('produtos')
          .update({ estoque: product.estoque - item.quantidade })
          .eq('id', item.produto_id);
      }
    }

    return { ...newVenda, itens };
  }
};
