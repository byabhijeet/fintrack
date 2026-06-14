import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Sparkles, Wrench, CheckCircle2, AlertCircle, Eye, EyeOff,
  Laptop, Calculator, Package, Store, Tag, ShoppingBag
} from 'lucide-react';

type ModuleNode = {
  name: string;
  sub: string;
  color: string;
  icon: string;
};

const MODULES: ModuleNode[] = [
  { name: "Retail Stores", sub: "Garments & Salons", color: "#22c55e", icon: "🏪" },
  { name: "Point of Sale", sub: "Fast Checkout", color: "#3b82f6", icon: "💻" },
  { name: "Finance", sub: "GST & Accounts", color: "#ef4444", icon: "📊" },
  { name: "E-Commerce", sub: "Online Store", color: "#f59e0b", icon: "🛍️" },
  { name: "Wholesale", sub: "Bulk Orders", color: "#ec4899", icon: "📦" },
  { name: "Marketing", sub: "Campaigns", color: "#06b6d4", icon: "🎯" },
];

const AuthShowcaseCanvas = ({ onModuleChange }: { onModuleChange?: (label: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const activeNodeRef = useRef(0);
  const loopStateRef = useRef({
    progress: 0,
    phase: "walk" as "walk" | "collect" | "pause",
    phaseTime: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = 420;
    const H = 420;
    const CX = 210;
    const CY = 210;
    const OR = 146;

    const posOf = (i: number) => {
      const a = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
      return { x: CX + OR * Math.cos(a), y: CY + OR * Math.sin(a) };
    };

    const drawNode = (i: number, active: boolean) => {
      const n = MODULES[i];
      const p = posOf(i);
      ctx.save();
      ctx.translate(p.x, p.y);

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-50, -38, 100, 76, 14);
      } else {
        ctx.rect(-50, -38, 100, 76);
      }
      ctx.fillStyle = active ? `${n.color}1C` : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = active ? n.color : "#dfe9df";
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -16, 12, 0, Math.PI * 2);
      ctx.fillStyle = active ? `${n.color}20` : "#f8fafc";
      ctx.fill();
      ctx.strokeStyle = active ? `${n.color}88` : "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = active ? n.color : "#334155";
      ctx.font = "700 12px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.icon, 0, -8);

      ctx.fillStyle = active ? "#0f172a" : "#1e293b";
      ctx.font = "700 11px Inter, sans-serif";
      ctx.fillText(n.name, 0, 11);
      ctx.font = "500 9px Inter, sans-serif";
      ctx.fillStyle = "#8aa08a";
      ctx.fillText(n.sub, 0, 24);
      ctx.restore();
    };

    const drawPerson = (x: number, y: number, facingRight: boolean, stepTick: number) => {
      const leg = Math.sin(stepTick) * 4;
      ctx.save();
      ctx.translate(x, y);

      ctx.beginPath();
      ctx.ellipse(0, 17, 9, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15,23,42,0.12)";
      ctx.fill();

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-2, 5);
      ctx.lineTo(-2 - leg * 0.4, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 5);
      ctx.lineTo(3 + leg * 0.4, 14);
      ctx.stroke();

      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-7, -8, 14, 14, 4);
      } else {
        ctx.rect(-7, -8, 14, 14);
      }
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -15, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(facingRight ? 2 : -2, -15, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      ctx.restore();
    };

    const drawHub = (tick: number) => {
      const pulse = 1 + Math.sin(tick * 0.03) * 0.05;
      ctx.save();
      ctx.translate(CX, CY);
      ctx.scale(pulse, pulse);

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-44, -44, 88, 88, 18);
      } else {
        ctx.rect(-44, -44, 88, 88);
      }
      ctx.fillStyle = "#050608";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#1ed760";
      ctx.stroke();

      const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 64);
      glow.addColorStop(0, "rgba(30,215,96,0.2)");
      glow.addColorStop(1, "rgba(30,215,96,0)");
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.textAlign = "center";
      ctx.font = "900 30px Inter, sans-serif";
      ctx.fillStyle = "#1ed760";
      ctx.fillText("B", -9, 11);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Z", 12, 11);
      ctx.restore();
    };

    let tick = 0;
    let current = 0;
    let next = 1;
    onModuleChange?.(MODULES[current].name);

    const animate = () => {
      tick += 1;
      const state = loopStateRef.current;
      const pausedByVisibility = document.hidden;

      if (!reduceMotion && !pausedByVisibility) {
        if (state.phase === "walk") {
          state.progress = Math.min(1, state.progress + 0.015);
          if (state.progress >= 1) {
            state.phase = "collect";
            state.phaseTime = 0;
            current = next;
            activeNodeRef.current = current;
            onModuleChange?.(MODULES[current].name);
          }
        } else if (state.phase === "collect") {
          state.phaseTime += 1;
          if (state.phaseTime > 35) {
            state.phase = "pause";
            state.phaseTime = 0;
          }
        } else {
          state.phaseTime += 1;
          if (state.phaseTime > 25) {
            state.phase = "walk";
            state.progress = 0;
            state.phaseTime = 0;
            next = (current + 1) % MODULES.length;
          }
        }
      }

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < MODULES.length; i += 1) {
        const p = posOf(i);
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = i === current ? `${MODULES[i].color}55` : "#e4ece4";
        ctx.lineWidth = i === current ? 1.8 : 1;
        ctx.setLineDash(i === current ? [4, 4] : []);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      drawHub(tick);
      for (let i = 0; i < MODULES.length; i += 1) drawNode(i, i === current);

      const from = posOf(current);
      const to = posOf(next);
      const x = from.x + (to.x - from.x) * state.progress;
      const y = from.y + (to.y - from.y) * state.progress;
      drawPerson(x, y, to.x >= from.x, tick * 0.3);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onModuleChange]);

  return (
    <div className="relative h-[420px] w-[420px]" style={{ margin: '0 auto 24px auto', zIndex: 10 }}>
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        className="h-full w-full"
        style={{ display: 'block' }}
        aria-label="BillZest module walkthrough animation"
      />
    </div>
  );
};

const BillingLoader = ({ size = "md", message }: { size?: "sm" | "md" | "lg" | "xl"; message?: string }) => {
  const DOMAIN_SYMBOLS = [
    { Icon: Store, className: "text-green-700 bg-green-50 border-green-200", top: "10%", left: "50%", label: "Retail Stores" },
    { Icon: Laptop, className: "text-blue-700 bg-blue-50 border-blue-200", top: "28%", left: "85%", label: "Point of Sale" },
    { Icon: Calculator, className: "text-red-700 bg-red-50 border-red-200", top: "72%", left: "85%", label: "Finance" },
    { Icon: ShoppingBag, className: "text-amber-700 bg-amber-50 border-amber-200", top: "90%", left: "50%", label: "E-Commerce" },
    { Icon: Package, className: "text-pink-700 bg-pink-50 border-pink-200", top: "72%", left: "15%", label: "Wholesale" },
    { Icon: Tag, className: "text-cyan-700 bg-cyan-50 border-cyan-200", top: "28%", left: "15%", label: "Marketing" }
  ];

  const sizeClasses = {
    sm: { orbit: "80px", central: "24px", chip: "20px", icon: 10, messageWidth: "96px" },
    md: { orbit: "112px", central: "40px", chip: "26px", icon: 13, messageWidth: "128px" },
    lg: { orbit: "144px", central: "56px", chip: "32px", icon: 16, messageWidth: "160px" },
    xl: { orbit: "192px", central: "80px", chip: "40px", icon: 20, messageWidth: "192px" },
  };

  const dimensions = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;

  return (
    <div className="billing-loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
      <div className="billing-loader-relative" style={{ position: 'relative', width: dimensions.orbit, height: dimensions.orbit, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Orbit Ring with Icons */}
        <div className="billing-loader-orbit" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animation: 'rotate-orbit 20s linear infinite' }}>
          {DOMAIN_SYMBOLS.map((symbol, idx) => {
            const SymbolIcon = symbol.Icon;
            return (
              <span
                key={idx}
                className={`billing-loader-chip ${symbol.className}`}
                title={symbol.label}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  top: symbol.top,
                  left: symbol.left,
                  borderRadius: '50%',
                  border: '1px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: dimensions.chip,
                  height: dimensions.chip,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  backgroundColor: '#ffffff'
                }}
              >
                <SymbolIcon size={dimensions.icon} style={{ animation: 'rotate-reverse 20s linear infinite' }} />
              </span>
            );
          })}
        </div>

        {/* Central Pulse / Circle Ring */}
        <div className="billing-loader-skeleton" style={{
          width: dimensions.central,
          height: dimensions.central,
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          animation: 'pulse-scale 1.5s ease-in-out infinite',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: '25%',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-base, #ffffff)'
          }} />
        </div>
      </div>
      {message && (
        <>
          {/* Stand Neck (connecting circular monitor to base) */}
          <div className="billing-loader-neck" style={{
            width: size === 'sm' ? '6px' : '8px',
            height: size === 'sm' ? '12px' : '16px',
            backgroundColor: '#e2e8f0',
            animation: 'pulse-scale 1.5s ease-in-out infinite',
            margin: '2px 0 0 0',
            borderRadius: '2px',
            opacity: 0.85
          }} />
          {/* Stand Base */}
          <div className="billing-loader-skeleton-line" style={{
            height: '8px',
            width: dimensions.messageWidth,
            borderRadius: '9999px',
            backgroundColor: '#e2e8f0',
            animation: 'pulse-scale 1.5s ease-in-out infinite',
            marginTop: '2px'
          }} />
          <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
            {message}
          </span>
        </>
      )}
    </div>
  );
};

// Password validation helper
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

function validatePassword(password: string): PasswordValidationResult {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= minLength;

  const errors: string[] = [];
  if (!hasMinLength) errors.push(`Password must be at least ${minLength} characters long`);
  if (!hasNumber) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');

  return {
    isValid: hasMinLength && hasNumber && hasSpecialChar,
    errors
  };
}

const toast = (message: string, type: 'success' | 'error' | 'info') => {
  alert(message);
};

export default function LoginScreenWeb() {
  const { signIn, signUp, signInWithPassword, verifyOtp } = useAuthStore();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  
  const [signupOtpSent, setSignupOtpSent] = useState<boolean>(false);
  const [signupOtp, setSignupOtp] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>("signin");
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showcaseLabel, setShowcaseLabel] = useState<string>("Powering retail stores");

  useEffect(() => {
    document.title = 'Sign In - BillZest FinTrack';
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setValidationErrors([]);
  }, [password]);

  // Clean up OTP state when switching tabs
  useEffect(() => {
    setSignupOtpSent(false);
    setOtpSent(false);
    setOtp("");
    setSignupOtp("");
    setShowPassword(false);
  }, [activeTab]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    let loginEmail = email.trim();

    if (loginEmail.toUpperCase().startsWith('ORG-')) {
      try {
        const { data: resolvedEmail, error: rpcError } = await supabase.rpc('get_login_email_by_display_id', {
          p_display_id: loginEmail.toUpperCase()
        });

        if (rpcError || !resolvedEmail) {
          toast("Invalid BillZest ID. Organization owner not found.", "error");
          setLoading(false);
          return;
        }
        loginEmail = resolvedEmail as string;
      } catch (err) {
        console.error("Error resolving BillZest ID to email:", err);
        toast("Could not verify BillZest ID.", "error");
        setLoading(false);
        return;
      }
    }

    const { error } = await signInWithPassword(loginEmail, password);
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Welcome back!", "success");
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      toast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${phone}`;
    const { error } = await signIn(fullPhone);

    if (error) {
      toast(error.message, "error");
    } else {
      setOtpSent(true);
      toast(`OTP sent to ${fullPhone}`, "success");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${phone}`;
    const { error } = await verifyOtp(fullPhone, otp);

    if (error) {
      toast(error.message, "error");
    } else {
      toast("Welcome back!", "success");
    }
    setLoading(false);
  };

  // Step 1: Send OTP to verify phone for signup
  const handleSignUpInit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);

    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      toast("Valid 10-digit phone number is required", "error");
      setLoading(false);
      return;
    }

    if (!fullName.trim()) {
      toast("Full name is required", "error");
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      toast("You must accept the Terms & Conditions to join.", "error");
      setLoading(false);
      return;
    }

    // Check if account already exists with email or phone
    try {
      const { data: existCheck } = await supabase.rpc('check_user_exists', {
        p_email: email.trim(),
        p_phone: phone.trim()
      });

      const existCheckTyped = existCheck as { exists: boolean; phone_exists?: boolean; email_exists?: boolean } | null;

      if (existCheckTyped?.exists) {
        if (existCheckTyped.phone_exists) toast("Account already exists with this mobile", "error");
        else if (existCheckTyped.email_exists) toast("Account already exists with this email", "error");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Account existence check failed:", err);
    }

    const fullPhone = `${countryCode}${phone}`;
    const { error } = await signUp(fullPhone, fullName, email);

    if (error) {
      toast(error.message, "error");
    } else {
      setSignupOtpSent(true);
      toast("Verification code sent to your mobile!", "success");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP and finalize signup
  const handleSignUpFinal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signupOtp || signupOtp.length !== 6) {
      toast("Please enter the 6-digit code", "error");
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${phone}`;

    // 1. Verify OTP — this creates the auth.users row and establishes a session
    const { error: verifyError } = await verifyOtp(fullPhone, signupOtp);
    if (verifyError) {
      toast("Incorrect verification code. Please try again.", "error");
      setLoading(false);
      return;
    }

    try {
      // 2. Set password and store user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName,
          email_confirmed: true,
        },
      });

      if (updateError) {
        toast("Verified, but could not set password: " + updateError.message, "error");
        setLoading(false);
        return;
      }

      // 3. The fn_on_auth_user_created trigger automatically creates the accounts row.
      //    For fin users we just ensure the email is stored on the account.
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Update the accounts row with email + full_name (trigger may have already created it)
        await supabase
          .from('accounts')
          .update({ email, full_name: fullName })
          .eq('auth_id', currentUser.id);
      }

      toast("Account created successfully! Welcome to BillZest Fin.", "success");
    } catch (err) {
      toast("Verified, but failed to finalize account.", "error");
    }

    setLoading(false);
  };

  if (showSplash) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 99999,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        '--bg-base': '#000000'
      } as React.CSSProperties}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 35%, rgba(30,215,96,0.18), rgba(0,0,0,0.9) 45%, #000 80%)',
          pointerEvents: 'none'
        }} />
        {/* Dots pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          backgroundImage: 'radial-gradient(circle, #1ed760 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          {/* Logo container */}
          <div style={{
            height: '96px',
            width: '96px',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            backgroundColor: '#000000',
            boxShadow: '0 0 30px rgba(30, 215, 96, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 900,
            letterSpacing: '-0.02em'
          }}>
            <span style={{ color: '#1ed760', fontWeight: 900 }}>B</span>
            <span style={{ color: '#ffffff', fontWeight: 900 }}>Z</span>
          </div>

          {/* Title and subtitle */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              letterSpacing: '0.16em',
              margin: 0,
              fontFamily: "'Orbitron', 'Plus Jakarta Sans', sans-serif",
              color: '#ffffff'
            }}>
              <span style={{ color: '#1ed760' }}>BILL</span>ZEST
            </h1>
            <p style={{
              marginTop: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: 'rgba(52, 211, 153, 0.9)',
              margin: '12px 0 0 0'
            }}>
              India's Retail Operating System
            </p>
          </div>

          {/* BillingLoader at the bottom */}
          <BillingLoader size="sm" message="Preparing secure login..." />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-split-layout">
      {/* LEFT: Showcase Panel */}
      <section className="showcase-section">
        <div className="showcase-grid-bg" />
        <div className="showcase-badge">{showcaseLabel}</div>
        
        <AuthShowcaseCanvas onModuleChange={setShowcaseLabel} />
        
        <div className="showcase-stats-row">
          <div className="showcase-stat-card">
            <div className="icon-wrapper"><Users size={16} /></div>
            <div className="stat-num">1000+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="showcase-stat-card">
            <div className="icon-wrapper"><Sparkles size={16} /></div>
            <div className="stat-num">AI Tools</div>
            <div className="stat-label">Automation</div>
          </div>
          <div className="showcase-stat-card">
            <div className="icon-wrapper"><Wrench size={16} /></div>
            <div className="stat-num">30+</div>
            <div className="stat-label">Features</div>
          </div>
        </div>
        
        <p className="showcase-footer-label">India's No.1 Retail Solution Platform</p>
      </section>

      {/* RIGHT: Form Panel */}
      <section className="form-section">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-wrapper"
        >
          {/* Logo Header */}
          <div className="form-logo-header">
            <div className="form-logo">
              <span className="b">B</span>
              <span className="z">Z</span>
            </div>
            <h1 className="form-brand-title">
              BILL<span>ZEST</span>
            </h1>
            <p className="form-brand-sub">Elevating business operations</p>
          </div>

          <div className="form-title-area">
            <h2>
              {activeTab === 'signin' ? 'Sign In' : activeTab === 'otp' ? 'Login with OTP' : 'Create Account'}
            </h2>
            <p>Secure access for every business role.</p>
          </div>

          {/* Custom tab bar */}
          <div className="tabs-list-wrapper">
            <button 
              className={`tab-trigger ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'otp' ? 'active' : ''}`}
              onClick={() => setActiveTab('otp')}
            >
              OTP
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Join
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="auth-form">
                  <div className="auth-form-group">
                    <label className="auth-label">Email / BillZest ID</label>
                    <input
                      type="text"
                      placeholder="you@domain.com"
                      className="auth-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <div className="auth-label-row">
                      <label className="auth-label">Password</label>
                      <button 
                        type="button" 
                        className="auth-forgot-password" 
                        onClick={() => toast("Please contact support at support@billzest.com to reset password.", "info")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <BillingLoader size="sm" /> : "LOG IN"}
                  </button>
                </form>
              )}

              {activeTab === 'otp' && (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="auth-form">
                  <div className="auth-form-group">
                    <label className="auth-label">Mobile Number</label>
                    <div className="phone-container">
                      <div className="cc-select-wrapper">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="cc-select"
                        >
                          <option value="+91">+91</option>
                        </select>
                      </div>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        className="auth-input flex-1"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {otpSent && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="auth-form-group"
                        style={{ overflow: 'hidden' }}
                      >
                        <label className="auth-label">OTP Code</label>
                        <input
                          type="text"
                          placeholder="000000"
                          className="auth-input text-center font-mono letter-spacing-lg"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          autoFocus
                        />
                        <p className="otp-helper-text">
                          <CheckCircle2 size={12} className="text-emerald" /> Verification code sent.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <BillingLoader size="sm" /> : (otpSent ? "VERIFY & LOGIN" : "GET ACCESS CODE")}
                  </button>

                  {otpSent && (
                    <button 
                      type="button" 
                      className="auth-change-phone-btn" 
                      onClick={() => { setOtpSent(false); setOtp(""); }} 
                      disabled={loading}
                    >
                      Change Phone Number?
                    </button>
                  )}
                </form>
              )}

              {activeTab === 'signup' && (
                <form onSubmit={signupOtpSent ? handleSignUpFinal : handleSignUpInit} className="auth-form">
                  <AnimatePresence mode="wait">
                    {!signupOtpSent ? (
                      <motion.div
                        key="signup-form"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="signup-step-container"
                      >
                        {validationErrors.length > 0 && (
                          <div className="signup-error-box">
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <div className="error-list">
                              {validationErrors.map((err, i) => (
                                <div key={i}>{err}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="auth-form-group">
                          <label className="auth-label">Full Name</label>
                          <input 
                            placeholder="Your name" 
                            className="auth-input" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            required 
                          />
                        </div>
                        
                        <div className="auth-form-group">
                          <label className="auth-label">Email</label>
                          <input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="auth-input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                          />
                        </div>
                        
                        <div className="auth-form-group">
                          <label className="auth-label">Mobile</label>
                          <input 
                            type="tel" 
                            placeholder="10 digits" 
                            className="auth-input" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                            required 
                          />
                        </div>
                        
                        <div className="auth-form-group" style={{ marginBottom: '20px' }}>
                          <label className="auth-label">Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="auth-input"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <div className="signup-terms-check">
                          <input
                            type="checkbox"
                            id="terms-check"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="terms-checkbox"
                          />
                          <label htmlFor="terms-check" className="terms-label">
                            I agree that BillZest will use my data for marketing. Subscriptions cannot be canceled once purchased. BillZest has the right to revoke accounts.{" "}
                            <span className="text-emerald hover-underline cursor-pointer" onClick={(e) => e.preventDefault()}>
                              Terms & Conditions
                            </span>.
                          </label>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                          {loading ? <BillingLoader size="sm" /> : "CREATE ACCOUNT"}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup-otp"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="signup-otp-container"
                      >
                        <div className="signup-otp-banner">
                          <h3>IDENTITY VERIFICATION</h3>
                          <p>SENT TO {phone}</p>
                        </div>
                        <div className="auth-form-group" style={{ marginBottom: '24px' }}>
                          <label className="auth-label">Enter Verification Code</label>
                          <input 
                            type="text" 
                            placeholder="000000" 
                            className="auth-input text-center font-mono letter-spacing-lg"
                            style={{ fontSize: '24px', height: '64px' }}
                            value={signupOtp}
                            onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            autoFocus
                          />
                        </div>
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                          {loading ? <BillingLoader size="sm" /> : "FINALIZE"}
                        </button>
                        <button 
                          type="button" 
                          className="auth-back-btn" 
                          onClick={() => setSignupOtpSent(false)}
                        >
                          Back
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </motion.div>
          </AnimatePresence>


          
          <div className="auth-footer-copy">
            © 2026 BillZest Global Solutions • Secure SaaS POS
          </div>
        </motion.div>
      </section>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Orbitron:wght@900&display=swap');

        .font-orbitron {
          font-family: 'Orbitron', 'Plus Jakarta Sans', sans-serif !important;
        }

        .auth-split-layout {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a;
          overflow-x: hidden;
        }

        /* LEFT PANEL: Showcase */
        .showcase-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 60%;
          background-color: #ecfdf5; /* emerald-50 */
          border-right: 1px solid #d1fae5;
          padding: 40px;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .showcase-section {
            display: none;
          }
          .form-section {
            width: 100% !important;
            padding: 32px 16px !important;
          }
        }

        .showcase-grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.35;
          background-image: radial-gradient(circle, #059669 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .showcase-badge {
          position: relative;
          z-index: 10;
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          border-radius: 9999px;
          padding: 6px 16px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #065f46;
          margin-bottom: 24px;
        }

        /* Showcase Stats cards */
        .showcase-stats-row {
          display: flex;
          gap: 16px;
          z-index: 10;
          margin-bottom: 24px;
        }

        .showcase-stat-card {
          background: #ffffff;
          border: 1px solid #d1fae5;
          border-radius: 16px;
          padding: 12px 20px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.05);
          width: 110px;
        }

        .showcase-stat-card .icon-wrapper {
          color: #059669;
          margin-bottom: 6px;
          display: flex;
          justify-content: center;
        }

        .showcase-stat-card .stat-num {
          font-size: 16px;
          font-weight: 800;
          color: #047857;
        }

        .showcase-stat-card .stat-label {
          font-size: 9px;
          font-weight: 600;
          color: #065f46;
          margin-top: 2px;
        }

        .showcase-footer-label {
          position: relative;
          z-index: 10;
          font-size: 10px;
          font-weight: 700;
          color: #065f46;
          opacity: 0.6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* RIGHT PANEL: Form */
        .form-section {
          width: 40%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          overflow-y: auto;
          background: #ffffff;
        }

        .form-wrapper {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
        }

        .form-logo-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }

        .form-logo {
          width: 56px;
          height: 56px;
          background: #000000;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 26px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .form-logo .b { color: #ffffff; }
        .form-logo .z { color: #10b981; }

        .form-brand-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.1em;
          margin: 12px 0 0 0;
          color: #0f172a;
          font-family: 'Orbitron', 'Plus Jakarta Sans', sans-serif;
        }

        .form-brand-title span {
          color: #10b981;
        }

        .form-brand-sub {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-top: 4px;
        }

        .form-title-area {
          margin-bottom: 24px;
        }

        .form-title-area h2 {
          font-size: 24px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .form-title-area p {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin: 4px 0 0 0;
        }

        /* Tabs redesigned */
        .tabs-list-wrapper {
          display: flex;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab-trigger {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 0;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .tab-trigger.active {
          background: #10b981;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
        }

        /* Form elements */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .auth-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #059669;
          padding-left: 2px;
        }

        .auth-forgot-password {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .auth-forgot-password:hover {
          color: #10b981;
        }

        .auth-input {
          height: 48px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 14.5px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }

        .auth-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          background-color: #ffffff;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .password-input-wrapper .auth-input {
          width: 100%;
          padding-right: 48px;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.2s;
        }

        .password-toggle-btn:hover {
          color: #10b981;
        }

        .phone-container {
          display: flex;
          gap: 8px;
        }

        .cc-select-wrapper {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 12px;
        }

        .cc-select {
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
          outline: none;
          cursor: pointer;
        }

        .letter-spacing-lg {
          letter-spacing: 0.4em;
        }

        .otp-helper-text {
          font-size: 10px;
          color: #64748b;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .text-emerald { color: #10b981; }

        /* Submit Button */
        .auth-submit-btn {
          height: 48px;
          background-color: #10b981;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .auth-submit-btn:hover {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-change-phone-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          margin-top: 8px;
        }

        .auth-change-phone-btn:hover {
          color: #10b981;
        }

        /* Signup Step specific */
        .signup-step-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .signup-error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #ef4444;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          gap: 8px;
        }

        .error-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .signup-terms-check {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .terms-checkbox {
          margin-top: 2px;
          cursor: pointer;
        }

        .terms-label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          line-height: 1.4;
          cursor: pointer;
        }

        .hover-underline:hover {
          text-decoration: underline;
        }

        /* Final OTP banner */
        .signup-otp-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .signup-otp-banner {
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          padding: 12px 16px;
        }

        .signup-otp-banner h3 {
          font-size: 11px;
          font-weight: 800;
          color: #065f46;
          margin: 0;
          letter-spacing: 0.1em;
        }

        .signup-otp-banner p {
          font-size: 9px;
          font-weight: 700;
          color: #047857;
          margin: 2px 0 0 0;
        }

        .auth-back-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          height: 40px;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          transition: background 0.2s;
        }

        .auth-back-btn:hover {
          background: #f1f5f9;
        }

        /* Spinner */
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes rotate-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotate-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        @keyframes pulse-scale {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }

        .auth-footer-copy {
          font-size: 8px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          text-align: center;
          margin-top: 32px;
        }

        /* SPLASH SCREEN REDESIGN */
        .splash-screen-redesign {
          position: fixed;
          inset: 0;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          overflow: hidden;
        }

        .splash-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          background: rgba(16, 185, 129, 0.12);
          filter: blur(60px);
          border-radius: 50%;
        }

        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          z-index: 10;
        }

        .splash-logo {
          width: 80px;
          height: 80px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .splash-logo .b { color: #ffffff; }
        .splash-logo .z { color: #10b981; }

        .splash-text {
          text-align: center;
        }

        .splash-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: #ffffff;
          margin: 0;
        }

        .splash-title span {
          color: #10b981;
        }

        .splash-subtitle {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(16, 185, 129, 0.7);
          margin-top: 6px;
        }

        .spinner-bar {
          width: 80px;
          height: 2px;
          background: #1e293b;
          border-radius: 1px;
          overflow: hidden;
          position: relative;
        }

        .spinner-bar::after {
          content: '';
          position: absolute;
          left: -100%;
          width: 100%;
          height: 100%;
          background: #10b981;
          animation: loading-bar-flow 1.5s infinite;
        }

        @keyframes loading-bar-flow {
          0% { left: -100%; }
          50% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
