// Applied only to ordinary user clicks. Internal navigation, OAuth, downloads and modifier clicks stay native.
export function externalUrl(href,origin){try{const url=new URL(href,origin);return ['https:','http:'].includes(url.protocol)&&url.origin!==origin&&!url.username&&!url.password?url:null;}catch{return null;}}
export function chromeIntent(url){
 // Keep fragment links native: this avoids changing anchors in sites, documents and videos.
 if(url.hash)return null;
 return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${url.protocol.slice(0,-1)};package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url.href)};end`;
}
export function routeExternalClick(event,{origin,androidInstalled,defer}){
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const link=event.target?.closest?.('a[href]');if(!link||link.hasAttribute('download'))return;
 const url=externalUrl(link.getAttribute('href'),origin);if(!url)return;
 link.setAttribute('target','_blank');const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));['noopener','noreferrer','external'].forEach(value=>rel.add(value));link.setAttribute('rel',[...rel].join(' '));
 if(!androidInstalled)return;
 const intent=chromeIntent(url);if(!intent)return;
 const original=link.getAttribute('href');link.setAttribute('href',intent);
 defer(()=>{if(link.getAttribute('href')===intent)link.setAttribute('href',original);});
}
