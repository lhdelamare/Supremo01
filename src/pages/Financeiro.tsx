import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  CreditCard,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { financeiroService } from '@/services/financeiroService';
import { irmaoService } from '@/services/irmaoService';
import { capituloService } from '@/services/capituloService';
import { Financeiro, Irmao, Capitulo } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<'transacoes' | 'gestao'>('transacoes');
  const [transacoes, setTransacoes] = useState<Financeiro[]>([]);
  const [irmaos, setIrmaos] = useState<Irmao[]>([]);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Gestão de Captações
  const [selectedCaptacao, setSelectedCaptacao] = useState<string>('');
  const [captacaoHistory, setCaptacaoHistory] = useState<Financeiro[]>([]);
  const [loadingGestao, setLoadingGestao] = useState(false);
  
  // Captação Anual
  const [isCaptacaoModalOpen, setIsCaptacaoModalOpen] = useState(false);
  const [captacaoData, setCaptacaoData] = useState({
    ano: new Date().getFullYear().toString(),
    valor: '0',
    data_vencimento: new Date().toISOString().split('T')[0]
  });
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    loadFinanceiro();
  }, []);

  async function loadFinanceiro() {
    setLoading(true);
    try {
      const data = await financeiroService.getAll();
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLaunchCaptacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);
    console.log('Iniciando lançamento de captação anual...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError);
        alert('Você precisa estar logado para realizar esta operação.');
        setIsLaunching(false);
        return;
      }

      console.log('Usuário autenticado:', user.id);
      
      const irmaos = await irmaoService.getAll();
      const activeIrmaos = irmaos.filter(i => i.status === 'ativo');
      
      console.log(`Encontrados ${activeIrmaos.length} irmãos ativos.`);

      if (activeIrmaos.length === 0) {
        alert('Nenhum irmão ativo encontrado para lançar a captação.');
        setIsLaunching(false);
        return;
      }

      const lancamentos = activeIrmaos.map(irmao => ({
        tipo_entidade: 'irmao' as const,
        entidade_id: irmao.id,
        descricao: `Captação Anual ${captacaoData.ano}`,
        categoria: 'Captação Anual',
        data_lancamento: new Date().toISOString().split('T')[0],
        data_vencimento: captacaoData.data_vencimento,
        valor: parseFloat(captacaoData.valor),
        tipo_movimento: 'credito' as const,
        status: 'lancado' as const,
        observacoes: `Lançamento em lote para o ano de ${captacaoData.ano}`,
        criado_por: user?.id
      }));

      console.log('Enviando lançamentos para o Supabase...');
      await financeiroService.createMany(lancamentos);
      
      alert(`Captação de ${captacaoData.ano} lançada com sucesso para ${activeIrmaos.length} irmãos ativos!`);
      setIsCaptacaoModalOpen(false);
      loadFinanceiro();
    } catch (error: any) {
      console.error('Erro detalhado ao lançar captação:', error);
      alert(`Erro ao lançar captação: ${error.message || 'Erro desconhecido'}\n\nVerifique se a tabela 'financeiro' existe no Supabase com as colunas corretas.`);
    } finally {
      setIsLaunching(false);
    }
  };

  const loadGestaoData = async () => {
    setLoadingGestao(true);
    try {
      const [irmaosData, financeiroData, capitulosData] = await Promise.all([
        irmaoService.getAll(),
        financeiroService.getAll(),
        capituloService.getAll()
      ]);
      setIrmaos(irmaosData);
      setTransacoes(financeiroData);
      setCapitulos(capitulosData);
      
      // Get unique captation years from categories or descriptions
      const history = financeiroData.filter(t => t.categoria === 'Captação Anual');
      setCaptacaoHistory(history);
      
      if (!selectedCaptacao && history.length > 0) {
        // Extract years from descriptions like "Captação Anual 2025"
        const years = Array.from(new Set(history.map(h => {
          const match = h.descricao.match(/\d{4}/);
          return match ? match[0] : '';
        }))).filter(y => y !== '').sort((a, b) => (b as string).localeCompare(a as string));
        
        if (years.length > 0) {
          setSelectedCaptacao(years[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de gestão:', error);
    } finally {
      setLoadingGestao(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gestao') {
      loadGestaoData();
    }
  }, [activeTab]);

  const handleRegisterPayment = async (irmaoId: string) => {
    const captacao = transacoes.find(t => 
      t.entidade_id === irmaoId && 
      t.categoria === 'Captação Anual' && 
      t.descricao.includes(selectedCaptacao) &&
      t.status !== 'pago'
    );

    if (!captacao) {
      alert('Lançamento de captação não encontrado para este irmão e ano.');
      return;
    }

    if (window.confirm(`Confirmar pagamento da Captação ${selectedCaptacao} para este irmão?`)) {
      try {
        await financeiroService.update(captacao.id, { 
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        });
        alert('Pagamento registrado com sucesso!');
        loadGestaoData();
      } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        alert('Erro ao registrar pagamento.');
      }
    }
  };

  const handleCancelPayment = async (irmaoId: string) => {
    const captacao = transacoes.find(t => 
      t.entidade_id === irmaoId && 
      t.categoria === 'Captação Anual' && 
      t.descricao.includes(selectedCaptacao) &&
      t.status === 'pago'
    );

    if (!captacao) {
      alert('Pagamento de captação não encontrado para este irmão e ano.');
      return;
    }

    if (window.confirm(`Deseja cancelar o pagamento da Captação ${selectedCaptacao} para este irmão?`)) {
      try {
        console.log('Cancelando pagamento para:', irmaoId, 'ID Transação:', captacao.id);
        await financeiroService.update(captacao.id, { 
          status: 'lancado',
          data_pagamento: null as any
        });
        alert('Pagamento cancelado com sucesso!');
        await loadGestaoData();
      } catch (error: any) {
        console.error('Erro ao cancelar pagamento:', error);
        alert(`Erro ao cancelar pagamento: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const totalCredito = transacoes
    .filter(t => t.tipo_movimento === 'credito' && t.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDebito = transacoes
    .filter(t => t.tipo_movimento === 'debito' && t.status === 'pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldo = totalCredito - totalDebito;

  const filteredTransacoes = transacoes.filter(t => 
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusIcons = {
    pago: <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />,
    pendente: <Clock className="mr-1 h-3 w-3 text-primary" />,
    lancado: <Clock className="mr-1 h-3 w-3 text-primary" />,
    cancelado: <XCircle className="mr-1 h-3 w-3 text-red-600" />,
  };

  const statusClasses = {
    pago: 'bg-emerald-50 text-emerald-700',
    pendente: 'bg-primary/10 text-primary',
    lancado: 'bg-primary/10 text-primary',
    cancelado: 'bg-red-50 text-red-700',
  };

  const statusLabels = {
    pago: 'Pago',
    pendente: 'Lançado',
    lancado: 'Lançado',
    cancelado: 'Cancelado'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Financeiro</h1>
          <p className="text-on-surface-variant">Controle de receitas, despesas e anuidades.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:space-x-3">
          <Button variant="outline" onClick={() => setIsCaptacaoModalOpen(true)} className="flex-1 md:flex-none">
            <Calendar className="mr-2 h-4 w-4" />
            Lançar Captação Anual
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          <Button className="flex-1 md:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Modal Captação Anual */}
      <Modal
        isOpen={isCaptacaoModalOpen}
        onClose={() => setIsCaptacaoModalOpen(false)}
        title="Lançar Captação Anual"
      >
        <form onSubmit={handleLaunchCaptacao} className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Este procedimento irá gerar um lançamento de crédito pendente para <strong>todos os irmãos com status "Ativo"</strong>.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano de Referência</label>
              <Input 
                type="number" 
                value={captacaoData.ano} 
                onChange={(e) => setCaptacaoData(prev => ({ ...prev, ano: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input 
                type="number" 
                step="0.01"
                value={captacaoData.valor} 
                onChange={(e) => setCaptacaoData(prev => ({ ...prev, valor: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Input 
                type="date" 
                value={captacaoData.data_vencimento} 
                onChange={(e) => setCaptacaoData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCaptacaoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLaunching}>
              {isLaunching ? 'Lançando...' : 'Confirmar Lançamento'}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="flex border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('transacoes')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'transacoes' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          Transações
          {activeTab === 'transacoes' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('gestao')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'gestao' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          Gestão de Captações
          {activeTab === 'gestao' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'transacoes' ? (
          <motion.div
            key="transacoes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="bg-primary text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-white/10 p-2">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-white/70">Saldo Total</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold">R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-white/70 mt-1">Saldo em conta corrente</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">Receitas (Mês)</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-on-surface">R$ {totalCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center text-xs text-emerald-600 mt-1">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      <span>+12.5% em relação ao mês anterior</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-red-50 p-2 text-red-600">
                      <TrendingDown className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">Despesas (Mês)</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-on-surface">R$ {totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center text-xs text-red-600 mt-1">
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                      <span>-3.2% em relação ao mês anterior</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input 
                      placeholder="Buscar transação..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <Calendar className="mr-2 h-4 w-4" />
                      Este Mês
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
                      <tr>
                        <th className="px-4 py-3 font-medium">Data</th>
                        <th className="px-4 py-3 font-medium">Descrição</th>
                        <th className="px-4 py-3 font-medium">Categoria</th>
                        <th className="px-4 py-3 font-medium">Valor</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-on-surface-variant">
                            Carregando transações...
                          </td>
                        </tr>
                      ) : filteredTransacoes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-on-surface-variant">
                            Nenhuma transação encontrada.
                          </td>
                        </tr>
                      ) : (
                        filteredTransacoes.map((t, index) => (
                          <motion.tr 
                            key={t.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-surface-container-low transition-colors"
                          >
                            <td className="px-4 py-4 text-on-surface-variant">
                              {new Date(t.data_lancamento).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-medium text-on-surface">{t.descricao}</p>
                              <p className="text-[10px] uppercase text-outline">ID: {t.id}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-md bg-surface-container-high px-2 py-1 text-xs text-on-surface-variant">
                                {t.categoria}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={cn(
                                'font-bold',
                                t.tipo_movimento === 'credito' ? 'text-emerald-600' : 'text-red-600'
                              )}>
                                {t.tipo_movimento === 'credito' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                statusClasses[t.status as keyof typeof statusClasses]
                              )}>
                                {statusIcons[t.status as keyof typeof statusIcons]}
                                {statusLabels[t.status as keyof typeof statusLabels]}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="gestao"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1 w-full sm:w-auto">
                      <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Selecionar Captação</label>
                      <select
                        value={selectedCaptacao}
                        onChange={(e) => setSelectedCaptacao(e.target.value)}
                        className="block w-full sm:w-48 rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="">Selecione o ano</option>
                        {Array.from(new Set(captacaoHistory.map(h => {
                          const match = h.descricao.match(/\d{4}/);
                          return match ? match[0] : '';
                        }))).filter(y => y !== '').sort((a, b) => (b as string).localeCompare(a as string)).map(year => (
                          <option key={year as string} value={year as string}>Captação {year as string}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Total de Irmãos</p>
                    <p className="text-2xl font-bold text-primary">{irmaos.length}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
                      <tr>
                        <th className="px-4 py-3 font-medium">Irmão</th>
                        <th className="px-4 py-3 font-medium">Capítulo</th>
                        <th className="px-4 py-3 font-medium">Valor</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {loadingGestao ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                            Carregando dados de gestão...
                          </td>
                        </tr>
                      ) : irmaos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                            Nenhum irmão cadastrado.
                          </td>
                        </tr>
                      ) : (
                        irmaos.map((irmao, index) => {
                          const captacao = transacoes.find(t => 
                            t.entidade_id === irmao.id && 
                            t.categoria === 'Captação Anual' && 
                            t.descricao.includes(selectedCaptacao)
                          );

                          return (
                            <motion.tr 
                              key={irmao.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="group hover:bg-surface-container-low transition-colors"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center mr-3">
                                    <Users className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-on-surface">{irmao.nome_completo}</p>
                                    <p className="text-[10px] text-outline">{irmao.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-on-surface-variant">
                                {capitulos.find(c => c.id === irmao.capitulo_id)?.nome || 'Não vinculado'}
                              </td>
                              <td className="px-4 py-4 font-medium">
                                {captacao ? `R$ ${captacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                              <td className="px-4 py-4">
                                {captacao ? (
                                  <span className={cn(
                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                    statusClasses[captacao.status as keyof typeof statusClasses]
                                  )}>
                                    {statusIcons[captacao.status as keyof typeof statusIcons]}
                                    {statusLabels[captacao.status as keyof typeof statusLabels]}
                                  </span>
                                ) : (
                                  <span className="text-xs text-outline italic">Não lançado</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {captacao && captacao.status !== 'pago' ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleRegisterPayment(irmao.id)}
                                    className="h-8 text-xs"
                                  >
                                    <CreditCard className="mr-1 h-3 w-3" />
                                    Registrar Pagamento
                                  </Button>
                                ) : captacao && captacao.status === 'pago' ? (
                                  <div className="flex flex-col items-end space-y-1">
                                    <span className="text-emerald-600 flex items-center justify-end text-xs font-medium">
                                      <CheckCircle2 className="mr-1 h-3 w-3" />
                                      Pago
                                    </span>
                                    <button 
                                      onClick={() => handleCancelPayment(irmao.id)}
                                      className="text-[10px] text-red-600 hover:underline flex items-center"
                                    >
                                      <XCircle className="mr-1 h-2 w-2" />
                                      Cancelar Pagamento
                                    </button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 text-xs opacity-50 cursor-not-allowed"
                                    disabled
                                  >
                                    Sem Lançamento
                                  </Button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
