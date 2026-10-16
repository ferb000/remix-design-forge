import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,copyFile,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parse} from 'yaml';

const root=process.cwd();
const compose=parse(await readFile('compose.yml','utf8'));
test('Compose publishes only Nginx and gates startup on database and API health',()=>{
  assert.deepEqual(Object.keys(compose.services).sort(),['api','certbot','db','web']);
  assert.deepEqual(compose.services.web.ports,['80:80','443:443']);
  for(const name of ['api','db','certbot']) assert.equal(compose.services[name].ports,undefined);
  assert.equal(compose.services.api.depends_on.db.condition,'service_healthy');
  assert.equal(compose.services.web.depends_on.api.condition,'service_healthy');
  assert.equal(compose.services.api.environment.HOST,'0.0.0.0');
  assert.equal(compose.services.api.environment.TRUST_PROXY_HOPS,'1');
  assert.equal(compose.services.api.environment.DATABASE_PASSWORD_FILE,'/run/secrets/app_db_password');
  assert.equal(compose.volumes.postgres_data.name,'design-forge_postgres_data');
  assert.equal(compose.networks.database.internal,true);
  for(const service of Object.values(compose.services)) assert.ok(!(service.volumes || []).some(volume=>String(volume).includes('docker.sock')));
});
test('certificate renewal and Nginx share persistent certificate and challenge volumes',()=>{
  for(const name of ['certbot','web']) {
    const volumes=compose.services[name].volumes;
    assert.ok(volumes.some(volume=>volume.startsWith('certificates:/etc/letsencrypt')));
    assert.ok(volumes.some(volume=>volume.startsWith('acme_challenges:/var/www/certbot')));
  }
  assert.match(compose.services.certbot.command[0],/certbot renew/);
  assert.match(compose.services.certbot.command[0],/sleep 43200/);
});

const bash=process.env.BASH_BIN || (process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'/bin/bash');
test('deployment shell scripts have valid Bash syntax',{skip:!existsSync(bash)},()=>{
  for(const file of ['deploy/init-secrets.sh','deploy/docker/web-entrypoint.sh','deploy/vps/init-db.sh']) {
    const result=spawnSync(bash,['-n',file],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  }
});
test('secret initialization creates different passwords and preserves existing values',{skip:!existsSync(bash)},async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'design-forge-secret-init-'));
  try {
    await mkdir(path.join(directory,'deploy'),{recursive:true});
    await copyFile(path.join(root,'deploy/init-secrets.sh'),path.join(directory,'deploy/init-secrets.sh'));
    const run=()=>spawnSync(bash,['deploy/init-secrets.sh'],{cwd:directory,encoding:'utf8'});
    let result=run();assert.equal(result.status,0,result.stderr);
    const files=['postgres_password','app_db_password'].map(name=>path.join(directory,'deploy/vps/secrets',name+'.txt'));
    const first=await Promise.all(files.map(file=>readFile(file,'utf8')));
    assert.ok(first.every(value=>/^[a-f0-9]{64}\n$/.test(value)));assert.notEqual(first[0],first[1]);
    result=run();assert.equal(result.status,0,result.stderr);
    assert.deepEqual(await Promise.all(files.map(file=>readFile(file,'utf8'))),first);
    assert.ok(first.every(password=>!result.stdout.includes(password.trim())));
  } finally { await rm(directory,{recursive:true,force:true}); }
});
