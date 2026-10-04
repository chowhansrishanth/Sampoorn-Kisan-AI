import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';

const API = API_BASE_URL || '';
const CROPS = ['Cotton', 'Maize', 'Paddy / Rice', 'Chili / Tomato / Cotton'];
const ALERT_COLORS = { 'CRITICAL — Spray Window Open': '#ef4444', 'WARNING — Scout Immediately': '#f59e0b', 'MONITOR': '#22c55e' };
const PEST_EMOJIS = { pink_bollworm: '🦋', fall_armyworm: '🐛', brown_planthopper: '🦗', helicoverpa: '🐞' };

export default function GDDRadar() {
    const [crop, setCrop] = useState('Cotton');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const runRadar = async (targetCrop = crop) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API}/api/gdd/radar`, { crop: targetCrop });
            setResult(data);
        } catch (e) {
            setError(e.response?.data?.error || 'Radar computation failed');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        runRadar('Cotton');
    }, []);

    return ( <
            div style = {
                { minHeight: '100vh', background: 'linear-gradient(135deg,#000d1a,#001a2e,#002d0a)', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }
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
                { fontSize: '3.1rem' }
            } > 🌦️ < /div> <
            h1 style = {
                { margin: 0, fontSize: '2.1rem', fontWeight: 800, background: 'linear-gradient(90deg,#38bdf8,#7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
            } > GDD Pest Outbreak Radar < /h1> <
            p style = {
                { color: '#94a3b8', marginTop: '0.4rem' }
            } > Growing Degree Days Thermal Accumulation· Pest Phenology Biofix Predictions· Economic Threshold Alerts < /p> < /
            div >

            { /* Control */ } <
            div style = {
                { background: 'rgba(255,255,255,0.04)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }
            } >
            <
            div style = {
                { flex: 1, minWidth: 200 }
            } >
            <
            label style = {
                { display: 'block', fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }
            } > 🌱Select Crop < /label> <
            select value = { crop }
            onChange = { e => setCrop(e.target.value) }
            style = {
                { width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.7rem', color: '#e2e8f0', fontSize: '0.96rem' }
            } > {
                CROPS.map(c => < option key = { c }
                    value = { c } > { c } < /option>)} < /
                    select > <
                    /div> <
                    button onClick = { runRadar }
                    disabled = { loading }
                    style = {
                        { padding: '0.75rem 2rem', background: loading ? '#334155' : 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.01rem', whiteSpace: 'nowrap' }
                    } > { loading ? '⏳ Computing...' : '📡 Run Pest Radar' } <
                    /button> < /
                    div >

                    {
                        error && < div style = {
                            { padding: '0.75rem', background: 'rgba(239,68,68,0.15)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', textAlign: 'center', marginBottom: '1.5rem' }
                        } > { error } < /div>}

                        {
                            result && ( <
                                >
                                { /* Summary Banner */ } <
                                div style = {
                                    { background: 'rgba(56,189,248,0.08)', borderRadius: 14, border: '1px solid rgba(56,189,248,0.2)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }
                                } >
                                <
                                div >
                                <
                                div style = {
                                    { fontWeight: 700, color: '#38bdf8', fontSize: '1.06rem' }
                                } > 📡Radar Results— { result.crop } < /div> <
                                div style = {
                                    { color: '#94a3b8', fontSize: '0.88rem' }
                                } > Based on { result.daysAnalyzed } - day temperature history simulation < /div> < /
                                div > <
                                div style = {
                                    { display: 'flex', gap: '1rem' }
                                } > {
                                    result.pests?.map(p => ( <
                                        div key = { p.pestId }
                                        style = {
                                            { textAlign: 'center' }
                                        } >
                                        <
                                        div style = {
                                            { color: ALERT_COLORS[p.alertLevel] || '#22c55e', fontWeight: 700, fontSize: '0.86rem' }
                                        } > { PEST_EMOJIS[p.pestId] || '🐛' } { p.alertLevel.split('—')[0].trim() } < /div> < /
                                        div >
                                    ))
                                } <
                                /div> < /
                                div >

                                { /* Pest Cards */ } {
                                    result.pests?.map(pest => {
                                        const alertColor = ALERT_COLORS[pest.alertLevel] || '#22c55e';
                                        return ( <
                                            div key = { pest.pestId }
                                            style = {
                                                { background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: `1px solid ${alertColor}44`, padding: '1.5rem', marginBottom: '1.5rem' }
                                            } > { /* Pest Header */ } <
                                            div style = {
                                                { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }
                                            } >
                                            <
                                            div >
                                            <
                                            div style = {
                                                { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                                            } >
                                            <
                                            span style = {
                                                { fontSize: '2.1rem' }
                                            } > { PEST_EMOJIS[pest.pestId] || '🐛' } < /span> <
                                            div >
                                            <
                                            div style = {
                                                { fontWeight: 800, color: '#e2e8f0', fontSize: '1.06rem' }
                                            } > { pest.name } < /div> <
                                            div style = {
                                                { color: '#64748b', fontSize: '0.86rem' }
                                            } > Crop: { pest.crop } < /div> < /
                                            div > <
                                            /div> < /
                                            div > <
                                            div style = {
                                                { textAlign: 'right' }
                                            } >
                                            <
                                            div style = {
                                                { fontSize: '0.88rem', padding: '0.35rem 0.9rem', borderRadius: 999, background: `${alertColor}22`, color: alertColor, fontWeight: 700, border: `1px solid ${alertColor}44` }
                                            } > { pest.alertLevel } < /div> < /
                                            div > <
                                            /div>

                                            { /* GDD Progress Bar */ } <
                                            div style = {
                                                { marginBottom: '1rem' }
                                            } >
                                            <
                                            div style = {
                                                { display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#94a3b8', marginBottom: '0.4rem' }
                                            } >
                                            <
                                            span > GDD Accumulated: < strong style = {
                                                { color: alertColor }
                                            } > { pest.cumulativeGDD } < /strong> / { pest.gddToFirstGeneration }
                                            GDD < /span> <
                                            span style = {
                                                { color: alertColor, fontWeight: 700 }
                                            } > { pest.percentToFirstGeneration } % to 1 st Generation < /span> < /
                                            div > <
                                            div style = {
                                                { height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }
                                            } >
                                            <
                                            div style = {
                                                { width: `${pest.percentToFirstGeneration}%`, height: '100%', background: `linear-gradient(90deg,${alertColor}88,${alertColor})`, borderRadius: 99, transition: 'width 0.8s ease' }
                                            }
                                            /> < /
                                            div > <
                                            /div>

                                            { /* Generation Dates */ } {
                                                (pest.predictedGenerationDates?.firstGen || pest.predictedGenerationDates?.secondGen) && ( <
                                                    div style = {
                                                        { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }
                                                    } > {
                                                        [
                                                            ['1st Gen Peak', pest.predictedGenerationDates.firstGen],
                                                            ['2nd Gen Peak', pest.predictedGenerationDates.secondGen],
                                                            ['3rd Gen Peak', pest.predictedGenerationDates.thirdGen]
                                                        ].map(([label, date]) => date && ( <
                                                            div key = { label }
                                                            style = {
                                                                { background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '0.5rem 0.85rem', fontSize: '0.86rem' }
                                                            } >
                                                            <
                                                            div style = {
                                                                { color: '#64748b' }
                                                            } > { label } < /div> <
                                                            div style = {
                                                                { color: alertColor, fontWeight: 700 }
                                                            } > { date } < /div> < /
                                                            div >
                                                        ))
                                                    } <
                                                    /div>
                                                )
                                            }

                                            { /* ETI */ } <
                                            div style = {
                                                { background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.88rem' }
                                            } >
                                            <
                                            div style = {
                                                { color: '#f59e0b', fontWeight: 700, marginBottom: '0.3rem' }
                                            } > 📏Economic Threshold Index(ETI) < /div> <
                                            div style = {
                                                { color: '#94a3b8' }
                                            } > { pest.economicThreshold } < /div> < /
                                            div >

                                            { /* Management Protocol */ } <
                                            div >
                                            <
                                            div style = {
                                                { color: '#38bdf8', fontWeight: 700, fontSize: '0.91rem', marginBottom: '0.5rem' }
                                            } > 🛡️IPM Management Protocol < /div> <
                                            div style = {
                                                { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '0.5rem' }
                                            } > {
                                                pest.managementProtocol?.map((step, i) => ( <
                                                    div key = { i }
                                                    style = {
                                                        { padding: '0.6rem 0.8rem', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 8, fontSize: '0.84rem', color: '#bae6fd', lineHeight: 1.5 }
                                                    } >
                                                    <
                                                    span style = {
                                                        { color: '#38bdf8', fontWeight: 700 }
                                                    } > { i + 1 }. < /span> {step} < /
                                                    div >
                                                ))
                                            } <
                                            /div> < /
                                            div > <
                                            /div>
                                        );
                                    })
                                }

                                {
                                    result.pests?.length === 0 && ( <
                                        div style = {
                                            { textAlign: 'center', color: '#64748b', padding: '3rem', fontSize: '1.01rem' }
                                        } > No GDD pest models available
                                        for < strong > { result.crop } < /strong> yet. More crops being added.</div >
                                    )
                                } <
                                />
                            )
                        } <
                        /div> < /
                        div >
                    );
                }