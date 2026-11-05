// Numerical checks against scikit-learn. Run: node check-metrics.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const ctx={localStorage:{getItem:()=>null}};vm.createContext(ctx);
for(const file of ['course.js','coding.js','explanations.js','metrics.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const data=vm.runInContext('({samples:metricSamples, lessons:lessons, exercises:codeExercises})',ctx);
assert.equal(data.lessons.length,26);assert.equal(data.exercises.length,26);
for(let i=0;i<26;i++){assert.equal(data.exercises[i].lesson,i);assert.ok(data.lessons[i].options[data.lessons[i].a]);}
const fixtures=[data.samples,[[0,.1],[0,.4],[1,.35],[1,.8]],[[1,.5],[0,.5]],[[1,1],[0,0]],[[1,0],[0,1]]];
const cases=fixtures.flatMap(samples=>[0,.39,.5,.55,1].map(t=>({samples,t})));
const py=spawnSync('.venv/bin/python',['-c',`import sys,json
from sklearn.metrics import confusion_matrix,roc_auc_score,average_precision_score,precision_score,recall_score,f1_score,accuracy_score
out=[]
for case in json.load(sys.stdin):
 y,p=zip(*case['samples']);pred=[int(s>=case['t']) for s in p]
 tn,fp,fn,tp=map(int,confusion_matrix(y,pred,labels=[0,1]).ravel())
 out.append(dict(tp=tp,tn=tn,fp=fp,fn=fn,precision=precision_score(y,pred,zero_division=0) if tp+fp else None,recall=recall_score(y,pred),f1=f1_score(y,pred),accuracy=accuracy_score(y,pred),auc=roc_auc_score(y,p),ap=average_precision_score(y,p)))
print(json.dumps(out))`],{input:JSON.stringify(cases),encoding:'utf8'});
assert.equal(py.status,0,py.stderr);const expected=JSON.parse(py.stdout);
let checks=0;for(let i=0;i<cases.length;i++){ctx.fixture=cases[i];const got=vm.runInContext('({...binaryMetrics(fixture.samples,fixture.t),...rankingMetrics(fixture.samples)})',ctx);for(const [key,val] of Object.entries(expected[i])){if(val===null)assert.equal(got[key],null);else assert.ok(Math.abs(got[key]-val)<1e-10,`${i} ${key}: ${got[key]} vs ${val}`);checks++;}}
console.log(`${checks} numerical checks agree with sklearn; 26 lessons and matching exercises verified.`);
