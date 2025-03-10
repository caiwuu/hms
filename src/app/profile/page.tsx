"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import {  Moon, Sun, Bell, BellOff, Loader2 } from "lucide-react";
import Image from 'next/image';

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
}

interface Chore {
  id: number;
  date: string;
  user: User;
  choreType: ChoreType;
  notes: string | null;
  verified: boolean;
}

interface UserStats {
  id: number;
  name: string;
  avatar: string | null;
  totalPoints: number;
  choreCount: number;
}


export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // 状态
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentChores, setRecentChores] = useState<Chore[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>(1); // 默认选择第一个用户
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<Record<string, string | null>>({});

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
        
        if (usersData.length > 0) {
          setSelectedUser(usersData[0].id);
        }
        
        // 获取统计数据
        const statsResponse = await fetch('/api/statistics');
        if (!statsResponse.ok) {
          throw new Error('获取统计数据失败');
        }
        const statsData = await statsResponse.json();
        
        if (statsData.userStats && statsData.userStats.length > 0) {
          setUserStats(statsData.userStats[0]); // 暂时只显示第一个用户的数据
        }
        
        if (statsData.recentChores) {
          setRecentChores(statsData.recentChores.filter((chore: Chore) => 
            chore.user.id === usersData[0].id
          ).slice(0, 5));
        }
        
        // 获取设置
        const settingsResponse = await fetch('/api/settings');
        if (!settingsResponse.ok) {
          throw new Error('获取设置失败');
        }
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
        
        // 应用设置
        if (settingsData.darkMode) {
          setDarkMode(settingsData.darkMode === 'true');
        }
        
        if (settingsData.notifications) {
          setNotifications(settingsData.notifications === 'true');
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
  
  // 获取特定用户数据
  useEffect(() => {
    if (!selectedUser || !users.length) return;
    
    async function fetchUserData() {
      try {
        // 获取统计数据
        const statsResponse = await fetch('/api/statistics');
        if (!statsResponse.ok) {
          throw new Error('获取统计数据失败');
        }
        const statsData = await statsResponse.json();
        
        // 找到选中用户的数据
        const userStatsData = statsData.userStats.find((stats: UserStats) => 
          stats.id === selectedUser
        );
        
        if (userStatsData) {
          setUserStats(userStatsData);
        }
        
        // 过滤用户的家务记录
        if (statsData.recentChores) {
          setRecentChores(statsData.recentChores.filter((chore: Chore) => 
            chore.user.id === selectedUser
          ).slice(0, 5));
        }
        
      } catch (err) {
        console.error('获取用户数据错误:', err);
      }
    }
    
    fetchUserData();
  }, [selectedUser, users]);

  // 保存设置
  const saveSettings = async (key: string, value: string) => {
    try {
      // setSubmitting(true);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      
      if (!response.ok) {
        throw new Error('保存设置失败');
      }
      
      // 更新本地设置
      setSettings({
        ...settings,
        [key]: value,
      });
      
    } catch (err) {
      console.error('保存设置错误:', err);
      alert('保存设置失败，请稍后再试');
    } finally {
      // setSubmitting(false);
    }
  };

  // 切换主题
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    saveSettings('darkMode', newValue.toString());
  };
  
  // 切换通知
  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    saveSettings('notifications', newValue.toString());
  };
  
  // 切换用户
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(parseInt(e.target.value));
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

  if (!userStats) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">
              {error || '无法加载用户数据'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">个人资料</h1>
          <p className="text-gray-600 dark:text-gray-400">查看和管理您的个人信息</p>
        </div>
        
        {/* 选择用户 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择家庭成员
          </label>
          <select
            id="selectedUser"
            value={selectedUser}
            onChange={handleUserChange}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 个人资料卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">个人信息</h2>
            </div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <Image
                  src={userStats.avatar || "/avatars/default.png"}
                  alt={userStats.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userStats.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  家务总得分: <span className="font-bold text-primary-600 dark:text-primary-400">{userStats.totalPoints.toFixed(1)}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  已完成家务: <span className="font-bold text-primary-600 dark:text-primary-400">{userStats.choreCount}</span> 项
                </p>
              </div>
            </div>
          </div>

          {/* 设置选项 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">应用设置</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {darkMode ? <Moon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" /> : <Sun className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />}
                  <span className="text-gray-700 dark:text-gray-300">暗黑模式</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`${
                    darkMode ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-700"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    className={`${
                      darkMode ? "translate-x-5" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out mt-1`}
                  ></span>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {notifications ? <Bell className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" /> : <BellOff className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />}
                  <span className="text-gray-700 dark:text-gray-300">通知提醒</span>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`${
                    notifications ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-700"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    className={`${
                      notifications ? "translate-x-5" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out mt-1`}
                  ></span>
                </button>
              </div>
            </div>
          </div>

          {/* 最近完成的家务 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              最近完成的家务
            </h2>
            {recentChores.length > 0 ? (
              <ul className="space-y-3">
                {recentChores.map((chore) => (
                  <li key={chore.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{chore.choreType.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {chore.choreType.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(chore.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {chore.choreType.weight.toFixed(1)} 分
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                暂无家务记录
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 