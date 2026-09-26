'use strict';
const httpClient = require('./httpClient');
const cache = require('./cacheService');
const fail = (message, status=503) => Object.assign(new Error(message), {status});
class WeatherService {
 async coordinates(location) {
  if (typeof location !== 'string' || !location.trim() || location.length>160) throw fail('Provide your farm location or coordinates.',400);
  return cache.getOrFetch('geocode:'+location.toLowerCase(),async()=>{
   const {data}=await httpClient.get('https://geocoding-api.open-meteo.com/v1/search',{params:{name:location.split(',')[0].trim(),count:1,language:'en',format:'json'},timeout:4000});
   const r=data?.results?.[0]; if(!r) throw fail('Location could not be resolved. Provide latitude and longitude.',400);
   return {lat:r.latitude,lon:r.longitude,label:[r.name,r.admin1,r.country].filter(Boolean).join(', ')};
  },3600000);
 }
 async fetchOpenMeteoWeather(latitude, longitude) {
  if(typeof latitude!=='number'||typeof longitude!=='number'||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180) throw fail('Valid farm latitude and longitude are required.',400);
  return cache.getOrFetch('weather:'+latitude+':'+longitude,async()=>{
   let data; try { ({data}=await httpClient.get('https://api.open-meteo.com/v1/forecast',{params:{latitude,longitude,current:'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code',daily:'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration',timezone:'auto',forecast_days:7},timeout:4000})); } catch {throw fail('Weather provider is unavailable. No weather values have been estimated.');}
   if(!data?.current) throw fail('Weather provider returned an incomplete response.');
   const c=data.current, n=v=>Number.isFinite(v)?v:null;
   return {temperature:n(c.temperature_2m),humidity:n(c.relative_humidity_2m),precipitation:n(c.precipitation),wind_speed:n(c.wind_speed_10m),weather_code:n(c.weather_code),condition:this._interpretWeatherCode(c.weather_code),location:latitude+', '+longitude,timestamp:c.time||null,retrievedAt:new Date().toISOString(),daily:data.daily||null,source:'Open-Meteo',timezone:data.timezone};
  },300000);
 }
 _interpretWeatherCode(code) { if(code===0)return 'Clear sky'; if(code>=1&&code<=3)return 'Partly cloudy'; if(code>=45&&code<=48)return 'Fog'; if(code>=51&&code<=67)return 'Rain / drizzle'; if(code>=71&&code<=77)return 'Snow'; if(code>=80&&code<=86)return 'Showers'; if(code>=95)return 'Thunderstorm'; return 'Condition unavailable'; }
 getWeatherAdvisory() {return {title:'General weather precautions',text:'General guidance; a local forecast has not been checked. If rain is forecast, postpone spraying according to the product label and consider delaying irrigation. Check field drainage after heavy rain. Chemical selection requires a confirmed diagnosis and local agronomic advice.',sources:[],limitations:['Conditional guidance, not a current weather observation.']};}
}
module.exports=new WeatherService();
