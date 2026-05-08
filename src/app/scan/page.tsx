'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { getProductByBarcode, generateHealthInsight } from '@/lib/api';
import Scanner from '@/components/Scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, AlertTriangle, CheckCircle2, Info, ChevronRight, Utensils, Activity, TrendingUp, Play, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ScanPage() {
  const { preferences, addToHistory, setPreferences } = useUser();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Voice feedback effect
  useEffect(() => {
    if (insight?.voiceSummary && typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      // Cancel any ongoing speech
      synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(insight.voiceSummary);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Select a nice voice if available
      const voices = synth.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      synth.speak(utterance);
    }
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, [insight]);

  const handleScan = async (barcode: string) => {
    setShowScanner(false);
    setLoading(true);
    setError(null);
    setProduct(null);
    setInsight(null);
    
    const productData = await getProductByBarcode(barcode, preferences);
    if (productData) {
      setProduct(productData);
      const healthInsight = await generateHealthInsight(productData, preferences);
      setInsight(healthInsight);
      
      // Save to history
      addToHistory({
        barcode,
        name: productData.name,
        brand: productData.brand,
        timestamp: Date.now(),
        isSafe: healthInsight.isSafe
      });

      // PUSH TO PUBLIC FEED (REAL-TIME)
      if (preferences?.conditions?.length) {
        try {
          await addDoc(collection(db, 'public_scans'), {
            product: productData.name,
            condition: preferences.conditions[0],
            timestamp: serverTimestamp()
          });
        } catch (e) {
          console.error("Firebase push failed", e);
        }
      }
    } else {
      setError('Product not found. Please try another barcode.');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Analyze Food</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem' }}>Instant clarity for your choices</p>
        </div>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
      </header>

      {!product && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Manual Entry */}
          <div className="card glass" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter barcode manually..." 
                id="manual-barcode"
                className="glass"
                style={{ 
                  flex: 1, 
                  background: 'var(--secondary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1rem',
                  color: 'var(--foreground)'
                }}
              />
              <button 
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '0 1.25rem' }}
                onClick={() => {
                  const val = (document.getElementById('manual-barcode') as HTMLInputElement).value;
                  if (val) handleScan(val);
                }}
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card glass"
            style={{ 
              textAlign: 'center', 
              padding: '3rem 1.5rem', 
              background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 20px 40px rgba(15, 118, 110, 0.2)'
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Camera size={64} strokeWidth={1} />
              </motion.div>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800 }}>Use Camera</h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8, maxWidth: '280px', margin: '0 auto 2rem', fontSize: '0.85rem' }}>Point your camera at a barcode to decode ingredients instantly.</p>
            <button 
              className="btn" 
              style={{ background: 'white', color: 'var(--primary)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', width: 'auto', padding: '0.8rem 2rem', margin: '0 auto' }} 
              onClick={() => setShowScanner(true)}
            >
              Open Scanner
            </button>
          </motion.div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: '1.5rem' }}
          >
            <Search size={48} color="var(--primary)" />
          </motion.div>
          <h3 style={{ fontWeight: 700 }}>AI is analyzing...</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Comparing with your health goals</p>
        </div>
      )}

      {error && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
          <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => setShowScanner(true)}>
            Try Another Product
          </button>
        </motion.div>
      )}

      {product && insight && !loading && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Main Info Card */}
          <div className="card glass" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '90px', height: '90px', borderRadius: '1rem', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '90px', height: '90px', background: 'var(--secondary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={32} color="var(--muted)" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{product.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 600 }}>{product.brand}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', background: 'var(--secondary)', borderRadius: '0.5rem', color: 'var(--muted)' }}>
                  {product.quantity || 'Standard Size'}
                </span>
              </div>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="card" style={{ 
            borderColor: insight.isSafe ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
            background: insight.isSafe ? 'rgba(240, 253, 244, 0.5)' : 'rgba(254, 242, 242, 0.5)', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                <svg width="70" height="70" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="31" fill="none" stroke="currentColor" strokeWidth="6" style={{ opacity: 0.1 }} />
                  <motion.circle 
                    cx="35" cy="35" r="31" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    strokeDasharray="194.7"
                    initial={{ strokeDashoffset: 194.7 }}
                    animate={{ strokeDashoffset: 194.7 - (194.7 * (insight.score || 0)) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ color: insight.isSafe ? '#22c55e' : '#ef4444' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.125rem' }}>
                  {insight.score || 0}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ color: insight.isSafe ? '#166534' : '#991b1b', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {insight.isSafe ? 'Healthy Choice' : 'Proceed with Caution'}
                </h4>
                <p style={{ fontSize: '0.9rem', marginTop: '0.4rem', color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.4 }}>
                  {insight.warning || insight.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Best Replacement Section (When Unsafe) */}
          {insight.bestReplacement && !insight.isSafe && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.1 }} 
              className="card" 
              style={{ 
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', 
                color: 'white',
                border: 'none', 
                padding: '1.5rem',
                boxShadow: '0 10px 30px rgba(15, 118, 110, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Best Replacement
              </h4>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{insight.bestReplacement.name}</p>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>{insight.bestReplacement.reason}</p>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>
                Calculated based on your ₹{preferences?.dailyBudget} budget & health conditions.
              </p>
            </motion.div>
          )}

          {/* NEW: Reality Check Section */}
          {insight.realityCheck && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="var(--primary)" /> Reality Check
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <div style={{ color: '#fbbf24', marginBottom: '0.5rem' }}><Utensils size={24} style={{ margin: '0 auto' }} /></div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Sugar Content</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800 }}>{insight.realityCheck.sugarTeaspoons} Teaspoons</p>
                </div>
                <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <div style={{ color: '#f87171', marginBottom: '0.5rem' }}><Activity size={24} style={{ margin: '0 auto' }} /></div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Burn it with</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800 }}>{insight.realityCheck.exerciseToBurn.minutes}m {insight.realityCheck.exerciseToBurn.activity}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Smart Swap Section (When Safe but could be better) */}
          {insight.smartSwap && insight.isSafe && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card" style={{ background: 'rgba(45, 212, 191, 0.05)', borderColor: 'var(--primary)', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <CheckCircle2 size={18} /> Smart Swap
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                Try <strong>{insight.smartSwap.productName}</strong> instead.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                {insight.smartSwap.reason}
              </p>
            </motion.div>
          )}

          {/* Enhanced Ingredient Insights */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.25rem', fontWeight: 800 }}>Ingredient Insights</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {insight.ingredientInsights ? (
                insight.ingredientInsights.map((item: any, idx: number) => (
                  <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--secondary)', borderRadius: '1rem' }}>
                    <h5 style={{ fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>{item.ingredient}</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>{item.explanation}</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {product.ingredients || 'Detailed ingredient list not available.'}
                </p>
              )}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Sugar</p>
                <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{product.nutrition.sugars_100g?.toFixed(1) || 0}g</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Protein</p>
                <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{product.nutrition.proteins_100g?.toFixed(1) || 0}g</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Energy</p>
                <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{product.nutrition['energy-kcal_100g'] || 0}kcal</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a' }} 
              onClick={() => {
                const kcal = product.nutrition['energy-kcal_100g'] || 0;
                setPreferences({
                  ...preferences!,
                  consumedKcalToday: (preferences?.consumedKcalToday || 0) + kcal
                });
                alert(`Added ${kcal} kcal to your daily intake. You should walk about ${((kcal * 18) / 1000).toFixed(1)}km to burn this.`);
              }}
            >
              <CheckCircle2 size={20} /> I Consumed This
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setProduct(null); setInsight(null); setShowScanner(true); }}>
                <Camera size={20} /> New Scan
              </button>
              <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => { setProduct(null); setInsight(null); }}>
                Back
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'black' }}
          >
            <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
