'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { db } from '@/lib/firebase';
import { searchUsers } from '@/lib/firebase-utils';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  UserPlus,
  Image as ImageIcon,
  Utensils,
  MessageCircle,
  Users,
  Bell,
  Search,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const { preferences } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'search'>('feed');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Global scan alert
  const [globalScan, setGlobalScan] = useState<any>(null);

  // Listen to Global Scans
  useEffect(() => {
    const q = query(collection(db, 'public_scans'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        if (data.timestamp) {
          setGlobalScan(data);
          setTimeout(() => setGlobalScan(null), 5000);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Feed
  useEffect(() => {
    const diet = preferences?.dietType || 'vegetarian';
    const q = query(
      collection(db, 'posts'),
      where('dietType', '==', diet),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn('Feed listener error (index may be building):', error.code);
    });
    return () => unsubscribe();
  }, [preferences?.dietType]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    await addDoc(collection(db, 'posts'), {
      content: newPost,
      authorDiet: preferences?.dietType,
      authorName: preferences?.username || 'Anonymous',
      dietType: preferences?.dietType,
      timestamp: serverTimestamp()
    });
    setNewPost('');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const getDietBadge = (dietType: string) => {
    switch (dietType) {
      case 'vegetarian': return { label: '🥬 Veg', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
      case 'non-veg': return { label: '🍗 Non-Veg', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      case 'vegan': return { label: '🌱 Vegan', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
      default: return { label: 'Unknown', color: '#888', bg: '#f1f1f1' };
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>People</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Connect with your nutrition community</p>
      </header>

      {/* Global Scan Alert */}
      <AnimatePresence>
        {globalScan && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              right: '20px',
              background: 'var(--primary)',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
          >
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Someone scanned <strong>{globalScan.product}</strong> for <strong>{globalScan.condition}</strong>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('feed')}
          className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          {preferences?.dietType === 'vegetarian' ? '🥬' : preferences?.dietType === 'vegan' ? '🌱' : '🍗'} Feed
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`btn ${activeTab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          <Search size={16} /> Find People
        </button>
      </div>

      {activeTab === 'search' ? (
        <>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0 1.25rem' }}
              onClick={handleSearch}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Search Results */}
          {searching ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <p>Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {searchResults.map((user: any) => {
                const badge = getDietBadge(user.dietType);
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card glass"
                    style={{ padding: '1rem', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        {user.dietType === 'vegetarian' ? '🥬' : user.dietType === 'vegan' ? '🌱' : '🍗'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>@{user.username}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800,
                            color: badge.color, background: badge.bg,
                            padding: '0.15rem 0.5rem', borderRadius: '0.4rem'
                          }}>
                            {badge.label}
                          </span>
                          {user.city && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                              📍 {user.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/chat/${user.id}`}
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.75rem', textDecoration: 'none' }}
                    >
                      <MessageCircle size={14} /> Chat
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : searchQuery ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No users found for "<strong>{searchQuery}</strong>"</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Type a username to find people</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Create Post */}
          <div className="card" style={{ padding: '1rem', marginBottom: '2rem' }}>
            <textarea
              className="input"
              placeholder={`Share a ${preferences?.dietType} recipe or question...`}
              style={{ minHeight: '80px', marginBottom: '1rem', background: 'var(--secondary)', border: 'none' }}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--muted)' }}>
                <ImageIcon size={20} />
                <Utensils size={20} />
              </div>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={handlePost}>
                Post <Send size={16} />
              </button>
            </div>
          </div>

          {/* Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', opacity: 0.5 }}>
                <MessageCircle size={48} style={{ margin: '0 auto 1rem' }} />
                <h3>No posts yet</h3>
                <p style={{ fontSize: '0.85rem' }}>Be the first to share something with the {preferences?.dietType} community!</p>
              </div>
            )}
            {posts.map((post) => {
              const badge = getDietBadge(post.authorDiet);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card glass"
                  style={{ padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem'
                      }}>
                        {post.authorDiet === 'vegetarian' ? '🥬' : post.authorDiet === 'vegan' ? '🌱' : '🍗'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>@{post.authorName}</h4>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800,
                          color: badge.color, background: badge.bg,
                          padding: '0.1rem 0.4rem', borderRadius: '0.3rem'
                        }}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/chat/demo-chat`}
                      style={{ textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', background: 'var(--secondary)', color: 'var(--foreground)', fontWeight: 600 }}
                    >
                      Connect
                    </Link>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>{post.content}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MessageCircle size={16} /> 0</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Utensils size={16} /> Recipe</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
