"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Plus, Filter, Search, Calendar, Check, X, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useMessage } from '@/components/MessageProvider';
import ConfirmDialog from '@/components/ConfirmDialog';

// 定义类型
interface User {
  id: number;
  name: string;
  avatar: string | null;
}

interface ChoreType {
  id: number;
  name: string;
  icon: string | null;
  weight: number;
  description?: string | null;
}

interface Chore {
  id: number;
  userId: number;
  choreTypeId: number;
  date: string;
  notes: string | null;
  verified: boolean;
  user: User;
  choreType: ChoreType;
  createdAt: string;
  updatedAt: string;
}

export default function ChoresPage() {
  const { showMessage } = useMessage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  
  // 添加新的状态
  const [chores, setChores] = useState<Chore[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [choreTypes, setChoreTypes] = useState<ChoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 获取家务记录
        const choresResponse = await fetch('/api/chores');
        if (!choresResponse.ok) {
          throw new Error('获取家务记录失败');
        }
        const choresData = await choresResponse.json();
        setChores(choresData);
        
        // 获取用户列表
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('获取用户列表失败');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // 获取家务类型
        const typesResponse = await fetch('/api/choreTypes');
        if (!typesResponse.ok) {
          throw new Error('获取家务类型失败');
        }
        const typesData = await typesResponse.json();
        setChoreTypes(typesData);
        
      } catch (err) {
        console.error('获取数据错误:', err);
        setError('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  
  // 验证家务记录
  const verifyChore = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/chores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('更新家务记录状态失败');
      }
      
      // 更新本地状态
      setChores(chores.map(chore => 
        chore.id === id 
          ? { ...chore, verified: !currentStatus } 
          : chore
      ));
      
    } catch (err) {
      console.error('验证家务记录失败:', err);
      alert('验证家务记录失败，请稍后再试');
    }
  };
  
  // 删除家务记录
  const deleteChore = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "删除家务记录",
      message: "确定要删除这条家务记录吗？",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/chores/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('删除家务记录失败');
          }
          
          // 更新本地状态
          setChores(chores.filter(chore => chore.id !== id));
          showMessage('success', '删除家务记录成功');
          
        } catch (err) {
          console.error('删除家务记录失败:', err);
          showMessage('error', '删除家务记录失败，请稍后再试');
        }
      },
    });
  };

  // 过滤家务记录
  const filteredRecords = chores.filter((record) => {
    // 搜索过滤
    if (
      searchTerm &&
      !record.choreType.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    ) {
      return false;
    }

    // 成员过滤
    if (selectedMember && record.userId !== selectedMember) {
      return false;
    }

    // 类型过滤
    if (selectedType && record.choreTypeId !== selectedType) {
      return false;
    }

    // 日期范围过滤
    if (dateRange.start && new Date(record.date) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(record.date) > new Date(dateRange.end)) {
      return false;
    }

    return true;
  });

  // 重置过滤器
  const resetFilters = () => {
    setSelectedMember(null);
    setSelectedType(null);
    setDateRange({ start: "", end: "" });
    setFilterOpen(false);
  };

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
        {/* 页面标题和操作 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">家务管理</h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看和管理家庭成员的家务记录
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索家务或成员..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white w-full"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter size={16} className="mr-2" /> 筛选
            </button>
            <Link
              href="/chores/add"
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>添加家务</span>
            </Link>
          </div>
        </div>

        {/* 过滤器面板 */}
        {filterOpen && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 成员筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  家庭成员
                </label>
                <div className="flex flex-wrap gap-2">
                  {users.map((member) => (
                    <button
                      key={member.id}
                      onClick={() =>
                        setSelectedMember(
                          selectedMember === member.id ? null : member.id
                        )
                      }
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        selectedMember === member.id
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden mr-1">
                        <Image
                          src={member.avatar || "/avatars/default.png"}
                          alt={member.name}
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            
              {/* 家务类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  家务类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {choreTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() =>
                        setSelectedType(selectedType === type.id ? null : type.id)
                      }
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        selectedType === type.id
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <span className="mr-1">{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            
              {/* 日期范围筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  日期范围
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="pl-10 pr-4 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white w-full"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="pl-10 pr-4 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 重置按钮 */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                重置筛选
              </button>
            </div>
          </div>
        )}

        {/* 家务记录列表 */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-6">
          {loading ? (
            <div className="py-10 text-center">
              <p className="text-gray-600 dark:text-gray-400">正在加载数据...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-600 dark:text-gray-400">没有找到符合条件的家务记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">日期</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">成员</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">家务类型</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">得分</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={record.user.avatar || "/avatars/default.png"}
                              alt={record.user.name}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{record.choreType.icon}</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {record.choreType.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400">
                        {record.choreType.weight}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.verified
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {record.verified ? "已验证" : "未验证"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => verifyChore(record.id, record.verified)}
                            className={`${
                              record.verified
                                ? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            }`}
                          >
                            {record.verified ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => deleteChore(record.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 