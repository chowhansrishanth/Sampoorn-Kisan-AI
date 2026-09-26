'use strict';
const history=require('./marketHistory');
const Observation=require('../models/MarketObservation');
const {isDbOperational}=require('../config/db');
const COMMODITY_BASE_PRICES=Object.fromEntries(['Tomato','Onion','Potato','Cotton','Wheat','Paddy','Chili','Soybean','Maize'].map(c=>[c,{}]));
const REGIONAL_MANDI_NETWORK={Telangana:[],Punjab:[],Maharashtra:[]};
async function predictMandiPrices(commodity,location,market) {
 if(!isDbOperational())return {...history.forecast([]),commodity,reason:'Market history storage is unavailable. No prices or forecasts have been generated.'};
 const filter={crop:commodity}; if(location)filter.location=location;if(market)filter.market=market;
 const data=await Observation.find(filter).sort({date:-1}).limit(365).lean().maxTimeMS(3000);
 return {...history.forecast(data),commodity};
}
function calculateArbitrageMatrix({quotes,quantityQuintals,transportCostPerKm}) {
 if(!Array.isArray(quotes)||quotes.length<2) return {status:'INSUFFICIENT_DATA',comparison:[],reason:'Provide at least two verified mandi quotes and actual transport assumptions.'};
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
 if(!valid(quantityQuintals)||quantityQuintals===0||!valid(transportCostPerKm))throw Object.assign(new Error('Valid quantity and transport cost are required.'),{status:400});
 const comparison=quotes.map(q=>{if(!q||!q.mandiName||!q.date||!['pricePerQuintal','distanceKm','loadingCharges','cessPercent'].every(k=>valid(q[k])))throw Object.assign(new Error('Each quote needs name, date, price, distance, loading cost and cess.'),{status:400});const grossRevenue=q.pricePerQuintal*quantityQuintals,transportCost=q.distanceKm*transportCostPerKm,apmcCess=grossRevenue*q.cessPercent/100,netProfit=grossRevenue-transportCost-apmcCess-q.loadingCharges;return {...q,quotedModalPrice:q.pricePerQuintal,grossRevenue,transportCost,apmcCess,netProfit,effectivePricePerQuintal:netProfit/quantityQuintals};}).sort((a,b)=>b.netProfit-a.netProfit);
 return {status:'CALCULATED',comparison,provenance:'USER_PROVIDED_QUOTES_AND_COSTS',limitations:['Net sale return excludes cultivation and storage costs. Quote freshness must be reviewed.']};
}
module.exports={predictMandiPrices,calculateArbitrageMatrix,COMMODITY_BASE_PRICES,REGIONAL_MANDI_NETWORK};
