'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  level: number;
  children?: Category[];
};

export default function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true); // 默认显示
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/tree');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/?category=${slug}`);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // 渲染单个分类项（递归）
  const renderCategory = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isActive = currentCategory === category.slug;
    const paddingLeft = depth * 16;

    return (
      <div key={category.id}>
        <div
          className={`
            flex items-center justify-between px-3 py-2 cursor-pointer transition-colors
            ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}
          `}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => {
            handleCategoryClick(category.slug);
            if (hasChildren) {
              toggleCategory(category.id);
            }
          }}
        >
          <span className="text-sm truncate">{category.name}</span>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* 子分类 */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children!.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 切换按钮 */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors border border-gray-200"
        title={isOpen ? '隐藏分类菜单' : '显示分类菜单'}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* 侧边栏 */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-sm z-30
          transition-all duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📂 产品分类</h2>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length > 0 ? (
            <nav className="space-y-1">
              {categories.map((category) => renderCategory(category))}
            </nav>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">暂无分类</p>
            </div>
          )}
        </div>
      </aside>

      {/* 侧边栏打开时的遮罩（移动端） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
