import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  Package, 
  History, 
  Filter,
  Download,
  ShoppingCart,
  Tag,
  Box,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { lojaService } from '@/services/lojaService';
import { Produto, Venda } from '@/types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function Loja() {
  const [activeTab, setActiveTab] = useState<'produtos' | 'vendas'>('produtos');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'produtos') {
        const data = await lojaService.getProdutos();
        setProdutos(data);
      } else {
        const data = await lojaService.getVendas();
        setVendas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendas = vendas.filter(v => 
    v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.forma_pagamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Loja & Vendas</h1>
          <p className="text-on-surface-variant">Gestão de estoque e comercialização de materiais.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Inventário
          </Button>
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      <div className="flex space-x-1 rounded-lg bg-surface-container-low p-1 w-fit">
        <button
          onClick={() => setActiveTab('produtos')}
          className={cn(
            'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all',
            activeTab === 'produtos' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Package className="mr-2 h-4 w-4" />
          Produtos & Estoque
        </button>
        <button
          onClick={() => setActiveTab('vendas')}
          className={cn(
            'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all',
            activeTab === 'vendas' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <History className="mr-2 h-4 w-4" />
          Histórico de Vendas
        </button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input 
                placeholder={activeTab === 'produtos' ? "Buscar produto..." : "Buscar venda por ID..."}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'produtos' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full py-10 text-center text-on-surface-variant">Carregando produtos...</div>
              ) : filteredProdutos.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="card-lift group overflow-hidden">
                    <div className="aspect-video bg-surface-container-low flex items-center justify-center border-b border-outline-variant">
                      <Box className="h-12 w-12 text-outline group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">{produto.categoria}</span>
                          <h3 className="font-serif font-bold text-on-surface">{produto.nome}</h3>
                        </div>
                        <p className="text-lg font-bold text-primary">R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{produto.descricao}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                        <div className="flex items-center text-xs">
                          <Tag className="mr-1 h-3 w-3 text-outline" />
                          <span className={cn(
                            'font-medium',
                            produto.estoque < 10 ? 'text-red-600' : 'text-on-surface-variant'
                          )}>
                            Estoque: {produto.estoque} un
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID Venda</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Pagamento</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr><td colSpan={6} className="py-10 text-center">Carregando vendas...</td></tr>
                  ) : filteredVendas.map((venda, index) => (
                    <motion.tr 
                      key={venda.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-4 py-4 font-medium text-primary">#{venda.id}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-4 font-bold text-on-surface">R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{venda.forma_pagamento}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Concluída
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
