import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  User as UserIcon, 
  Edit, 
  Trash2, 
  IdCard,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  Save,
  X,
  Camera,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { irmaoService } from '@/services/irmaoService';
import { capituloService } from '@/services/capituloService';
import { financeiroService } from '@/services/financeiroService';
import { Irmao, Capitulo, Financeiro } from '@/types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { CarteirinhaModal } from '@/components/irmaos/CarteirinhaModal';

export function Irmaos() {
  const [irmaos, setIrmaos] = useState<Irmao[]>([]);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [captacoes, setCaptacoes] = useState<Financeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCapitulo, setSelectedCapitulo] = useState<string>('all');
  const [selectedIrmaoForCard, setSelectedIrmaoForCard] = useState<Irmao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIrmao, setEditingIrmao] = useState<Irmao | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Irmao>>({
    nome_completo: '',
    cpf: '',
    potencia: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    capitulo_id: '',
    cargo: '',
    data_admissao: '',
    foto_url: '',
    status: 'ativo',
    numero_registro: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [irmaosData, capitulosData, financeiroData] = await Promise.all([
        irmaoService.getAll(),
        capituloService.getAll(),
        financeiroService.getAll()
      ]);
      setIrmaos(irmaosData);
      setCapitulos(capitulosData);
      setCaptacoes(financeiroData.filter(t => t.categoria === 'Captação Anual'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (irmao?: Irmao) => {
    if (irmao) {
      setEditingIrmao(irmao);
      setFormData(irmao);
    } else {
      setEditingIrmao(null);
      setFormData({
        nome_completo: '',
        cpf: '',
        potencia: '',
        data_nascimento: '',
        email: '',
        telefone: '',
        endereco: '',
        capitulo_id: capitulos[0]?.id || '',
        cargo: 'Mestre Maçom',
        data_admissao: new Date().toISOString().split('T')[0],
        foto_url: '',
        status: 'ativo',
        numero_registro: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIrmao(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Validar tamanho (ex: 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await irmaoService.uploadFoto(file);
      setFormData(prev => ({ ...prev, foto_url: publicUrl }));
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert(error.message || 'Erro ao fazer upload da foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, created_at, ...rest } = formData;
      const dataToSave = {
        ...rest,
        foto_url: formData.foto_url?.trim() === '' ? null : formData.foto_url
      };

      if (editingIrmao) {
        await irmaoService.update(editingIrmao.id, dataToSave);
      } else {
        await irmaoService.create(dataToSave as Omit<Irmao, 'id' | 'created_at'>);
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar irmão:', error);
      const message = error.message || 'Erro desconhecido';
      const details = error.details || '';
      alert(`Erro ao salvar irmão: ${message}\n${details}\n\nVerifique se o CPF ou Registro já existem ou se as colunas do banco estão corretas.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este irmão?')) {
      try {
        await irmaoService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir irmão:', error);
        alert('Erro ao excluir irmão.');
      }
    }
  };

  const getCapituloNome = (id: string) => {
    return capitulos.find(c => c.id === id)?.nome || 'Não vinculado';
  };

  const filteredIrmaos = irmaos.filter(i => {
    const matchesSearch = i.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.cpf.includes(searchTerm) ||
      i.numero_registro.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCapitulo = selectedCapitulo === 'all' || i.capitulo_id === selectedCapitulo;
    
    return matchesSearch && matchesCapitulo;
  });

  const statusColors = {
    ativo: 'bg-emerald-50 text-emerald-700',
    inativo: 'bg-red-50 text-red-700',
    suspenso: 'bg-amber-50 text-amber-700',
    falecido: 'bg-slate-50 text-slate-700',
  };

  const captacaoStatusColors = {
    pago: 'text-emerald-600',
    pendente: 'text-amber-600',
    lancado: 'text-amber-600',
    cancelado: 'text-red-600',
  };

  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Irmãos</h1>
          <p className="text-on-surface-variant">Gestão de membros do Arco Real de São Paulo.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:space-x-3">
          <Button variant="outline" className="flex-1 md:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Exportar Lista
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex-1 md:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Novo Irmão
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <Input 
                  placeholder="Buscar por nome, CPF ou registro..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-on-surface-variant" />
                <select
                  value={selectedCapitulo}
                  onChange={(e) => setSelectedCapitulo(e.target.value)}
                  className="rounded-md border border-outline-variant bg-surface px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="all">Todos os Capítulos</option>
                  {capitulos.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} (Nº {c.numero})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-bold">Irmão</th>
                  <th className="px-4 py-3 font-bold">Capítulo</th>
                  <th className="px-4 py-3 font-bold">Admissão</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                      Carregando irmãos...
                    </td>
                  </tr>
                ) : filteredIrmaos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                      Nenhum irmão encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredIrmaos.map((irmao) => (
                    <tr 
                      key={irmao.id} 
                      className="group cursor-pointer transition-colors hover:bg-surface-container-low"
                      onClick={() => handleOpenModal(irmao)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-outline-variant bg-surface-container-low">
                            {irmao.foto_url ? (
                              <img src={irmao.foto_url} alt={irmao.nome_completo} className="h-full w-full object-cover" />
                            ) : (
                              <UserIcon className="h-full w-full p-2 text-outline" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-bold text-on-surface">{irmao.nome_completo}</p>
                            <p className="text-xs text-on-surface-variant">{irmao.numero_registro}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-on-surface-variant">
                          <Building2 className="mr-2 h-4 w-4 shrink-0" />
                          <span>{getCapituloNome(irmao.capitulo_id)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant">
                        {new Date(irmao.data_admissao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase',
                          statusColors[irmao.status as keyof typeof statusColors]
                        )}>
                          {irmao.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedIrmaoForCard(irmao)}
                            title="Carteirinha"
                            className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            <IdCard className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(irmao)}
                            title="Editar"
                            className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(irmao.id)}
                            title="Excluir"
                            className="rounded-md p-2 text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
        title={editingIrmao ? 'Editar Irmão' : 'Novo Irmão'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div 
              className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center transition-colors hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-[10px] font-medium text-on-surface-variant">Subindo...</span>
                </div>
              ) : formData.foto_url ? (
                <>
                  <img src={formData.foto_url} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Camera className="h-8 w-8 text-outline" />
                  <span className="text-[10px] font-medium text-on-surface-variant">Clique para subir</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Foto do Perfil</label>
              <div className="flex space-x-2">
                <Input 
                  name="foto_url" 
                  value={formData.foto_url} 
                  onChange={handleInputChange} 
                  placeholder="URL da imagem ou suba um arquivo"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Subir Foto
                </Button>
              </div>
              <p className="text-[10px] text-on-surface-variant">Clique no quadro ou no botão para selecionar uma imagem do seu computador.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input 
                name="nome_completo" 
                value={formData.nome_completo} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <Input 
                name="cpf" 
                value={formData.cpf} 
                onChange={handleInputChange} 
                required 
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Potência</label>
              <Input 
                name="potencia" 
                value={formData.potencia} 
                onChange={handleInputChange} 
                required 
                placeholder="Ex: GOSP, GLESP..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Nascimento</label>
              <Input 
                type="date" 
                name="data_nascimento" 
                value={formData.data_nascimento} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nº Registro (CIM/Matrícula)</label>
              <Input 
                name="numero_registro" 
                value={formData.numero_registro} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
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
              <label className="text-sm font-medium">Endereço Completo</label>
              <Input 
                name="endereco" 
                value={formData.endereco} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capítulo</label>
              <select
                name="capitulo_id"
                value={formData.capitulo_id}
                onChange={handleInputChange}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                required
              >
                <option value="">Selecione um capítulo</option>
                {capitulos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} (Nº {c.numero})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo/Grau</label>
              <Input 
                name="cargo" 
                value={formData.cargo} 
                onChange={handleInputChange} 
                required 
                placeholder="Ex: Mestre Maçom"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Admissão</label>
              <Input 
                type="date" 
                name="data_admissao" 
                value={formData.data_admissao} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="falecido">Falecido</option>
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

      {selectedIrmaoForCard && (
        <CarteirinhaModal 
          irmao={selectedIrmaoForCard} 
          onClose={() => setSelectedIrmaoForCard(null)} 
        />
      )}
    </div>
  );
}
