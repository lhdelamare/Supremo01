import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Building2,
  Filter,
  Download,
  Save,
  X,
  Users,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  IdCard,
  User as UserIcon,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { capituloService } from '@/services/capituloService';
import { irmaoService } from '@/services/irmaoService';
import { financeiroService } from '@/services/financeiroService';
import { Capitulo, Irmao, Financeiro } from '@/types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const statusColors = {
  ativo: 'bg-emerald-500 text-white',
  inativo: 'bg-slate-500 text-white',
  suspenso: 'bg-amber-500 text-white',
  falecido: 'bg-black text-white'
};

export function Capitulos() {
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCapitulo, setEditingCapitulo] = useState<Capitulo | null>(null);
  
  // Membros do capítulo
  const [selectedCapituloForMembers, setSelectedCapituloForMembers] = useState<Capitulo | null>(null);
  const [members, setMembers] = useState<Irmao[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  
  // Detalhes do irmão
  const [selectedIrmaoDetail, setSelectedIrmaoDetail] = useState<Irmao | null>(null);
  const [isIrmaoDetailModalOpen, setIsIrmaoDetailModalOpen] = useState(false);
  const [irmaoHistory, setIrmaoHistory] = useState<Financeiro[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [formData, setFormData] = useState<Partial<Capitulo>>({
    nome: '',
    numero: 0,
    cidade: '',
    estado: '',
    data_fundacao: '',
    responsavel: '',
    email: '',
    telefone: '',
    status: 'ativo'
  });

  useEffect(() => {
    loadCapitulos();
  }, []);

  async function loadCapitulos() {
    setLoading(true);
    try {
      const data = await capituloService.getAll();
      setCapitulos(data);
    } catch (error) {
      console.error('Erro ao carregar capítulos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (capitulo?: Capitulo) => {
    if (capitulo) {
      setEditingCapitulo(capitulo);
      setFormData(capitulo);
    } else {
      setEditingCapitulo(null);
      setFormData({
        nome: '',
        numero: 0,
        cidade: '',
        estado: '',
        data_fundacao: '',
        responsavel: '',
        email: '',
        telefone: '',
        status: 'ativo'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCapitulo(null);
  };

  const handleOpenMembersModal = async (capitulo: Capitulo) => {
    setSelectedCapituloForMembers(capitulo);
    setIsMembersModalOpen(true);
    setLoadingMembers(true);
    try {
      const data = await irmaoService.getByCapituloId(capitulo.id);
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCloseMembersModal = () => {
    setIsMembersModalOpen(false);
    setSelectedCapituloForMembers(null);
    setMembers([]);
  };

  const handleOpenIrmaoDetail = async (irmao: Irmao) => {
    setSelectedIrmaoDetail(irmao);
    setIsIrmaoDetailModalOpen(true);
    setLoadingHistory(true);
    try {
      const history = await financeiroService.getByIrmaoId(irmao.id);
      setIrmaoHistory(history.filter(h => h.categoria === 'Captação Anual'));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseIrmaoDetail = () => {
    setIsIrmaoDetailModalOpen(false);
    setSelectedIrmaoDetail(null);
    setIrmaoHistory([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numero' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCapitulo) {
        await capituloService.update(editingCapitulo.id, formData);
      } else {
        await capituloService.create(formData as Omit<Capitulo, 'id' | 'created_at'>);
      }
      handleCloseModal();
      loadCapitulos();
    } catch (error: any) {
      console.error('Erro ao salvar capítulo:', error);
      alert(`Erro ao salvar capítulo: ${error.message || 'Verifique os dados e tente novamente.'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este capítulo?')) {
      try {
        await capituloService.delete(id);
        loadCapitulos();
      } catch (error) {
        console.error('Erro ao excluir capítulo:', error);
        alert('Erro ao excluir capítulo. Ele pode estar vinculado a irmãos.');
      }
    }
  };

  const filteredCapitulos = capitulos.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numero.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Capítulos</h1>
          <p className="text-on-surface-variant">Gerencie os capítulos federados ao SGCARSP.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Capítulo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input 
                placeholder="Buscar por nome, número ou cidade..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-medium">Capítulo</th>
                  <th className="px-4 py-3 font-medium">Localização</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                      Carregando capítulos...
                    </td>
                  </tr>
                ) : filteredCapitulos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                      Nenhum capítulo encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredCapitulos.map((capitulo, index) => (
                    <motion.tr 
                      key={capitulo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className="font-semibold text-on-surface">{capitulo.nome}</p>
                            <p className="text-xs text-on-surface-variant">Nº {capitulo.numero}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-on-surface">{capitulo.cidade}</p>
                        <p className="text-xs text-on-surface-variant">{capitulo.estado}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-on-surface">{capitulo.responsavel}</p>
                        <p className="text-xs text-on-surface-variant">{capitulo.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        {capitulo.status === 'ativo' ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenMembersModal(capitulo)}
                            title="Ver Membros"
                            className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(capitulo)}
                            title="Editar"
                            className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(capitulo.id)}
                            title="Excluir"
                            className="rounded-md p-2 text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCapitulo ? 'Editar Capítulo' : 'Novo Capítulo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Nome do Capítulo</label>
              <Input 
                name="nome" 
                value={formData.nome} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Número</label>
              <Input 
                type="number" 
                name="numero" 
                value={formData.numero} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Fundação</label>
              <Input 
                type="date" 
                name="data_fundacao" 
                value={formData.data_fundacao} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Input 
                name="cidade" 
                value={formData.cidade} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Input 
                name="estado" 
                value={formData.estado} 
                onChange={handleInputChange} 
                required 
                maxLength={2}
                placeholder="SP"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Responsável (Primeiro Principal)</label>
              <Input 
                name="responsavel" 
                value={formData.responsavel} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail de Contato</label>
              <Input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input 
                name="telefone" 
                value={formData.telefone} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Membros */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={handleCloseMembersModal}
        title={`Membros do Capítulo ${selectedCapituloForMembers?.nome}`}
        className="max-w-4xl"
      >
        <div className="space-y-4">
          {loadingMembers ? (
            <div className="py-10 text-center text-on-surface-variant">
              Carregando membros...
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant">
              Nenhum membro vinculado a este capítulo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Situação</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {members.map((irmao) => (
                    <tr key={irmao.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
                            {irmao.foto_url ? (
                              <img src={irmao.foto_url} alt={irmao.nome_completo} className="h-full w-full object-cover" />
                            ) : (
                              <UserIcon className="h-full w-full p-1.5 text-outline" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-on-surface">{irmao.nome_completo}</p>
                            <p className="text-[10px] text-on-surface-variant">{irmao.numero_registro}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center text-xs text-on-surface-variant">
                            <Mail className="mr-1.5 h-3 w-3" />
                            {irmao.email}
                          </div>
                          <div className="flex items-center text-xs text-on-surface-variant">
                            <Phone className="mr-1.5 h-3 w-3" />
                            {irmao.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                          statusColors[irmao.status as keyof typeof statusColors]
                        )}>
                          {irmao.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenIrmaoDetail(irmao)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={handleCloseMembersModal}>Fechar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalhes do Irmão */}
      <Modal
        isOpen={isIrmaoDetailModalOpen}
        onClose={handleCloseIrmaoDetail}
        title="Ficha do Irmão"
        className="max-w-2xl"
      >
        {selectedIrmaoDetail && (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                {selectedIrmaoDetail.foto_url ? (
                  <img src={selectedIrmaoDetail.foto_url} alt={selectedIrmaoDetail.nome_completo} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-full w-full p-6 text-outline" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-serif font-bold text-on-surface">{selectedIrmaoDetail.nome_completo}</h2>
                <p className="text-primary font-semibold">{selectedIrmaoDetail.numero_registro}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase',
                    statusColors[selectedIrmaoDetail.status as keyof typeof statusColors]
                  )}>
                    {selectedIrmaoDetail.status}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
                    {selectedIrmaoDetail.cargo}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-outline">Informações Pessoais</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <IdCard className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">CPF</p>
                      <p className="text-sm font-medium">{selectedIrmaoDetail.cpf}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">Data de Nascimento</p>
                      <p className="text-sm font-medium">{new Date(selectedIrmaoDetail.data_nascimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">E-mail</p>
                      <p className="text-sm font-medium">{selectedIrmaoDetail.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">Telefone</p>
                      <p className="text-sm font-medium">{selectedIrmaoDetail.telefone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-outline">Informações Maçônicas</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Building2 className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">Potência</p>
                      <p className="text-sm font-medium">{selectedIrmaoDetail.potencia}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">Data de Admissão</p>
                      <p className="text-sm font-medium">{new Date(selectedIrmaoDetail.data_admissao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="mr-3 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase text-outline">Endereço</p>
                      <p className="text-sm font-medium leading-tight">{selectedIrmaoDetail.endereco}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-outline-variant pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-outline">Histórico de Captações Anuais</h3>
              {loadingHistory ? (
                <p className="text-xs text-on-surface-variant">Carregando histórico...</p>
              ) : irmaoHistory.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Nenhuma captação registrada para este irmão.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {irmaoHistory.map(h => (
                    <div key={h.id} className="flex items-center justify-between rounded-lg border border-outline-variant p-3 bg-surface-container-low">
                      <div>
                        <p className="text-xs font-bold text-on-surface">{h.descricao}</p>
                        <p className="text-[10px] text-on-surface-variant">Vencimento: {new Date(h.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">R$ {h.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold uppercase',
                          h.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                          h.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        )}>
                          {h.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <Button onClick={handleCloseIrmaoDetail}>Fechar Ficha</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
