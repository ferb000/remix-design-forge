import React, {useState} from 'react';
import {contentImages,useSiteContent} from '../../services/siteContent';
import {request} from '../../services/api';
export function SiteContentManager() {
  const initial=useSiteContent();
  const [saved,setSaved]=useState<Record<string,string>>({});
  const [busy,setBusy]=useState('');
  const [message,setMessage]=useState('');
  async function upload(key:string,file?:File) {
    if(!file)return;
    setBusy(key);setMessage('');
    try {
      const data=new FormData();data.append('image',file);
      const result=await request<{url:string}>('/api/site-content/'+key,'PUT',data);
      setSaved(current=>({...current,[key]:result.data.url}));
      setMessage('Image saved. Refresh the website to see the update.');
    } catch(error) {setMessage((error as Error).message);}
    finally {setBusy('');}
  }
  return <section><h1 className="text-2xl mb-2">Website images</h1>
    <p className="text-sm text-white/60 mb-5">Update the About Me portrait and images used throughout Creative Process. Existing images remain until replaced.</p>
    <p role="status" className="mb-4 text-sm">{message}</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{contentImages.map(([key,label])=><div key={key} className="border border-white/15 rounded-lg p-4 min-w-0">
      <h2 className="mb-3 text-sm">{label}</h2>
      {(saved[key]||initial[key]) ? <img src={saved[key]||initial[key]} alt={label} className="w-full h-36 object-cover rounded mb-3"/> : <div className="h-36 bg-white/5 rounded mb-3 flex items-center justify-center text-xs text-white/50">Original website image</div>}
      <label className="block text-xs">{busy===key?'Uploading…':'Replace image'}<input aria-label={label} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={!!busy} className="block w-full mt-2 text-xs" onChange={event=>{void upload(key,event.target.files?.[0]);event.target.value='';}}/></label>
    </div>)}</div></section>;
}
