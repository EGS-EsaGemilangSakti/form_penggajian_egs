import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['src/utils/age.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const fe=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const be=vm.createContext({});vm.runInContext(fs.readFileSync('backend/AgeValidation.gs','utf8'),be);
const now=new Date('2026-10-31T05:00:00Z');
for(const [name,api] of [['frontend',fe],['backend',be]]) {
 test(name+' accurate birthdays, leap days, date validation and Jakarta boundary',()=>{
 for(const [dob,age] of [['2005-01-20',21],['2008-10-31',18],['2008-11-01',17],['1975-11-01',50],['1975-10-31',51],['1976-10-31',50],['20/01/2005',21],['20-01-2005',21],['2000-02-29',26]])assert.equal(api.calculateAge(dob,now),age,dob);
 for(const dob of ['2026-11-01','2005-02-29','2026-02-30','', 'not a date'])assert.equal(api.calculateAge(dob,now),null,dob);
 assert.equal(api.calculateAge('2008-11-01',new Date('2026-10-31T17:00:00Z')),18);
 });
 test(name+' restricted placements enforce inclusive 18 to 50 and switching placement reevaluates',()=>{
 const branches=vm.runInContext('AGE_RESTRICTED_PLACEMENTS',be);
 for(const branch of branches)for(const [dob,allowed] of [['2008-10-31',true],['2008-11-01',false],['1975-11-01',true],['1975-10-31',false],['',false]])assert.equal(api.isAgeAllowed(dob,branch,now),allowed,branch+' '+dob);
 assert.equal(api.isAgeAllowed('1970-01-01','BDO 5J',now),true);
 assert.equal(api.isAgeAllowed('2010-01-01','MONDE',now),true);
 });
}
test('frontend and backend parity for all days near age boundaries',()=>{
 const branches=vm.runInContext('AGE_RESTRICTED_PLACEMENTS',be);
 for(const branch of branches)for(let i=-400;i<=400;i++) {const date=new Date(Date.UTC(2008,9,31+i)).toISOString().slice(0,10);assert.equal(fe.isAgeAllowed(date,branch,now),be.isAgeAllowed(date,branch,now));}
});
