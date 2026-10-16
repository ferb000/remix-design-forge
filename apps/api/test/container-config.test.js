import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {databaseConnection} from '../src/db.js';

test('database password files are encoded safely and local connection URLs remain supported',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'design-forge-db-secret-'));
  const file=path.join(directory,'password');
  try {
    await writeFile(file,'complex@password:/?#%\n');
    const parsed=new URL(databaseConnection('postgresql://design_forge@db:5432/design_forge',file));
    assert.equal(parsed.hostname,'db');
    assert.equal(decodeURIComponent(parsed.password),'complex@password:/?#%');
    assert.equal(databaseConnection('postgresql://dev:local@localhost/design_forge',null),'postgresql://dev:local@localhost/design_forge');
    await writeFile(file,'\n');
    assert.throws(()=>databaseConnection('postgresql://design_forge@db/design_forge',file),/empty/);
    assert.throws(()=>databaseConnection('postgresql://design_forge@db/design_forge',path.join(directory,'missing')));
  } finally { await rm(directory,{recursive:true,force:true}); }
});
