
import React, { useState } from 'react';
import { Trash2, Plus, Users, Building, ChevronDown, Tag } from 'lucide-react';
import { MOCK_BRANDS, MOCK_USERS, MOCK_CATEGORIES, MOCK_INFLUENCERS } from '../constants';
import { Card, Button } from '../components/UI';
import { User, Brand, CreatorCategory } from '../types';

export const Settings = () => {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [categories, setCategories] = useState<CreatorCategory[]>(MOCK_CATEGORIES);
  
  const [newBrandName, setNewBrandName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // --- Brand Handlers ---
  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    const newBrand: Brand = {
      id: Date.now().toString(),
      name: newBrandName
    };
    setBrands([...brands, newBrand]);
    setNewBrandName('');
  };

  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter(b => b.id !== id));
  };

  // --- User Handlers ---
  const handleAddUser = () => {
    if (!newUserEmail.trim()) return;
    const newUser: User = {
      id: Date.now().toString(),
      name: newUserEmail.split('@')[0] || 'New User',
      email: newUserEmail,
      role: 'Viewer',
      status: 'Pending'
    };
    setUsers([...users, newUser]);
    setNewUserEmail('');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  // --- Category Handlers ---
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: CreatorCategory = {
      id: 'cat-' + Date.now().toString(),
      name: newCategoryName
    };
    setCategories([...categories, newCat]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Helper to get count
  const getCategoryCount = (categoryName: string) => {
    return MOCK_INFLUENCERS.filter(i => i.category === categoryName).length;
  };

  return (
    <div className="p-6 mx-auto space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Workspace Settings</h2>
        <p className="text-sm text-gray-500">Manage your brands, team members, and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Management - 1 Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Building className="text-gray-400" size={18} />
            <h3 className="text-base font-bold text-gray-800">Brands</h3>
          </div>
          <Card className="h-full">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New brand name..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm bg-white text-gray-900"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
              />
              <Button icon={Plus} onClick={handleAddBrand} className="px-3 py-2" />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {brands.map(brand => (
                <div key={brand.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700 text-sm">{brand.name}</span>
                  <button 
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {brands.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">No brands added yet.</div>
              )}
            </div>
          </Card>
        </div>

         {/* Category Management - 1 Column (New) */}
         <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="text-gray-400" size={18} />
            <h3 className="text-base font-bold text-gray-800">Creator Categories</h3>
          </div>
          <Card className="h-full">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. Skin, Hair, Tech..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm bg-white text-gray-900"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button icon={Plus} onClick={handleAddCategory} className="px-3 py-2" />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full" title="Creators in this category">
                      {getCategoryCount(cat.name)}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">No categories added.</div>
              )}
            </div>
          </Card>
        </div>

        {/* User Management - Full Width below or next to it */}
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center gap-2">
            <Users className="text-gray-400" size={18} />
            <h3 className="text-base font-bold text-gray-800">Team Members</h3>
          </div>
          <Card className="p-0 overflow-hidden h-full">
             <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex gap-3">
                <input
                  type="text"
                  placeholder="Invite by email..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm bg-white text-gray-900"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <Button icon={Plus} onClick={handleAddUser} className="py-2">Invite</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative group w-24">
                          <select 
                            value={user.role}
                            onChange={(e) => handleUpdateUser(user.id, { role: e.target.value as any })}
                            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-2 pr-6 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-indigo-300 transition-colors"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
