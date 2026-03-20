import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search, 
  MoreVertical,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Trash2,
  Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase, adminClient } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Usuarios() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit user state
  const [editRole, setEditRole] = useState<UserRole>('consulta');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // New user state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('inativo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    setLoading(true);
    try {
      console.log('Iniciando busca de usuários na tabela profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }
      
      console.log('Usuários retornados do banco:', data);
      setUsuarios(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      alert(`Erro ao carregar usuários: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      // 1. Update Profile in public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: editDisplayName,
          role: editRole,
          email: editEmail
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // 2. Update Auth User if email changed (requires service role)
      if (editEmail !== selectedUser.email) {
        const { error: authError } = await adminClient.auth.admin.updateUserById(
          selectedUser.id,
          { email: editEmail }
        );
        if (authError) {
          console.warn('Erro ao atualizar email no Auth (pode exigir service role):', authError);
        }
      }

      alert('Usuário atualizado com sucesso!');
      loadUsuarios();
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      alert(`Erro ao atualizar usuário: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newDisplayName) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user in Auth using adminClient (so current user doesn't get logged out)
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: newEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          display_name: newDisplayName,
          role: newRole
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // The trigger on_auth_user_created should handle the profile creation,
        // but let's make sure the role is correct if it's not handled by the trigger
        // or if we want to be explicit.
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            display_name: newDisplayName,
            role: newRole 
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.warn('Erro ao atualizar perfil (pode já ter sido criado pelo trigger):', profileError);
        }
      }

      alert('Usuário criado com sucesso!');
      setIsAdding(false);
      setNewEmail('');
      setNewPassword('');
      setNewDisplayName('');
      setNewRole('inativo');
      loadUsuarios();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro ao criar usuário: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    (u.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    secretario: 'bg-blue-100 text-blue-700 border-blue-200',
    financeiro: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    consulta: 'bg-slate-100 text-slate-700 border-slate-200',
    inativo: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const roleLabels = {
    admin: 'Administrador',
    secretario: 'Secretário',
    financeiro: 'Financeiro',
    consulta: 'Consulta',
    inativo: 'Inativo',
  };

  const isMainAdmin = currentUser?.email === 'delamare@gmail.com';
  const hasServiceRole = !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (currentUser?.role !== 'admin' && !isMainAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-outline mb-4" />
          <h2 className="text-xl font-bold text-on-surface">Acesso Restrito</h2>
          <p className="text-on-surface-variant">Apenas administradores podem gerenciar usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Gestão de Usuários</h1>
          <p className="text-on-surface-variant">Gerencie os acessos e permissões do sistema.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Usuários Cadastrados</CardTitle>
                <p className="text-xs text-on-surface-variant mt-1">Total: {usuarios.length} usuários encontrados</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input 
                  placeholder="Buscar usuário..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant text-on-surface-variant">
                      <th className="pb-3 font-medium">Usuário</th>
                      <th className="pb-3 font-medium">Cargo</th>
                      <th className="pb-3 font-medium">Data de Cadastro</th>
                      <th className="pb-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredUsuarios.map((u) => (
                      <tr key={u.id} className="group hover:bg-surface-container-low transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {u.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{u.display_name}</p>
                              <p className="text-xs text-on-surface-variant">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            roleColors[u.role]
                          )}>
                            {roleLabels[u.role]}
                          </span>
                        </td>
                        <td className="py-4 text-on-surface-variant">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setEditRole(u.role);
                              setEditDisplayName(u.display_name || '');
                              setEditEmail(u.email || '');
                              setIsEditing(true);
                              setIsAdding(false);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details / Edit */}
        <div className="space-y-6">
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Cadastrar Novo Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasServiceRole && (
                    <div className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-700 border border-amber-200">
                      <strong>Atenção:</strong> A chave <code>VITE_SUPABASE_SERVICE_ROLE_KEY</code> não foi encontrada. 
                      A criação de usuários pode falhar ou deslogar você. 
                      Adicione-a em <strong>Settings &gt; Secrets</strong> para uma gestão segura.
                    </div>
                  )}
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Completo</label>
                      <Input 
                        required
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-mail</label>
                      <Input 
                        required
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Senha Temporária</label>
                      <Input 
                        required
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cargo Inicial</label>
                      <select 
                        className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                      >
                        <option value="inativo">Inativo (Requer aprovação)</option>
                        <option value="consulta">Consulta</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="secretario">Secretário</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit"
                        className="flex-1" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsAdding(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : isEditing && selectedUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Editar Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-xl">
                        {selectedUser.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{selectedUser.display_name}</p>
                        <p className="text-xs text-on-surface-variant">{selectedUser.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Completo</label>
                      <Input 
                        required
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder="Ex: João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-mail</label>
                      <Input 
                        required
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="joao@exemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cargo / Nível de Acesso</label>
                      <select 
                        className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                      >
                        <option value="inativo">Inativo (Sem acesso)</option>
                        <option value="consulta">Consulta (Apenas leitura)</option>
                        <option value="financeiro">Financeiro (Gestão de pagamentos)</option>
                        <option value="secretario">Secretário (Gestão de membros)</option>
                        <option value="admin">Administrador (Acesso total)</option>
                      </select>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit"
                        className="flex-1" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedUser(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo de Acessos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Total de Usuários</span>
                  <span className="font-bold">{usuarios.length}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <div key={role} className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <div className={cn("mr-2 h-2 w-2 rounded-full", 
                          role === 'admin' ? 'bg-red-500' : 
                          role === 'secretario' ? 'bg-blue-500' : 
                          role === 'financeiro' ? 'bg-emerald-500' : 
                          role === 'inativo' ? 'bg-orange-500' : 'bg-slate-400'
                        )} />
                        {label}
                      </div>
                      <span className="font-medium">
                        {usuarios.filter(u => u.role === role).length}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-outline-variant">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Novos usuários cadastrados via tela de login recebem automaticamente o cargo de <strong>Consulta</strong>. 
                    Administradores devem elevar o cargo conforme necessário.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
