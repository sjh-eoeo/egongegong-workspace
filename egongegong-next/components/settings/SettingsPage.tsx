'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Users, Building, Tag, Mail, Eye, EyeOff, Link, Check } from 'lucide-react';
import { useBrands, useUsers, useCategories, useZendeskAccounts } from '@/hooks/useCollection';
import { Card, Button } from '@/components/ui';
import { User, Brand, CreatorCategory, ZendeskAccount } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/components/Toast';
import { 
  createBrand, deleteBrand, updateBrand,
  createUser, updateUser, deleteUser,
  createCategory, deleteCategory,
  createZendeskAccount, updateZendeskAccount, deleteZendeskAccount
} from '@/lib/firebase/firestore';

export const SettingsPage = () => {
  const { addToast } = useToast();
  const { data: brandsData } = useBrands();
  const { data: usersData } = useUsers();
  const { data: categoriesData } = useCategories();
  const { data: zendeskAccountsData } = useZendeskAccounts();
  
  const brands = brandsData as Brand[];
  const users = usersData as User[];
  const categories = (categoriesData as CreatorCategory[]) || [];
  const zendeskAccounts = (zendeskAccountsData as ZendeskAccount[]) || [];
  
  const [newBrandName, setNewBrandName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Zendesk account form states
  const [showZendeskForm, setShowZendeskForm] = useState(false);
  const [zendeskForm, setZendeskForm] = useState({ name: '', subdomain: '', email: '', apiToken: '' });
  const [showToken, setShowToken] = useState(false);
  const [linkingBrand, setLinkingBrand] = useState<string | null>(null);

  // --- Brand Handlers ---
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      await createBrand({ name: newBrandName.trim() });
      addToast('success', 'Brand Added', `"${newBrandName}" has been added.`);
      setNewBrandName('');
    } catch (error) {
      console.error('Error adding brand:', error);
      addToast('error', 'Error', 'Failed to add brand.');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand(id);
      addToast('success', 'Brand Deleted', 'Brand has been removed.');
    } catch (error) {
      console.error('Error deleting brand:', error);
      addToast('error', 'Error', 'Failed to delete brand.');
    }
  };

  // --- User Handlers ---
  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return;
    try {
      await createUser({ 
        email: newUserEmail.trim(), 
        name: newUserEmail.split('@')[0],
        role: 'Manager',
        status: 'Pending'
      });
      addToast('success', 'User Invited', `Invitation sent to ${newUserEmail}.`);
      setNewUserEmail('');
    } catch (error) {
      console.error('Error adding user:', error);
      addToast('error', 'Error', 'Failed to add user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      addToast('success', 'User Removed', 'User has been removed.');
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast('error', 'Error', 'Failed to remove user.');
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      await updateUser(id, updates);
      addToast('success', 'User Updated', 'User settings have been saved.');
    } catch (error) {
      console.error('Error updating user:', error);
      addToast('error', 'Error', 'Failed to update user.');
    }
  };

  // --- Category Handlers ---
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ name: newCategoryName.trim() });
      addToast('success', 'Category Added', `"${newCategoryName}" has been added.`);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
      addToast('error', 'Error', 'Failed to add category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      addToast('success', 'Category Deleted', 'Category has been removed.');
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast('error', 'Error', 'Failed to delete category.');
    }
  };

  // --- Zendesk Account Handlers ---
  const handleAddZendeskAccount = async () => {
    if (!zendeskForm.name.trim() || !zendeskForm.subdomain.trim() || !zendeskForm.email.trim() || !zendeskForm.apiToken.trim()) {
      addToast('error', 'Error', 'Please fill in all fields.');
      return;
    }
    try {
      await createZendeskAccount({
        name: zendeskForm.name.trim(),
        subdomain: zendeskForm.subdomain.trim().replace('.zendesk.com', ''),
        email: zendeskForm.email.trim(),
        apiToken: zendeskForm.apiToken.trim()
      });
      addToast('success', 'Zendesk Account Added', `"${zendeskForm.name}" has been added.`);
      setZendeskForm({ name: '', subdomain: '', email: '', apiToken: '' });
      setShowZendeskForm(false);
    } catch (error) {
      console.error('Error adding Zendesk account:', error);
      addToast('error', 'Error', 'Failed to add Zendesk account.');
    }
  };

  const handleDeleteZendeskAccount = async (id: string) => {
    try {
      await deleteZendeskAccount(id);
      addToast('success', 'Zendesk Account Deleted', 'Account has been removed.');
    } catch (error) {
      console.error('Error deleting Zendesk account:', error);
      addToast('error', 'Error', 'Failed to delete account.');
    }
  };

  const handleLinkBrandToZendesk = async (brandId: string, zendeskAccountId: string | null) => {
    try {
      await updateBrand(brandId, { zendeskAccountId: zendeskAccountId || undefined });
      addToast('success', 'Brand Linked', 'Zendesk account has been linked.');
      setLinkingBrand(null);
    } catch (error) {
      console.error('Error linking brand:', error);
      addToast('error', 'Error', 'Failed to link account.');
    }
  };

  return (
    <Layout>
      <div className="p-6 mx-auto space-y-6 w-full">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Workspace Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your brands, team members, and configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brand Management */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Building className="text-gray-400" size={18} />
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Brands</h3>
            </div>
            <Card className="h-full">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New brand name..."
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                />
                <Button icon={Plus} onClick={handleAddBrand} className="px-3 py-2" />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {brands.map(brand => {
                  const linkedAccount = zendeskAccounts.find(z => z.id === brand.zendeskAccountId);
                  return (
                    <div key={brand.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{brand.name}</span>
                        <button 
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {/* Zendesk Link */}
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {linkingBrand === brand.id ? (
                          <select
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                            value={brand.zendeskAccountId || ''}
                            onChange={(e) => handleLinkBrandToZendesk(brand.id, e.target.value || null)}
                            autoFocus
                            onBlur={() => setLinkingBrand(null)}
                          >
                            <option value="">No Zendesk Account</option>
                            {zendeskAccounts.filter(z => z.isActive).map(z => (
                              <option key={z.id} value={z.id}>{z.name}</option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setLinkingBrand(brand.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Mail size={12} />
                            {linkedAccount ? (
                              <span className="flex items-center gap-1">
                                <Check size={10} className="text-green-500" />
                                {linkedAccount.name}
                              </span>
                            ) : (
                              <span>Link Zendesk</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {brands.length === 0 && (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">No brands added yet.</div>
                )}
              </div>
            </Card>
          </div>

          {/* Category Management */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="text-gray-400" size={18} />
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Creator Categories</h3>
            </div>
            <Card className="h-full">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. Skin, Hair, Tech..."
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button icon={Plus} onClick={handleAddCategory} className="px-3 py-2" />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{cat.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">No categories added yet.</div>
                )}
              </div>
            </Card>
          </div>

          {/* User Management */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="text-gray-400" size={18} />
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Team Members</h3>
            </div>
            <Card className="h-full">
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <Button icon={Plus} onClick={handleAddUser} className="px-3 py-2" />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value as User['role'] })}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Zendesk Accounts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="text-gray-400" size={18} />
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Zendesk Accounts</h3>
            </div>
            <Button 
              icon={Plus} 
              onClick={() => setShowZendeskForm(!showZendeskForm)}
              variant="secondary"
              className="text-xs"
            >
              Add Account
            </Button>
          </div>

          {/* Add Zendesk Account Form */}
          {showZendeskForm && (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Brand A Support"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={zendeskForm.name}
                    onChange={(e) => setZendeskForm({ ...zendeskForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomain</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="your-company"
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={zendeskForm.subdomain}
                      onChange={(e) => setZendeskForm({ ...zendeskForm, subdomain: e.target.value })}
                    />
                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl text-sm text-gray-500 dark:text-gray-400">
                      .zendesk.com
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Email</label>
                  <input
                    type="email"
                    placeholder="agent@company.com"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={zendeskForm.email}
                    onChange={(e) => setZendeskForm({ ...zendeskForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">API Token</label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={zendeskForm.apiToken}
                      onChange={(e) => setZendeskForm({ ...zendeskForm, apiToken: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setShowZendeskForm(false)}>Cancel</Button>
                <Button onClick={handleAddZendeskAccount}>Save Account</Button>
              </div>
            </Card>
          )}

          {/* Zendesk Accounts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zendeskAccounts.map(account => (
              <Card key={account.id} className="relative">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{account.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{account.subdomain}.zendesk.com</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <button
                      onClick={() => handleDeleteZendeskAccount(account.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p>Agent: {account.email}</p>
                </div>
                {/* Linked Brands */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Linked Brands:</p>
                  <div className="flex flex-wrap gap-1">
                    {brands.filter(b => b.zendeskAccountId === account.id).map(b => (
                      <span key={b.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300">
                        {b.name}
                      </span>
                    ))}
                    {brands.filter(b => b.zendeskAccountId === account.id).length === 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">No brands linked</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {zendeskAccounts.length === 0 && !showZendeskForm && (
              <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                No Zendesk accounts configured yet. Click &quot;Add Account&quot; to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
