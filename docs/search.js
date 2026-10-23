// Small, dependency-free full-text index. No query or personal notes leave the browser.
const GROUPS=[
 ['llmpros','llm-pros','llm pros','llm pros paper'],['apros','a-pros','a pros'],['xlagent','xl-agent','xl agent','excel agent','excel','polyglot'],
 ['contribution','contributions','ownership','personally','responsibility'],['limitations','limitation','drawback','drawbacks','weakness'],
 ['funding','funded','financial','stipend','scholarship'],['phd','ph.d.','doctorate','doctoral'],
 ['calibration','calibrated','ece'],['memory','stateful','history','context'],['leakage','leak','contamination'],
 ['results','result','outcome','findings','performance'],['purpose','motivation','goal'],['baseline','control'],
 ['significance','significant','p-value','statistics'],['professor','supervisor','advisor','adviser'],['cost','budget','compute'],['cot','chain of thought','chain-of-thought'],['apr','automated program repair','program repair']
];
export const normalize=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9.+_-]+/g,' ').trim();
const words=s=>normalize(s).split(/[^a-z0-9]+/).filter(Boolean);
const stem=s=>s.length>5?s.replace(/(ing|ies|es|s)$/,''):s;
function distanceOne(a,b){
 if(Math.abs(a.length-b.length)>1)return false;
 if(a===b)return true;
 let i=0,j=0,n=0;
 while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++n>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}
 return n+(i<a.length||j<b.length?1:0)<=1;
}
const STOP_WORDS=new Set(['i','my','me','your','you','the','a','an','is','are','was','were','what','how','do','did','does','of','in','for','to','about','and','please','can','could','would','it','this']);
export function parseQuery(query){
 const include=[],exclude=[];
 const pattern=/(-?)"([^"]+)"|(-?)([^\s"]+)/g;
 for(const m of String(query).matchAll(pattern)){
  const phrase=m[2]!==undefined,negative=(phrase?m[1]:m[3])==='-',value=normalize(phrase?m[2]:m[4]);
  if(value&&(!STOP_WORDS.has(value)||phrase||negative))(negative?exclude:include).push({value,phrase});
 }
 return {include,exclude};
}
export function createIndex(questions,projects=[]){
 const names=Object.fromEntries(projects.map(p=>[p.id,p.name]));
 return questions.map(q=>{
  const fields=[q.question,q.tags.join(' '),`${q.project} ${names[q.project]||''} ${q.topic}`,q.answer,q.detail.join(' '),q.caution,q.followups.join(' '),q.locator].map(normalize);
  const all=fields.join(' '),tokens=[...new Set(words(all))];
  return {q,fields,all,tokens};
 });
}
function termMatch(doc,term){
 const value=term.value;
 const weights=[12,9,7,5,2,2,1,1];
 let score=0;
 doc.fields.forEach((field,i)=>{if(field.includes(value))score=Math.max(score,weights[i]+(field===value?8:0));});
 if(score||term.phrase)return score;
 const group=GROUPS.find(g=>g.some(s=>normalize(s)===value));
 if(group)for(const alias of group)if(doc.all.includes(normalize(alias)))return 3;
 const st=stem(value);
 if(value.length>3&&doc.tokens.some(t=>stem(t)===st))return 2;
 if(value.length>=5&&doc.tokens.some(t=>distanceOne(t,value)))return 1;
 return 0;
}
export function search(index,query,{project='all',topic='all',difficulty='all',saved=null,essential=false}={}){
 const parsed=parseQuery(query),hits=[];
 for(const doc of index){
  const q=doc.q;
  if(project!=='all'&&q.project!==project||topic!=='all'&&q.topic!==topic||difficulty!=='all'&&q.difficulty!==difficulty||saved&&!saved.has(q.id)||essential&&!q.essential)continue;
  if(parsed.exclude.some(t=>termMatch(doc,t)))continue;
  let score=0,valid=true;
  for(const t of parsed.include){const s=termMatch(doc,t);if(!s){valid=false;break;}score+=s;}
  if(valid)hits.push({question:q,score:score+(q.essential?0.25:0)+(/\b(my|your|personally)\b/i.test(query)&&q.tags.includes('ownership')?8:0)});
 }
 return hits.sort((a,b)=>b.score-a.score||a.question.id.localeCompare(b.question.id));
}
export function highlightTerms(query){return parseQuery(query).include.map(t=>t.value).sort((a,b)=>b.length-a.length);}
