'use client';

import React from 'react';
import { CATEGORIES, Category } from '@/data/mockData';
import { Car, Bike, Disc, Shield, Truck, Bus, Anchor } from 'lucide-react';

interface CategoryExploreProps {
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
}

export const CategoryExplore: React.FC<CategoryExploreProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car':
        return <Car size={36} className="text-blue-500" />;
      case 'Bike':
        return <Bike size={36} className="text-blue-500" />;
      case 'Disc':
        return <Disc size={36} className="text-blue-500" />;
      case 'Shield':
        return <Shield size={36} className="text-blue-500" />;
      case 'Truck':
        return <Truck size={36} className="text-blue-500" />;
      case 'Bus':
        return <Bus size={36} className="text-blue-500" />;
      case 'Anchor':
        return <Anchor size={36} className="text-blue-500" />;
      default:
        return <Car size={36} className="text-blue-500" />;
    }
  };

  return (
    <section className="my-8">
      <h2 className="section-title">Explorează după categorie</h2>
      <div className="categories-scroll-wrapper">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              className={`category-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            >
              <div className="category-img-box">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} />
                ) : (
                  getIcon(cat.iconName)
                )}
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
