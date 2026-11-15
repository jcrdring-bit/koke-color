import React from 'react';

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  totalVisible: number;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalVisible,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      
      {/* Category Pills Bar */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#164e28] text-white shadow-sm scale-[1.02]'
                  : 'bg-white text-[#78716C] hover:text-[#1C1917] border border-surface-border hover:border-gray-300'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-muted text-[#78716C]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats and Disclaimer Sub-Row */}
      <div className="flex items-center justify-between text-xs text-[#78716C] border-b border-surface-border/60 pb-3 mt-4">
        <div>
          <span>{totalVisible} {totalVisible === 1 ? 'kokedama' : 'kokedamas'}</span>
        </div>
        <div className="flex items-center gap-1.5 italic">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>Artesanales · Envíos y retiros a coordinar</span>
        </div>
      </div>

    </div>
  );
};
