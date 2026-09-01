import React, { useState } from 'react';
import { Article } from '../../types.ts';
import { useNews } from '../../context/NewsContext.tsx';
import { toBanglaNumeral, getRelativeTimeBangla } from '../../utils/banglaUtils.ts';
import { AdSlot } from '../layout/AdSlot.tsx';
import { TrendingUp, Flame, Star, Vote, CheckCircle2 } from 'lucide-react';

interface TrendingSidebarProps {
  articles?: Article[];
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({ articles = [] }) => {
  const { navigate, showToast } = useNews();
  const [activeTab, setActiveTab] = useState<'popular' | 'editor'>('popular');
  const [pollVoted, setPollVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const safeArticles = Array.isArray(articles) ? articles : [];

  // Sort by views for popular
  const popularArticles = [...safeArticles]
    .sort((a, b) => (b?.viewsCount || 0) - (a?.viewsCount || 0))
    .slice(0, 7);

  // Editor's picks
  const editorPicks = safeArticles
    .filter((a) => a?.isEditorPick)
    .slice(0, 7);


  const displayList = activeTab === 'popular' ? popularArticles : (editorPicks.length > 0 ? editorPicks : popularArticles);

  const handleVote = (optionIndex: number) => {
    if (pollVoted) return;
    setSelectedOption(optionIndex);
    setPollVoted(true);
    showToast('আপনার মতামতের জন্য ধন্যবাদ!', 'success');
  };

  return (
    <aside className="space-y-6">
      {/* Popular / Editor Tabs Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        {/* Tab Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 pb-2.5 text-sm font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${activeTab === 'popular' ? 'border-rose-800 text-rose-800 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>সর্বাধিক পঠিত</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 pb-2.5 text-sm font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${activeTab === 'editor' ? 'border-rose-800 text-rose-800 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Star className="w-4 h-4" />
            <span>আলোচিত সংবাদ</span>
          </button>
        </div>

        {/* List of Ranked Articles */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayList.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate(`/article/${item.slug}`)}
              className="group cursor-pointer py-3 first:pt-0 last:pb-0 flex items-start gap-3"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${idx < 3 ? 'bg-rose-900 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {toBanglaNumeral(idx + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold font-serif text-slate-900 dark:text-white group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h5>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>{item.categoryName}</span>
                  <span>•</span>
                  <span>{getRelativeTimeBangla(item.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reader Online Opinion Poll (জনমত জরিপ) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
          <Vote className="w-4 h-4" />
          <span>সত্যবাণী অনলাইন জনমত জরিপ</span>
        </div>
        <h4 className="text-sm font-semibold mb-4 leading-relaxed text-slate-100">
          কৃত্রিম বুদ্ধিমত্তা ও ডিজিটাল প্রযুক্তির প্রসারে বাংলাদেশের সংবাদ মাধ্যম কি আরও দ্রুত ও নির্ভুল সংবাদ পাঠকদের কাছে পৌঁছে দিতে পারবে?
        </h4>

        <div className="space-y-2">
          {[
            { label: 'হ্যাঁ, সক্ষমতা বাড়বে', percent: 68 },
            { label: 'না, বিভ্রান্তি বাড়তে পারে', percent: 22 },
            { label: 'মন্তব্য নেই', percent: 10 },
          ].map((opt, i) => (
            <div key={i} className="relative">
              {pollVoted ? (
                <div className="w-full bg-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs overflow-hidden border border-slate-700">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-900/50 rounded-lg transition-all duration-700"
                    style={{ width: `${opt.percent}%` }}
                  />
                  <span className="relative z-10 font-medium flex items-center gap-1.5">
                    {selectedOption === i && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    {opt.label}
                  </span>
                  <span className="relative z-10 font-bold text-rose-300">
                    {toBanglaNumeral(opt.percent)}%
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleVote(i)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/80 text-xs font-medium transition border border-slate-700 flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {pollVoted && (
          <p className="text-[11px] text-slate-400 text-center mt-3">
            মোট ভোট সংগৃহীত: {toBanglaNumeral(1472)}
          </p>
        )}
      </div>

      {/* Sidebar Ad Slot */}
      <AdSlot placement="sidebar" />
    </aside>
  );
};
