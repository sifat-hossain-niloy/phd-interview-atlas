import {cp,rm,mkdir,readFile,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('docs','dist',{recursive:true});
await writeFile('dist/.nojekyll','');
const data=JSON.parse(await readFile('docs/data/content.json','utf8'));
console.log(`Built static site: ${data.questions.length} questions, ${data.glossary.length} concepts.`);
