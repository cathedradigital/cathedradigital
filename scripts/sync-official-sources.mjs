const endpoint = "https://isojguvcnfncokoxoauk.supabase.co/functions/v1/source-sync";
const token = process.env.OIDC_TOKEN;

if (!token) throw new Error("OIDC_TOKEN ausente");

async function post(body) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  if (!r.ok) throw new Error("source-sync HTTP " + r.status + ": " + t);
  return JSON.parse(t);
}

const result = await post({
  max_bible_chapters: 0,
  max_catechism_pages: 2,
});

console.log(JSON.stringify(result, null, 2));

if (!result?.ok) {
  throw new Error("source-sync retornou falha: " + JSON.stringify(result));
}
