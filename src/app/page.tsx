"use client";
import { Navigation } from "@/components/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Image from 'next/image';
import { useEffect, useState } from "react";

// 定义类型
interface User {
  id: number;
  name: string;
  avatar: string | null;
  totalPoints: number;
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

interface WeeklyData {
  name: string;
  [key: string]: string | number;
}

interface Statistics {
  userStats: User[];
  recentChores: Chore[];
  weeklyData: WeeklyData[];
}

export default function Home() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/statistics');
        if (!response.ok) {
          throw new Error('获取统计数据失败');
        }
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error('获取数据错误:', err);
        setError('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 准备饼图数据
  const pieData = statistics?.userStats.map((user) => ({
    name: user.name,
    value: user.totalPoints,
    color: getUserColor(user.name),
  })) || [];

  // 根据用户名获取颜色
  function getUserColor(name: string): string {
    const colorMap: Record<string, string> = {
      '爸爸': '#FF6B6B',
      '妈妈': '#4ECDC4',
      '儿子': '#FFE66D',
      '女儿': '#6A0572',
    };
    return colorMap[name] || '#888888';
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8 flex items-center justify-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        {/* 欢迎信息 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">家务统计仪表盘</h1>
          <p className="text-gray-600 dark:text-gray-400">查看家庭成员的家务贡献情况</p>
        </div>
        
        {/* 家庭成员贡献卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statistics?.userStats.map((user) => (
            <div 
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                <Image width={96} height={96} src={user.avatar || '/avatars/default.png'} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm">
                  <span className="font-bold text-primary-600 dark:text-primary-400">{user.totalPoints.toFixed(1)}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> 分</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 贡献分布饼图 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">家庭贡献分布</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 每周贡献柱状图 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">本周家务贡献</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics?.weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {statistics?.userStats.map((user) => (
                    <Bar key={user.id} dataKey={user.name} fill={getUserColor(user.name)} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* 最近家务记录 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">最近家务记录</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">日期</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">成员</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">家务类型</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">得分</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {statistics?.recentChores.map((chore) => (
                  <tr key={chore.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(chore.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {chore.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {chore.choreType.icon} {chore.choreType.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {chore.choreType.weight.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
