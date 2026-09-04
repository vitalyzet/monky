import React from 'react';

export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#121212] text-slate-900 dark:text-slate-100 antialiased">
      {/* Skeleton Top Navbar Placeholder */}
      <div className="h-16 w-full border-b border-slate-200/80 dark:border-[#222222] bg-white dark:bg-[#181818] animate-pulse" />

      {/* Main Content Area */}
      <main className="max-w-[1240px] w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-grow">
        {/* Breadcrumb / Back Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-20 h-4 bg-slate-200 dark:bg-[#252525] rounded-md animate-pulse" />
          <div className="w-4 h-4 bg-slate-200 dark:bg-[#252525] rounded-full animate-pulse" />
          <div className="w-32 h-4 bg-slate-200 dark:bg-[#252525] rounded-md animate-pulse" />
        </div>

        {/* 2-Column Grid matching ListingDetailClient */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Gallery & Details) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Main Image Skeleton */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-slate-200 dark:bg-[#1c1c1c] rounded-2xl overflow-hidden animate-pulse border border-slate-200 dark:border-[#2a2a2a]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer" />
            </div>

            {/* Thumbnail Row Skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-14 rounded-xl bg-slate-200 dark:bg-[#222] animate-pulse flex-shrink-0"
                />
              ))}
            </div>

            {/* Title & Price Card Skeleton */}
            <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-[#282828] flex flex-col gap-3">
              <div className="w-3/4 h-7 bg-slate-200 dark:bg-[#262626] rounded-lg animate-pulse" />
              <div className="w-1/3 h-8 bg-slate-200 dark:bg-[#262626] rounded-lg animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="w-24 h-6 bg-slate-100 dark:bg-[#222] rounded-md animate-pulse" />
                <div className="w-24 h-6 bg-slate-100 dark:bg-[#222] rounded-md animate-pulse" />
                <div className="w-28 h-6 bg-slate-100 dark:bg-[#222] rounded-md animate-pulse" />
              </div>
            </div>

            {/* Specifications Card Skeleton */}
            <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-[#282828] grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="w-16 h-3 bg-slate-200 dark:bg-[#222] rounded animate-pulse" />
                  <div className="w-24 h-5 bg-slate-200 dark:bg-[#262626] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Seller & Action Skeleton) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Action Buttons Skeleton */}
            <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-[#282828] flex flex-col gap-3">
              <div className="w-full h-12 bg-emerald-500/30 rounded-xl animate-pulse" />
              <div className="w-full h-12 bg-slate-200 dark:bg-[#262626] rounded-xl animate-pulse" />
            </div>

            {/* Seller Card Skeleton */}
            <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-[#282828] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#262626] animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-32 h-5 bg-slate-200 dark:bg-[#262626] rounded animate-pulse" />
                  <div className="w-20 h-3 bg-slate-200 dark:bg-[#222] rounded animate-pulse" />
                </div>
              </div>
              <div className="w-full h-10 bg-slate-100 dark:bg-[#222] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
