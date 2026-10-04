import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';

const API = API_BASE_URL || '';

const CROPS = ['Paddy / Rice', 'Wheat', 'Cotton', 'Maize', 'Soybean', 'Chili / Red Pepper', 'Tomato', 'Groundnut', 'Mustard', 'Onion'];
const SCENARIOS = ['No Anomaly (Normal Season)', 'Mild Drought (20-30% Rainfall Deficit)', 'Severe Drought (>40% Rainfall Deficit)', 'Excess Rainfall / Flood Risk', 'Heat Wave (>40°C for 5+ Days)', 'Unseasonal Frost / Cold Spell', 'High Humidity / Disease Pressure'];

const riskColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

export default function YieldPredictor() {
    const [form, setForm] = useState({ crop: 'Paddy / Rice', landHectares: 2, irrigationType: 'drip', soilQuality: 'good', climateScenario: 'No Anomaly (Normal Season)', cultivarType: 'hybrid' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(f => ({...f, [k]: v }));

    const predict = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API}/api/yield/predict`, form);
            setResult(data);
        } catch (e) {
            setError(e.response?.data?.error || 'Prediction failed');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        predict();
    }, []);

    const fmt = (n) => n?.toLocaleString('en-IN') || '—';

    return ( <
        div style = {
            { minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }
        } >
        <
        div style = {
            { maxWidth: 960, margin: '0 auto' }
        } > { /* Header */ } <
        div style = {
            { textAlign: 'center', marginBottom: '2.5rem' }
        } >
        <
        div style = {
            { fontSize: '3.1rem', marginBottom: '0.5rem' }
        } > 🌾 < /div> <
        h1 style = {
            { fontSize: '2.1rem', fontWeight: 800, background: 'linear-gradient(90deg,#22c55e,#86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }
        } >
        Crop Yield & Revenue Predictor <
        /h1> <
        p style = {
            { color: '#94a3b8', marginTop: '0.5rem' }
        } > FAO Crop Response Model· PMFBY Insurance Simulator· 3 - Scenario Forecast < /p> < /
        div >

        { /* Input Card */ } <
        div style = {
            { background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', backdropFilter: 'blur(20px)', marginBottom: '2rem' }
        } >
        <
        h2 style = {
            { margin: '0 0 1.5rem', color: '#22c55e', fontSize: '1.2rem', fontWeight: 700 }
        } > 📋Crop & Farm Details < /h2> <
        div style = {
            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.2rem' }
        } > {
            [
                { label: '🌱 Crop', key: 'crop', type: 'select', options: CROPS },
                { label: '📐 Land Area (Hectares)', key: 'landHectares', type: 'number' },
                { label: '💧 Irrigation Type', key: 'irrigationType', type: 'select', options: ['drip', 'sprinkler', 'canal', 'rainfed'] },
                { label: '🪨 Soil Quality', key: 'soilQuality', type: 'select', options: ['excellent', 'good', 'fair', 'poor'] },
                { label: '🌦️ Climate Scenario', key: 'climateScenario', type: 'select', options: SCENARIOS },
                { label: '🧬 Cultivar Type', key: 'cultivarType', type: 'select', options: ['hybrid', 'improved', 'local'] },
            ].map(({ label, key, type, options }) => ( <
                    div key = { key } >
                    <
                    label style = {
                        { display: 'block', fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }
                    } > { label } < /label> {
                    type === 'select' ? ( <
                        select value = { form[key] }
                        onChange = { e => set(key, e.target.value) }
                        style = {
                            { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.65rem', color: '#e2e8f0', fontSize: '0.96rem' }
                        } > {
                            options.map(o => < option key = { o }
                                value = { o } > { o } < /option>)} < /
                                select >
                            ): ( <
                                input type = "number"
                                value = { form[key] }
                                onChange = { e => set(key, e.target.value) }
                                min = { 0.1 }
                                step = { 0.5 }
                                style = {
                                    { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.65rem', color: '#e2e8f0', fontSize: '0.96rem', boxSizing: 'border-box' }
                                }
                                />
                            )
                        } <
                        /div>
                    ))
            } <
            /div> <
            button onClick = { predict }
            disabled = { loading }
            style = {
                { marginTop: '1.5rem', width: '100%', padding: '0.9rem', background: loading ? '#334155' : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '1.06rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }
            } > { loading ? '⏳ Predicting...' : '🚀 Predict Yield & Revenue' } <
            /button> {
            error && < div style = {
                { marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.15)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', textAlign: 'center' }
            } > { error } < /div>} < /
            div >

            {
                result && ( <
                    >
                    { /* Risk Banner */ } <
                    div style = {
                        { background: `${riskColor[result.riskLevel]}22`, border: `2px solid ${riskColor[result.riskLevel]}`, borderRadius: 14, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }
                    } >
                    <
                    span style = {
                        { fontSize: '1.9rem' }
                    } > { result.riskLevel === 'low' ? '🟢' : result.riskLevel === 'medium' ? '🟡' : '🔴' } < /span> <
                    div >
                    <
                    div style = {
                        { fontWeight: 800, color: riskColor[result.riskLevel], fontSize: '1.06rem' }
                    } > Climate Risk: { result.riskLevel.toUpperCase() } < /div> <
                    div style = {
                        { color: '#94a3b8', fontSize: '0.91rem' }
                    } > { result.climateScenario } < /div> < /
                    div > <
                    div style = {
                        { marginLeft: 'auto', textAlign: 'right' }
                    } >
                    <
                    div style = {
                        { fontSize: '2.1rem', fontWeight: 800, color: '#22c55e' }
                    } > { result.yieldPrediction.yieldEfficiencyPercent } % < /div> <
                    div style = {
                        { color: '#94a3b8', fontSize: '0.86rem' }
                    } > Yield Efficiency < /div> < /
                    div > <
                    /div>

                    { /* Stats Grid */ } <
                    div style = {
                        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }
                    } > {
                        [
                            { icon: '🌾', label: 'Total Yield', value: `${fmt(result.yieldPrediction.totalYieldQuintals)} Qtl`, sub: `${result.yieldPrediction.adjustedYieldPerHa} Qtl/Ha` },
                            { icon: '💰', label: 'Gross Revenue (MSP)', value: `₹${fmt(result.financials.grossRevenueRs)}`, sub: `@₹${fmt(result.financials.mspRatePerQtl)}/Qtl` },
                            { icon: '🛡️', label: 'Net Revenue (Post-PMFBY)', value: `₹${fmt(result.financials.netRevenueAfterInsuranceRs)}`, sub: `After insurance` },
                            { icon: '📄', label: 'PMFBY Premium', value: `₹${fmt(result.pmfbyInsurance.farmerPremiumRs)}`, sub: `${result.pmfbyInsurance.farmerPremiumPercent}% farmer share` },
                        ].map(({ icon, label, value, sub }) => ( <
                            div key = { label }
                            style = {
                                { background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', textAlign: 'center' }
                            } >
                            <
                            div style = {
                                { fontSize: '1.9rem' }
                            } > { icon } < /div> <
                            div style = {
                                { color: '#94a3b8', fontSize: '0.84rem', marginTop: '0.4rem', fontWeight: 600 }
                            } > { label } < /div> <
                            div style = {
                                { color: '#22c55e', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.3rem' }
                            } > { value } < /div> <
                            div style = {
                                { color: '#64748b', fontSize: '0.81rem' }
                            } > { sub } < /div> < /
                            div >
                        ))
                    } <
                    /div>

                    { /* 3-Scenario Table */ } <
                    div style = {
                        { background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }
                    } >
                    <
                    h3 style = {
                        { margin: '0 0 1rem', color: '#22c55e', fontWeight: 700 }
                    } > 📊3 - Scenario Harvest Forecast < /h3> {
                    result.scenarios.map((s, i) => ( <
                        div key = { i }
                        style = {
                            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: i === 1 ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.2)', borderRadius: 10, marginBottom: '0.5rem', border: i === 1 ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent' }
                        } >
                        <
                        span style = {
                            { color: '#e2e8f0', fontWeight: i === 1 ? 700 : 400, fontSize: '0.96rem' }
                        } > { s.label } < /span> <
                        div style = {
                            { textAlign: 'right' }
                        } >
                        <
                        div style = {
                            { color: '#22c55e', fontWeight: 700 }
                        } > ₹{ fmt(s.revenue) } < /div> <
                        div style = {
                            { color: '#64748b', fontSize: '0.86rem' }
                        } > { fmt(s.yieldQtl) }
                        Qtl < /div> < /
                        div > <
                        /div>
                    ))
                } <
                /div>

                { /* PMFBY Box */ } <
                div style = {
                    { background: 'rgba(99,102,241,0.1)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.3)', padding: '1.5rem' }
                } >
                <
                h3 style = {
                    { margin: '0 0 0.75rem', color: '#818cf8' }
                } > 🛡️PMFBY Insurance Summary < /h3> <
                div style = {
                    { color: '#c7d2fe', fontSize: '0.96rem', lineHeight: 1.8 }
                } >
                <
                div > Total Sum Insured: < strong > ₹{ fmt(result.pmfbyInsurance.totalSumInsuredRs) } < /strong></div >
                    <
                    div > Farmer Premium(paid): < strong > ₹{ fmt(result.pmfbyInsurance.farmerPremiumRs) } < /strong></div >
                    <
                    div > Govt.Subsidy(estimated): < strong > ₹{ fmt(result.pmfbyInsurance.centralSubsidyEstimateRs) } < /strong></div >
                    <
                    div > Expected Payout: < strong style = {
                        { color: result.pmfbyInsurance.expectedPayoutRs > 0 ? '#22c55e' : '#64748b' }
                    } > ₹{ fmt(result.pmfbyInsurance.expectedPayoutRs) } < /strong></div >
                    <
                    div style = {
                        { marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(99,102,241,0.15)', borderRadius: 8, fontWeight: 700, color: '#a5b4fc' }
                    } > 💡{ result.pmfbyInsurance.recommendation } <
                    /div> < /
                div > <
                /div> < / >
            )
        } <
        /div> < /
        div >
    );
}