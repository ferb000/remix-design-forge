import { useEffect, useState } from 'react';
import { request } from './api';
export const contentImages = [
  ['aboutPortrait','About Me portrait'],
  ['processNordic','Creative Process: Nordic / discovery'],
  ['processTower','Creative Process: tower / delivery'],
  ['processKyoto','Creative Process: Kyoto / moodboard'],
  ['processSpiral','Creative Process: spiral / references'],
  ['processInterior','Creative Process: interior / atmosphere'],
  ['processDesert','Creative Process: desert / exploration'],
  ['processCoastal','Creative Process: coastal / camera and clay'],
] as const;
export function useSiteContent() {
  const [images,setImages] = useState<Record<string,string>>({});
  useEffect(() => {
    let active=true;
    request<Record<string,string>>('/api/site-content').then(result=>{if(active)setImages(result.data);}).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  return images;
}
