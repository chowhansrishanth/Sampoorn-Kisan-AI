'use strict';
const day=86400000;
function normalizeObservation(raw,source=raw?.source) {
 const date=raw?.date||raw?.updated||raw?.price_date; const time=Date.parse(date); const price=Number(raw?.modalPrice??raw?.modal_price??raw?.price);
 const crop=String(raw?.crop||raw?.commodity||'').trim(), market=String(raw?.market||raw?.mandi||'').trim(),location=String(raw?.location||'').trim();
 if(!date||!Number.isFinite(time)||!Number.isFinite(price)||price<=0||!crop||!market||!source)return null;
 const numeric=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
 const min=numeric(raw.minPrice??raw.min_price),max=numeric(raw.maxPrice??raw.max_price);
 if((min!==null&&(min<0||min>price))||(max!==null&&max<price))return null;
 return {crop,market,location,date:new Date(time).toISOString().slice(0,10),minPrice:min,maxPrice:max,modalPrice:price,source,unit:raw.unit||'INR/quintal'};
}
function assessQuality(observations=[],{minObservations=30,minDays=21,now=Date.now(),maxAgeDays=7}={}) {
 const valid=observations.map(x=>normalizeObservation(x,x.source)).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date));
 const unique=new Map(valid.map(x=>[[x.crop,x.market,x.location,x.unit,x.date].join('|'),x]));const values=[...unique.values()];
 const series=new Set(values.map(x=>[x.crop,x.market,x.location,x.unit,x.source].join('|')));
 const coverageDays=values.length?Math.round((Date.parse(values.at(-1).date)-Date.parse(values[0].date))/day)+1:0;
 const ageDays=values.length?(now-Date.parse(values.at(-1).date))/day:null;
 const maxGapDays=values.length>1?Math.max(...values.slice(1).map((x,i)=>(Date.parse(x.date)-Date.parse(values[i].date))/day)):null;
 const enough=values.length>=minObservations&&coverageDays>=minDays&&series.size===1&&ageDays>=0&&ageDays<=maxAgeDays&&maxGapDays<=7;
 return {status:enough?'FORECAST_AVAILABLE':'INSUFFICIENT_DATA',observationCount:values.length,coverageDays,ageDays,maxGapDays,duplicatesRemoved:valid.length-values.length,observations:values,reason:enough?null:'At least 30 dated observations for one market, crop, unit and source, with recent data and no gap above seven days, are required.'};
}
function analytics(values) {if(!values.length)return null; const p=values.slice(-14).map(x=>x.modalPrice),mean=p.reduce((a,b)=>a+b)/p.length;const movement=(p.at(-1)/p[0]-1)*100;return {recentAverage:mean,recentMinimum:Math.min(...p),recentMaximum:Math.max(...p),movementPercent:movement,standardDeviation:p.length>1?Math.sqrt(p.reduce((a,b)=>a+(b-mean)**2,0)/(p.length-1)):null,trend:movement>0?'up':movement<0?'down':'stable',type:'DESCRIPTIVE_CALCULATION'};}
function forecast(observations,options={}) {
 const quality=assessQuality(observations,options);const history=quality.observations;const base={...quality,history,analytics:analytics(history),forecast:[],updatedAt:history.at(-1)?.date||null,disclaimer:'Market forecasts are estimates based on historical information and are not guaranteed future prices.'};
 if(quality.status!=='FORECAST_AVAILABLE')return base;
 const split=Math.floor(history.length*.8), p=history.map(x=>x.modalPrice);const errors=[],naive=[];
 for(let i=split;i<p.length;i++){const prediction=p.slice(i-7,i).reduce((a,b)=>a+b,0)/7;errors.push(p[i]-prediction);naive.push(p[i]-p[i-1]);}
 const metrics=e=>({MAE:e.reduce((a,b)=>a+Math.abs(b),0)/e.length,RMSE:Math.sqrt(e.reduce((a,b)=>a+b*b,0)/e.length),MAPE:e.reduce((a,b,i)=>a+Math.abs(b/p[split+i]),0)/e.length*100});
 const candidate=metrics(errors),baseline=metrics(naive);const candidateWins=candidate.MAE<baseline.MAE&&candidate.RMSE<=baseline.RMSE;
 const predicted=candidateWins?p.slice(-7).reduce((a,b)=>a+b,0)/7:p.at(-1);
 return {...base,model:candidateWins?'Trailing 7 observation moving average':'Last observation baseline',validation:{method:'Chronological rolling one-step holdout; no shuffling',trainCount:split,testCount:p.length-split,testFrom:history[split].date,candidate,baseline,selected:candidateWins?'moving_average':'baseline'},forecast:[{date:new Date(Date.parse(history.at(-1).date)+day).toISOString().slice(0,10),predictedModal:predicted}],limitations:['One observation horizon only; daily coverage is not guaranteed.','No calibrated prediction interval or confidence percentage is available.']};
}
module.exports={normalizeObservation,assessQuality,analytics,forecast};
