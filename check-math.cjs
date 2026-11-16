// Node + Python standard library: run from the repository with node check-math.cjs.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const context={localStorage:{getItem:()=>null}};vm.createContext(context);
for(const file of ['math-content.js','math.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const lessons=vm.runInContext('mathLessons',context);
assert.equal(lessons.length,15);assert.equal(new Set(lessons.map(l=>l.id)).size,15);
for(const track of ['derivatives','probability','statistics'])assert.equal(lessons.filter(l=>l.track===track).length,5);
for(const lesson of lessons){
 assert.ok(lesson.quiz.options[lesson.quiz.a]);assert.equal(lesson.tasks.length,2);
 // Every runnable Python example must complete without extra packages.
 const result=spawnSync('python3',['-c',lesson.code],{encoding:'utf8',timeout:15000});
 assert.equal(result.status,0,`${lesson.id}: ${result.stderr}`);
 for(const task of lesson.tasks){
  context.task=task;context.raw=String(task.answer).replace('.',',');assert.equal(vm.runInContext('mathAnswerMatches(raw, task)',context),true);
  for(const raw of ['', ' ', 'NaN', 'Infinity', '1/0', '0x10','не знаю']){context.raw=raw;assert.equal(vm.runInContext('mathAnswerMatches(raw, task)',context),false);}
  context.raw=String(task.answer+2);assert.equal(vm.runInContext('mathAnswerMatches(raw,task)',context),false);
 }
}
// Independent numerical fixtures for the three interactive experiences.
assert.ok(Math.abs(vm.runInContext('bayesPrecision(.01,.9,.05)',context)-90/585)<1e-12);
assert.equal(vm.runInContext('bayesPrecision(0,1,0)',context),null);
assert.equal(vm.runInContext('bayesPrecision(.1,1,0)',context),1);
assert.equal(vm.runInContext('bayesPrecision(.1,0,.05)',context),0);
const intervals=vm.runInContext('mathIntervalSimulation(25,10000)',context);
const coverage=intervals.filter(i=>i.covers).length/intervals.length;
assert.ok(coverage>.94&&coverage<.96,`Coverage ${coverage}`);
assert.ok(Math.abs((intervals[0].hi-intervals[0].lo)-2*1.959963984540054*10/5)<1e-10);
const smaller=vm.runInContext('mathIntervalSimulation(100,1)',context)[0];
assert.ok(Math.abs((intervals[0].hi-intervals[0].lo)/(smaller.hi-smaller.lo)-2)<1e-10);
context.lesson=lessons[0];
assert.equal(vm.runInContext('mathDone(lesson)',context),false);
vm.runInContext("mathState[lesson.id]={quiz:true,tasks:{0:true}}",context);
assert.equal(vm.runInContext('mathDone(lesson)',context),false);
vm.runInContext('mathState[lesson.id].tasks[1]=true',context);
assert.equal(vm.runInContext('mathDone(lesson)',context),true);
console.log(`15 Python examples, 30 answer validators, lesson completion and numerical labs passed. Simulated coverage: ${coverage}.`);
