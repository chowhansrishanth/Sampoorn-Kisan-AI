const unavailable=(req,res)=>res.status(503).json({success:false,status:'NOT_CONFIGURED',error:'No verified federated training coordinator is connected. No training round or metrics have been generated.'});
module.exports={getFLStatus:unavailable,triggerFLRound:unavailable};
