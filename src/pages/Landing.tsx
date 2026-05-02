import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { OrnamentalDivider } from '@/components/OrnamentalDivider';
import sraiLogo from '@/assets/srai-logo.png';
import { 
  Brain, Target, Briefcase, Upload, BarChart3, CheckCircle2, ArrowRight,
  Zap, Shield, Users, Star, TrendingUp, Award, Flame, ScrollText, Lamp
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ─────────── Futuristic Hero (heritage-orange neon) ─────────── */
function useCountUp(target: number, duration = 1800, start = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

function formatStat(v: number, display: string) {
  if (display.includes('K')) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K+`;
  if (display.includes('%')) return `${v}%`;
  return `${v}+`;
}

function FuturisticHero({ stats }: { stats: { value: number; display: string; label: string; icon: any }[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Cursor glow tracking
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  // Particles
  const particles = Array.from({ length: 28 }, (_, i) => i);

  return (
    <section ref={heroRef} className="srai-hero relative overflow-hidden min-h-[92vh] flex items-center">
      {/* deep gradient base */}
      <div className="absolute inset-0 srai-hero-bg" />
      {/* perspective grid floor */}
      <div className="absolute inset-0 srai-grid-floor pointer-events-none" />
      {/* ambient edge bloom */}
      <div className="absolute inset-0 srai-edge-bloom pointer-events-none" />
      {/* cursor glow */}
      <div className="absolute inset-0 srai-cursor-glow pointer-events-none" />

      {/* floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((i) => (
          <span
            key={i}
            className="srai-particle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 10) * 0.6}s`,
              animationDuration: `${8 + (i % 7)}s`,
              opacity: i % 3 === 0 ? 0.9 : 0.5,
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ═════ LEFT: Title + CTA ═════ */}
          <div className={`lg:col-span-5 text-center lg:text-left order-2 lg:order-1 ${mounted ? 'srai-fade-in' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full srai-chip mb-6">
              <Flame className="h-4 w-4 srai-flame" />
              <span className="text-xs font-medium tracking-wider uppercase srai-chip-text">
                Wisdom-Powered Resume Intelligence
              </span>
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight font-serif leading-none srai-title">
              SRAI
            </h1>
            <p className="text-lg md:text-xl font-semibold mt-3 srai-subtitle font-serif italic">
              Saraswati Resume Artificial Intelligence
            </p>

            <div className="srai-divider my-6 max-w-xs mx-auto lg:mx-0" />

            <p className="text-base md:text-lg srai-desc max-w-md mx-auto lg:mx-0 leading-relaxed">
              Ancient Wisdom Empowering Modern Careers — Analyze resumes, detect skill gaps,
              improve ATS compatibility, and optimize your career profile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-9">
              <Link to="/dashboard">
                <button className="srai-cta group">
                  <span className="srai-cta-inner">
                    <ScrollText className="h-5 w-5" />
                    Start Resume Analysis (SRAI Check)
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
              <Link to="/about">
                <button className="srai-cta-ghost">Learn More</button>
              </Link>
            </div>
          </div>

          {/* ═════ CENTER: AI Core Card ═════ */}
          <div className={`lg:col-span-4 flex justify-center order-1 lg:order-2 ${mounted ? 'srai-scale-in' : 'opacity-0'}`}>
            <div className="srai-core-wrap">
              {/* radial under-glow */}
              <div className="srai-core-radial" />
              {/* rotating rings */}
              <div className="srai-ring srai-ring-1" />
              <div className="srai-ring srai-ring-2" />
              <div className="srai-ring srai-ring-3" />
              {/* orbiting dots */}
              <div className="srai-orbit">
                <span className="srai-orbit-dot" />
              </div>
              <div className="srai-orbit srai-orbit-rev">
                <span className="srai-orbit-dot srai-orbit-dot-gold" />
              </div>

              {/* glass card */}
              <div className="srai-core-card group">
                <div className="srai-core-aura" />
                <div className="srai-core-inner">
                  <Lamp className="srai-core-diya" />
                  <img
                    src={sraiLogo}
                    alt="SRAI"
                    className="srai-core-logo"
                  />
                </div>
              </div>

              {/* floor reflection */}
              <div className="srai-floor-reflect" />
            </div>
          </div>

          {/* ═════ RIGHT: Stats Panel ═════ */}
          <div className={`lg:col-span-3 order-3 ${mounted ? 'srai-slide-in' : 'opacity-0'}`}>
            <div className="srai-stats-panel group">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-center srai-stats-title">
                Platform Statistics
              </h3>
              <div className="srai-divider my-4" />
              <div className="space-y-4">
                {stats.map((s, i) => (
                  <StatRow key={i} stat={s} delay={i * 200} mounted={mounted} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SraiHeroStyles />
    </section>
  );
}

function StatRow({ stat, delay, mounted }: { stat: any; delay: number; mounted: boolean }) {
  const [start, setStart] = useState(false);
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(t);
  }, [mounted, delay]);
  const v = useCountUp(stat.value, 1600, start);
  return (
    <div className="srai-stat-row group/row">
      <div className="srai-stat-icon">
        <stat.icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="srai-stat-value font-serif">{formatStat(v, stat.display)}</p>
        <p className="srai-stat-label">{stat.label}</p>
      </div>
    </div>
  );
}

/* Scoped styles for the futuristic hero */
function SraiHeroStyles() {
  return (
    <style>{`
      .srai-hero { isolation: isolate; }
      .srai-hero-bg {
        background:
          radial-gradient(1200px 600px at 80% -10%, hsl(var(--primary) / 0.18), transparent 60%),
          radial-gradient(900px 500px at -10% 110%, hsl(var(--gold) / 0.14), transparent 60%),
          linear-gradient(180deg, #050505 0%, #0a0f1c 55%, #120a1a 100%);
      }
      .srai-grid-floor {
        background-image:
          linear-gradient(hsl(var(--primary) / 0.18) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary) / 0.18) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: linear-gradient(180deg, transparent 55%, black 80%, transparent 100%);
        -webkit-mask-image: linear-gradient(180deg, transparent 55%, black 80%, transparent 100%);
        transform: perspective(900px) rotateX(62deg) translateY(8%);
        transform-origin: center bottom;
        opacity: 0.55;
      }
      .srai-edge-bloom {
        background:
          radial-gradient(60% 40% at 0% 50%, hsl(var(--primary) / 0.10), transparent 70%),
          radial-gradient(60% 40% at 100% 50%, hsl(var(--gold) / 0.08), transparent 70%);
      }
      .srai-cursor-glow {
        background: radial-gradient(260px 260px at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.16), transparent 70%);
        transition: background 0.1s linear;
      }

      @keyframes sraiFloat {
        0% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
      }
      .srai-particle {
        position: absolute;
        width: 3px; height: 3px; border-radius: 50%;
        background: hsl(var(--gold));
        box-shadow: 0 0 8px hsl(var(--gold) / 0.9), 0 0 16px hsl(var(--primary) / 0.5);
        animation: sraiFloat linear infinite;
      }

      /* Text */
      .srai-title {
        background: linear-gradient(120deg, #ff8a3a 0%, #ffb84d 35%, #ffd86b 60%, #ff7a1a 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        background-size: 200% 200%;
        animation: sraiShine 6s ease-in-out infinite;
        text-shadow: 0 0 40px hsl(var(--primary) / 0.35);
        filter: drop-shadow(0 0 18px hsl(var(--primary) / 0.4));
        letter-spacing: -0.02em;
      }
      @keyframes sraiShine {
        0%,100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .srai-subtitle { color: #ffd28a; text-shadow: 0 0 18px hsl(var(--primary) / 0.5); }
      .srai-desc { color: rgba(245, 235, 220, 0.78); }

      .srai-chip {
        background: rgba(255, 138, 58, 0.08);
        border: 1px solid hsl(var(--primary) / 0.45);
        backdrop-filter: blur(12px);
        box-shadow: 0 0 22px hsl(var(--primary) / 0.18), inset 0 0 14px hsl(var(--primary) / 0.08);
      }
      .srai-chip-text { color: #ffce8a; }
      .srai-flame { color: #ffb84d; filter: drop-shadow(0 0 6px hsl(var(--primary) / 0.9)); animation: flameFlicker 1.5s ease-in-out infinite; }

      .srai-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.7), hsl(var(--gold) / 0.7), hsl(var(--primary) / 0.7), transparent);
        box-shadow: 0 0 12px hsl(var(--primary) / 0.4);
      }

      /* CTA */
      .srai-cta {
        position: relative;
        padding: 2px;
        border-radius: 999px;
        background: linear-gradient(120deg, #ff6a00, #ffb84d, #ffd700, #ff6a00);
        background-size: 200% 200%;
        animation: sraiShine 4s ease-in-out infinite;
        box-shadow: 0 0 24px hsl(var(--primary) / 0.55), 0 0 48px hsl(var(--gold) / 0.25);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        cursor: pointer;
        border: none;
      }
      .srai-cta:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 0 38px hsl(var(--primary) / 0.85), 0 0 80px hsl(var(--gold) / 0.4);
      }
      .srai-cta-inner {
        display: inline-flex; align-items: center; gap: 0.6rem;
        padding: 0.95rem 1.6rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #1a0d05 0%, #2a1408 50%, #1a0d05 100%);
        color: #ffe1b3;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size: 0.85rem;
      }
      .srai-cta-ghost {
        padding: 0.95rem 1.6rem;
        border-radius: 999px;
        background: rgba(255, 138, 58, 0.05);
        border: 1px solid hsl(var(--primary) / 0.4);
        color: #ffce8a;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size: 0.85rem;
        backdrop-filter: blur(10px);
        transition: all 0.25s ease;
        cursor: pointer;
      }
      .srai-cta-ghost:hover {
        background: hsl(var(--primary) / 0.12);
        border-color: hsl(var(--primary) / 0.7);
        box-shadow: 0 0 24px hsl(var(--primary) / 0.35);
      }

      /* Center core */
      .srai-core-wrap {
        position: relative;
        width: min(420px, 90vw);
        aspect-ratio: 1;
        display: flex; align-items: center; justify-content: center;
      }
      .srai-core-radial {
        position: absolute; inset: -10%;
        background: radial-gradient(closest-side, hsl(var(--primary) / 0.45), hsl(var(--gold) / 0.18) 45%, transparent 70%);
        filter: blur(30px);
        animation: sraiBreath 5s ease-in-out infinite;
      }
      @keyframes sraiBreath {
        0%,100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.06); }
      }
      .srai-ring {
        position: absolute; border-radius: 50%;
        border: 1px solid hsl(var(--primary) / 0.35);
        box-shadow: inset 0 0 30px hsl(var(--primary) / 0.18), 0 0 30px hsl(var(--primary) / 0.18);
      }
      .srai-ring-1 { inset: 6%; animation: sraiSpin 22s linear infinite; border-color: hsl(var(--primary) / 0.45); border-style: dashed; }
      .srai-ring-2 { inset: 14%; animation: sraiSpin 32s linear infinite reverse; border-color: hsl(var(--gold) / 0.35); }
      .srai-ring-3 { inset: 22%; animation: sraiSpin 14s linear infinite; border-color: hsl(var(--primary) / 0.55); border-style: dotted; }
      @keyframes sraiSpin { to { transform: rotate(360deg); } }

      .srai-orbit {
        position: absolute; inset: 4%;
        border-radius: 50%;
        animation: sraiSpin 9s linear infinite;
      }
      .srai-orbit-rev { animation: sraiSpin 13s linear infinite reverse; inset: 12%; }
      .srai-orbit-dot {
        position: absolute; top: -6px; left: 50%;
        width: 10px; height: 10px; border-radius: 50%;
        background: hsl(var(--primary));
        box-shadow: 0 0 14px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.7);
        transform: translateX(-50%);
      }
      .srai-orbit-dot-gold { background: hsl(var(--gold)); box-shadow: 0 0 14px hsl(var(--gold)), 0 0 30px hsl(var(--gold) / 0.7); }

      .srai-core-card {
        position: relative;
        width: 62%; aspect-ratio: 1;
        border-radius: 28px;
        background: linear-gradient(160deg, rgba(40, 18, 6, 0.55), rgba(15, 10, 20, 0.65));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1.5px solid hsl(var(--primary) / 0.6);
        box-shadow:
          0 0 0 1px hsl(var(--gold) / 0.15) inset,
          0 0 30px hsl(var(--primary) / 0.45),
          0 0 80px hsl(var(--primary) / 0.25),
          0 30px 80px rgba(0,0,0,0.6);
        transition: transform 0.5s ease, box-shadow 0.5s ease;
        animation: sraiHover 6s ease-in-out infinite;
        display: flex; align-items: center; justify-content: center;
      }
      @keyframes sraiHover {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .srai-core-card:hover {
        transform: translateY(-6px) scale(1.04);
        box-shadow:
          0 0 0 1px hsl(var(--gold) / 0.25) inset,
          0 0 50px hsl(var(--primary) / 0.7),
          0 0 120px hsl(var(--primary) / 0.4),
          0 30px 80px rgba(0,0,0,0.7);
      }
      .srai-core-aura {
        position: absolute; inset: 8%;
        border-radius: 50%;
        background: radial-gradient(closest-side, hsl(var(--primary) / 0.35), transparent 70%);
        filter: blur(20px);
        animation: sraiSpin 18s linear infinite;
      }
      .srai-core-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
      .srai-core-diya {
        width: 28px; height: 28px;
        color: hsl(var(--gold));
        filter: drop-shadow(0 0 12px hsl(var(--gold) / 0.9));
        animation: flameFlicker 1.5s ease-in-out infinite;
        position: absolute; top: -42px; left: 50%; transform: translateX(-50%);
      }
      .srai-core-logo {
        width: 78%;
        max-width: 220px;
        object-fit: contain;
        filter: drop-shadow(0 0 24px hsl(var(--primary) / 0.7)) drop-shadow(0 0 40px hsl(var(--gold) / 0.35));
      }
      .srai-floor-reflect {
        position: absolute;
        bottom: -8%; left: 15%; right: 15%;
        height: 40px;
        background: radial-gradient(ellipse at center, hsl(var(--primary) / 0.5), transparent 70%);
        filter: blur(14px);
        animation: sraiBreath 5s ease-in-out infinite;
      }

      /* Stats panel */
      .srai-stats-panel {
        position: relative;
        padding: 1.5rem;
        border-radius: 20px;
        background: linear-gradient(160deg, rgba(20, 10, 5, 0.55), rgba(10, 8, 15, 0.65));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid hsl(var(--primary) / 0.4);
        box-shadow:
          0 0 0 1px hsl(var(--gold) / 0.1) inset,
          0 0 24px hsl(var(--primary) / 0.25),
          0 20px 60px rgba(0,0,0,0.5);
        transition: transform 0.4s ease, box-shadow 0.4s ease;
      }
      .srai-stats-panel:hover {
        transform: translateY(-4px) rotateX(2deg) rotateY(-2deg);
        box-shadow:
          0 0 0 1px hsl(var(--gold) / 0.2) inset,
          0 0 36px hsl(var(--primary) / 0.5),
          0 30px 80px rgba(0,0,0,0.6);
      }
      .srai-stats-title { color: #ffce8a; }
      .srai-stat-row {
        display: flex; align-items: center; gap: 0.85rem;
        padding: 0.5rem;
        border-radius: 12px;
        transition: background 0.3s ease;
      }
      .srai-stat-row:hover { background: hsl(var(--primary) / 0.08); }
      .srai-stat-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.05));
        border: 1px solid hsl(var(--primary) / 0.5);
        color: #ffb84d;
        box-shadow: 0 0 16px hsl(var(--primary) / 0.35), inset 0 0 10px hsl(var(--primary) / 0.15);
      }
      .srai-stat-value {
        font-size: 1.35rem; font-weight: 800;
        background: linear-gradient(120deg, #ffb84d, #ffd86b);
        -webkit-background-clip: text; background-clip: text;
        color: transparent;
        line-height: 1.1;
      }
      .srai-stat-label { font-size: 0.72rem; color: rgba(245, 235, 220, 0.65); letter-spacing: 0.06em; text-transform: uppercase; }

      /* Entry animations */
      @keyframes sraiFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes sraiScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      @keyframes sraiSlideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
      .srai-fade-in { animation: sraiFadeIn 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
      .srai-scale-in { animation: sraiScaleIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s both; }
      .srai-slide-in { animation: sraiSlideIn 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both; }

      @media (prefers-reduced-motion: reduce) {
        .srai-particle, .srai-ring, .srai-orbit, .srai-core-card, .srai-core-aura, .srai-core-radial, .srai-floor-reflect, .srai-flame, .srai-core-diya { animation: none !important; }
      }
    `}</style>
  );
}

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: Upload, title: t('landing.features.upload'), description: t('landing.features.uploadDesc') },
    { icon: Brain, title: t('landing.features.analysis'), description: t('landing.features.analysisDesc') },
    { icon: Target, title: t('landing.features.ats'), description: t('landing.features.atsDesc') },
    { icon: Briefcase, title: t('landing.features.jobs'), description: t('landing.features.jobsDesc') },
    { icon: BarChart3, title: t('landing.features.skillGap'), description: t('landing.features.skillGapDesc') },
    { icon: CheckCircle2, title: t('landing.features.insights'), description: t('landing.features.insightsDesc') },
  ];

  const stats = [
    { value: 0, suffix: '', display: 'AI', label: 'Powered by Gemini', icon: Brain },
    { value: 0, suffix: '', display: 'ATS', label: 'Compatibility Check', icon: Target },
    { value: 0, suffix: '', display: 'Free', label: 'Student Project', icon: GraduationCap },
    { value: 0, suffix: '', display: '24/7', label: 'Cloud Available', icon: Zap },
  ];

  return (
    <Layout>
      {/* ═══ FUTURISTIC AI HERO ═══ */}
      <FuturisticHero stats={stats} />

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 relative parchment-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-gold-muted/10 to-background" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-4 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4 font-serif">{t('landing.features.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.features.subtitle')}</p>
          </div>
          <OrnamentalDivider className="max-w-sm mx-auto mb-12" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="manuscript-card corner-ornament bg-card/70 hover:shadow-xl hover:shadow-gold/8 transition-all duration-500 group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-gold/10 group-hover:from-primary/25 group-hover:to-gold/20 group-hover:scale-110 transition-all duration-300 border border-gold/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-foreground text-lg font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 relative heritage-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-card/50" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-4 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4 font-serif">{t('landing.howItWorks.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.howItWorks.subtitle')}</p>
          </div>
          <OrnamentalDivider className="max-w-sm mx-auto mb-14" />
          <div className="grid gap-10 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '01', title: t('landing.howItWorks.step1'), description: t('landing.howItWorks.step1Desc'), icon: ScrollText },
              { step: '02', title: t('landing.howItWorks.step2'), description: t('landing.howItWorks.step2Desc'), icon: Brain },
              { step: '03', title: t('landing.howItWorks.step3'), description: t('landing.howItWorks.step3Desc'), icon: Lamp },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-fade-in-up group" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="mb-5 text-7xl font-bold text-gold/15 group-hover:text-gold/30 transition-all duration-500 font-serif">{item.step}</div>
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 border border-gold/20">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-serif">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="py-20 relative parchment-bg">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Shield, title: t('landing.trust.secure'), description: t('landing.trust.secureDesc') },
              { icon: Zap, title: t('landing.trust.instant'), description: t('landing.trust.instantDesc') },
              { icon: Users, title: t('landing.trust.trusted'), description: t('landing.trust.trustedDesc') },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 animate-fade-in-left p-6 rounded-xl temple-border bg-card/60 hover:shadow-lg hover:shadow-gold/8 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-gold/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 font-serif">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[100px] animate-soft-glow" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[100px] animate-soft-glow" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <Flame className="h-10 w-10 text-gold mx-auto mb-4 flame-flicker diya-glow" />
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4 font-serif">{t('landing.cta2.title')}</h2>
            <p className="text-lg text-primary-foreground/80 mb-10">{t('landing.cta2.subtitle')}</p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 hover-scale font-semibold shadow-xl border border-gold/30">
                {t('landing.cta2.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
