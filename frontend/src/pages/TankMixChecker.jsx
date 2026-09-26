import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';

const API = API_BASE_URL || '';
const CAT_COLORS = { insecticide: '#f97316', fungicide: '#a855f7', herbicide: '#ef4444', foliar_fertilizer: '#22c55e' };
const CAT_ICONS = { insecticide: '🐛', fungicide: '🍄', herbicide: '🌿', foliar_fertilizer: '💧' };

export default function TankMixChecker() {
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState([]);
    const [result, setResult] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API}/api/tank-mix/products`).then(r => setProducts(r.data.products || [])).catch(() => {});
    }, []);

    const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    const checkMix = async() => {
        if (selected.length < 2) { alert('Select at least 2 products to check compatibility'); return; }
        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/api/tank-mix/check`, { productIds: selected });
            setResult(data);
        } catch (e) {
            alert(e.response?.data?.error || 'Check failed');
        } finally { setLoading(false); }
    };

    const filteredProducts = activeFilter === 'all' ? products : products.filter(p => p.category === activeFilter);
    const ratingColors = { 'SAFE ✅': '#22c55e', 'CAUTION ⚠️': '#f59e0b', 'UNSAFE ❌': '#ef4444' };

    return ( <
        div style = {
            { minHeight: '100vh', background: 'linear-gradient(135deg,#1a0020,#2d0040,#0a1a30)', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }
        } >
        <
        div style = {
            { maxWidth: 1000, margin: '0 auto' }
        } > { /* Header */ } <
        div style = {
            { textAlign: 'center', marginBottom: '2rem' }
        } >
        <
        div style = {
            { fontSize: '3rem' }
        } > 🔬 < /div> <
        h1 style = {
            { margin: 0, fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(90deg,#c084fc,#f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
        } > Agro - Chemical Tank - Mix Safety < /h1> <
        p style = {
            { color: '#94a3b8', marginTop: '0.4rem' }
        } > Select products→ Check compatibility before mixing in spray tank < /p> < /
        div >

        { /* Filter Tabs */ } <
        div style = {
            { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }
        } > {
            ['all', 'insecticide', 'fungicide', 'herbicide', 'foliar_fertilizer'].map(cat => ( <
                button key = { cat }
                onClick = {
                    () => setActiveFilter(cat)
                }
                style = {
                    { padding: '0.4rem 1rem', borderRadius: 999, border: activeFilter === cat ? `2px solid ${CAT_COLORS[cat] || '#6366f1'}` : '1px solid rgba(255,255,255,0.1)', background: activeFilter === cat ? `${CAT_COLORS[cat] || '#6366f1'}22` : 'rgba(255,255,255,0.04)', color: activeFilter === cat ? (CAT_COLORS[cat] || '#818cf8') : '#94a3b8', fontWeight: activeFilter === cat ? 700 : 400, cursor: 'pointer', fontSize: '0.82rem', textTransform: 'capitalize' }
                } > { CAT_ICONS[cat] || '🔧' } { cat.replace(/_/g, ' ') } <
                /button>
            ))
        } <
        /div>

        { /* Selection Status + Check Button */ } <
        div style = {
            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }
        } >
        <
        div style = {
            { color: '#94a3b8', fontSize: '0.9rem' }
        } > { selected.length === 0 ? '☝️ Select 2+ products to check tank-mix safety' : `✅ ${selected.length} product(s) selected for mix-check` } <
        /div> <
        div style = {
            { display: 'flex', gap: '0.75rem' }
        } > {
            selected.length > 0 && < button onClick = {
                () => {
                    setSelected([]);
                    setResult(null);
                }
            }
            style = {
                { padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }
            } > Clear < /button>} <
            button onClick = { checkMix }
            disabled = { loading || selected.length < 2 }
            style = {
                { padding: '0.55rem 1.4rem', background: selected.length >= 2 && !loading ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : '#334155', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: selected.length >= 2 && !loading ? 'pointer' : 'not-allowed', fontSize: '0.9rem' }
            } > { loading ? '⏳ Checking...' : '🔍 Check Compatibility' } <
            /button> < /
            div > <
            /div>

            { /* Products Grid */ } <
            div style = {
                { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem', marginBottom: '2rem' }
            } > {
                filteredProducts.map(p => {
                        const isSelected = selected.includes(p.id);
                        const color = CAT_COLORS[p.category] || '#6366f1';
                        return ( <
                            div key = { p.id }
                            onClick = {
                                () => toggle(p.id)
                            }
                            style = {
                                { padding: '1.1rem', borderRadius: 14, border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.07)'}`, background: isSelected ? `${color}15` : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }
                            } > {
                                isSelected && < div style = {
                                    { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }
                                } > ✓ < /div>} <
                                div style = {
                                    { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }
                                } >
                                <
                                span style = {
                                    { fontSize: '1.3rem' }
                                } > { CAT_ICONS[p.category] || '🧪' } < /span> <
                                span style = {
                                    { fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 5, background: `${color}22`, color, fontWeight: 700, textTransform: 'capitalize' }
                                } > { p.category } < /span> < /
                                div > <
                                div style = {
                                    { fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.3 }
                                } > { p.name } < /div> <
                                div style = {
                                    { color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }
                                } > Active: { p.activeIngredient } | Form: { p.formulation } < /div> {
                                p.note && < div style = {
                                    { marginTop: '0.4rem', fontSize: '0.75rem', color: '#fca5a5' }
                                } > ⚠️{ p.note } < /div>} < /
                                div >
                            );
                        })
                } <
                /div>

                { /* Results */ } {
                    result && ( <
                        div style = {
                            { background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }
                        } >
                        <
                        div style = {
                            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }
                        } >
                        <
                        h3 style = {
                            { margin: 0, color: '#c084fc', fontWeight: 800, fontSize: '1.1rem' }
                        } > 🧪Compatibility Report < /h3> <
                        div style = {
                            { fontSize: '1.4rem', fontWeight: 800, color: ratingColors[result.overallRating] || '#22c55e' }
                        } > { result.overallRating } < /div> < /
                        div >

                        {
                            result.criticalIssues?.length > 0 && ( <
                                div style = {
                                    { marginBottom: '1.5rem' }
                                } >
                                <
                                div style = {
                                    { color: '#ef4444', fontWeight: 700, marginBottom: '0.75rem' }
                                } > 🚫Critical Issues({ result.criticalIssues.length }) < /div> {
                                result.criticalIssues.map((issue, i) => ( <
                                    div key = { i }
                                    style = {
                                        { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }
                                    } >
                                    <
                                    div style = {
                                        { fontWeight: 700, color: '#fca5a5', fontSize: '0.9rem' }
                                    } > { issue.issue } < /div> <
                                    div style = {
                                        { color: '#ef4444', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }
                                    } > ⚠️{ issue.action } < /div> < /
                                    div >
                                ))
                            } <
                            /div>
                        )
                    }

                    {
                        result.warnings?.length > 0 && ( <
                                div style = {
                                    { marginBottom: '1.5rem' }
                                } >
                                <
                                div style = {
                                    { color: '#f59e0b', fontWeight: 700, marginBottom: '0.75rem' }
                                } > ⚠️Warnings({ result.warnings.length }) < /div> {
                                result.warnings.map((w, i) => ( <
                                    div key = { i }
                                    style = {
                                        { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#fbbf24' }
                                    } > { w.issue }— < em > { w.action } < /em></div >
                                ))
                            } <
                            /div>
                    )
                }

                {
                    result.safe && result.criticalIssues?.length === 0 && ( <
                        div style = {
                            { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', color: '#86efac', fontWeight: 700 }
                        } > ✅No critical incompatibilities detected.Tank - mix appears safe
                        for use. <
                        /div>
                    )
                }

                { /* Mixing Protocol */ }
                <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 14, border: '1px solid rgba(99,102,241,0.2)', padding: '1rem' }}>
                    <div style={{ color: '#818cf8', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>🧫 Recommended Mixing Protocol</div>
                    {result.mixingOrderProtocol?.map((step, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: '#c7d2fe', marginBottom: '0.3rem' }}>{step}</div>
                    ))}
                    {result.jarTestRequired && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
                            ⚗️ Jar Test Required: Mix a small trial batch (500 mL) and observe for precipitation or layer separation before full tank mixing.
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
    </div>
    );
}