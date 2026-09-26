import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';

const API = API_BASE_URL || '';
const CROPS = ['Paddy / Rice', 'Wheat', 'Cotton', 'Maize', 'Soybean', 'Tomato', 'Onion', 'Chili', 'Groundnut', 'Sugarcane'];
const STATUS_COLORS = { sufficient: '#22c55e', medium: '#f59e0b', deficient: '#ef4444', unknown: '#64748b' };
const STATUS_ICONS = { sufficient: '✅', medium: '⚠️', deficient: '❌', unknown: '❓' };

const DEFAULT_SHC = { nitrogen: 380, phosphorus: 8, potassium: 220, sulfur: 8, zinc: 0.4, iron: 7, manganese: 3.5, boron: 0.4, pH: 6.8, organicCarbon: 0.45 };

export default function SoilHealth() {
    const [form, setForm] = useState({ shcData: DEFAULT_SHC, crop: 'Paddy / Rice', landHectares: 2 });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(f => ({...f, [k]: v }));
    const setShc = (k, v) => setForm(f => ({...f, shcData: {...f.shcData, [k]: parseFloat(v) || 0 } }));
    const fmt = (n) => n?.toLocaleString('en-IN') || '—';

    const analyze = async() => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const { data } = await axios.post(`${API}/api/soil-health/analyze`, { shcData: form.shcData, crop: form.crop, landHectares: Number(form.landHectares) });
            setResult(data);
            // Persist the farmer-provided measurements through the authenticated soil pipeline.
            // Analysis remains visible if persistence is unavailable; no success message is shown for an unsaved record.
            try {
                await axios.post(`${API}/api/soil`, {
                    nitrogen: form.shcData.nitrogen,
                    phosphorus: form.shcData.phosphorus,
                    potassium: form.shcData.potassium,
                    ph: form.shcData.pH,
                    source: 'soil_test',
                    unit: 'reported soil-test units',
                    measuredAt: new Date().toISOString(),
                });
            } catch (persistError) {
                setError(persistError.response?.data?.error || 'Analysis completed, but the soil measurement could not be saved.');
            }
        } catch (e) {
            setError(e.response?.data?.error || 'Analysis failed');
        } finally { setLoading(false); }
    };

    const shcFields = [
        ['nitrogen', 'Available N (kg/ha)', '0–1000'],
        ['phosphorus', 'Available P (kg/ha)', '0–100'],
        ['potassium', 'Available K (kg/ha)', '0–600'],
        ['sulfur', 'Sulfur (ppm)', '0–50'],
        ['zinc', 'DTPA Zinc (ppm)', '0–5'],
        ['iron', 'DTPA Iron (ppm)', '0–50'],
        ['manganese', 'Manganese (ppm)', '0–20'],
        ['boron', 'Boron (ppm)', '0–5'],
        ['pH', 'Soil pH', '3–10'],
        ['organicCarbon', 'Organic Carbon (%)', '0–3'],
    ];

    return ( <
            div style = {
                { minHeight: '100vh', background: 'linear-gradient(135deg,#1a0a00,#3d1f00,#1a3a00)', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }
            } >
            <
            div style = {
                { maxWidth: 1000, margin: '0 auto' }
            } > { /* Header */ } <
            div style = {
                { textAlign: 'center', marginBottom: '2.5rem' }
            } >
            <
            div style = {
                { fontSize: '3rem' }
            } > 🧪 < /div> <
            h1 style = {
                { margin: 0, fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(90deg,#86efac,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
            } > Soil Health Card Analyzer < /h1> <
            p style = {
                { color: '#94a3b8', marginTop: '0.4rem' }
            } > ICAR / STCR Benchmark Analysis· NPK Deficiency Detection· Crop - Specific Fertilizer Schedule < /p> < /
            div >

            <
            div style = {
                { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }
            } > { /* SHC Input */ } <
            div style = {
                { background: 'rgba(255,255,255,0.04)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }
            } >
            <
            h3 style = {
                { margin: '0 0 1rem', color: '#86efac', fontWeight: 700 }
            } > 📋Enter SHC Test Values < /h3> <
            div style = {
                { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }
            } > {
                shcFields.map(([key, label, hint]) => ( <
                    div key = { key } >
                    <
                    label style = {
                        { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }
                    } > { label } < /label> <
                    input type = "number"
                    value = { form.shcData[key] }
                    step = "any"
                    onChange = { e => setShc(key, e.target.value) }
                    placeholder = { hint }
                    style = {
                        { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.55rem 0.7rem', color: '#e2e8f0', fontSize: '0.85rem', boxSizing: 'border-box' }
                    }
                    /> < /
                    div >
                ))
            } <
            /div> <
            label style = {
                { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }
            } > 🌱Crop < /label> <
            select value = { form.crop }
            onChange = { e => set('crop', e.target.value) }
            style = {
                { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.55rem', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.75rem' }
            } > {
                CROPS.map(c => < option key = { c }
                    value = { c } > { c } < /option>)} < /
                    select > <
                    label style = {
                        { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }
                    } > 📐Land Area(Hectares) < /label> <
                    input type = "number"
                    value = { form.landHectares }
                    onChange = { e => set('landHectares', e.target.value) }
                    min = { 0.1 }
                    step = { 0.5 }
                    style = {
                        { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.55rem', color: '#e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1rem' }
                    }
                    /> <
                    button onClick = { analyze }
                    disabled = { loading }
                    style = {
                        { width: '100%', padding: '0.85rem', background: loading ? '#334155' : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }
                    } > { loading ? '⏳ Analyzing...' : '🔬 Analyze Soil & Generate Prescription' } <
                    /button> {
                    error && < div style = {
                        { marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(239,68,68,0.15)', borderRadius: 8, color: '#fca5a5', textAlign: 'center', fontSize: '0.85rem' }
                    } > { error } < /div>} < /
                    div >

                    { /* Results Panel */ } {
                        result && ( <
                                div > { /* Score */ } <
                                div style = {
                                    { background: 'rgba(34,197,94,0.08)', borderRadius: 18, border: '1px solid rgba(34,197,94,0.25)', padding: '1.2rem', marginBottom: '1rem', textAlign: 'center' }
                                } >
                                <
                                div style = {
                                    { fontSize: '2.5rem', fontWeight: 900, color: result.soilHealthScore >= 70 ? '#22c55e' : result.soilHealthScore >= 40 ? '#f59e0b' : '#ef4444' }
                                } > { result.soilHealthScore } % < /div> <
                                div style = {
                                    { color: '#94a3b8', fontSize: '0.85rem' }
                                } > Soil Health Score < /div> {
                                result.deficienciesDetected?.length > 0 && ( <
                                    div style = {
                                        { marginTop: '0.5rem', fontSize: '0.8rem', color: '#fca5a5' }
                                    } > ❌Deficient: { result.deficienciesDetected.join(', ') } <
                                    /div>
                                )
                            } <
                            /div>

                        { /* Nutrient Status Grid */ } <
                        div style = {
                                { background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', marginBottom: '1rem' }
                            } >
                            <
                            h4 style = {
                                { margin: '0 0 0.75rem', color: '#86efac', fontSize: '0.85rem', fontWeight: 700 }
                            } > NUTRIENT STATUS(ICAR Benchmarks) < /h4> {
                        Object.entries(result.soilAnalysis).map(([key, nut]) => ( <
                            div key = { key }
                            style = {
                                { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }
                            } >
                            <
                            span style = {
                                { fontSize: '0.8rem', color: '#94a3b8', flex: 1 }
                            } > { nut.name } < /span> <
                            span style = {
                                { fontSize: '0.8rem', color: '#e2e8f0', width: 60, textAlign: 'right' }
                            } > { nut.measured ?? '–' } { nut.unit } < /span> <
                            span style = {
                                { marginLeft: '0.75rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: `${STATUS_COLORS[nut.status] || '#64748b'}22`, color: STATUS_COLORS[nut.status] || '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }
                            } > { STATUS_ICONS[nut.status] } { nut.status } < /span> < /
                            div >
                        ))
                    } <
                    /div>

                    { /* Agronomic Recommendations */ } {
                        result.agronomicRecommendations?.length > 0 && ( <
                            div style = {
                                { background: 'rgba(245,158,11,0.08)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.25)', padding: '1rem', marginBottom: '1rem' }
                            } > {
                                result.agronomicRecommendations.map((r, i) => ( <
                                    div key = { i }
                                    style = {
                                        { fontSize: '0.82rem', color: '#fbbf24', marginBottom: '0.4rem' }
                                    } > ⚠️{ r } < /div>
                                ))
                            } <
                            /div>
                        )
                    } <
                    /div>
                )
            } <
            /div>

            { /* Fertilizer Schedule */ } {
                result?.fertilizerSchedule && ( <
                        div style = {
                            { marginTop: '2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }
                        } >
                        <
                        h3 style = {
                            { margin: '0 0 1.2rem', color: '#86efac', fontWeight: 700 }
                        } > 🧾Crop - Specific Fertilizer Schedule— { result.crop }
                        on { result.landHectares }
                        Ha < /h3> {
                        result.fertilizerSchedule.map((stage, si) => ( <
                            div key = { si }
                            style = {
                                { marginBottom: '1.5rem' }
                            } >
                            <
                            div style = {
                                { fontWeight: 700, color: '#fbbf24', marginBottom: '0.6rem', fontSize: '0.9rem' }
                            } > ⏱️{ stage.timing } < /div> <
                            div style = {
                                { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '0.75rem' }
                            } > {
                                stage.fertilizers.map((f, fi) => ( <
                                    div key = { fi }
                                    style = {
                                        { background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(255,255,255,0.06)' }
                                    } >
                                    <
                                    div style = {
                                        { fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }
                                    } > { f.name } < /div> <
                                    div style = {
                                        { display: 'flex', gap: '1.5rem', marginTop: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }
                                    } >
                                    <
                                    span > 📦{ f.kgPerHa }
                                    kg / Ha < /span> <
                                    span > 🌍Total: { f.totalKg }
                                    kg < /span> < /
                                    div > <
                                    div style = {
                                        { color: '#22c55e', fontWeight: 700, marginTop: '0.3rem', fontSize: '0.9rem' }
                                    } > ₹{ fmt(f.costRs) }
                                    est. < /div> < /
                                    div >
                                ))
                            } <
                            /div> < /
                            div >
                        ))
                    } <
                    /div>
            )
        } <
        /div> < /
    div >
);
}
