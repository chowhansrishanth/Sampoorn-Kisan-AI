const agents = [
  ['Crop Recommendation Agent', ['crop'], ['crop recommendation', 'crop planning', 'should i grow', 'what crop']],
  ['Disease Agent', ['disease'], ['disease', 'pest']],
  ['Weather Agent', ['weather'], ['weather', 'rain', 'spray']],
  ['Market Agent', ['market'], ['market', 'price', 'mandi']],
  ['Profitability Agent', ['profitability'], ['profit', 'roi', 'cost']],
  ['Irrigation Agent', ['irrigation'], ['irrigation', 'irrigate', 'water']],
  ['Fertilizer Agent', ['fertilizer', 'soil'], ['fertilizer', 'nutrient', 'soil']],
  ['Government Scheme Agent', ['scheme'], ['scheme', 'subsidy']],
  ['Knowledge Agent', ['general'], ['agriculture', 'knowledge']]
].map(([name, intents, keywords]) => ({ name, purpose: `${name} handles its specialized agricultural domain.`, supportedIntents: intents, requiredInputs: ['farmer query'], optionalInputs: ['farm profile', 'location', 'season'], tools: keywords, outputSchema: '{ success, evidence, sources, limitations }', timeoutMs: 15000, failureBehavior: 'return structured unavailable state; coordinator continues with other agents' }));
function select(intent, query = '') { const q = query.toLowerCase(); return agents.filter(agent => agent.supportedIntents.includes(intent) || agent.tools.some(keyword => q.includes(keyword))); }
const contracts={
 'Crop Recommendation Agent':{required:['N','P','K','temperature','humidity','ph','rainfall'],tool:'crop ML service'},
 'Disease Agent':{required:['validated uploaded image'],tool:'disease upload route'},
 'Weather Agent':{required:['latitude','longitude'],tool:'Open-Meteo'},
 'Market Agent':{required:['commodity','location'],tool:'Farmer.in'},
 'Profitability Agent':{required:['cropName','landSizeAcres','expectedYieldQuintalsPerAcre','expectedPricePerQuintal','customInputCosts'],tool:'profitabilityEngine'},
 'Irrigation Agent':{required:['crop','stage','soil','landAcres','lat','lon','initialDeficitMm','pumpFlowLph'],tool:'irrigationService + Open-Meteo'},
 'Fertilizer Agent':{required:['crop','areaAcres','nutrientTargets','rateSource'],tool:'fertilizerPlanner'},
 'Government Scheme Agent':{required:['query'],tool:'knowledge retrieval'},
 'Knowledge Agent':{required:['query'],tool:'knowledge retrieval'}
};
for(const agent of agents){agent.requiredInputs=contracts[agent.name].required;agent.tools=[contracts[agent.name].tool];agent.outputSchema={name:'string',status:'OK | MISSING_INPUT | UNAVAILABLE | TIMEOUT',evidence:'object | null',sources:'string[]',limitations:'string[]'};}
// Keep routing keywords separate from tools advertised in the contract.
const keywords={crop:['grow','crop recommendation','crop planning'],disease:['disease','pest','leaf','spray'],weather:['weather','rain','spray'],market:['market','price','mandi','profitable'],profitability:['profit','roi','cost'],irrigation:['irrigat','water'],fertilizer:['fertiliz','nutrient','soil'],scheme:['scheme','subsidy'],general:['knowledge','agriculture']};
function route(intent,query=''){const q=query.toLowerCase();return agents.filter(a=>a.supportedIntents.includes(intent)||(keywords[a.supportedIntents[0]]||[]).some(k=>q.includes(k)));}
async function run(agentsToRun,context={},adapters={}) {
 return Promise.all(agentsToRun.map(async agent=>{
  let timer;const empty={name:agent.name,status:'UNAVAILABLE',evidence:null,sources:[],limitations:[]};
  try {const execute=adapters[agent.name];if(!execute)return {...empty,status:'MISSING_INPUT',limitations:['Required: '+agent.requiredInputs.join(', ')]};
   return await Promise.race([Promise.resolve().then(()=>execute(context)).then(r=>({...empty,...r,name:agent.name})),new Promise(resolve=>{timer=setTimeout(()=>resolve({...empty,status:'TIMEOUT',limitations:['Agent timed out. Other results remain available.']}),agent.timeoutMs);})]);
  }catch{return {...empty,limitations:['Service unavailable. No substitute evidence was generated.']};}finally{clearTimeout(timer);}
 }));
}
module.exports={agents,select:route,run};
