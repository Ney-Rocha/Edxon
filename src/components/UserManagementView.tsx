import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  Edit
} from 'lucide-react';
import { User, Role, UserStatus } from '../types';

interface UserManagementViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserManagementView({ users, setUsers }: UserManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Todos' | Role>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | UserStatus>('Todos');

  // New User Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('Usuário');
  const [newStatus, setNewStatus] = useState<UserStatus>('Ativo');

  // Editing User Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Deletion Confirmation state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Handle Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: User = {
      id: String(Math.floor(Math.random() * 9000) + 1000),
      name: newName,
      email: newEmail,
      role: newRole,
      status: newStatus,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newName)}`
    };

    setUsers((prev) => [newUser, ...prev]);
    setNewName('');
    setNewEmail('');
    setIsAdding(false);
  };

  // Handle Edit User
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
  };

  // Toggle Status
  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus: UserStatus =
            u.status === 'Ativo' ? 'Inativo' : u.status === 'Inativo' ? 'Pendente' : 'Ativo';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.includes(searchTerm);

    const matchesRole = roleFilter === 'Todos' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'Todos' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-sm text-slate-500">Cadastre colaboradores, monitore acessos e edite permissões de forma rápida.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition duration-200 shadow-md shadow-indigo-600/10 self-start"
        >
          <UserPlus className="h-4 w-4" />
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      {/* Add User Drawer Form */}
      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner transition-all animate-down">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-600" />
            <span>Inserir Credenciais do Novo Colaborador</span>
          </h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nome Completo</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex. Thiago Silveira"
                className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Corporativo</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Ex. thiago.s@educorp.com"
                className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cargo/Função</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Usuário">Usuário (Colaborador)</option>
                <option value="Admin">Administrador</option>
              </select>
            </div>

            <div className="space-y-1 flex items-end">
              <button
                type="submit"
                className="w-full text-xs font-bold bg-indigo-600 text-white rounded-xl py-2.5 hover:bg-indigo-700 transition"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Control Area (Search and Filters) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nome, email ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Role filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Função:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none bg-slate-50/50"
            >
              <option value="Todos">Todos</option>
              <option value="Admin">Admin</option>
              <option value="Usuário">Usuário</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none bg-slate-50/50"
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-xs font-bold text-slate-400">
                <th className="py-3 px-6 text-slate-500">ID</th>
                <th className="py-3 px-6 text-slate-500">Colaborador</th>
                <th className="py-3 px-6 text-slate-500">Email</th>
                <th className="py-3 px-6 text-slate-500">Função</th>
                <th className="py-3 px-6 text-slate-500">Status</th>
                <th className="py-3 px-6 text-slate-500 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-medium text-slate-400">
                    Nenhum colaborador corresponde aos filtros indicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400 whitespace-nowrap">#{u.id}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-9 w-9 rounded-full bg-slate-100 object-cover border border-slate-200/50"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-slate-800 text-xs">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">{u.email}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'Admin'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100/50'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        title="Clique para alternar o status"
                        className="flex items-center gap-1.5 focus:outline-none group hover:underline"
                      >
                        {u.status === 'Ativo' ? (
                          <span className="flex items-center text-emerald-700 text-xs font-bold gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Ativo</span>
                          </span>
                        ) : u.status === 'Pendente' ? (
                          <span className="flex items-center text-amber-700 text-xs font-bold gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
                            <span>Pendente</span>
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-700 text-xs font-bold gap-1">
                            <XCircle className="h-3.5 w-3.5 text-rose-400" />
                            <span>Inativo</span>
                          </span>
                        )}
                        <RefreshCw className="h-2.5 w-2.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Editar Usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-605 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Deletar Usuário"
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
        {/* Table footer info */}
        <div className="bg-slate-50/60 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center justify-between">
          <span>Mostrando {filteredUsers.length} de {users.length} cadastros globais</span>
          <span>Dica: Clique no status para alterná-lo rapidamente.</span>
        </div>
      </div>

      {/* Modern responsive overlay modal for editing a user */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Editar Colaborador</h3>
                <p className="text-[11px] text-slate-450 font-medium">Altere credenciais de acesso e perfil do colaborador.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Corporativo</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Classe/Função</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Usuário">Usuário (Colaborador)</option>
                    <option value="Admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status do Usuário</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase transition shadow-md shadow-indigo-600/10"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern responsive overlay modal for delete confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm">Excluir Colaborador?</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tem certeza de que deseja remover permanentemente o colaborador <strong>{userToDelete.name}</strong>? Essa operação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase transition shadow-md shadow-rose-600/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
