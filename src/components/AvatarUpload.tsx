import React, { useState, useRef } from 'react';
import { Loader2, Camera } from 'lucide-react';
import Image from 'next/image';


interface AvatarUploadProps {
  currentAvatar: string | null;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({ currentAvatar, onAvatarChange, size = 'md' }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 基本文件验证
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // 创建预览
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 创建FormData
      const formData = new FormData();
      formData.append('file', file);

      // 发送到服务器
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      const data = await response.json();
      
      // 通知父组件
      onAvatarChange(data.url);
      
      // 清除本地预览URL
      URL.revokeObjectURL(objectUrl);
      
      // 使用服务器返回的URL
      setPreviewUrl(data.url);
    } catch (err) {
      console.error('头像上传失败:', err);
      setError(err instanceof Error ? err.message : '上传失败');
      // 恢复原来的头像
      setPreviewUrl(currentAvatar);
    } finally {
      setIsUploading(false);
      // 重置文件输入，以便能够上传相同的文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 根据size属性确定头像大小
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size];

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative cursor-pointer group"
        onClick={triggerFileInput}
      >
        <div className={`${sizeClasses} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700`}>
          <Image 
            src={previewUrl || '/avatars/default.png'} 
            alt="用户头像" 
            width={100}
            height={100}
            className="w-full h-full object-cover transition-opacity group-hover:opacity-70"
          />
          
          {/* 悬停时显示的相机图标 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white drop-shadow-md" />
          </div>
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
      
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
} 