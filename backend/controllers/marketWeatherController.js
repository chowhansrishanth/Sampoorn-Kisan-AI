const weather=require('../services/weatherService');
const market=require('../services/marketPriceService');
async function getWeatherForecast(req,res){try {const coords=req.query.lat!==undefined&&req.query.lon!==undefined?{lat:Number(req.query.lat),lon:Number(req.query.lon)}:await weather.coordinates(req.query.location);const w=await weather.fetchOpenMeteoWeather(coords.lat,coords.lon);return res.json({...w,current_temperature_c:w.temperature,humidity_percent:w.humidity,wind_speed_kmh:w.wind_speed,rainfall_probability:w.daily?.precipitation_probability_max?.[0]??null,forecast_3day:w.daily?.time?.slice(0,3).map((date,i)=>({day:date,temp:w.daily.temperature_2m_max[i],rainMm:w.daily.precipitation_sum[i]}))||[],smart_irrigation_recommendation:'Review rainfall and field moisture before irrigation.'});}catch(e){return res.status(e.status||503).json({error:e.status===400?e.message:'Weather provider unavailable. Please retry.'});}}
async function getMandiPrices(req, res) {
  try {
    const crop = (req.query.crop || req.query.commodity || req.query.cropType || '').trim();
    const state = req.query.state || 'Telangana';

    if (!crop) {
      const overview = await market.getMarketOverview({ state });
      return res.json(overview);
    }

    const data = await market.getMarketPrice('price of ' + crop, { location: state, state });
    if (!data.success || data.needs_clarification || data.unavailable) {
      const overview = await market.getMarketOverview({ state });
      return res.json({
        ...data,
        updated_at: data.price_date || overview.updated_at,
        prices: overview.prices || [],
        modal_price: overview.prices?.[0]?.modal_price || null,
        market_insight: data.response || overview.market_insight
      });
    }

    return res.json({
      ...data,
      source: data.metadata?.source || data.sources?.[0] || 'Farmer.in Open Prices API',
      updated_at: data.price_date || null,
      prices: data.modal_price ? [{
        mandi: data.location || (state + ' APMC Aggregate'),
        modal_price_rs_quintal: data.modal_price,
        modal_price: data.modal_price,
        min_price: data.min_price,
        max_price: data.max_price
      }] : [],
      market_insight: data.response
    });
  } catch (err) {
    console.warn('[MarketWeatherController] Mandi price error:', err.message);
    try {
      const overview = await market.getMarketOverview({ state: req.query.state || 'Telangana' });
      return res.json(overview);
    } catch (_) {
      return res.status(503).json({ error: 'Market provider unavailable. No price was generated.' });
    }
  }
}
module.exports={getWeatherForecast,getMandiPrices};
