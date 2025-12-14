export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const defaultModel = process.env.GEMINI_MODEL || "gemini-3-pro-preview";

    if (!apiKey) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
    }

    try {
        const body = req.body || {};
        const model = (body.model || defaultModel).trim();

        // Frontend will send:
        // { kind, model?, temperature?, responseMimeType?, prompt, contents?, parts? }
        // We convert it to Gemini REST API format: generateContent

        const temperature =
            typeof body.temperature === "number" ? body.temperature : undefined;
        const responseMimeType =
            typeof body.responseMimeType === "string" ? body.responseMimeType : undefined;

        // contents can be passed through directly (frontend will format as Gemini contents)
        const contents = body.contents;

        if (!contents) {
            return res.status(400).json({ error: "Missing contents" });
        }

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const payload = {
            contents,
            ...(temperature !== undefined ? { generationConfig: { temperature } } : {}),
            ...(responseMimeType ? { generationConfig: { responseMimeType } } : {}),
        };

        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await r.json();

        if (!r.ok) {
            return res.status(r.status).json({
                error: data?.error?.message || "Gemini API error",
                raw: data,
            });
        }

        // Extract text
        const text =
            data?.candidates?.[0]?.content?.parts
                ?.map((p) => p?.text || "")
                .join("") || "";

        return res.status(200).json({ text, raw: data });
    } catch (e) {
        return res.status(500).json({ error: e?.message || "Server error" });
    }
}
