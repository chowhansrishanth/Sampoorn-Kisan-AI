const test=require('node:test');const assert=require('node:assert/strict');
delete process.env.GOOGLE_APPLICATION_CREDENTIALS;process.env.FIREBASE_USE_ADC='false';
const service=require('../services/notificationService');
test('missing Firebase credentials fail explicitly without message ID',async()=>{const r=await service.sendPushNotification('TEST_DEVICE_TOKEN',{title:'Fixture'});assert.equal(r.success,false);assert.equal(r.mode,'unavailable');assert.equal(r.messageId,undefined);});
test('missing and oversized FCM tokens reject',async()=>{for(const token of ['',null,'a'.repeat(4097)])assert.equal((await service.sendPushNotification(token,{})).success,false);});
test('failed broadcast reports zero delivered recipients',async()=>{const r=await service.sendBroadcastAlert(['TEST_A','TEST_B'],{title:'Fixture'});assert.equal(r.successful,0);assert.equal(r.total,2);assert.ok(r.results.every(v=>v.status==='fulfilled'&&v.value.success===false));});
