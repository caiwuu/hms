"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import AvatarUpload from '@/components/AvatarUpload';
import Image from 'next/image';
import { useMessage } from '@/components/MessageProvider';
import ConfirmDialog from '@/components/ConfirmDialog';


// 定义类型
interface User {
  id: number;
  name: string;
  username: string;
  password?: string;
  avatar: string | null;
}

interface ChoreType {
  id: number;
  name: string;
  icon: string | null;
  weight: number;
  description?: string | null;
}

export default function SettingsPage() {
  const { showMessage } = useMessage();
  const [activeTab, setActiveTab] = useState("choreTypes");
  
  // 状态
  const [choreTypes, setChoreTypes] = useState<ChoreType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingType, setEditingType] = useState<ChoreType | null>(null);
  const [newType, setNewType] = useState<Omit<ChoreType, 'id'>>({ 
    name: "", 
    weight: 1.0, 
    icon: "🧹",
    description: null
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ 
    name: "",
    username: "",
    password: "",
    avatar: null 
  });

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // 图标选择
  const availableIcons = ["🍽️", "🧹", "🍳", "👕", "🛒", "🚿", "🚽", "📚", "🧺", "🧴"];

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 获取家务类型
        const typesResponse = await fetch('/api/choreTypes');
        if (!typesResponse.ok) {
          throw new Error('获取家务类型失败');
        }
        const typesData = await typesResponse.json();
        setChoreTypes(typesData);
        
        // 获取用户列表
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('获取用户列表失败');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
      } catch (err) {
        console.error('获取数据错误:', err);
        setError('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // 添加家务类型
  const handleAddChoreType = async () => {
    if (!newType.name.trim()) {
      showMessage('error', '请输入家务类型名称');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/choreTypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newType),
      });
      
      if (!response.ok) {
        throw new Error('添加家务类型失败');
      }
      
      const newChoreType = await response.json();
      
      // 更新本地数据
      setChoreTypes([...choreTypes, newChoreType]);
      // 重置表单
      setNewType({ name: "", weight: 1.0, icon: "🧹", description: null });
      showMessage('success', '添加家务类型成功');
      
    } catch (err) {
      console.error('添加家务类型错误:', err);
      showMessage('error', '添加家务类型失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  // 更新家务类型
  const handleUpdateChoreType = async () => {
    if (!editingType || !editingType.name.trim()) {
      showMessage('error', '请输入有效的家务类型名称');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/choreTypes/${editingType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingType),
      });
      
      if (!response.ok) {
        throw new Error('更新家务类型失败');
      }
      
      const updatedChoreType = await response.json();
      
      // 更新本地数据
      setChoreTypes(
        choreTypes.map((type) => (type.id === updatedChoreType.id ? updatedChoreType : type))
      );
      // 关闭编辑状态
      setEditingType(null);
      showMessage('success', '更新家务类型成功');
      
    } catch (err) {
      console.error('更新家务类型错误:', err);
      showMessage('error', '更新家务类型失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除家务类型
  const handleDeleteChoreType = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "删除家务类型",
      message: "确定要删除这个家务类型吗？这将同时删除与之相关的所有家务记录！",
      onConfirm: async () => {
        try {
          setSubmitting(true);
          
          const response = await fetch(`/api/choreTypes/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('删除家务类型失败');
          }
          
          // 更新本地数据
          setChoreTypes(choreTypes.filter((type) => type.id !== id));
          showMessage('success', '删除家务类型成功');
          
        } catch (err) {
          console.error('删除家务类型错误:', err);
          showMessage('error', '删除家务类型失败，请稍后再试');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  // 添加家庭成员
  const handleAddFamilyMember = async () => {
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password) {
      showMessage('error', '请填写完整信息');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (!response.ok) {
        throw new Error('添加家庭成员失败');
      }
      
      const newMember = await response.json();
      
      // 更新本地数据
      setUsers([...users, newMember]);
      // 重置表单
      setNewUser({ name: "", username: "", password: "", avatar: null });
      showMessage('success', '添加家庭成员成功');
      
    } catch (err) {
      console.error('添加家庭成员错误:', err);
      showMessage('error', '添加家庭成员失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  // 更新家庭成员
  const handleUpdateFamilyMember = async () => {
    if (!editingUser || !editingUser.name.trim()) {
      showMessage('error', '请输入有效的家庭成员名称');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });
      
      if (!response.ok) {
        throw new Error('更新家庭成员失败');
      }
      
      const updatedMember = await response.json();
      
      // 更新本地数据
      setUsers(
        users.map((user) => (user.id === updatedMember.id ? updatedMember : user))
      );
      // 关闭编辑状态
      setEditingUser(null);
      showMessage('success', '更新家庭成员成功');
      
    } catch (err) {
      console.error('更新家庭成员错误:', err);
      showMessage('error', '更新家庭成员失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除家庭成员
  const handleDeleteFamilyMember = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "删除家庭成员",
      message: "确定要删除这个家庭成员吗？这将同时删除与之相关的所有家务记录！",
      onConfirm: async () => {
        try {
          setSubmitting(true);
          
          const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('删除家庭成员失败');
          }
          
          // 更新本地数据
          setUsers(users.filter((user) => user.id !== id));
          showMessage('success', '删除家庭成员成功');
          
        } catch (err) {
          console.error('删除家庭成员错误:', err);
          showMessage('error', '删除家庭成员失败，请稍后再试');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">正在加载数据...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h1>
          <p className="text-gray-600 dark:text-gray-400">配置家务管理系统</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {/* 选项卡 */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("choreTypes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "choreTypes"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              家务类型管理
            </button>
            <button
              onClick={() => setActiveTab("familyMembers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "familyMembers"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              家庭成员管理
            </button>
          </nav>
        </div>
        
        {/* 家务类型管理 */}
        {activeTab === "choreTypes" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">家务类型</h2>
              <div className="grid grid-cols-1 gap-4 w-full">
                <input
                  type="text"
                  placeholder="名称"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                />
                <div className="relative">
                  <select
                    value={newType.icon || ""}
                    onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  >
                    {availableIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="权重"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={newType.weight}
                  onChange={(e) => setNewType({ ...newType, weight: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={handleAddChoreType}
                  disabled={submitting}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  添加类型
                </button>
              </div>
            </div>
            
            {/* 在中等屏幕及以上时使用网格布局 */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-4 w-full">
              <input
                type="text"
                placeholder="名称"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
              <div className="relative">
                <select
                  value={newType.icon || ""}
                  onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                >
                  {availableIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                placeholder="权重"
                step="0.1"
                min="0.1"
                max="10"
                value={newType.weight}
                onChange={(e) => setNewType({ ...newType, weight: parseFloat(e.target.value) })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleAddChoreType}
                disabled={submitting}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                添加类型
              </button>
            </div>
            
            {/* 家务类型列表 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">图标</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">名称</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">权重</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {choreTypes.map((type) => (
                    <tr key={type.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl">{type.icon}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingType?.id === type.id ? (
                          <input
                            type="text"
                            value={editingType.name}
                            onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingType?.id === type.id ? (
                          <input
                            type="number"
                            value={editingType.weight}
                            onChange={(e) => setEditingType({ ...editingType, weight: parseFloat(e.target.value) })}
                            step="0.1"
                            min="0.1"
                            max="10"
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{type.weight.toFixed(1)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingType?.id === type.id ? (
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={handleUpdateChoreType}
                              disabled={submitting}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setEditingType(null)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => setEditingType(type)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChoreType(type.id)}
                              disabled={submitting}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* 家庭成员管理 */}
        {activeTab === "familyMembers" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">添加新成员</h2>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-6 md:space-y-0">
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <AvatarUpload 
                      currentAvatar={newUser.avatar}
                      onAvatarChange={(url) => setNewUser({ ...newUser, avatar: url })}
                      size="lg"
                    />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <label htmlFor="newUserName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        成员名称
                      </label>
                      <input
                        id="newUserName"
                        type="text"
                        placeholder="请输入名称"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        用户名
                      </label>
                      <input
                        id="newUsername"
                        type="text"
                        placeholder="请输入用户名"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        密码
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="请输入密码"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-transparent dark:text-transparent mb-2">
                        操作
                      </label>
                      <button
                        onClick={handleAddFamilyMember}
                        disabled={submitting || !newUser.name || !newUser.username || !newUser.password}
                        className="w-full flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        添加成员
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">家庭成员列表</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {editingUser?.id === member.id ? (
                      <div className="flex flex-col items-center space-y-4">
                        <AvatarUpload 
                          currentAvatar={editingUser.avatar} 
                          onAvatarChange={(url) => setEditingUser({ ...editingUser, avatar: url })}
                          size="lg"
                        />
                        
                        <div className="w-full mt-4">
                          <label htmlFor={`name-${member.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            成员名称
                          </label>
                          <input
                            id={`name-${member.id}`}
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        
                        <div className="flex space-x-3 mt-2 w-full">
                          <button
                            onClick={handleUpdateFamilyMember}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm disabled:opacity-50"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="mb-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <Image
                              src={member.avatar || "/avatars/default.png"}
                              alt={member.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          {member.name}
                        </h3>
                        <div className="flex space-x-3 mt-2">
                          <button
                            onClick={() => setEditingUser(member)}
                            className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteFamilyMember(member.id)}
                            disabled={submitting}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 