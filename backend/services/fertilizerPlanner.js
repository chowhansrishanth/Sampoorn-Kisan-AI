'use strict';
// Nutrient percentages are labelled commercial grades, not crop rate recommendations.
// Targets use kg N, P2O5 and K2O per acre, supplied by a farmer/agronomist.
const invalid=message=>Object.assign(new Error(message),{status:400});
function plan({crop,areaAcres,stage='not specified',soilTest=null,nutrientTargets,rateSource,applications=[]}) {
 if(typeof crop!=='string'||!crop.trim()||crop.length>100||typeof areaAcres!=='number'||!Number.isFinite(areaAcres)||areaAcres<=0||areaAcres>1e6)throw invalid('Crop and a positive numeric area in acres are required.');
 if(!nutrientTargets||!['N','P','K'].every(k=>typeof nutrientTargets[k]==='number'&&Number.isFinite(nutrientTargets[k])&&nutrientTargets[k]>=0&&nutrientTargets[k]<=1000)||typeof rateSource!=='string'||!rateSource.trim()||rateSource.length>300)throw invalid('Provide prescribed N, P2O5 and K2O targets (kg/acre) and their source. No validated regional crop-rate table is configured.');
 if(soilTest && (!['N','P','K'].every(k=>typeof soilTest[k]==='number'&&Number.isFinite(soilTest[k])&&soilTest[k]>=0)||typeof soilTest.unit!=='string'||!soilTest.unit||!soilTest.date))throw invalid('Soil-test mode requires dated numeric N/P/K values and units.');
 const round=v=>Number(v.toFixed(2));
 const nutrients=Object.fromEntries(['N','P','K'].map(k=>[k,round(nutrientTargets[k]*areaAcres)]));
 const dap=nutrients.P/.46, dapN=dap*.18, urea=Math.max(0,nutrients.N-dapN)/.46, mop=nutrients.K/.6;
 if(!Array.isArray(applications)||applications.length>30)throw invalid('Provide at most 30 application stages.');
 let shares={N:0,P:0,K:0};
 const stages=applications.map(a=>{if(!a||typeof a.label!=='string'||!a.label.trim()||!['N','P','K'].every(k=>typeof a.shares?.[k]==='number'&&Number.isFinite(a.shares[k])&&a.shares[k]>=0&&a.shares[k]<=1))throw invalid('Each prescribed application needs a stage and N/P/K fractions from 0 to 1.'); const values={}; for(const k of ['N','P','K']){shares[k]+=a.shares[k];values[k]=round(nutrients[k]*a.shares[k]);} return {label:a.label,timing:a.timing||'Timing not provided',nutrientsKg:values};});
 if(stages.length&&Object.values(shares).some(s=>Math.abs(s-1)>1e-6))throw invalid('Application fractions must sum to 1 for each nutrient.');
 return {crop,areaAcres,stage,mode:soilTest?'SOIL_TEST_PLAN':'GENERAL_PLAN',soilTest,nutrientRequirementKg:nutrients,nutrientBasis:'N / P2O5 / K2O',fertilizerQuantitiesKg:{urea:round(urea),dap:round(dap),mop:round(mop)},dapNitrogenKg:round(dapN),excessNitrogenKg:round(Math.max(0,dapN-nutrients.N)),applicationStages:stages,formulas:['DAP = P2O5 / 0.46','Urea = max(0, N - DAP × 0.18) / 0.46','MOP = K2O / 0.60','Farm target = kg/acre × acres'],provenance:{requirements:'USER_PROVIDED_PRESCRIPTION',rateSource,soilTest:soilTest?'FARMER_PROVIDED':'NOT_PROVIDED',calculations:'CALCULATED_FROM_NUTRIENT_PERCENTAGES'},limitations:['Calculator, not an agronomic prescription. Confirm fertilizer label grades.','Soil-test values are recorded, not directly subtracted from fertilizer targets. Laboratory extraction units require a validated local response model.','Prior applications must already be deducted from your prescribed remaining target.','If DAP alone exceeds the N target, choose another phosphorus source with an agronomist.',...(stages.length?[]:['Application timing has not been prescribed.'])]};
}
module.exports={plan};
