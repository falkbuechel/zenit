// Erzeugt die App-Icons nach public/. Aufruf: node tools/make-icons.js (danach python build.py)
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', 'public');
(async()=>{
 const b=await chromium.launch();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0d0f0c"/><circle cx="256" cy="256" r="190" fill="#161914" stroke="#343b30" stroke-width="6"/><path d="M96 372 L226 176 L274 248 L312 200 L416 372 Z" fill="#86b06e" fill-opacity=".25" stroke="#86b06e" stroke-width="22" stroke-linejoin="round"/><path d="M226 176 L252 215 L233 232 L212 214 Z" fill="#eef1e9"/></svg>`;
 for (const [n,sz] of [['icon-512',512],['icon-192',192],['apple-touch-icon',180]]) {
  const p=await (await b.newContext({viewport:{width:sz,height:sz}})).newPage();
  await p.setContent(`<body style="margin:0"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width=${sz} height=${sz}>`);
  await p.screenshot({path:path.join(OUT,`${n}.png`)});
 }
 await b.close();
})();
