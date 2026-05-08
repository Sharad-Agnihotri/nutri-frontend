'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { motion } from 'framer-motion';
import { RefreshCcw, Play } from 'lucide-react';

const YOUTUBE_RECIPES: Record<string, { id: string; title: string; channel: string }[]> = {
  'vegetarian': [
    { id: 'qJ0GBuBz4Aw', title: 'Paneer Butter Masala Recipe', channel: 'Ranveer Brar' },
    { id: '1ahpSTf_Pvk', title: 'Healthy Vegetarian Meal Prep', channel: 'Pick Up Limes' },
    { id: 'GzgL3AQ7O3c', title: 'Dal Tadka Recipe', channel: 'Chef Ranveer' },
    { id: 'XKNwunagTVc', title: 'Palak Paneer Recipe', channel: 'Your Food Lab' },
    { id: 'OG9VWBOd7TQ', title: 'Aloo Gobi Masala', channel: 'Hebbars Kitchen' },
    { id: 'wKRj8DeAiLc', title: 'Veggie Buddha Bowl', channel: 'Rainbow Plant Life' },
    { id: '2KR44a_5v_A', title: 'South Indian Sambar', channel: 'Vahchef' },
    { id: 'Q3MFbrHq4dY', title: 'Mushroom Biryani', channel: 'Vishnu Manohar' },
    { id: 'ooAQXhGFawI', title: 'Healthy Smoothie Bowls', channel: 'Downshiftology' },
    { id: 'I1hFgz169Fo', title: 'Vegetable Stir Fry', channel: 'Tasty' },
  ],
  'non-veg': [
    { id: 'a03U45jFxOI', title: 'Butter Chicken Recipe', channel: 'Kunal Kapoor' },
    { id: '1IszQFJfSKo', title: 'Chicken Biryani Hyderabadi', channel: 'Chef Ranveer' },
    { id: 'Flt1IVQlvKk', title: 'Grilled Chicken Meal Prep', channel: 'Fit Men Cook' },
    { id: 'Ghh5t8mJn3c', title: 'Fish Curry Kerala Style', channel: 'Your Food Lab' },
    { id: 'wL5KaGaQU68', title: 'Egg Fried Rice', channel: 'Uncle Roger' },
    { id: 'Y-rJb9kIGWE', title: 'Tandoori Chicken Recipe', channel: 'Kabita Kitchen' },
    { id: '9gsBBJOMmiA', title: 'Protein Packed Meals', channel: 'Greg Doucette' },
    { id: 'SfJz-MZxNRI', title: 'Mutton Curry Traditional', channel: 'Vahchef' },
    { id: 'rT-KnTq5fgI', title: 'Chicken Tikka Masala', channel: 'Joshua Weissman' },
    { id: 'DWQ3RnSQvMo', title: 'Keema Pav Recipe', channel: 'Ranveer Brar' },
  ],
  'vegan': [
    { id: 'Pw4GfLBo5Ig', title: 'High Protein Vegan Meals', channel: 'Simnett Nutrition' },
    { id: '668nUCeBHyY', title: 'Vegan Buddha Bowl', channel: 'Pick Up Limes' },
    { id: 'Q3MFbrHq4dY', title: 'Vegan Indian Curry', channel: 'Rainbow Plant Life' },
    { id: 'CjRr0DNPILM', title: 'Tofu Stir Fry Recipe', channel: 'The Happy Pear' },
    { id: 'kHRB5YXChBQ', title: 'Vegan Protein Sources', channel: 'Mic the Vegan' },
    { id: 'rOjMBBMs1PA', title: 'Avocado Toast 5 Ways', channel: 'Tasty' },
    { id: 'NuVx0TSMqsQ', title: 'Chickpea Curry', channel: 'Minimalist Baker' },
    { id: 'OCJcRUw0GjA', title: 'Vegan Meal Prep', channel: 'Cheap Lazy Vegan' },
    { id: 'OoF1LAY9kRk', title: 'Smoothie Bowl Recipe', channel: 'Downshiftology' },
    { id: 'SY1UrggdpI0', title: 'Lentil Soup Easy', channel: 'Nisha Madhulika' },
  ]
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FeedPage() {
  const { preferences } = useUser();
  const diet = preferences?.dietType || 'vegetarian';
  const [videos, setVideos] = useState<typeof YOUTUBE_RECIPES['vegetarian']>([]);

  const refreshFeed = () => {
    const category = YOUTUBE_RECIPES[diet] || YOUTUBE_RECIPES.vegetarian;
    setVideos(shuffleArray(category).slice(0, 10));
  };

  useEffect(() => {
    refreshFeed();
  }, [diet]);

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Feed</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            {diet === 'vegetarian' ? '🥬 Vegetarian' : diet === 'non-veg' ? '🍗 Non-Veg' : '🌱 Vegan'} Recipes for You
          </p>
        </div>
        <button
          onClick={refreshFeed}
          style={{
            background: 'var(--secondary)',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '1rem',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          <RefreshCcw size={18} /> Refresh
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {videos.map((video, idx) => (
          <motion.div
            key={video.id + idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card"
            style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}
          >
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
            <div style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.3 }}>
                {video.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
                <Play size={16} color="#FF0000" />
                <span>{video.channel}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
