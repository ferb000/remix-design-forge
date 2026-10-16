import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/storage.js';
import {validateProductionConfig} from '../src/config.js';

test('S3 storage writes private encrypted objects and returns stable API image URLs', async()=>{
  const commands=[];
  const storage=createStorage({driver:'s3',bucket:'private-bucket',region:'eu-west-1',publicUrl:'https://studio.example.com',client:{async send(command){commands.push(command);}}});
  const body=Buffer.from('image');
  const url=await storage.put('render.png',body,'image/png');
  assert.equal(url,'https://studio.example.com/api/media/render.png');
  assert.equal(commands[0].input.Bucket,'private-bucket');
  assert.equal(commands[0].input.Key,'uploads/render.png');
  assert.equal(commands[0].input.ACL,undefined);
  assert.equal(commands[0].input.ServerSideEncryption,'AES256');
  assert.equal(commands[0].input.ContentType,'image/png');
  await storage.remove(url);
  assert.equal(commands[1].input.Key,'uploads/render.png');
  await storage.remove('https://other.example.com/uploads/render.png');
  await storage.remove('https://studio.example.com/api/media/../../secret');
  assert.equal(commands.length,2);
});
test('failed S3 writes do not return a successful upload URL', async()=>{
  const storage=createStorage({driver:'s3',bucket:'private-bucket',region:'eu-west-1',publicUrl:'https://studio.example.com',client:{async send(){throw new Error('Unavailable');}}});
  await assert.rejects(storage.put('render.png',Buffer.from('image'),'image/png'),/Unavailable/);
});
test('production rejects missing storage settings, insecure origins and demo credentials',()=>{
  const valid={NODE_ENV:'production',DATABASE_URL:'postgresql://local/design_forge',ADMIN_EMAIL:'director@example.com',ADMIN_PASSWORD:'unique-password-for-production',PUBLIC_API_URL:'https://studio.example.com',CORS_ORIGINS:'https://studio.example.com',STORAGE_DRIVER:'s3',S3_BUCKET:'bucket',AWS_REGION:'eu-west-1'};
  assert.doesNotThrow(()=>validateProductionConfig(valid));
  for(const change of [{STORAGE_DRIVER:'local'},{ADMIN_PASSWORD:'forge2026!'},{ADMIN_PASSWORD:'REPLACE_WITH_A_UNIQUE_LONG_PASSWORD'},{CORS_ORIGINS:'http://studio.example.com'},{S3_BUCKET:''}]) assert.throws(()=>validateProductionConfig({...valid,...change}));
});
test('S3 reads only validated upload keys and uses GetObject',async()=>{
  const commands=[];
  const storage=createStorage({driver:'s3',bucket:'private-bucket',region:'eu-west-1',publicUrl:'https://studio.example.com',client:{async send(command){commands.push(command);return {ContentType:'image/png'};}}});
  const result=await storage.read('render.png');
  assert.equal(result.ContentType,'image/png');
  assert.equal(commands[0].constructor.name,'GetObjectCommand');
  assert.equal(commands[0].input.Key,'uploads/render.png');
  for(const name of ['../secret.png','folder/file.png','test.html']) await assert.rejects(storage.read(name));
  assert.equal(commands.length,1);
});
