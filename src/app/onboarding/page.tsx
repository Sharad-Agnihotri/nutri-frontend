'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, AlertCircle, Target, Activity, MapPin } from 'lucide-react';
import { syncUserProfile } from '@/lib/firebase-utils';

const ALLERGIES = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs', 'Tree Nuts'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Celiac Disease', 'PCOS', 'IBS'];

export default function Onboarding() {
  const { setPreferences } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Profile basics
  const [username, setUsername] = useState('');
  const [age, setAge] = useState<number>(25);

  // Pre-fill username from signup page
  useEffect(() => {
    const saved = localStorage.getItem('nutriai_signup_username');
    if (saved) {
      setUsername(saved);
      localStorage.removeItem('nutriai_signup_username');
    }
  }, []);

  // Step 2: Diet type
  const [dietType, setDietType] = useState<'vegetarian' | 'non-veg' | 'vegan'>('vegetarian');

  // Step 3: Allergies & Conditions
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Step 4: Location
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = () => {
    const prefs = {
      username,
      age,
      dietType,
      allergies: selectedAllergies,
      conditions: selectedConditions,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      dailyBudget: 500,
      consumedKcalToday: 0,
      scanHistory: []
    };

    setPreferences(prefs as any);
    syncUserProfile(prefs);
    router.push('/');
  };

  const variants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: -100, opacity: 0, transition: { duration: 0.2 } }
  };

  const totalSteps = 4;

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: s <= step ? 'var(--primary)' : 'var(--secondary)',
            transition: 'all 0.3s ease'
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Welcome to NutriAi! 👋</h2>
            <p className="subtitle">Let's set up your profile.</p>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Username</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. sharad_01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Age</label>
            <input
              type="number"
              className="input"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Your Diet Preference 🥗</h2>
            <p className="subtitle">This helps us connect you with the right community.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['vegetarian', 'non-veg', 'vegan'] as const).map(dt => (
                <motion.button
                  key={dt}
                  whileTap={{ scale: 0.97 }}
                  className={`btn ${dietType === dt ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '1.25rem' }}
                  onClick={() => setDietType(dt)}
                >
                  {dietType === dt && <Check size={20} />}
                  {dt === 'vegetarian' ? '🥬 Vegetarian' : dt === 'non-veg' ? '🍗 Non-Vegetarian' : '🌱 Vegan'}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Health Details 🏥</h2>
            <p className="subtitle">Help us keep you safe while scanning products.</p>

            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Allergies</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {ALLERGIES.map(a => (
                <motion.button
                  key={a}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(a, selectedAllergies, setSelectedAllergies)}
                  className={`btn ${selectedAllergies.includes(a) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {selectedAllergies.includes(a) && <Check size={14} />} {a}
                </motion.button>
              ))}
            </div>

            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Health Conditions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {CONDITIONS.map(c => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(c, selectedConditions, setSelectedConditions)}
                  className={`btn ${selectedConditions.includes(c) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {selectedConditions.includes(c) && <AlertCircle size={14} />} {c}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Your Location 📍</h2>
            <p className="subtitle">We use this for weather-based food recommendations.</p>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Country</label>
            <input
              type="text"
              className="input"
              placeholder="India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>State</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>City</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        {step > 1 && (
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < totalSteps ? (
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              if (step === 1 && !username.trim()) {
                alert('Please enter a username');
                return;
              }
              setStep(step + 1);
            }}
          >
            Continue <ChevronRight size={20} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleFinish}
          >
            Get Started 🚀
          </button>
        )}
      </div>
    </div>
  );
}
