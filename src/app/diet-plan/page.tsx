'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/user-context';
import { generateDietPlan } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { Calendar, Flame, Target, ChevronRight, Clock, Camera, Search, MessageSquare, Sun, Moon, RefreshCcw, Settings, IndianRupee } from 'lucide-react';

export default function DietPlanPage() {
  const { preferences, setPreferences } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'maintenance' | 'leanCut'>('maintenance');
  const [showSettings, setShowSettings] = useState(false);
  const [tempBudget, setTempBudget] = useState(preferences?.dailyBudget || 500);
  const [tempProtein, setTempProtein] = useState(preferences?.proteinGoal || 0);
  const router = useRouter();

  const fetchPlan = async (prefs: any) => {
    setLoading(true);
    const data = await generateDietPlan(prefs);
    setPlan(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!preferences) {
      router.push('/onboarding');
      return;
    }
    
    if (!plan) {
      fetchPlan(preferences);
    }
  }, [preferences, router, plan]);

  const handleUpdateGoals = () => {
    if (preferences) {
      const updated = { 
        ...preferences, 
        dailyBudget: tempBudget, 
        proteinGoal: tempProtein > 0 ? tempProtein : undefined 
      };
      setPreferences(updated);
      fetchPlan(updated);
      setShowSettings(false);
    }
  };

  const handleRegenerate = () => {
    if (preferences) {
      fetchPlan(preferences);
    }
  };

  if (loading || !preferences) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}
        >
          <RefreshCcw size={48} />
        </motion.div>
        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Crafting your menu...</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem', textAlign: 'center', maxWidth: '250px' }}>
          Optimizing for ₹{preferences?.dailyBudget || 500} budget and health goals
        </p>
      </div>
    );
  }

  const currentCalories = viewMode === 'maintenance' ? plan.maintenanceCalories : plan.deficitCalories;

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Diet Strategy</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: 0 }}>Smart meals for your profile</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'var(--secondary)', border: 'none', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--muted)' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{ 
              background: showSettings ? 'var(--primary)' : 'var(--secondary)', 
              border: 'none', 
              padding: '0.6rem', 
              borderRadius: '0.75rem', 
              color: showSettings ? 'white' : 'var(--muted)' 
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
          >
            <div className="card glass" style={{ padding: '1.25rem', border: '1px solid var(--primary)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Adjust Your Goals</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--muted)' }}>DAILY BUDGET (₹)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '0.75rem' }}>
                  <IndianRupee size={16} color="var(--muted)" />
                  <input 
                    type="number" 
                    value={tempBudget}
                    onChange={(e) => setTempBudget(Number(e.target.value))}
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem 0', fontWeight: 700, fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--muted)' }}>PROTEIN GOAL (GRAMS)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '0.75rem' }}>
                  <Target size={16} color="var(--muted)" />
                  <input 
                    type="number" 
                    value={tempProtein}
                    onChange={(e) => setTempProtein(Number(e.target.value))}
                    placeholder="Auto-calculated"
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem 0', fontWeight: 700, fontSize: '1rem' }}
                  />
                </div>
                <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.4rem' }}>Leave as 0 for auto-calculation based on weight.</p>
              </div>

              <button className="btn btn-primary" onClick={handleUpdateGoals} style={{ padding: '0.75rem' }}>
                Save & Apply Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Switcher */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--secondary)', 
        padding: '0.4rem', 
        borderRadius: '1.25rem', 
        marginBottom: '1.5rem' 
      }}>
        <button 
          onClick={() => setViewMode('maintenance')}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            borderRadius: '1rem', 
            border: 'none', 
            background: viewMode === 'maintenance' ? 'var(--card)' : 'transparent',
            fontWeight: 700,
            color: viewMode === 'maintenance' ? 'var(--primary)' : 'var(--muted)',
            boxShadow: viewMode === 'maintenance' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          Maintenance
        </button>
        <button 
          onClick={() => setViewMode('leanCut')}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            borderRadius: '1rem', 
            border: 'none', 
            background: viewMode === 'leanCut' ? 'var(--card)' : 'transparent',
            fontWeight: 700,
            color: viewMode === 'leanCut' ? 'var(--primary)' : 'var(--muted)',
            boxShadow: viewMode === 'leanCut' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          Lean Cut
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '1rem', textAlign: 'center', background: 'var(--card)' }}>
          <Flame size={20} color="var(--accent)" style={{ marginBottom: '0.25rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentCalories}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Kcal</div>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '1rem', textAlign: 'center', background: 'var(--card)' }}>
          <Target size={20} color="var(--primary)" style={{ marginBottom: '0.25rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{plan.proteinTarget}g</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Protein</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Daily Menu</h3>
        <button 
          onClick={handleRegenerate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}
        >
          <RefreshCcw size={14} /> Regenerate
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {plan.meals.map((meal: any, index: number) => (
          <motion.div 
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card"
            style={{ padding: '1rem', marginBottom: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', background: 'var(--secondary)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>
                  {meal.type}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>{meal.time}</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)' }}>{meal.calories} kcal</span>
            </div>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{meal.name}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{meal.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>
                Protein: {meal.protein}g
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--foreground)' }}>
                Cost: {meal.costEstimate}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card glass" style={{ marginTop: '1.5rem', border: '1px solid var(--primary)', padding: '1.25rem' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="var(--primary)" />
          Chef's Tips
        </h4>
        <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
          {plan.tips.map((tip: string, i: number) => (
            <li key={i} style={{ marginBottom: '0.4rem' }}>{tip}</li>
          ))}
        </ul>
      </div>

      <nav className="nav">
        <Link href="/scan" className="nav-item">
          <Camera size={24} />
          <span>Scan</span>
        </Link>
        <Link href="/diet-plan" className="nav-item active">
          <Calendar size={24} />
          <span>Diet</span>
        </Link>
        <Link href="/chat" className="nav-item">
          <MessageSquare size={24} />
          <span>AI Chat</span>
        </Link>
      </nav>
    </div>
  );
}
