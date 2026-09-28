Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    return json({ error: "Gateway de IA não configurado." }, 503);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 4000) {
    return json({ error: "Pergunta inválida." }, 400);
  }

  const history = Array.isArray(body?.history)
    ? body.history.slice(-6).filter((m) =>
        m && (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" && m.content.trim().length > 0
        && m.content.length <= 4000
      )
    : [];

  const system = [
    "Você é Logos, assistente de estudo da Cathedra Digital.",
    "Ajude a compreender a fé católica e conectar Escritura, Catecismo, Magistério, santos, jornadas e oração.",
    "Não invente versículos, citações, documentos, números de parágrafo ou referências.",
    "Diferencie fonte, resumo, interpretação e inferência.",
    "Quando não houver fonte verificável no contexto, diga isso.",
    "Não apresente opinião do modelo como doutrina.",
    "Responda em português brasileiro, de forma clara e útil.",
  ].join("\n");

  const messages = [
    { role: "system", content: system },
    {
      role: "system",
      content: JSON.stringify({
        contexto_cathedra: typeof body?.context === "string" ? body.context.slice(0, 500) : "global",
        tipo: body?.type || null,
        jornada: typeof body?.journeyId === "string" ? body.journeyId.slice(0, 120) : null,
        trecho_selecionado: typeof body?.selectedText === "string" ? body.selectedText.slice(0, 8000) : null,
      }),
    },
    ...history,
    { role: "user", content: query },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages,
        temperature: 0.2,
        max_tokens: 900,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429) {
        return json({ error: "Limite do serviço de IA atingido.", limit_reached: true }, 429);
      }

      console.error("Logos upstream error", response.status, payload?.error?.message);
      return json({ error: "Serviço de IA temporariamente indisponível." }, 502);
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return json({ error: "O serviço de IA respondeu sem conteúdo." }, 502);
    }

    return new Response(JSON.stringify({ text: text.trim() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Logos gateway failure", String(error));
    return json({ error: "Não foi possível conectar ao serviço de IA." }, 502);
  } finally {
    clearTimeout(timeout);
  }
});
