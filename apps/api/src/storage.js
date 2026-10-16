import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

export function createStorage({ driver = process.env.STORAGE_DRIVER || 'local', uploadsDir, bucket = process.env.S3_BUCKET, region = process.env.AWS_REGION, publicUrl = process.env.PUBLIC_API_URL || 'http://localhost:3002', client } = {}) {
  if (driver === 'local') return {
    async put(name,body) { await mkdir(uploadsDir,{recursive:true}); await writeFile(path.join(uploadsDir,name),body,{flag:'wx'}); return '/uploads/'+name; },
    async remove(url) { if (/^\/uploads\/[\w.-]+$/.test(url)) await unlink(path.join(uploadsDir,path.basename(url))).catch(()=>{}); },
  };
  if (driver !== 's3' || !bucket || !region || !/^https?:\/\/[^/]+\/?$/.test(publicUrl)) throw new Error('S3 storage requires S3_BUCKET, AWS_REGION, and a PUBLIC_API_URL origin.');
  const s3 = client || new S3Client({region});
  const prefix = publicUrl.replace(/\/$/,'')+'/api/media/';
  return {
    async put(name,body,contentType) {
      await s3.send(new PutObjectCommand({ Bucket:bucket, Key:'uploads/'+name, Body:body, ContentType:contentType, CacheControl:'public, max-age=31536000, immutable', ServerSideEncryption:'AES256' }));
      return prefix+name;
    },
    async remove(url) {
      if (url.startsWith(prefix) && /^[\w.-]+$/.test(url.slice(prefix.length))) await s3.send(new DeleteObjectCommand({Bucket:bucket,Key:'uploads/'+url.slice(prefix.length)}));
    },
    async read(name) {
      if (!/^[\w-]+\.(?:jpg|png|webp|gif|svg)$/.test(name)) throw Object.assign(new Error('Image not found.'),{status:404});
      return s3.send(new GetObjectCommand({Bucket:bucket,Key:'uploads/'+name}));
    },
  };
}
