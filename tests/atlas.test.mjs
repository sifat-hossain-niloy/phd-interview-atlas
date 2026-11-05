import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createIndex,search,parseQuery} from '../docs/search.js';
import {contextCases,contextCase} from '../docs/study.js';
const data=JSON.parse(await readFile(new URL('../docs/data/content.json',import.meta.url),'utf8'));
const index=createIndex(data.questions,data.projects);
const texts=(query,options)=>search(index,query,options).map(h=>h.question.question);
test('all answers have unique durable IDs, valid sources and substantive content',()=>{
 assert.equal(new Set(data.questions.map(q=>q.id)).size,data.questions.length);
 assert.ok(data.questions.length>=200);
 const sources=new Set(data.sources.map(s=>s.id));
 for(const q of data.questions){assert.ok(sources.has(q.source),q.id);assert.ok(q.question.length>15,q.id);assert.ok(q.answer.length>60,q.id);assert.ok(q.detail.length>0,q.id);assert.ok(q.locator.length>5,q.id);assert.ok(q.tags.length>=2,q.id);assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(q)),q.id);}
});
test('answer-only evidence is searchable, not just question titles',()=>{
 assert.ok(texts('11.79').includes('How much did XLAgent cost?'));
 assert.ok(texts('8,565').includes('What does the 91% precision estimate mean?'));
});
test('ownership intent elevates personal contribution answers',()=>{
 const hits=search(index,'my contribution');
 assert.ok(hits.length>=3);
 assert.ok(hits.slice(0,3).every(h=>h.question.tags.includes('ownership')));
 assert.ok(texts('A-ProS contribution').includes('What did you personally contribute to A-ProS?'));
});
test('related terminology and common small typos recover relevant answers',()=>{
 assert.ok(texts('drawbacks').includes('What are the biggest limitations of A-ProS?'));
 assert.ok(texts('calibraton').includes('Can you explain critic calibration?'));
 assert.ok(texts('Excel Agent').some(t=>t.includes('XLAgent')));
 assert.ok(texts('CoT').includes('Does this prove chain-of-thought caused the better performance?'));
 assert.ok(texts('"Table 12"').includes('What did the 47-problem memory study show?'));
});
test('multiple keywords use intersection, including across answer fields',()=>{
 const hits=search(index,'memory 47');
 assert.ok(hits.length>0);
 assert.ok(hits.some(h=>h.question.question==='What did the 47-problem memory study show?'));
 assert.equal(search(index,'unfindable-token-12345 memory').length,0);
});
test('quoted phrases and exclusions are distinct from synonym expansion',()=>{
 assert.deepEqual(parseQuery('"hidden tests" -"one language"').include,[{value:'hidden tests',phrase:true}]);
 const hits=search(index,'"hidden tests" -"one language"');
 assert.ok(hits.length>0);
 for(const h of hits){const doc=index.find(d=>d.q.id===h.question.id);assert.ok(doc.all.includes('hidden tests'));assert.ok(!doc.all.includes('one language'));}
});
test('project, topic, depth, essential and saved filters compose',()=>{
 const saved=new Set(data.questions.filter(q=>q.project==='xlagent').slice(0,8).map(q=>q.id));
 const hits=search(index,'',{project:'xlagent',difficulty:'Core',essential:true,saved});
 assert.ok(hits.length>0);
 assert.ok(hits.every(h=>h.question.project==='xlagent'&&h.question.difficulty==='Core'&&h.question.essential&&saved.has(h.question.id)));
 assert.equal(search(index,'',{saved:new Set()}).length,0);
 assert.equal(search(index,'',{project:'ask'}).length,22);
});
test('important factual caveats survive in the data',()=>{
 const get=t=>data.questions.find(q=>q.question===t);
 assert.match(get('What are the exact ICPC results?').answer,/167/);
 assert.match(get('Was the memory solve-rate result statistically significant?').answer,/No/);
 assert.match(get('Did the graph improve localization?').answer,/No measurable improvement/);
 assert.match(get('What are the main repair results?').caution,/did not establish/);
 assert.match(get('What remains unfinished?').caution,/strict/);
});
test('search handles metacharacters, unicode and empty input without throwing',()=>{
 for(const q of ['[','<script>','.*','a+b','"','C++','café','—',''])assert.ok(Array.isArray(search(index,q)));
 assert.equal(search(index,'').length,data.questions.length);
});
test('full corpus queries stay well below one second on this machine',()=>{
 const start=performance.now();
 for(const q of ['memory results','XLAgent contribution','calibraton','funding','"hidden tests"','graph precision'])search(index,q);
 const duration=performance.now()-start;
 assert.ok(duration<1000,`${duration.toFixed(1)}ms for six queries`);
 console.log(`Search benchmark: six representative queries in ${duration.toFixed(1)} ms.`);
});
test('every question has a complete structured answer rather than coaching notes',()=>{
 assert.ok(data.questions.length>=208);
 assert.equal(data.questions.reduce((n,q)=>n+q.answerSections.length,0),data.questions.length*3);
 const coaching=/^(?:A strong answer|A plausible answer|A defensible answer|Connect |Start |Establish |State |Use |Prepare |Identify |Name |Explain |Keep |Give |Personalize|Choose )/;
 for(const q of data.questions){
  assert.equal(q.answerSections.length,3,q.id);
  assert.ok(!coaching.test(q.answer),q.id+' summary remains coaching');
  assert.ok(q.answerSections.every(s=>s.heading.length>3&&s.body.split(/\s+/).length>=25),q.id);
  assert.ok(q.answerSections.reduce((n,s)=>n+s.body.split(/\s+/).length,0)>=110,q.id);
  assert.deepEqual(q.detail,q.answerSections.map(s=>s.body),q.id);
  assert.ok(['WriteHuman','Manual source review'].includes(q.editorialReview.service),q.id);
  if(q.editorialReview.service==='WriteHuman')assert.equal(q.editorialReview.humanizerInputReviewed,true,q.id);
  else assert.equal(q.editorialReview.sourceChecked,true,q.id);
 }
});
test('structured answers retain critical denominators, null results and prospective status',()=>{
 const body=id=>data.questions.find(q=>q.id===id).detail.join(' ');
 assert.match(body('llmpros-005'),/16 accepted solutions out of 166/);
 assert.match(body('apros-016'),/167 ICPC/);
 assert.match(body('apros-020'),/0\.063/);
 assert.match(body('apros-020'),/0\.125/);
 assert.match(body('xlagent-030'),/No measurable improvement/);
 assert.match(body('xlagent-033'),/4\.0/);
 assert.match(body('xlagent-033'),/2\.7/);
 assert.match(body('xlagent-033'),/did not establish better repair correctness/);
 assert.match(body('xlagent-051'),/under review/);
 assert.match(body('xlagent-051'),/not describe it as accepted or published/);
 assert.match(body('phd-004'),/future experiment/);
 for(const q of data.questions.filter(q=>q.project==='ask'))assert.equal(q.answerFormat,'professor-question-script');
});
test('existing study notes and links retain all original question IDs',async()=>{
 const originals=JSON.parse(await readFile(new URL('./fixtures/original-question-ids.json',import.meta.url),'utf8'));
 const current=new Set(data.questions.map(q=>q.id));
 assert.equal(originals.length,208);
 for(const id of originals)assert.ok(current.has(id),id);
});
test('the separate study pack resolves all selected answers and a 60-minute rehearsal',()=>{
 const pack=data.studyPacks.find(p=>p.id==='evident');
 assert.ok(pack);
 assert.equal(pack.groups.reduce((n,g)=>n+g.minutes,0),60);
 assert.equal(new Set(pack.questionIds).size,pack.questionIds.length);
 for(const id of pack.questionIds)assert.ok(data.questions.some(q=>q.id===id),id);
 assert.ok(pack.questionIds.includes('apros-036'));
 assert.ok(pack.questionIds.includes('evident-005'));
 assert.ok(pack.questionIds.includes('evident-022'));
 assert.equal(data.questions.filter(q=>q.project==='evident').length,36);
});
test('the renamed interview pack answers all 30 prepared questions in order and keeps its backup',()=>{
 const pack=data.studyPacks.find(p=>p.id==='evident');
 assert.equal(pack.title,'Haonan Li Interview prep');
 const ids=pack.groups.flatMap(g=>g.questionIds);
 assert.deepEqual(ids,Array.from({length:30},(_,i)=>`haonan-${String(i+1).padStart(3,'0')}`));
 assert.deepEqual(pack.groups.map(g=>g.questionIds.length),[8,6,5,5,6]);
 const backup=pack.backupGroups.flatMap(g=>g.questionIds);
 assert.equal(backup.length,45);
 for(const id of [...ids,...backup])assert.ok(pack.questionIds.includes(id),id);
 for(const id of ids){
  const q=data.questions.find(x=>x.id===id);
  assert.equal(q.answerSections.length,3,id);
  for(const s of q.answerSections){assert.ok(s.heading.length>3,id);assert.ok(s.body.length>150,id);}
  assert.deepEqual(q.detail,q.answerSections.map(s=>s.body),id);
 }
});
test('interview answers keep private details out and do not mix evaluation versions',()=>{
 const text=JSON.stringify(data.questions.filter(q=>q.project==='haonan'));
 assert.doesNotMatch(text,/zoom|@\w*\.?ucr|ucr\.edu|hli333|gmail|Thursday|9:30|8:30 PM|Sridharan|Fall 2027|in writing/i);
 assert.doesNotMatch(text,/\b151\b|75\.5%|21 unresolved|28 still/);
 const q=id=>data.questions.find(x=>x.id===id);
 assert.match(q('haonan-014').answer,/have not run Frama-C, Eva or Evident/);
 assert.match(q('haonan-004').answer,/proposal, not something I have built/);
 assert.match(q('haonan-005').caution,/Causes overlap/);
 assert.match(q('haonan-016').answer,/not statistically significant/);
 assert.match(q('haonan-018').answer,/did not make it more correct/);
});
test('interview questions are found by the terms used in the conversation',()=>{
 assert.ok(texts('call witness').includes("The LLM already chooses the entry from the call witness, so what's new?"));
 assert.ok(texts('abstract_value').includes('Why use abstract_value instead of letting the LLM choose ranges?'));
 assert.ok(texts('first email').includes('Your first email proposed something we already do. What did you learn from that?'));
 assert.ok(texts('BugLens accuracy').includes("Evident's accuracy is lower than BugLens. Is it worse?"));
 assert.ok(search(index,'',{project:'haonan'}).length===30);
});
test('title and formal-feedback queries retrieve complete relevant answers',()=>{
 assert.ok(texts('APPROS reliable').includes('What exactly does reliable mean in A-ProS?'));
 assert.ok(texts('towards autonomous').includes('What does the full A-ProS title mean?'));
 assert.ok(texts('judge Eva').includes('How is online-judge feedback fundamentally different from an Eva result?'));
 assert.ok(texts('caller guard').includes('Can I explain the eight-element-array caller example step by step?'));
 assert.match(data.questions.find(q=>q.id==='apros-036').answer,/Towards Reliable Autonomous Programming Through Multi-Model Feedback/);
});
test('unsafe and incomplete caller contexts never receive the safe-case decision',()=>{
 assert.equal(contextCase('checked').retain,false);
 for(const id of ['unchecked','off-by-one','mixed','invented'])assert.equal(contextCase(id).retain,true,id);
 assert.ok(contextCase('mixed').explanation.includes('unsafe caller'));
 assert.ok(contextCase('invented').boundary.includes('source or threat-model justification'));
 assert.equal(new Set(contextCases.map(c=>c.id)).size,5);
});
test('public content excludes correspondence and private meeting access',()=>{
 const serialized=JSON.stringify(data);
 for(const privateValue of ['hli333@ucr.edu','haonan.li@email.ucr.edu','ucr.zoom.us','9:30 AM Eastern','20:30','6:52 AM','4:04 AM'])assert.ok(!serialized.includes(privateValue),privateValue);
 const xl=data.projects.find(p=>p.id==='xlagent');assert.equal(xl.status,'Under review');
 assert.ok(!serialized.includes('MSR 2027'));
});
