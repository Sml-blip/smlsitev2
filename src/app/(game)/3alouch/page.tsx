'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

/* ── Font ──────────────────────────────────────────────────────────────────── */
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`;

/* ── Prize definitions ─────────────────────────────────────────────────────── */
interface Prize {
  id: string; emoji: string; name: string;
  tier: 'legendary' | 'rare' | 'uncommon' | 'common' | 'none';
  gradientFrom: string; gradientTo: string;
  borderColor: string; textColor: string;
  weight: number; won: boolean;
}

const WIN_PRIZE: Prize = {
  id: 'win', emoji: '🐑', name: 'خروف!',
  tier: 'legendary',
  gradientFrom: '#B8860B', gradientTo: '#FFD700',
  borderColor: '#FFD700', textColor: '#3a1a00',
  weight: 0, won: true,
};

const LOSE_POOL: Prize[] = [
  { id: 'l1', emoji: '🎁', name: 'هدية',      tier: 'rare',     gradientFrom: '#3b1f6b', gradientTo: '#1e0d40', borderColor: '#a855f7', textColor: '#d8b4fe', weight: 20, won: false },
  { id: 'l2', emoji: '☕', name: 'قهوة',      tier: 'uncommon', gradientFrom: '#3d1f0d', gradientTo: '#1a0d05', borderColor: '#92400e', textColor: '#fcd34d', weight: 25, won: false },
  { id: 'l3', emoji: '🍬', name: 'حلوى',      tier: 'common',   gradientFrom: '#1e3a5f', gradientTo: '#0c1f34', borderColor: '#3b82f6', textColor: '#93c5fd', weight: 25, won: false },
  { id: 'l4', emoji: '💨', name: 'لا شيء',    tier: 'none',     gradientFrom: '#1e293b', gradientTo: '#0f172a', borderColor: '#475569', textColor: '#94a3b8', weight: 30, won: false },
];

/* gold decoy appears visually but reel never stops on it */
const GOLD_DECOY: Prize = { ...WIN_PRIZE, id: 'decoy', won: false, name: 'الجائزة الكبرى' };

const ALL_PRIZES = [...LOSE_POOL];
function weightedRandom(): Prize {
  const total = ALL_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of ALL_PRIZES) { r -= p.weight; if (r <= 0) return p; }
  return ALL_PRIZES[0];
}

/* ── Card strip constants ──────────────────────────────────────────────────── */
const CW_DESK = 110, CH_DESK = 140;
const CW_MOB  = 85,  CH_MOB  = 110;
const GAP = 6, TOTAL = 250, TARGET = 200;
/* gold decoy positions — visible during spin but reel never stops here */
const DECOYS = new Set([15, 33, 48]);

function buildStrip(targetPrize: Prize): Prize[] {
  return Array.from({ length: TOTAL }, (_, i) => {
    if (i === TARGET)    return targetPrize;
    if (DECOYS.has(i))  return GOLD_DECOY;
    return weightedRandom();
  });
}

/* ── Web Audio ─────────────────────────────────────────────────────────────── */
let audioCtx: AudioContext | null = null;
function ctx() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tick(pitch = 800) {
  try {
    const c = ctx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(pitch, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(pitch * .5, c.currentTime + .05);
    g.gain.setValueAtTime(.12, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .05);
    o.start(); o.stop(c.currentTime + .05);
  } catch {}
}
function heavyTick() {
  try {
    const c = ctx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'triangle'; o.frequency.setValueAtTime(1200, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, c.currentTime + .1);
    g.gain.setValueAtTime(.2, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .1);
    o.start(); o.stop(c.currentTime + .1);
  } catch {}
}
function revealSound() {
  try {
    [[880,0],[1320,.15]].forEach(([f,d]) => {
      const c = ctx(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.type = 'sine';
      o.frequency.setValueAtTime(f, c.currentTime+d);
      g.gain.setValueAtTime(0,c.currentTime+d); g.gain.linearRampToValueAtTime(.25,c.currentTime+d+.05);
      g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d+.6);
      o.start(c.currentTime+d); o.stop(c.currentTime+d+.6);
    });
  } catch {}
}
function winSound() {
  try {
    [523.25,659.25,783.99,1046.5].forEach((f,i)=>{
      const c=ctx(),o=c.createOscillator(),g=c.createGain();
      o.connect(g); g.connect(c.destination); o.type='sine';
      o.frequency.setValueAtTime(f,c.currentTime+i*.15);
      g.gain.setValueAtTime(0,c.currentTime+i*.15); g.gain.linearRampToValueAtTime(.25,c.currentTime+i*.15+.05);
      g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.15+.4);
      o.start(c.currentTime+i*.15); o.stop(c.currentTime+i*.15+.4);
    });
  } catch {}
}
function loseSound() {
  try {
    const c=ctx(),o=c.createOscillator(),g=c.createGain();
    o.connect(g); g.connect(c.destination); o.type='sine';
    o.frequency.setValueAtTime(400,c.currentTime); o.frequency.exponentialRampToValueAtTime(100,c.currentTime+.8);
    g.gain.setValueAtTime(.2,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.8);
    o.start(); o.stop(c.currentTime+.8);
  } catch {}
}

/* ── Countdown ─────────────────────────────────────────────────────────────── */
function useCountdown() {
  const [t,setT] = useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    const end = new Date('2026-05-27T00:00:00+01:00').getTime();
    const run = ()=>{
      const diff = end - Date.now();
      if(diff<=0){setT({d:0,h:0,m:0,s:0});return;}
      setT({d:Math.floor(diff/86400000),h:Math.floor(diff/3600000%24),m:Math.floor(diff/60000%60),s:Math.floor(diff/1000%60)});
    };
    run(); const id=setInterval(run,1000); return ()=>clearInterval(id);
  },[]);
  return t;
}

/* ── Stars ─────────────────────────────────────────────────────────────────── */
function Stars(){
  const s=useMemo(()=>Array.from({length:22},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:2+Math.random()*3,d:Math.random()*5,dur:2+Math.random()*3})),[]);
  return <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
    {s.map(x=><div key={x.id} style={{position:'absolute',borderRadius:'50%',left:`${x.x}%`,top:`${x.y}%`,width:x.sz,height:x.sz,background:'rgba(255,215,0,.4)',boxShadow:'0 0 4px rgba(255,215,0,.3)',animation:`star-twinkle ${x.dur}s ease-in-out ${x.d}s infinite`}}/>)}
  </div>;
}

/* ── CardStrip ─────────────────────────────────────────────────────────────── */
interface StripProps { targetPrize: Prize; isActive: boolean; onSpinEnd: (p: Prize) => void; }

function CardStrip({ targetPrize, isActive, onSpinEnd }: StripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef     = useRef<HTMLDivElement>(null);
  const tlRef        = useRef<gsap.core.Timeline | null>(null);
  const lastTick     = useRef(-1);
  const [cw, setCw]  = useState(CW_MOB);
  const [done, setDone] = useState(false);

  useEffect(()=>{
    const upd=()=>setCw(window.innerWidth>=640?CW_DESK:CW_MOB);
    upd(); window.addEventListener('resize',upd); return ()=>window.removeEventListener('resize',upd);
  },[]);

  const cards = useMemo(()=>buildStrip(targetPrize),[targetPrize]);
  const step  = cw + GAP;
  const ch    = cw===CW_DESK?CH_DESK:CH_MOB;

  const startSpin = useCallback(()=>{
    if(!stripRef.current||!containerRef.current||tlRef.current) return;
    try{ctx();}catch{}

    const W      = containerRef.current.offsetWidth || window.innerWidth - 32;
    const target = -(TARGET*step) + W/2 - cw/2;
    const start  = W/2 - cw/2 - step;

    gsap.set(stripRef.current,{x:start});
    lastTick.current=-1; setDone(false);

    const upd=()=>{
      if(!stripRef.current) return;
      const x=gsap.getProperty(stripRef.current,'x') as number;
      const i=Math.round((-x+containerRef.current!.offsetWidth/2-cw/2)/step);
      if(i!==lastTick.current&&i>=0&&i<cards.length){
        lastTick.current=i;
        const c=cards[i];
        if(c.tier==='legendary'||c.tier==='rare') heavyTick();
        else tick(600+Math.random()*400);
      }
    };

    const tl=gsap.timeline({onComplete:()=>{
      setDone(true);
      revealSound();
      onSpinEnd(targetPrize);
    }});

    /* Phase 1 — fast */
    tl.to(stripRef.current,{x:target+300,duration:5,ease:'power2.inOut',onUpdate:upd});
    /* Phase 2 — slow dramatic */
    tl.to(stripRef.current,{x:target,duration:4,ease:'power4.out',onUpdate:upd});
    /* Phase 3 — bounce */
    tl.to(stripRef.current,{x:target-step*.3,duration:.3,ease:'power2.in'})
      .to(stripRef.current,{x:target+step*.15,duration:.3,ease:'power2.out'})
      .to(stripRef.current,{x:target,duration:.5,ease:'elastic.out(1,.5)'});

    tlRef.current=tl;
  },[cw,step,cards,targetPrize,onSpinEnd]);

  useEffect(()=>{
    if(!isActive) return;
    const raf=requestAnimationFrame(()=>startSpin());
    return ()=>{cancelAnimationFrame(raf); tlRef.current?.kill(); tlRef.current=null;};
  },[isActive,startSpin]);

  const BG='#0A1628';
  return (
    <div style={{position:'relative',width:'100%',direction:'ltr'}}>
      {/* fades */}
      {[['top','bottom'],['bottom','top'],['left','right'],['right','left']].map(([a,b],i)=>(
        <div key={i} style={{position:'absolute',...(i<2?{[a]:0,left:0,right:0,height:24}:{top:0,bottom:0,[a]:0,width:60}),zIndex:10,pointerEvents:'none',background:`linear-gradient(to ${b},${BG},transparent)`}}/>
      ))}

      {/* indicator */}
      <div style={{position:'absolute',top:0,bottom:0,left:'50%',transform:'translateX(-50%)',zIndex:20,pointerEvents:'none',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div className={isActive&&!done?'ind-pulse':''} style={{color:'#FFD700',fontSize:22}}>▼</div>
        <div style={{width:2,flex:1,margin:'4px 0',borderRadius:9,background:'linear-gradient(to bottom,#FFD700,rgba(255,215,0,.2),#FFD700)',boxShadow:'0 0 10px rgba(255,215,0,.5)'}}/>
        <div className={isActive&&!done?'ind-pulse':''} style={{color:'#FFD700',fontSize:22}}>▲</div>
      </div>

      {/* strip container */}
      <div ref={containerRef} style={{overflow:'hidden',height:ch+20,width:'100%'}}>
        <div ref={stripRef} style={{display:'flex',alignItems:'center',gap:GAP,willChange:'transform',padding:'10px 0'}}>
          {cards.map((card,i)=>{
            const winner=i===TARGET&&done;
            const isGold=card.id==='decoy'||card.id==='win';
            const gw=isGold?cw+8:cw, gh=isGold?ch+8:ch;
            return (
              <div key={i} className={winner?'winner-glow':isGold?'gold-card-anim':''} style={{
                flexShrink:0,borderRadius:14,position:'relative',overflow:'hidden',
                width:gw,height:gh,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,
                background:`linear-gradient(135deg,${card.gradientFrom},${card.gradientTo})`,
                border:winner?`3px solid ${card.borderColor}`:isGold?`2px solid ${card.borderColor}`:`2px solid ${card.borderColor}66`,
                boxShadow:winner?`0 0 30px ${card.borderColor}88,0 0 60px ${card.borderColor}44`:'0 2px 8px rgba(0,0,0,.3)',
                transform:winner?'scale(1.08)':'scale(1)',transition:'transform .3s,box-shadow .3s',
              }}>
                {isActive&&!done&&<div className='card-shimmer' style={{position:'absolute',inset:0}}/>}
                {isGold&&<div className='gold-shine-layer'/>}
                {isGold&&(
                  <>
                    <span className='gold-sparkle' style={{top:4,left:4,animationDelay:'0s'}}>✦</span>
                    <span className='gold-sparkle' style={{top:4,right:4,animationDelay:'.4s'}}>✦</span>
                    <span className='gold-sparkle' style={{bottom:4,left:4,animationDelay:'.8s'}}>✦</span>
                    <span className='gold-sparkle' style={{bottom:4,right:4,animationDelay:'1.2s'}}>✦</span>
                    <div style={{position:'absolute',top:-2,left:'50%',transform:'translateX(-50%)',fontSize:13,filter:'drop-shadow(0 0 4px #FFD700)'}}>👑</div>
                  </>
                )}
                <div style={{position:'absolute',top:isGold?18:5,left:5,width:7,height:7,borderRadius:'50%',
                  background:card.tier==='legendary'?'#FFD700':card.tier==='rare'?'#A855F7':card.tier==='uncommon'?'#D97706':card.tier==='common'?'#EC4899':'#6B7280',
                  boxShadow:card.tier==='legendary'?'0 0 6px #FFD700':card.tier==='rare'?'0 0 6px #A855F7':'none'}}/>
                <span style={{fontSize:cw===CW_DESK?36:28,lineHeight:1,filter:'drop-shadow(0 2px 4px rgba(0,0,0,.3))'}}>{card.emoji}</span>
                <span style={{fontSize:cw===CW_DESK?11:9,fontWeight:800,color:card.textColor,textAlign:'center',padding:'0 4px',lineHeight:1.3}}>{card.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* speed pill */}
      {isActive&&!done&&(
        <div style={{position:'absolute',bottom:6,left:'50%',transform:'translateX(-50%)',zIndex:20}}>
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:99,background:'rgba(0,0,0,.7)'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#FFD700',animation:'ind-pulse .6s ease-in-out infinite'}}/>
            <span style={{fontSize:11,color:'#FFD700',fontWeight:700}}>جاري السحب...</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
type Phase = 'form'|'checking'|'blocked_phone'|'blocked_ip'|'loading'|'spinning'|'result';

export default function AlouchPage(){
  const [phase,     setPhase]     = useState<Phase>('form');
  const [phone,     setPhone]     = useState('');
  const [name,      setName]      = useState('');
  const [target,    setTarget]    = useState<Prize>(LOSE_POOL[0]);
  const [stats,     setStats]     = useState<{total:number;wins:number}|null>(null);

  const cd = useCountdown();

  useEffect(()=>{
    fetch('/api/3alouch/config').then(r=>r.json())
      .then(d=>setStats({total:d.totalPlays||0,wins:d.totalWins||0})).catch(()=>{});
  },[]);

  const handleCheck = useCallback(async(e:React.FormEvent)=>{
    e.preventDefault();
    const p=phone.trim().replace(/\s/g,'');
    if(p.length<8) return;
    setPhase('checking');
    try{
      const r=await fetch(`/api/3alouch/check?phone=${encodeURIComponent(p)}`);
      const d=await r.json();
      if(d.eligible) setPhase('form'); // will show "ready" ui — handled below via separate flag
      else setPhase(d.reason==='ip'?'blocked_ip':'blocked_phone');
    }catch{ setPhase('form'); }
  },[phone]);

  const [checked, setChecked] = useState(false);
  const handleSubmit = useCallback(async(e:React.FormEvent)=>{
    e.preventDefault();
    const p=phone.trim().replace(/\s/g,'');
    if(p.length<8) return;
    setPhase('checking');
    try{
      const r=await fetch(`/api/3alouch/check?phone=${encodeURIComponent(p)}`);
      const d=await r.json();
      if(d.eligible){ setChecked(true); setPhase('form'); }
      else setPhase(d.reason==='ip'?'blocked_ip':'blocked_phone');
    }catch{ setChecked(true); setPhase('form'); }
  },[phone]);

  const handlePlay = useCallback(async()=>{
    const p=phone.trim().replace(/\s/g,'');
    setPhase('loading');
    try{ctx();}catch{}
    let result:Prize=LOSE_POOL[0];
    try{
      const r=await fetch('/api/3alouch/play',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:p,name:name.trim()})});
      const d=await r.json();
      if(d.error==='blocked'){setPhase(d.reason==='ip'?'blocked_ip':'blocked_phone');return;}
      result = d.result==='win' ? WIN_PRIZE : LOSE_POOL[Math.floor(Math.random()*LOSE_POOL.length)];
    }catch{}
    setTarget(result);
    setPhase('spinning');
  },[phone,name]);

  const handleSpinEnd = useCallback((prize:Prize)=>{
    setTimeout(()=>{
      setPhase('result');
      if(prize.won){ winSound(); fireConfetti(); }
      else loseSound();
    }, 900);
  },[]);

  const G='#F0C987', G2='#D4A574', BG='#0A1628';

  return (
    <div dir='rtl' style={{fontFamily:"'Cairo',sans-serif",minHeight:'100vh',background:BG,color:'#FFF8F0',position:'relative',overflowX:'hidden'}}>
      <style>{`
        ${FONT}
        *{font-family:'Cairo',sans-serif!important;box-sizing:border-box;}
        @keyframes star-twinkle{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow-pulse{0%,100%{box-shadow:0 0 20px rgba(240,201,135,.5),0 0 40px rgba(240,201,135,.3)}50%{box-shadow:0 0 30px rgba(240,201,135,.8),0 0 60px rgba(240,201,135,.5)}}
        @keyframes card-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes ind-pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes gold-card-pulse{0%,100%{box-shadow:0 0 18px #FFD700,0 0 36px rgba(255,215,0,.55)}50%{box-shadow:0 0 38px #FFD700,0 0 75px rgba(255,215,0,.85),0 0 110px rgba(255,215,0,.25)}}
        @keyframes gold-shine{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes sparkle{0%,100%{opacity:.5;transform:scale(.8) rotate(0deg)}50%{opacity:1;transform:scale(1.3) rotate(180deg)}}
        .winner-glow{animation:glow-pulse 1.5s ease-in-out infinite}
        .card-shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);background-size:200% 100%;animation:card-shimmer 2s infinite}
        .ind-pulse{animation:ind-pulse .8s ease-in-out infinite}
        .gold-card-anim{animation:gold-card-pulse 1.1s ease-in-out infinite}
        .gold-shine-layer{position:absolute;inset:0;border-radius:14px;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.38) 50%,transparent 65%);background-size:200% 100%;animation:gold-shine 1.7s linear infinite}
        .gold-sparkle{position:absolute;color:#FFD700;font-size:10px;animation:sparkle 1.2s ease-in-out infinite;pointer-events:none}
        input::placeholder{color:rgba(255,248,240,.3)}
      `}</style>

      {/* bg */}
      <div style={{position:'fixed',inset:0,zIndex:0,background:`radial-gradient(ellipse at top,rgba(26,107,60,.18),transparent 50%),radial-gradient(ellipse at bottom right,rgba(212,165,116,.12),transparent 50%),linear-gradient(180deg,#0A1628,#0D1F3C 50%,#0A1628)`}}/>
      <div style={{position:'fixed',inset:0,zIndex:0,opacity:.4,pointerEvents:'none',backgroundImage:`linear-gradient(30deg,rgba(212,165,116,.04) 12%,transparent 12.5%,transparent 87%,rgba(212,165,116,.04) 87.5%),linear-gradient(150deg,rgba(212,165,116,.04) 12%,transparent 12.5%,transparent 87%,rgba(212,165,116,.04) 87.5%),linear-gradient(60deg,rgba(26,107,60,.06) 25%,transparent 25.5%,transparent 75%,rgba(26,107,60,.06) 75%)`,backgroundSize:'80px 140px'}}/>
      <Stars/>

      {/* header */}
      <header style={{position:'relative',zIndex:10,background:'rgba(0,0,0,.55)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(212,165,116,.15)'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <a href='/' style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/images/logo-light.svg' alt='SML' style={{height:32,objectFit:'contain'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
            <span style={{fontSize:13,color:`${G}88`,fontWeight:600}}>SML Informatique</span>
          </a>
          <div style={{textAlign:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:18}}>☪️</span>
              <span style={{fontSize:15,fontWeight:900,color:G}}>مسابقة عيد الأضحى المبارك</span>
              <span style={{fontSize:18}}>🐑</span>
            </div>
            <p style={{fontSize:10,color:`${G}44`,margin:0}}>2026</p>
          </div>
          <a href='/shop' style={{fontSize:12,color:`${G}66`,textDecoration:'none',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
            🛒 <span>المتجر</span>
          </a>
        </div>
      </header>

      <main style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',padding:'16px 16px 64px',minHeight:'calc(100vh - 100px)'}}>
        <AnimatePresence>

          {/* FORM / READY */}
          {(phase==='form'||phase==='checking') && (
            <motion.div key='form' initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-30}} transition={{duration:.4}}
              style={{width:'100%',maxWidth:440,display:'flex',flexDirection:'column',gap:16}}>

              {/* countdown */}
              <div style={{textAlign:'center',marginBottom:4}}>
                <p style={{fontSize:12,color:`${G}88`,marginBottom:10}}>⏰ العد التنازلي لعيد الأضحى</p>
                <div style={{display:'flex',justifyContent:'center',gap:10}}>
                  {[{v:cd.d,l:'يوم'},{v:cd.h,l:'ساعة'},{v:cd.m,l:'دقيقة'},{v:cd.s,l:'ثانية'}].map(({v,l})=>(
                    <div key={l} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <div style={{fontSize:'clamp(20px,5vw,28px)',fontWeight:900,color:'#FFD700',background:'rgba(255,215,0,.1)',border:'1px solid rgba(255,215,0,.3)',borderRadius:12,padding:'6px 10px',minWidth:52,textAlign:'center'}}>
                        {String(v).padStart(2,'0')}
                      </div>
                      <span style={{fontSize:10,color:`${G}66`,marginTop:4}}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!checked ? (
                /* phone entry */
                <div style={{background:'linear-gradient(135deg,rgba(255,248,240,.06),rgba(212,165,116,.04))',border:'1px solid rgba(212,165,116,.2)',borderRadius:20,padding:'28px 24px',backdropFilter:'blur(20px)',boxShadow:'0 25px 50px rgba(0,0,0,.35)'}}>
                  <div style={{textAlign:'center',marginBottom:24}}>
                    <div style={{fontSize:52,marginBottom:8,animation:'float 3s ease-in-out infinite',display:'inline-block'}}>🐑</div>
                    <h2 style={{fontSize:'clamp(18px,5vw,26px)',fontWeight:900,color:G,margin:'0 0 4px'}}>العب واربح خروف الأضحية!</h2>
                    <p style={{fontSize:13,color:`${G}77`,margin:0}}>🎰 امسح QR وجرّب حظك</p>
                  </div>
                  <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
                    <div>
                      <label style={lbl}>الاسم الكامل *</label>
                      <input type='text' value={name} onChange={e=>setName(e.target.value)} placeholder='محمد علي...' dir='rtl' required style={inp}/>
                    </div>
                    <div>
                      <label style={lbl}>📱 رقم الهاتف *</label>
                      <input type='tel' value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,8))}
                        placeholder='22113344' required dir='ltr'
                        style={{...inp,textAlign:'center',letterSpacing:'.25em',fontSize:20,fontWeight:800,
                          border:phone.length===8?'1.5px solid rgba(74,222,128,.6)':'1.5px solid rgba(212,165,116,.2)',
                          color:phone.length===8?'#4ade80':'#FFF8F0',
                          boxShadow:phone.length===8?'0 0 18px rgba(74,222,128,.15)':'none'}}/>
                      <div style={{display:'flex',justifyContent:'center',gap:5,marginTop:6}}>
                        {Array.from({length:8}).map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:i<phone.length?G2:'rgba(212,165,116,.2)',transition:'background .2s'}}/>)}
                      </div>
                    </div>
                    <button type='submit' disabled={phone.length<8||!name.trim()||phase==='checking'} style={{...btn,
                      background:(phone.length===8&&name.trim())?'linear-gradient(135deg,#D4A574,#F0C987,#D4A574)':'rgba(212,165,116,.2)',
                      color:(phone.length===8&&name.trim())?'#0A1628':`${G}44`,
                      boxShadow:(phone.length===8&&name.trim())?'0 4px 20px rgba(212,165,116,.5)':'none',
                      cursor:(phone.length===8&&name.trim())?'pointer':'not-allowed'}}>
                      {phase==='checking'?'جاري التحقق...':'🐑 ابدأ اللعبة!'}
                    </button>
                  </form>
                </div>
              ) : (
                /* ready to play */
                <div style={{background:'linear-gradient(135deg,rgba(255,248,240,.08),rgba(212,165,116,.05))',border:'1px solid rgba(212,165,116,.3)',borderRadius:24,padding:'36px 32px',textAlign:'center',boxShadow:'0 0 40px rgba(212,165,116,.12),0 25px 50px rgba(0,0,0,.3)'}}>
                  <div style={{fontSize:64,marginBottom:12,animation:'float 2s ease-in-out infinite',display:'inline-block'}}>🐑</div>
                  <h2 style={{fontSize:24,fontWeight:900,color:G,marginBottom:6}}>{name?`أهلاً ${name}!`:'أهلاً بك!'}</h2>
                  <p style={{color:`${G}77`,marginBottom:24,fontSize:15}}>اضغط الزر لبدء السحب... حظك بانتظارك!</p>
                  <button onClick={handlePlay} style={{...btn,fontSize:20,padding:'16px 52px',background:'linear-gradient(135deg,#D4A574,#F0C987,#D4A574)',color:'#0A1628',boxShadow:'0 4px 24px rgba(212,165,116,.6)'}}>
                    🎰 العب الآن!
                  </button>
                  <br/>
                  <button onClick={()=>{setChecked(false);setPhone('');}} style={{marginTop:12,background:'none',border:'none',cursor:'pointer',color:`${G}55`,fontSize:13,textDecoration:'underline'}}>← تغيير رقم الهاتف</button>
                </div>
              )}

              {/* rules */}
              <div style={{background:'rgba(255,215,0,.05)',border:'1px solid rgba(255,215,0,.12)',borderRadius:16,padding:'14px 18px'}}>
                <p style={{fontSize:13,fontWeight:800,color:G,textAlign:'center',marginBottom:8}}>📜 قواعد اللعبة</p>
                <ul style={{margin:0,padding:0,listStyle:'none',color:`${G}aa`,fontSize:13,lineHeight:2.1}}>
                  <li>✅ كل شخص له دور واحد فقط</li>
                  <li>✅ كل جهاز يلعب مرة واحدة فقط</li>
                  <li>🏆 الرابح يحصل على خروف العيد</li>
                  <li>📞 التواصل عبر واتساب عند الفوز</li>
                </ul>
              </div>

              {stats&&stats.total>0&&<p style={{textAlign:'center',fontSize:12,color:`${G}44`}}>📊 {stats.total} مشاركة &nbsp;|&nbsp; 🏆 {stats.wins} فائز</p>}
            </motion.div>
          )}

          {/* LOADING */}
          {phase==='loading' && (
            <motion.div key='loading' initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,padding:'80px 16px'}}>
              <div style={{position:'relative'}}>
                <div style={{width:80,height:80,borderRadius:'50%',border:'4px solid transparent',borderTopColor:'#FFD700',borderRightColor:'rgba(255,215,0,.2)',animation:'spin 1s linear infinite'}}/>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>🐑</div>
              </div>
              <p style={{fontSize:18,fontWeight:700,color:G}}>جاري تحضير السحب...</p>
            </motion.div>
          )}

          {/* SPINNING */}
          {phase==='spinning' && (
            <motion.div key='spinning' initial={{opacity:1}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.3}}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,width:'100%'}}>
              <div style={{textAlign:'center'}}>
                <h2 style={{fontSize:20,fontWeight:900,color:G,marginBottom:4}}>🐑 السحب جارٍ!</h2>
                <p style={{fontSize:13,color:`${G}66`}}>شاهد البطاقات تتوقف على نتيجتك</p>
              </div>
              <div style={{width:'100%',padding:'0 4px'}}>
                <CardStrip targetPrize={target} isActive={true} onSpinEnd={handleSpinEnd}/>
              </div>
            </motion.div>
          )}

          {/* BLOCKED */}
          {(phase==='blocked_phone'||phase==='blocked_ip') && (
            <motion.div key='blocked' initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{type:'spring',duration:.5}}
              style={{background:'linear-gradient(135deg,rgba(231,76,60,.1),rgba(180,30,20,.08))',border:'2px solid rgba(231,76,60,.4)',borderRadius:24,padding:'36px 28px',textAlign:'center',maxWidth:420,width:'100%'}}>
              <div style={{fontSize:56,marginBottom:12}}>🚫</div>
              <h2 style={{fontSize:22,fontWeight:800,color:'#e74c3c',marginBottom:8}}>
                {phase==='blocked_ip'?'هذا الجهاز لعب بالفعل!':'هذا الرقم لعب بالفعل!'}
              </h2>
              <p style={{color:`${G}88`,fontSize:15}}>
                {phase==='blocked_ip'?'كل جهاز له دور واحد — استخدم هاتفاً آخر 📱':'كل رقم له دور واحد — استخدم رقماً آخر 📞'}
              </p>
            </motion.div>
          )}

          {/* RESULT */}
          {phase==='result' && (
            <motion.div key='result' initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{type:'spring',duration:.6}}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,width:'100%',maxWidth:440}}>
              <div style={{
                background:target.won?'linear-gradient(135deg,rgba(184,134,11,.15),rgba(255,215,0,.08))':'linear-gradient(135deg,rgba(255,248,240,.05),rgba(107,114,128,.05))',
                border:`2px solid ${target.won?'rgba(255,215,0,.5)':'rgba(107,114,128,.3)'}`,
                borderRadius:24,padding:'32px 28px',textAlign:'center',width:'100%',
                boxShadow:target.won?'0 0 50px rgba(255,215,0,.2),0 25px 50px rgba(0,0,0,.3)':'0 25px 50px rgba(0,0,0,.3)'}}>

                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:.2,stiffness:200}}
                  style={{fontSize:80,marginBottom:8}}>
                  {target.won?'🐑':'💨'}
                </motion.div>

                <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.35}}
                  style={{fontSize:26,fontWeight:900,color:target.won?G:'#9CA3AF',marginBottom:6}}>
                  {target.won?'مبروك! ربحت خروف! 🎉':'💨 حظ أوفر!'}
                </motion.h2>

                <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.5}}
                  style={{color:`${G}aa`,fontSize:15,marginBottom:4,fontWeight:700}}>
                  {target.won?'خروف ضحية في انتظارك 🐑':'لم تربح هذه المرة'}
                </motion.p>

                <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.6}}
                  style={{color:`${G}66`,fontSize:13,marginBottom:24}}>
                  {target.won
                    ? 'سيتواصل معك الفريق قريباً لتسليم الجائزة 📞'
                    : 'حاول مرة أخرى! قد يكون حظك أوفر المرة القادمة'}
                </motion.p>

                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.75}}
                  style={{display:'flex',flexDirection:'column',gap:10}}>
                  {target.won&&(
                    <a href={`https://wa.me/21648028729?text=${encodeURIComponent(`مرحباً SML 🎉 فزت بخروف العيد!\nاسمي: ${name}\nرقمي: ${phone}`)}`}
                      target='_blank' rel='noopener'
                      style={{...btn,display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none',background:'linear-gradient(135deg,#25D366,#128C7E)',color:'#fff'}}>
                      📲 تواصل معنا عبر واتساب
                    </a>
                  )}
                  <button onClick={()=>handleShare(target.won,name,phone)}
                    style={{...btn,background:'linear-gradient(135deg,rgba(212,165,116,.2),rgba(240,201,135,.15))',color:G,border:'1px solid rgba(212,165,116,.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    📤 شارك مع أصدقائك
                  </button>
                </motion.div>
              </div>
              {stats&&stats.total>0&&<p style={{textAlign:'center',fontSize:12,color:`${G}44`}}>📊 {stats.total} مشاركة &nbsp;|&nbsp; 🏆 {stats.wins} فائز</p>}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer style={{position:'relative',zIndex:10,borderTop:'1px solid rgba(212,165,116,.15)',background:'rgba(0,0,0,.4)',backdropFilter:'blur(12px)'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'20px',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{height:1,width:60,background:'rgba(212,165,116,.2)'}}/>
            <span style={{color:G,fontSize:16}}>☪</span>
            <div style={{height:1,width:60,background:'rgba(212,165,116,.2)'}}/>
          </div>
          <p style={{margin:0,color:`${G}66`,fontSize:13,fontWeight:700}}>كل عام وأنتم بخير 🐑</p>
          <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
            <a href='/' style={{color:`${G}44`,fontSize:11,textDecoration:'none'}}>الرئيسية</a>
            <span style={{color:`${G}22`}}>|</span>
            <a href='/shop' style={{color:`${G}44`,fontSize:11,textDecoration:'none'}}>المتجر</a>
            <span style={{color:`${G}22`}}>|</span>
            <a href='/contact' style={{color:`${G}44`,fontSize:11,textDecoration:'none'}}>تواصل معنا</a>
          </div>
          <p style={{margin:0,color:`${G}22`,fontSize:11}}>© 2026 SML Informatique</p>
        </div>
      </footer>
    </div>
  );
}

async function generateShareImage(won: boolean, name: string): Promise<Blob> {
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d')!;

  // Background
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0A1628');
  bg.addColorStop(1, '#0D1F3C');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);

  // Gold/silver glow
  const glow = c.createRadialGradient(W/2, H/2, 0, W/2, H/2, 520);
  glow.addColorStop(0, won ? 'rgba(255,215,0,.18)' : 'rgba(100,116,139,.12)');
  glow.addColorStop(1, 'transparent');
  c.fillStyle = glow; c.fillRect(0, 0, W, H);

  // Try load SML logo
  try {
    await new Promise<void>((res, rej) => {
      const img = new Image();
      img.onload = () => { c.drawImage(img, W/2-80, 60, 160, 60); res(); };
      img.onerror = () => {
        // fallback: text logo
        c.font = 'bold 48px Arial'; c.fillStyle = '#F0C987'; c.textAlign = 'center';
        c.fillText('SML', W/2, 110);
        res();
      };
      img.src = '/images/logo-light.svg';
      setTimeout(rej, 2000);
    });
  } catch {
    c.font = 'bold 48px Arial'; c.fillStyle = '#F0C987'; c.textAlign = 'center';
    c.fillText('SML', W/2, 110);
  }

  c.textAlign = 'center'; c.textBaseline = 'middle';

  // Competition title
  c.font = `bold 54px 'Cairo', Arial`;
  c.fillStyle = 'rgba(240,201,135,.8)';
  c.fillText('مسابقة عيد الأضحى المبارك 🐑', W/2, 200);

  // Divider
  c.strokeStyle = 'rgba(212,165,116,.3)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(160, 240); c.lineTo(W-160, 240); c.stroke();

  // Big result emoji
  c.font = '220px serif';
  c.fillText(won ? '🐑' : '💨', W/2, 460);

  // Result text
  c.font = `bold 72px 'Cairo', Arial`;
  c.fillStyle = won ? '#FFD700' : '#94a3b8';
  c.fillText(won ? '🎉 مبروك! ربحت خروف!' : 'حظ أوفر المرة القادمة', W/2, 660);

  // Name
  if(name){
    c.font = `600 54px 'Cairo', Arial`;
    c.fillStyle = 'rgba(240,201,135,.75)';
    c.fillText(name, W/2, 760);
  }

  // Divider
  c.strokeStyle = 'rgba(212,165,116,.2)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(200, 840); c.lineTo(W-200, 840); c.stroke();

  // Footer branding
  c.font = `500 40px 'Cairo', Arial`;
  c.fillStyle = 'rgba(240,201,135,.5)';
  c.fillText('SML Informatique — sml.tn', W/2, 920);

  c.font = `36px 'Cairo', Arial`;
  c.fillStyle = 'rgba(240,201,135,.3)';
  c.fillText('كل عام وأنتم بخير ☪', W/2, 1000);

  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
}

async function handleShare(won: boolean, name: string, phone: string) {
  try {
    const blob = await generateShareImage(won, name);
    const file = new File([blob], 'eid-result.png', { type: 'image/png' });
    if(navigator.share && navigator.canShare?.({ files: [file] })){
      await navigator.share({ files: [file], title: 'لعبة عيد الأضحى ۳لوش', text: won ? '🏆 ربحت خروف العيد! 🐑' : '💨 جرب حظك في لعبة ۳لوش!' });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'eid-result.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch {}
}

function fireConfetti(){
  const end=Date.now()+4000,cols=['#facc15','#f59e0b','#fbbf24','#22c55e','#86efac'];
  (function f(){
    confetti({particleCount:7,angle:60,spread:55,origin:{x:0},colors:cols});
    confetti({particleCount:7,angle:120,spread:55,origin:{x:1},colors:cols});
    if(Date.now()<end) requestAnimationFrame(f);
  })();
}

const inp:React.CSSProperties={width:'100%',background:'rgba(255,248,240,.05)',border:'1.5px solid rgba(212,165,116,.2)',borderRadius:14,padding:'12px 16px',color:'#FFF8F0',fontSize:15,transition:'border-color .2s,box-shadow .2s'};
const lbl:React.CSSProperties={color:'rgba(240,201,135,.8)',fontSize:13,fontWeight:700,display:'block',marginBottom:6};
const btn:React.CSSProperties={background:'linear-gradient(135deg,#D4A574,#F0C987)',color:'#0A1628',fontWeight:900,fontSize:16,border:'none',borderRadius:16,padding:'13px 32px',cursor:'pointer',transition:'transform .15s'};
