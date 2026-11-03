// Run with node check-coding.cjs. Uses only Node and Python's standard library.
const fs = require('node:fs');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const assert = require('node:assert/strict');
const context = {localStorage:{getItem:()=>null}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('coding.js','utf8')+';this.exercises=codeExercises;',context);
let script;
const worker = {self:{}, loadPyodide:async()=>({globals:{set(){}},runPythonAsync:async s=>{script=s;return '{}';}})};
worker.self.postMessage=()=>{};
vm.createContext(worker);
vm.runInContext(fs.readFileSync('python-worker.js','utf8').replace(/^importScripts.*;\n/,''),worker);
(async()=>{
 await worker.self.onmessage({data:{}});
 let cases=0;
 const check=(ex,code,expected)=>{
  const payload={code, mode:ex.mode||'line', tests:ex.tests, solutions:[ex.solution,...(ex.alternatives||[])]};
  const input=JSON.stringify({script,payload});
  const result=spawnSync('python3',['-c',`import sys,json,ast
p=json.load(sys.stdin)
ns={'payload_json':json.dumps(p['payload'])}
tree=ast.parse(p['script'])
last=tree.body.pop()
exec(compile(tree,'runner','exec'),ns)
print(eval(compile(ast.Expression(last.value),'runner','eval'),ns))`],{input,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const out=JSON.parse(result.stdout);
  assert.equal(out.passed,expected,`${ex.id}: ${out.output}`);cases++;
 };
 for(const ex of context.exercises){check(ex,ex.starter,false);check(ex,ex.solution,true);for(const s of ex.alternatives||[])check(ex,s,true);if(!ex.mode)check(ex,ex.solution.replaceAll('"',"'")+' # комментарий',true);}
 const first=context.exercises[0];
 check(first,'def count_examples(regular, spam):\n    return 1000',false);
 check(first,'def count_examples(regular, spam)\n    return regular + spam',false);
 check(first,'print("x" * 13000)',false);
 check(first,'print(1000)',false);
 check(first,'def count_examples(regular, spam):\n    return 1 / 0',false);
 console.log(`${cases} checks passed: solutions, wrong answers, formatting, syntax errors, output limits.`);
})();
