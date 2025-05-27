import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { rolesAPI, permissionsAPI } from '../../services/api';
import { Role, Permission, RoleCreateInput } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<RoleCreateInput>({
    name: '',
    description: '',
    permissions: [],
  });

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesData, permissionsData] = await Promise.all([
          rolesAPI.getAll(),
          permissionsAPI.getAll(),
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load roles and permissions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const newRole = await rolesAPI.create(formData);
        setRoles([...roles, newRole]);
      } else if (selectedRole) {
        const updatedRole = await rolesAPI.update({
          id: selectedRole.id,
          ...formData,
        });
        setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save role:', err);
      setError('Failed to save role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await rolesAPI.delete(roleId);
        setRoles(roles.filter(r => r.id !== roleId));
      } catch (err) {
        console.error('Failed to delete role:', err);
        setError('Failed to delete role. Please try again.');
      }
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Управление ролями
        </h2>
        <Button 
          onClick={openCreateModal} 
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить роль
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Поиск ролей..."
          value={searchTerm}
          onChange={handleSearchChange}
          icon={<Search className="h-5 w-5 text-gray-400" />}
          fullWidth
        />
      </div>

      {error && (
        <div className="mb-6 p-3 bg-error-100 dark:bg-error-900/40 text-error-800 dark:text-error-300 text-sm rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-16 text-gray-600 dark:text-gray-400">
          Роли не найдены. {searchTerm ? 'Попробуйте изменить поисковый запрос.' : ''}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRoles.map(role => (
            <Card key={role.id} className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {role.description}
                    </p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Разрешения:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map(permission => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                          >
                            {permission.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {modalMode === 'create' ? 'Добавить роль' : 'Редактировать роль'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Название роли"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Разрешения
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {permissions.map(permission => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-white">
                          {permission.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeModal} type="button">
                    Отмена
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {modalMode === 'create' ? 'Создать' : 'Сохранить'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;