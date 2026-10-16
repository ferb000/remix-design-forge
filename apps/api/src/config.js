export function validateProductionConfig(env = process.env) {
  if (env.NODE_ENV !== 'production') return;
  if (env.TRUST_PROXY_HOPS && env.TRUST_PROXY_HOPS !== '1') throw new Error('TRUST_PROXY_HOPS must be 1 for the single Nginx ingress.');
  for (const key of ['DATABASE_URL','ADMIN_EMAIL','ADMIN_PASSWORD','PUBLIC_API_URL','CORS_ORIGINS','S3_BUCKET','AWS_REGION']) if(!env[key]) throw new Error(`Production configuration requires ${key}.`);
  if (env.ADMIN_PASSWORD.length < 16 || /^(?:REPLACE_|YOUR_)/.test(env.ADMIN_PASSWORD) || env.ADMIN_PASSWORD === 'forge2026!') throw new Error('Use a unique ADMIN_PASSWORD of at least 16 characters.');
  if (env.STORAGE_DRIVER !== 's3') throw new Error('Production uploads must use STORAGE_DRIVER=s3.');
  for (const url of [env.PUBLIC_API_URL,...env.CORS_ORIGINS.split(',')]) if(!/^https:\/\/[^/]+\/?$/.test(url)) throw new Error('Production public URLs and allowed origins must be HTTPS origins without paths.');
}
