"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Calendar, Settings, User, PlusCircle } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "首页", icon: Home },
    { href: "/statistics", label: "统计", icon: BarChart2 },
    { href: "/chores", label: "家务", icon: Calendar },
    { href: "/settings", label: "设置", icon: Settings },
    { href: "/profile", label: "我的", icon: User },
  ];

  // 检查当前路径是否匹配或者是子路径
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* 桌面端顶部导航 */}
      <div className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">家务统计</span>
              </Link>
              <nav className="ml-10 flex items-center space-x-4">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-gray-800 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300 border-b-2 border-primary-600 dark:border-primary-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border-b-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className={`mr-1.5 h-4 w-4 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                        {item.label}
                      </div>
                      {active && (
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center ${
                  active
                    ? "text-primary-600 dark:text-primary-400 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 添加家务按钮 (移动端) */}
      <div className="md:hidden fixed bottom-20 right-4 z-20">
        <Link
          href="/chores/add"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircle size={24} />
        </Link>
      </div>
    </>
  );
} 