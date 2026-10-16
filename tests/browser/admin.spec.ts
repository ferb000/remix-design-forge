import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  let authenticated=false;
  const user={id:'test-admin',email:'director@example.com',name:'Studio Director',role:'super_admin'};
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/auth/login') {
      authenticated=true;
      return route.fulfill({json:{success:true,user,expiresAt:Date.now()+3600000}});
    }
    if(path==='/api/auth/logout') { authenticated=false; return route.fulfill({json:{success:true,data:true}}); }
    if(path==='/api/auth/session') return route.fulfill({status:authenticated?200:401,json:{success:authenticated,data:authenticated?user:null}});
    if(path==='/api/health') return route.fulfill({json:{success:true,data:{status:'ok'}}});
    if(['/api/inquiries','/api/bookings'].includes(path) && !authenticated) return route.fulfill({status:401,json:{success:false,message:'Please sign in again.'}});
    return route.fulfill({json:{success:true,data:[]}});
  });
});

test('visitors cannot enter the dashboard with forged local storage',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('design_forge_admin_token','fake');
    localStorage.setItem('design_forge_admin_user',JSON.stringify({role:'super_admin'}));
  });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByText('Sign In To Console')).toBeVisible();
  await expect(page.getByText('Portfolio Works', {exact:false})).toHaveCount(0);
  await expect(page.locator('input[type=password]')).toHaveValue('');
  expect(await page.evaluate(()=>localStorage.getItem('design_forge_admin_token'))).toBeNull();
});
test('public navigation contains no admin shortcut and legacy hash does not open admin',async({page})=>{
  await page.goto('/#admin');
  await expect(page.getByRole('button',{name:'Open navigation menu'})).toBeVisible();
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await expect(page.getByText('Admin Console',{exact:true})).toHaveCount(0);
  await expect(page.getByText('Test Admin Credentials:')).toHaveCount(0);
});
test('successful login enters the dashboard and logout returns to the protected login route',async({page})=>{
  await page.goto('/admin/login');
  await page.locator('input[type=email]').fill('director@example.com');
  await page.locator('input[type=password]').fill('a-real-password');
  await page.getByText('Sign In To Console').click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Portfolio Works', {exact:false})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('design_forge_admin_token'))).toBeNull();
  await page.getByRole('button',{name:'Sign Out'}).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});
