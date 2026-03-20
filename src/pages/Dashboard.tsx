import React from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const chartData = [
  { name: 'Jan', receita: 4000, despesa: 2400 },
  { name: 'Fev', receita: 3000, despesa: 1398 },
  { name: 'Mar', receita: 2000, despesa: 9800 },
  { name: 'Abr', receita: 2780, despesa: 3908 },
  { name: 'Mai', receita: 1890, despesa: 4800 },
  { name: 'Jun', receita: 2390, despesa: 3800 },
  { name: 'Jul', receita: 3490, despesa: 4300 },
];

const stats = [
  { label: 'Total de Irmãos', value: '1,248', icon: Users, trend: '+12%', trendUp: true, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Capítulos Ativos', value: '42', icon: Building2, trend: '+2', trendUp: true, color: 'text-secondary', bg: 'bg-secondary/10' },
  { label: 'Receita Mensal', value: 'R$ 45.200', icon: DollarSign, trend: '+8.4%', trendUp: true, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Vendas na Loja', value: 'R$ 12.850', icon: ShoppingBag, trend: '-2.1%', trendUp: false, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const recentActivities = [
  { id: 1, type: 'irmao', title: 'Novo Irmão Registrado', description: 'Ir. Carlos Alberto foi admitido no Capítulo 01.', time: '2 horas atrás' },
  { id: 2, type: 'financeiro', title: 'Pagamento Recebido', description: 'Capítulo 15 efetuou o pagamento da anuidade.', time: '5 horas atrás' },
  { id: 3, type: 'venda', title: 'Venda Concluída', description: 'Pedido #4582 enviado para Capítulo 08.', time: 'Ontem' },
  { id: 4, type: 'capitulo', title: 'Capítulo Atualizado', description: 'Capítulo 22 atualizou os dados de diretoria.', time: '2 dias atrás' },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Painel de Controle</h1>
          <p className="text-on-surface-variant">Bem-vindo ao sistema administrativo do SGCARSP.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-on-surface shadow-sm border border-outline-variant hover:bg-surface-container-low transition-colors">
            <Clock className="mr-2 h-4 w-4" />
            Relatório Rápido
          </button>
          <button className="btn-primary px-4 py-2 text-sm">
            Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn('rounded-lg p-3', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <div className={cn('flex items-center text-xs font-medium', stat.trendUp ? 'text-emerald-600' : 'text-red-600')}>
                    {stat.trend}
                    {stat.trendUp ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-on-surface-variant">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-on-surface">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visão Geral Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#af2b3e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#af2b3e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#666' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#af2b3e" 
                    fillOpacity={1} 
                    fill="url(#colorRec)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capítulos por Cidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'São Paulo', total: 12 },
                  { name: 'Campinas', total: 5 },
                  { name: 'Santos', total: 3 },
                  { name: 'Ribeirão', total: 4 },
                  { name: 'SJC', total: 2 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: '#f9f9f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="total" fill="#af2b3e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex space-x-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-on-surface">{activity.title}</p>
                    <p className="text-xs text-on-surface-variant">{activity.description}</p>
                    <p className="text-[10px] text-outline">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
