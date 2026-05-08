'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, ChevronLeft, Apple, Utensils, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { use } from 'react';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { preferences } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', resolvedParams.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [resolvedParams.id]);

  const sendMessage = async (type = 'text', mealData = null) => {
    if (type === 'text' && !newMessage.trim()) return;
    
    await addDoc(collection(db, 'chats', resolvedParams.id, 'messages'), {
      text: newMessage,
      type,
      mealData,
      sender: preferences?.dietType, // Simplified for demo
      timestamp: serverTimestamp()
    });
    setNewMessage('');
    setIsSwapping(false);
  };

  const handleMealSwap = () => {
    // Mocking a meal swap send
    const mockMeal = {
      name: "Avocado Salad",
      kcal: 350,
      protein: "12g",
      photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80"
    };
    sendMessage('meal_swap', mockMeal);
  };

  return (
    <div className="container" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/community" style={{ color: 'var(--foreground)' }}><ChevronLeft /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Meal Buddy</h4>
            <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>Online</span>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.sender === preferences?.dietType ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            {msg.type === 'text' ? (
              <div style={{ 
                background: msg.sender === preferences?.dietType ? 'var(--primary)' : 'var(--secondary)',
                color: msg.sender === preferences?.dietType ? 'white' : 'var(--foreground)',
                padding: '0.75rem 1rem',
                borderRadius: '1.25rem',
                borderBottomRightRadius: msg.sender === preferences?.dietType ? '0.25rem' : '1.25rem',
                borderBottomLeftRadius: msg.sender === preferences?.dietType ? '1.25rem' : '0.25rem'
              }}>
                {msg.text}
              </div>
            ) : (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="card" 
                style={{ 
                  padding: '0.5rem', 
                  border: '2px solid var(--primary)', 
                  background: 'var(--card)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', height: '150px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <img src={msg.mealData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.5rem', fontSize: '0.7rem' }}>
                    Sent a Snap-Meal
                  </div>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <h5 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{msg.mealData.name}</h5>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    <span>{msg.mealData.kcal} kcal</span>
                    <span>•</span>
                    <span>{msg.mealData.protein} Protein</span>
                  </div>
                  
                  {msg.sender !== preferences?.dietType && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--secondary)', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Meal Buddy had this! What did you have?</p>
                      <button className="btn btn-primary" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={handleMealSwap}>
                        <Camera size={14} /> Send Photo Back
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={handleMealSwap}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Camera size={20} />
          </button>
          <input 
            type="text" 
            className="input" 
            placeholder="Type a message..." 
            style={{ marginBottom: 0, borderRadius: '1.5rem', background: 'var(--secondary)', border: 'none' }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={() => sendMessage()}
            style={{ background: 'transparent', color: 'var(--primary)', border: 'none' }}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
