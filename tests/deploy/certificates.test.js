import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,mkdir,copyFile,chmod,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';

const bash=process.env.BASH_BIN || (process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'/bin/bash');
const tools=existsSync(bash) && spawnSync(bash,['-lc','command -v envsubst && command -v sha256sum'],{encoding:'utf8'}).status===0;
async function until(check) {
  for(let attempt=0;attempt<100;attempt++) {
    if(await check()) return;
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error('Timed out waiting for the certificate watcher.');
}
test('Nginx wrapper bootstraps HTTP, detects certificates, and rolls back failed reloads',{skip:!tools,timeout:30000},async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'design-forge-cert-test-'));
  let child;
  let completed;
  try {
    for(const folder of ['bin','config','templates','certificates/live/studio.example.com']) await mkdir(path.join(directory,folder),{recursive:true});
    for(const mode of ['http','https']) await copyFile(`deploy/docker/nginx-${mode}.conf.template`,path.join(directory,`templates/nginx-${mode}.conf.template`));
    await copyFile('deploy/docker/web-entrypoint.sh',path.join(directory,'entrypoint.sh'));
    // Simulate only the Nginx process/signals; template rendering and certificate
    // hashing execute the production shell code with real envsubst/sha256sum.
    await writeFile(path.join(directory,'bin/nginx'),`#!/bin/sh
case "$1" in
  -t) [ ! -f "$TEST_ROOT/fail-validation" ] ;;
  -s) if [ "$2" = reload ]; then echo reload >> "$TEST_ROOT/events"; else touch "$TEST_ROOT/stop"; fi ;;
  -g) while [ ! -f "$TEST_ROOT/stop" ]; do sleep 0.1; done ;;
  *) exit 1 ;;
esac
`);
    await chmod(path.join(directory,'bin/nginx'),0o755);
    const unixRoot=spawnSync(bash,['-c','pwd'],{cwd:directory,encoding:'utf8'}).stdout.trim();
    let output='';
    child=spawn(bash,['-c','export PATH="$TEST_ROOT/bin:/mingw64/bin:/usr/bin:$PATH"; exec sh ./entrypoint.sh'],{
      cwd:directory,env:{...process.env,DOMAIN:'studio.example.com',TEST_ROOT:unixRoot,LETSENCRYPT_DIR:unixRoot+'/certificates',NGINX_CONFIG_DIR:unixRoot+'/config',NGINX_TEMPLATES_DIR:unixRoot+'/templates',CERTIFICATE_POLL_SECONDS:'0.1'},stdio:['ignore','pipe','pipe'],
    });
    child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{output+=chunk;});
    completed=new Promise(resolve=>child.once('close',code=>resolve(code)));
    const config=()=>readFile(path.join(directory,'config/default.conf'),'utf8').catch(()=> '');
    const events=()=>readFile(path.join(directory,'events'),'utf8').catch(()=> '');
    await until(async()=> {
      if(child.exitCode !== null) throw new Error('Nginx wrapper exited before startup: '+output);
      return (await config()).includes('HTTP is ready');
    });
    assert.ok(!(await config()).includes('listen 443'));
    const certDir=path.join(directory,'certificates/live/studio.example.com');
    await writeFile(path.join(certDir,'privkey.pem'),'test-key');
    await writeFile(path.join(certDir,'fullchain.pem'),'test-certificate-v1');
    await until(async()=> (await events()).split('reload').length>=2);
    const https=await config();
    assert.match(https,/listen 443 ssl/);assert.match(https,/server_name studio\.example\.com/);
    assert.ok(https.includes('$request_uri'));assert.ok(https.includes('$api_upstream'));
    await writeFile(path.join(directory,'fail-validation'),'yes');
    await writeFile(path.join(certDir,'fullchain.pem'),'test-certificate-v2');
    await until(async()=>output.includes('retained previous Nginx configuration'));
    assert.equal(await config(),https);
    await rm(path.join(directory,'fail-validation'));
    await until(async()=> (await events()).split('reload').length>=3);
    await writeFile(path.join(directory,'stop'),'yes');
    assert.equal(await completed,0,output);
  } finally {
    if(child && child.exitCode===null) { await writeFile(path.join(directory,'stop'),'yes');await completed; }
    await rm(directory,{recursive:true,force:true,maxRetries:10,retryDelay:100});
  }
});
