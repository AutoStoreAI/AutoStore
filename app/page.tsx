"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { track, type TrackingEvent } from "../lib/tracking";

type Step = "landing" | "prediction" | "cart" | "autonomy" | "join" | "success";
type AutomationId = "recommendation" | "preparation" | "automatic";

const products = [
  { name: "Leche", icon: "🥛", due: "en 2 días", confidence: 94, cadence: "cada 5 días", price: 3.18, color: "#e8f5ee" },
  { name: "Huevos", icon: "🥚", due: "en 3 días", confidence: 91, cadence: "cada 7 días", price: 3.75, color: "#fff4df" },
  { name: "Café", icon: "☕", due: "en 5 días", confidence: 89, cadence: "cada 16 días", price: 5.95, color: "#f3ebe5" },
  { name: "Papel higiénico", icon: "🧻", due: "en 8 días", confidence: 86, cadence: "cada 21 días", price: 4.42, color: "#edf2ff" },
  { name: "Detergente", icon: "🫧", due: "en 10 días", confidence: 83, cadence: "cada 30 días", price: 6.4, color: "#e8f6f7" },
  { name: "Yogures", icon: "🍶", due: "en 1 día", confidence: 96, cadence: "cada 6 días", price: 3.1, color: "#f9ecf2" },
];
const cart = [products[0], products[1], products[2], products[4], products[5]];
const levels: Record<AutomationId, { title: string; description: string; icon: string; event: TrackingEvent }> = {
  recommendation: { title: "Solo recomendarme", description: "AutoStore te avisa cuando cree que necesitas comprar algo.", icon: "✦", event: "recommendation_selected" },
  preparation: { title: "Preparar mi carrito", description: "AutoStore prepara tu compra y tú la revisas antes de comprar.", icon: "▣", event: "cart_preparation_selected" },
  automatic: { title: "Comprar automáticamente", description: "AutoStore compra tus productos habituales cuando detecta que los necesitas.", icon: "↗", event: "auto_purchase_selected" },
};

function Logo() { return <div className="logo"><span className="logo-mark">a</span><span>autostore</span></div>; }
function Back({ onClick }: { onClick: () => void }) { return <button className="back" onClick={onClick} aria-label="Volver">←</button>; }

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [selected, setSelected] = useState<AutomationId | null>(null);
  const [name, setName] = useState("");
  useEffect(() => { track("landing_view"); }, []);
  const go = (next: Step) => {
    const viewed: Partial<Record<Step, TrackingEvent>> = { prediction: "prediction_viewed", cart: "cart_viewed", autonomy: "automation_screen_viewed" };
    if (viewed[next]) track(viewed[next]);
    setStep(next); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (step === "landing") return <Landing onStart={() => { track("demo_started"); go("prediction"); }} />;
  if (step === "prediction") return <Prediction onBack={() => go("landing")} onCart={() => go("cart")} />;
  if (step === "cart") return <Cart onBack={() => go("prediction")} onApprove={() => { track("purchase_approved", { products: cart.length, total: "42.80" }); go("autonomy"); }} />;
  if (step === "autonomy") return <Autonomy selected={selected} onBack={() => go("cart")} onSelect={(level) => { setSelected(level); track(levels[level].event, { automation_level: level }); }} onContinue={() => go("join")} />;
  if (step === "join" && selected) return <Join selected={selected} onBack={() => go("autonomy")} onSubmit={(submittedName) => { track("email_submitted", { automation_level: selected }); setName(submittedName); go("success"); }} />;
  return <Success name={name} selected={selected ?? "automatic"} onRestart={() => go("landing")} />;
}

function Landing({ onStart }: { onStart: () => void }) { return <main className="landing screen-enter"><nav><Logo /><span className="nav-note">Tu lista, sin pensar</span></nav><section className="hero"><div className="eyebrow"><i />Compra inteligente</div><h1>Tu próxima compra<br />ya está <em>casi hecha.</em></h1><p>AutoStore aprende lo que compras habitualmente y predice qué necesitarás próximamente.</p><button className="primary" onClick={onStart}>Predecir mi próxima compra <span>→</span></button><div className="trusted"><div className="avatars"><b>J</b><b>M</b><b>A</b></div><span>Hecho para los imprescindibles<br />de cada hogar</span></div></section><section className="hero-card"><div className="card-top"><span>Próxima compra</span><b>Actualizada ahora</b></div><div className="mini-items">{products.slice(0, 3).map((p, i) => <div className="mini-row" key={p.name}><span className="product-icon" style={{ background: p.color }}>{p.icon}</span><span>{p.name}</span><small>{i === 0 ? "Pronto" : p.due}</small></div>)}</div><div className="card-footer"><span>Tu carrito está casi listo</span><span>→</span></div></section><div className="landing-orb orb-one" /><div className="landing-orb orb-two" /></main>; }

function Prediction({ onBack, onCart }: { onBack: () => void; onCart: () => void }) { return <main className="app-shell screen-enter"><header><Back onClick={onBack} /><Logo /><span className="header-spacer" /></header><section className="intro"><div className="eyebrow"><i />Análisis completo</div><h1>Tu próxima compra</h1><p>Hemos revisado tus hábitos de los últimos 30 días.</p></section><div className="insight"><div className="sparkle">✦</div><p>Sabemos qué se está acabando antes de que tengas que pensarlo.</p><div className="history"><span>30 días de historial</span><div><i /><i /><i /><i /><i /><i /></div></div></div><section className="prediction-list"><div className="section-label"><span>PREVISIONES</span><span>CONFIANZA</span></div>{products.map((p, index) => <article className="prediction" key={p.name} style={{ animationDelay: `${index * 60}ms` }}><span className="product-icon large" style={{ background: p.color }}>{p.icon}</span><div className="prediction-info"><strong>{p.name}</strong><span>Lo compras {p.cadence}</span></div><div className="prediction-meta"><b className={index === 0 || index === 5 ? "soon" : ""}>{p.due}</b><small>{p.confidence}%</small></div></article>)}</section><section className="ready-card"><div><span className="ready-icon">✓</span><div><strong>AutoStore ha preparado tu carrito.</strong><p>5 productos · Total estimado 42,80 €</p></div></div><button className="primary" onClick={onCart}>Revisar carrito <span>→</span></button></section></main>; }

function Cart({ onBack, onApprove }: { onBack: () => void; onApprove: () => void }) { return <main className="app-shell screen-enter"><header><Back onClick={onBack} /><Logo /><span className="header-spacer" /></header><section className="intro cart-intro"><div className="eyebrow"><i />Carrito inteligente</div><h1>Tu compra está lista.</h1><p>Hemos reunido los productos que probablemente necesitas.</p></section><div className="cart-list">{cart.map((p, index) => <article className="cart-item" key={p.name}><span className="product-icon large" style={{ background: p.color }}>{p.icon}</span><div><strong>{p.name} <span className="quantity">× {index === 0 ? 2 : 1}</span></strong><span>{index === 0 ? "Tu marca habitual" : "Según tu rutina"}</span></div><b>{p.price.toFixed(2).replace(".", ",")} €</b></article>)}</div><div className="total"><span><b>5 productos</b><small>Total estimado</small></span><strong>42,80 €</strong></div><div className="cart-actions"><button className="primary" onClick={onApprove}>✓&nbsp; Aprobar compra <span>→</span></button></div><p className="secure">Demo: no se realizará ningún cargo.</p></main>; }

function Autonomy({ selected, onSelect, onBack, onContinue }: { selected: AutomationId | null; onSelect: (level: AutomationId) => void; onBack: () => void; onContinue: () => void }) { return <main className="app-shell screen-enter"><header><Back onClick={onBack} /><Logo /><span className="header-spacer" /></header><section className="intro autonomy-intro"><div className="eyebrow"><i />Tú tienes el control</div><h1>¿Hasta dónde confiarías en AutoStore?</h1><p>Puedes decidir cuánto quieres delegar. Tú tienes el control.</p></section><section className="levels">{(Object.entries(levels) as [AutomationId, typeof levels[AutomationId]][]).map(([id, level]) => <button className={`level ${selected === id ? "selected" : ""} ${id === "automatic" ? "featured" : ""}`} key={id} onClick={() => onSelect(id)}><span className="level-icon">{level.icon}</span><span className="level-copy"><strong>{level.title}</strong><small>{level.description}</small></span><span className="radio">{selected === id && "✓"}</span>{id === "automatic" && <span className="recommended">MÁXIMA AUTOMATIZACIÓN</span>}</button>)}</section>{selected && <button className="primary fixed-bottom" onClick={onContinue}>Quiero probar AutoStore <span>→</span></button>}</main>; }

function Join({ selected, onBack, onSubmit }: { selected: AutomationId; onBack: () => void; onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!cleanName) return setError("Escribe tu nombre para continuar.");
    if (!isValidEmail) return setError("Introduce un email válido.");

    setError("");
    setIsSubmitting(true);
    try {
      const { error: insertError } = await getSupabaseClient().from("beta_signups").insert({
        name: cleanName,
        email: cleanEmail,
        automation_level: selected,
        created_at: new Date().toISOString(),
      });

      if (insertError?.code === "23505") {
        setError("Este email ya está apuntado a la beta.");
        return;
      }
      if (insertError) throw insertError;
      onSubmit(cleanName);
    } catch {
      setError("No hemos podido guardar tu solicitud. Prueba de nuevo en un momento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <main className="join screen-enter"><header><Back onClick={onBack} /><Logo /><span className="header-spacer" /></header><section className="join-content"><div className="join-symbol">✦</div><div className="eyebrow"><i />Acceso anticipado</div><h1>Queremos que seas de los primeros.</h1><p>Estamos construyendo AutoStore para que nunca tengas que acordarte de reponer tus productos habituales.</p><form onSubmit={handleSubmit} noValidate><label>Nombre<input required value={name} onChange={event => setName(event.target.value)} placeholder="¿Cómo te llamas?" aria-invalid={Boolean(error)} /></label><label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="tu@email.com" aria-invalid={Boolean(error)} /></label><p className="preference">Tu preferencia: <b>{levels[selected].title}</b></p>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando tu plaza…" : <>Unirme a la beta <span>→</span></>}</button></form><small className="privacy">Sin spam. Solo te escribiremos cuando puedas probarlo.</small></section></main>;
}

function Success({ name, selected, onRestart }: { name: string; selected: AutomationId; onRestart: () => void }) { return <main className="success screen-enter"><Logo /><div className="success-check">✓</div><div><div className="eyebrow"><i />Todo listo</div><h1>🎉 Estás dentro.</h1><p>Te avisaremos cuando AutoStore esté listo para que puedas probarlo.</p><div className="success-preference"><span>Tu nivel de automatización</span><b>{levels[selected].title}</b></div><p className="thanks">Gracias{ name ? `, ${name},` : ""} por ayudarnos a construir una forma más inteligente de hacer la compra.</p></div><button className="outline" onClick={onRestart}>Volver al inicio</button></main>; }
