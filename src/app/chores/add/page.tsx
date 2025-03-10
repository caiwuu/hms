"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { ArrowLeft, Calendar, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function AddChorePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    choreTypeId: "",
    userId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    verified: false,
  });
  
  // 添加状态
  const [users, setUsers] = useState<User[]>([]);
  const [choreTypes, setChoreTypes] = useState<ChoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
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
        
        // 设置默认值
        if (usersData.length > 0) {
          setFormData(prev => ({ ...prev, userId: String(usersData[0].id) }));
        }
        if (typesData.length > 0) {
          setFormData(prev => ({ ...prev, choreTypeId: String(typesData[0].id) }));
        }
        
      } catch (err) {
        console.error('获取数据错误:', err);
        setError('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!formData.choreTypeId || !formData.userId || !formData.date) {
      alert('请填写所有必填字段！');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // 提交数据到API
      const response = await fetch('/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          choreTypeId: parseInt(formData.choreTypeId),
          userId: parseInt(formData.userId),
          date: formData.date,
          notes: formData.notes || null,
          verified: formData.verified,
        }),
      });
      
      if (!response.ok) {
        throw new Error('创建家务记录失败');
      }
      
      // 提交成功后跳转
      router.push("/chores");
      
    } catch (err) {
      console.error('提交数据错误:', err);
      setError('提交失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

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
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        {/* 页面标题和返回按钮 */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Link
              href="/chores"
              className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              添加家务记录
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            记录家庭成员完成的家务
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* 添加家务表单 */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* 选择家务类型 */}
          <div className="mb-6">
            <label
              htmlFor="choreType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              家务类型 <span className="text-red-500">*</span>
            </label>
            <select
              id="choreTypeId"
              name="choreTypeId"
              value={formData.choreTypeId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            >
              {choreTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name} ({type.weight} 分)
                </option>
              ))}
            </select>
          </div>

          {/* 选择家庭成员 */}
          <div className="mb-6">
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              家庭成员 <span className="text-red-500">*</span>
            </label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* 日期选择器 */}
          <div className="mb-6">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              完成日期 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* 备注 */}
          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              备注
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="添加关于该家务的备注信息..."
            ></textarea>
          </div>

          {/* 确认状态 */}
          <div className="mb-8">
            <div className="flex items-center">
              <input
                id="verified"
                name="verified"
                type="checkbox"
                checked={formData.verified}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="verified"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                已确认完成
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end">
            <Link
              href="/chores"
              className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  提交中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  保存家务记录
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 