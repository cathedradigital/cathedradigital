import { createClient } from "npm:@supabase/supabase-js@2";

const REPO = "cathedradigital/cathedradigital";
const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_AUDIENCE = "https://cathedradigital.com.br/source-sync";
const GITHUB_JWKS_URL = "https://token.actions.githubusercontent.com/.well-known/jwks";
const ORDINARIUM_BASE = "https://api.ordinarium.com.br/api/v1/bible";
const VATICAN_BASE = "https://www.vatican.va/archive/cathechism_po/index_new/";

const API_BOOK_MAP: Record<string, string> = {
  "Gn":"gn","Ex":"ex","Lv":"lv","Nm":"nm","Dt":"dt","Js":"js","Jz":"jz","Rt":"rt","1 Sm":"1sm","2 Sm":"2sm",
  "1 Rs":"1rs","2 Rs":"2rs","1 Cr":"1cr","2 Cr":"2cr","Esd":"esd","Ne":"ne","Tb":"tb","Jdt":"jdt","Est":"est",
  "1 Mc":"1mc","2 Mc":"2mc","Jó":"jo","Sl":"sl","Pr":"pv","Ecl":"ecl","Ct":"ct","Sb":"sb","Eclo":"eclo","Is":"is",
  "Jr":"jr","Lm":"lm","Br":"br","Ez":"ez","Dn":"dn","Os":"os","Jl":"jl","Am":"am","Abd":"abd","Jn":"jn","Mq":"mq",
  "Na":"na","Hab":"hab","Sf":"sf","Ag":"ag","Zc":"zc","Ml":"ml","Mt":"mt","Mc":"mc","Lc":"lc","Jo":"joao","At":"at",
  "Rm":"rm","1 Cor":"1cor","2 Cor":"2cor","Gl":"gl","Ef":"ef","Fl":"fl","Cl":"cl","1 Ts":"1ts","2 Ts":"2ts",
  "1 Tm":"1tm","2 Tm":"2tm","Tt":"tt","Fm":"fm","Hb":"hb","Tg":"tg","1 Pd":"1pd","2 Pd":"2pd","1 Jo":"1jo","2 Jo":"2jo",
  "3 Jo":"3jo","Jd":"jd","Ap":"ap",
};

const PAGES: Array<[number, number, string]> = [
  [1,25,"prologo 1-25_po.html"],[26,49,"p1s1c1_26-49_po.html"],[50,141,"p1s1c2_50-141_po.html"],
  [142,184,"p1s1c3_142-184_po.html"],[185,197,"p1s2_185-197_po.html"],[198,421,"p1s2c1_198-421_po.html"],
  [422,682,"p1s2cap2_422-682_po.html"],[683,1065,"p1s2cap3_683-1065_po.html"],[1066,1075,"p2s1cap1_1066-1075_po.html"],
  [1076,1134,"p2s1cap1_1076-1134_po.html"],[1135,1209,"p2s1cap2_1135-1209_po.html"],[1210,1419,"p2s2cap1_1210-1419_po.html"],
  [1420,1532,"p2s2cap1_1420-1532_po.html"],[1533,1666,"p2s2cap3_1533-1666_po.html"],[1667,1690,"p2s2cap4_1667-1690_po.html"],
  [1691,1698,"p3-intr_1691-1698_po.html"],[1699,1876,"p3s1cap1_1699-1876_po.html"],[1877,1948,"p3s1cap2_1877-1948_po.html"],
  [1949,2051,"p3s1cap3_1949-2051_po.html"],[2052,2082,"p3s2-intr_2052-2082_po.html"],[2083,2195,"p3s2cap1_2083-2195_po.html"],
  [2196,2557,"p3s2cap2_2196-2557_po.html"],[2558,2565,"p4-intr_2558-2565_po.html"],[2566,2649,"p4s1cap1_2566-2649_po.html"],
  [2650,2696,"p4s1cap2_2650-2696_po.html"],[2697,2758,"p4s1cap3_2697-2758_po.html"],[2759,2865,"p4s2_2759-2865_po.html"],
];

const CORS = {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:CORS});
let jwks: Record<string, JsonWebKey>|null=null;

function b64(input:string){const s=input.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(input.length/4)*4,"=");const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0));}
function part(input:string){return JSON.parse(new TextDecoder().decode(b64(input)));}
async function keys(){if(jwks)return jwks;const r=await fetch(GITHUB_JWKS_URL);if(!r.ok)throw new Error("github_jwks_unavailable");const j=await r.json();jwks=Object.fromEntries((j.keys??[]).map((k:JsonWebKey&{kid?:string})=>[k.kid,k]));return jwks;}

async function authorized(req:Request){
  const auth=req.headers.get("authorization")||"";const token=auth.startsWith("Bearer ")?auth.slice(7).trim():"";if(!token)return false;
  const p=token.split(".");if(p.length!==3)return false;
  try{
    const h=part(p[0]) as {alg?:string;kid?:string};const c=part(p[1]) as Record<string,unknown>;
    const now=Math.floor(Date.now()/1000);
    if(h.alg!=="RS256"||!h.kid||c.iss!==OIDC_ISSUER||c.aud!==OIDC_AUDIENCE||c.repository!==REPO||c.ref!=="refs/heads/main")return false;
    if(typeof c.exp!=="number"||c.exp<=now||typeof c.iat!=="number"||c.iat>now+60)return false;
    const jwk=(await keys())[h.kid];if(!jwk)return false;
    const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64(p[2]),new TextEncoder().encode(p[0]+"."+p[1]));
  }catch{return false;}
}

async function fetchRetry(url:string){
  let last=502;
  for(let i=1;i<=3;i++){try{const r=await fetch(url,{headers:{Accept:"application/json,text/html","User-Agent":"CathedraDigital/1.0"}});if(r.ok||r.status===404)return r;last=r.status;if(r.status<500||i===3)return r;}catch{if(i===3)break;}await new Promise(r=>setTimeout(r,150*i));}
  return new Response(null,{status:last});
}
function decodeEntities(text:string){
  const named:Record<string,string>={
    nbsp:" ",quot:'"',apos:"'",amp:"&",lt:"<",gt:">",laquo:"«",raquo:"»",mdash:"—",ndash:"–",
    atilde:"ã",ccedil:"ç",eacute:"é",iacute:"í",aacute:"á",oacute:"ó",agrave:"à",ecirc:"ê",otilde:"õ",
    uacute:"ú",acirc:"â",ocirc:"ô",Eacute:"É",Atilde:"Ã",Ccedil:"Ç",ordf:"ª",sect:"§",Aacute:"Á",
    Iacute:"Í",Oacute:"Ó",Uacute:"Ú",Ecirc:"Ê",Agrave:"À",Otilde:"Õ",egrave:"è",uuml:"ü",Acirc:"Â",
    ograve:"ò",icirc:"î",deg:"°",ucirc:"û",iuml:"ï",yacute:"ý",Ocirc:"Ô",euml:"ë",igrave:"ì",
    auml:"ä",ordm:"º",shy:""
  };
  return text
    .replace(/&([A-Za-z][A-Za-z0-9]+);/g,(_,name)=>named[name]??("&"+name+";"))
    .replace(/&#x([0-9a-f]+);/gi,(_,hex)=>String.fromCodePoint(parseInt(hex,16)))
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
}
function stripHtml(html:string){
  return decodeEntities(html
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<br\s*\/?>/gi,"\n")
    .replace(/<\/(?:p|div|li|blockquote|h[1-6])\s*>/gi,"\n")
    .replace(/<[^>]+>/g," ")
    .replace(/[ \t]+/g," ")
    .replace(/\n[ \t]+/g,"\n")
    .replace(/\n{3,}/g,"\n\n").trim());
}
function parsePage(text:string,from:number,to:number){
  const markers=new Map<number,{index:number;length:number}[]>();
  const pattern=from===1 ? /\b(\d{1,4})\s*\.\s+/g : /\b(\d{1,4})(?:\s*\.)?\s+/g;
  for(const match of text.matchAll(pattern)){
    const n=Number(match[1]);
    if(n<from||n>to) continue;
    const list=markers.get(n)??[];
    list.push({index:match.index??0,length:match[0].length});
    markers.set(n,list);
  }

  if(from===2196 && to===2557){
    if(!markers.has(2217)){
      const alias=[...text.matchAll(/\b2117\s*\.?\s+/g)].map(m=>({index:m.index??0,length:m[0].length}));
      if(alias.length) markers.set(2217,alias);
    }
    if(!markers.has(2439)){
      const alias=[...text.matchAll(/\b1439\s*\.?\s+/g)].map(m=>({index:m.index??0,length:m[0].length}));
      if(alias.length) markers.set(2439,alias);
    }
  }
  const out:{paragraph:number;content:string}[]=[];
  let cursor=0;
  for(let n=from;n<=to;n++){
    const candidates=(markers.get(n)??[]).filter(x=>x.index>=cursor);
    const chosen=candidates[0];
    if(!chosen) continue;
    const nextCandidates=(markers.get(n+1)??[]).filter(x=>x.index>chosen.index);
    let end=nextCandidates[0]?.index??text.length;
    if(!nextCandidates.length){
      const notesIndex=text.search(/\n\s*Notas\b/i);
      if(notesIndex>chosen.index) end=notesIndex;
    }
    const content=text.slice(chosen.index+chosen.length,end).replace(/\s+/g," ").trim();
    out.push({paragraph:n,content});
    cursor=end;
  }
  return out;
}

async function syncBible(db:any,limit:number){
  const {data:s}=await db.from("source_sync_state").select("*").eq("source_kind","bible").single();if(!s||s.status==="completed")return {status:s?.status??"missing",processed:0};
  const {data:books,error}=await db.from("bible_books").select("id,abbrev,chapters_count,created_at").order("created_at",{ascending:true}).order("id",{ascending:true});if(error||!books)throw new Error(error?.message||"bible_books_unavailable");
  let cursor=s.cursor,processed=0;const total=books.reduce((a:any,b:any)=>a+Number(b.chapters_count||0),0);
  while(cursor<total&&processed<limit){
    let offset=cursor,book=books[0];for(const candidate of books){const count=Number(candidate.chapters_count||0);if(offset<count){book=candidate;break;}offset-=count;}
    const chapter=offset+1;const apiBook=API_BOOK_MAP[book.abbrev]||String(book.abbrev).toLowerCase();const url=`${ORDINARIUM_BASE}/${encodeURIComponent(apiBook)}/${chapter}`;const r=await fetchRetry(url);if(!r.ok)throw new Error(`bible_upstream_${r.status}_${book.abbrev}_${chapter}`);
    const raw=await r.json();const rv=Array.isArray(raw)?raw:raw?.verses;const verses=Array.isArray(rv)?rv.map((v:any)=>({number:Number(v.number??v.verse),text:typeof v.text==="string"?v.text.trim():""})).filter((v:any)=>Number.isInteger(v.number)&&v.number>0&&v.text):[];if(!verses.length)throw new Error(`bible_empty_${book.abbrev}_${chapter}`);
    const at=new Date().toISOString();const {data:ch,error:ce}=await db.from("bible_chapters").upsert({book_id:book.id,number:chapter,source_name:"Ordinarium API",source_url:r.url||url,source_retrieved_at:at},{onConflict:"book_id,number"}).select("id").single();if(ce||!ch?.id)throw new Error(ce?.message||"bible_chapter_upsert_failed");
    const {error:ve}=await db.from("bible_verses").upsert(verses.map((v:any)=>({chapter_id:ch.id,number:v.number,text:v.text,source_name:"Ordinarium API",source_url:r.url||url,source_retrieved_at:at})),{onConflict:"chapter_id,number"});if(ve)throw new Error(ve.message);
    cursor++;processed++;
  }
  const done=cursor>=total;await db.from("source_sync_state").update({cursor,items_processed:cursor,status:done?"completed":"pending",last_error:null,completed_at:done?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("source_kind","bible");
  return {status:done?"completed":"pending",processed,cursor,total};
}

async function syncCatechism(db:any,maxPages:number){
  const {data:s}=await db.from("source_sync_state").select("*").eq("source_kind","catechism").single();if(!s||s.status==="completed")return {status:s?.status??"missing",pages:0};
  let index=s.cursor,pages=0,processed=s.items_processed;
  while(index<PAGES.length&&pages<maxPages){
    const [from,to,file]=PAGES[index];const url=VATICAN_BASE+encodeURI(file);const r=await fetchRetry(url);if(!r.ok)throw new Error(`catechism_upstream_${r.status}_${from}_${to}`);const items=parsePage(stripHtml(await r.text()),from,to);if(!items.length)throw new Error(`catechism_page_empty_${from}_${to}`);
    const at=new Date().toISOString();const {error}=await db.from("catechism_official").upsert(items.map(x=>({paragraph:x.paragraph,content:x.content,source_name:"Santa Sé · vatican.va",source_url:url,source_retrieved_at:at})),{onConflict:"paragraph"});if(error)throw new Error(error.message);
    processed+=items.length;index++;pages++;
  }
  const done=index>=PAGES.length;await db.from("source_sync_state").update({cursor:index,items_processed:processed,status:done?"completed":"pending",last_error:null,completed_at:done?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("source_kind","catechism");
  return {status:done?"completed":"pending",pages,cursor:index,totalPages:PAGES.length,processed};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:CORS});if(req.method!=="POST")return json({error:"Método não permitido."},405);if(!(await authorized(req)))return json({error:"Não autorizado."},401);
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!url||!key)return json({error:"Configuração segura do Supabase ausente."},503);
  let body:any={};try{body=await req.json();}catch{}
  const bibleLimit=Math.min(Math.max(Number(body.max_bible_chapters)||8,1),12);const catechismPages=Math.min(Math.max(Number(body.max_catechism_pages)||27,1),27);
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  try{const [bible,catechism]=await Promise.all([syncBible(db,bibleLimit),syncCatechism(db,catechismPages)]);return json({ok:true,bible,catechism,limits:{bibleLimit,catechismPages},at:new Date().toISOString()});}
  catch(error){const message=error instanceof Error?error.message:String(error);console.error("[source-sync] failed",message);return json({ok:false,error:message},502);}
});

// Catechism P0: sequential parser repair validated against Vatican page structure.
