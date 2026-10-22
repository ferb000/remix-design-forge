import { test, expect } from '@playwright/test';
const widths=[320,375,390,667,768,1280];
for(const width of widths) test('public sections and scheduler at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:width===667?375:width<600?740:900});
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/bookings' && route.request().method()==='POST') {
      const data=route.request().postDataJSON();
      expect(data.time).toBe('10:00 GMT');expect(data.budget).toBeUndefined();expect(data.role).toBeUndefined();
      return route.fulfill({json:{success:true,data:{booked:true,reservationId:'test-booking',emailStatus:'queued'}}});
    }
    if(path==='/api/inquiries' && route.request().method()==='POST') return route.fulfill({json:{success:true,data:{received:true,id:'test-inquiry',emailStatus:'queued'}}});
    if(path==='/api/bookings/availability') {
      const date=new Date(Date.now()+86400000).toISOString().slice(0,10);
      return route.fulfill({json:{success:true,data:{timeZone:'Africa/Accra (GMT, UTC+00:00)',durationMinutes:30,dates:[{date,slots:[{time:'10:00 GMT',startsAt:date+'T10:00:00Z',endsAt:date+'T10:30:00Z',available:true}]}]}}});
    }
    return route.fulfill({json:{success:true,data:path==='/api/site-content'?{}:[]}});
  });
  await page.goto('/');
  for(const section of ['Work','About','Clients','Creative Process','FAQ','Connect With Us']) {
    await page.getByRole('button',{name:'Open navigation menu'}).click();
    await page.getByRole('dialog').getByRole('button',{name:section,exact:true}).click();
    await page.waitForTimeout(650);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
    const current=await page.locator('#section-'+({'Work':'work','About':'about','Clients':'clients','Creative Process':'process','FAQ':'faq','Connect With Us':'connect'}[section])).boundingBox();
    expect(current).not.toBeNull();
    if(width===390) await page.screenshot({path:'test-results/mobile-'+section.replaceAll(' ','-')+'.png'});
  }
  await page.getByText('Schedule Consultation',{exact:true}).click();
  const dialog=page.getByRole('dialog').filter({has:page.getByText('Schedule Consultation',{exact:true})});
  await expect(dialog).toBeVisible();
  const close=dialog.getByRole('button',{name:'Close dialog'});
  const box=await close.boundingBox();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
  await dialog.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(dialog.getByText('Estimated Budget Range')).toHaveCount(0);
  await dialog.getByRole('button',{name:/Call Slot|Select.*Time|Choose.*Time/i}).click();
  await expect(dialog.getByText('GMT · Accra (UTC+00:00)')).toBeVisible();
  await dialog.getByRole('button',{name:'10:00 GMT',exact:true}).click();
  await dialog.getByRole('button',{name:'Your Contact Info'}).click();
  if(width===390) await page.screenshot({path:'test-results/mobile-consultation.png'});
  await expect(dialog.getByText('Role',{exact:true})).toHaveCount(0);
  if(width===390) {
    await dialog.locator('input[type=text]').first().fill('Test Client');
    await dialog.locator('input[type=email]').fill('visitor@example.com');
    await dialog.getByRole('button',{name:'Lock In Consultation'}).click();
    await expect(dialog.getByText('Consultation Confirmed',{exact:true})).toBeVisible();
  }
  await close.click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button',{name:'Fill Out Form',exact:true}).click();
  const inquiry=page.getByRole('dialog').filter({has:page.getByText('Start a Project',{exact:true})});
  await expect(inquiry).toBeVisible();
  await inquiry.getByPlaceholder('Your name').fill('Test Visitor');
  await inquiry.getByPlaceholder('Your email address').fill('visitor@example.com');
  await inquiry.locator('textarea').fill('Please discuss my architectural project.');
  await inquiry.getByRole('button',{name:'Send Message'}).click();
  await expect(inquiry.getByText('Message Sent',{exact:true})).toBeVisible();
  await inquiry.getByRole('button',{name:'Close form'}).click();
  await expect(inquiry).toHaveCount(0);
});
