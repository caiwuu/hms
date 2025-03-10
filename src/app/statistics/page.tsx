"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Calendar, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";

// 定义类型
interface User {
  id: number;
  name: string;
  avatar: string | null;
  totalPoints: number;
  count?: number;
}

interface ChoreType {
  id: number;
  name: string;
  icon: string | null;
  weight: number;
  count?: number;
}

interface ChoreStatistics {
  userStats: User[];
  choreTypeCounts: ChoreTypeCount[];
  weeklyData: any[];
  monthlyData: any[];
}

interface ChoreTypeCount {
  id: number;
  name: string;
  icon: string | null;
  weight: number;
  count: number;
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState("week");
  const [dateRange, setDateRange] = useState("本周");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChoreStatistics | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/statistics');
      if (!res.ok) {
        throw new Error('获取统计数据失败');
      }
      
      const data = await res.json();
      
      // 统计家务类型计数
      const choreTypeCounts: ChoreTypeCount[] = [];
      if (data.recentChores && data.recentChores.length > 0) {
        const countMap = new Map<number, number>();
        const typeMap = new Map<number, ChoreType>();
        
        // 统计每种家务类型的数量
        data.recentChores.forEach((chore: any) => {
          const typeId = chore.choreType.id;
          countMap.set(typeId, (countMap.get(typeId) || 0) + 1);
          typeMap.set(typeId, chore.choreType);
        });
        
        // 转换为数组形式
        countMap.forEach((count, typeId) => {
          const type = typeMap.get(typeId);
          if (type) {
            choreTypeCounts.push({
              id: type.id,
    name: type.name,
    icon: type.icon,
              weight: type.weight,
              count
            });
          }
        });
        
        // 按计数排序
        choreTypeCounts.sort((a, b) => b.count - a.count);
      }
      
      setStats({
        userStats: data.userStats || [],
        choreTypeCounts,
        weeklyData: data.weeklyData || [],
        monthlyData: data.weeklyData || [], // 目前后端没有提供月数据，暂用周数据代替
      });
    } catch (err) {
      console.error('获取数据失败', err);
      setError('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出报表功能
  const exportToCSV = async () => {
    if (!stats) return;
    
    try {
      setExporting(true);
      
      // 创建CSV内容
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // 添加BOM以支持中文
      
      // 1. 家庭成员贡献数据
      csvContent += "家庭成员贡献统计\n";
      csvContent += "成员,总得分,完成家务数\n";
      stats.userStats.forEach(member => {
        csvContent += `${member.name},${member.totalPoints},${member.count || 0}\n`;
      });
      
      csvContent += "\n";
      
      // 2. 家务类型统计
      csvContent += "家务类型统计\n";
      csvContent += "类型,权重,完成次数,占比\n";
      const totalCount = stats.choreTypeCounts.reduce((sum, t) => sum + t.count, 0);
      stats.choreTypeCounts.forEach(type => {
        const percentage = ((type.count / totalCount) * 100).toFixed(1);
        csvContent += `${type.name},${type.weight},${type.count},${percentage}%\n`;
      });
      
      csvContent += "\n";
      
      // 3. 周/月数据
      csvContent += period === "week" ? "周数据统计\n" : "月数据统计\n";
      
      const data = period === "week" ? stats.weeklyData : stats.monthlyData;
      if (data.length > 0) {
        // 获取所有成员名称作为表头
        const members = stats.userStats.map(u => u.name);
        csvContent += `日期,${members.join(',')}\n`;
        
        // 添加数据行
        data.forEach(day => {
          const values = members.map(name => day[name] || 0);
          csvContent += `${day.name},${values.join(',')}\n`;
        });
      }
      
      // 下载CSV文件
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `家务统计报表_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('导出报表失败', err);
      alert('导出报表失败，请稍后再试');
    } finally {
      setExporting(false);
    }
  };

  // 获取图表数据
  const getChartData = () => {
    if (!stats) return [];
    return period === "week" ? stats.weeklyData : stats.monthlyData;
  };

  // 获取图表X轴字段名
  const getXAxisKey = () => {
    return "name";
  };

  // 饼图数据准备
  const pieData = stats?.userStats.map(member => ({
    name: member.name,
    value: member.totalPoints,
  })) || [];

  // 饼图颜色
  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6A0572", "#5D5C61", "#557B83"];


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

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">家务统计报表</h1>
            <p className="text-gray-600 dark:text-gray-400">查看家庭成员的家务贡献详细统计</p>
          </div>
          <button 
            onClick={exportToCSV}
            disabled={exporting} 
            className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> 导出中...
              </>
            ) : (
              <>
            <Download size={16} className="mr-2" /> 导出报表
              </>
            )}
          </button>
        </div>

        {/* 时间筛选选项卡 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setPeriod("week");
                setDateRange("本周");
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                period === "week"
                  ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-gray-400"
              }`}
            >
              周报表
            </button>
            <button
              onClick={() => {
                setPeriod("month");
                setDateRange("本月");
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                period === "month"
                  ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-gray-400"
              }`}
            >
              月报表
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">{dateRange}</span>
            </div>
            <div className="flex space-x-2">
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeft size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 家务贡献柱状图/折线图 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              家务贡献趋势
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {period === "week" ? (
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="爸爸" fill="#FF6B6B" />
                    <Bar dataKey="妈妈" fill="#4ECDC4" />
                    <Bar dataKey="儿子" fill="#FFE66D" />
                    <Bar dataKey="女儿" fill="#6A0572" />
                  </BarChart>
                ) : (
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="爸爸" stroke="#FF6B6B" />
                    <Line type="monotone" dataKey="妈妈" stroke="#4ECDC4" />
                    <Line type="monotone" dataKey="儿子" stroke="#FFE66D" />
                    <Line type="monotone" dataKey="女儿" stroke="#6A0572" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* 家务类型分布饼图 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              家务类型分布
            </h2>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 家庭成员贡献对比 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            家庭成员贡献对比
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats?.userStats.map((member) => (
              <div
                key={member.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
                  <Image
                    src={member.avatar || "/avatars/default.png"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                  />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: COLORS[member.id % COLORS.length] }}>
                  {member.totalPoints}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">总贡献分</p>
              </div>
            ))}
          </div>
        </div>

        {/* 家务类型详情 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">家务类型详情</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    类型
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    权重
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    完成次数
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    贡献占比
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.choreTypeCounts.map((type) => (
                  <tr key={type.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{type.icon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {type.weight}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {type.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-primary-600 dark:bg-primary-400 h-2.5 rounded-full"
                          style={{
                            width: `${
                              (type.count /
                                stats.choreTypeCounts.reduce((sum, t) => sum + t.count, 0)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {(
                          (type.count / stats.choreTypeCounts.reduce((sum, t) => sum + t.count, 0)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
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