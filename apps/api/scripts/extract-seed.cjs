const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../..');
function arrayFrom(file, name) {
  const source = fs.readFileSync(path.join(root,file),'utf8');
  const start = source.indexOf('export const '+name);
  const arrayStart = source.indexOf('= [',start)+2;
  const arrayEnd = source.indexOf('\n];',arrayStart)+2;
  if(start<0 || arrayStart<2 || arrayEnd<2) throw new Error('Seed array not found');
  const context={};
  for(const match of source.matchAll(/import (\w+) from '([^']+\.jpg)'/g)) context[match[1]]='/assets/'+path.basename(match[2]);
  const literal=source.slice(arrayStart,arrayEnd).replace(/icon:\s*\([\s\S]*?\n\s*\),/g,'');
  return vm.runInNewContext(literal,context,{timeout:1000});
}
const seed={projects:arrayFrom('apps/web/src/components/FullScreenWorkGallery.tsx','ALL_GALLERY_PROJECTS'),clients:arrayFrom('apps/web/src/components/OurClientsSlider.jsx','CLIENT_LOGOS')};
fs.mkdirSync(path.join(root,'apps/api/data'),{recursive:true});
fs.writeFileSync(path.join(root,'apps/api/data/seed.json'),JSON.stringify(seed,null,2)+'\n');
console.log(`Preserved ${seed.projects.length} projects and ${seed.clients.length} clients.`);
