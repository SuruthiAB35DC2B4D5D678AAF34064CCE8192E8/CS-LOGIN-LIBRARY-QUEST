import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
};

// Curated, freely available e-books matching the syllabus.
// The frontend never sees these source URLs — the proxy streams them.
const EBOOKS: Record<
  string,
  { url: string; filename: string; title: string }
> = {
  "1": {
    url: "https://legislative.gov.in/sites/default/files/COI.pdf",
    filename: "constitution-of-india.pdf",
    title: "Constitution of India (TNPSC Polity)",
  },
  "2": {
    url: "https://ncert.nic.in/textbook/pdf/jemh1ps.pdf",
    filename: "ncert-class10-maths.pdf",
    title: "SSC — Quantitative Aptitude (NCERT Class 10 Math)",
  },
  "3": {
    url: "https://ncert.nic.in/textbook/pdf/jesc1ps.pdf",
    filename: "ncert-class10-science.pdf",
    title: "RRB — General Science (NCERT Class 10)",
  },
  "4": {
    url: "https://ugcnet.nta.nic.in/images/syllabus/paper1.pdf",
    filename: "ugc-net-paper1-syllabus.pdf",
    title: "UGC NET Paper 1 — Teaching & Research Aptitude",
  },
  "5": {
    url: "https://ncert.nic.in/textbook/pdf/iess101.pdf",
    filename: "trb-pedagogy-reference.pdf",
    title: "TRB — Teacher Recruitment Pedagogy",
  },
  "6": {
    url: "https://archive.org/download/Thirukkural_with_English_Couplets/Thirukkural_with_English_Couplets.pdf",
    filename: "thirukkural.pdf",
    title: "Thirukkural — Tamil Literature",
  },
  "7": {
    url: "https://ncert.nic.in/textbook/pdf/jeff1ps.pdf",
    filename: "english-grammar.pdf",
    title: "English Grammar & Communication",
  },
  "8": {
    url: "https://ncert.nic.in/textbook/pdf/keph101.pdf",
    filename: "neet-physics-class11-ch1.pdf",
    title: "NEET — Physics NCERT Class 11",
  },
  "9": {
    url: "https://ncert.nic.in/textbook/pdf/jemh114.pdf",
    filename: "aptitude-foundation.pdf",
    title: "Aptitude & Reasoning Foundation",
  },
  "10": {
    url: "https://ncert.nic.in/textbook/pdf/keec101.pdf",
    filename: "economic-survey-reference.pdf",
    title: "Current Affairs — Economic Reference",
  },
  "11": {
    url: "https://tanthiamhuat.files.wordpress.com/2018/04/pythondatasciencehandbook.pdf",
    filename: "python-data-science-handbook.pdf",
    title: "Python Data Science Handbook — VanderPlas",
  },
  "12": {
    url: "https://toc.cryptobook.us/book.pdf",
    filename: "applied-cryptography-boneh-shoup.pdf",
    title: "Applied Cryptography — Boneh & Shoup",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const download = url.searchParams.get("download") === "1";
    const tokenFromQuery = url.searchParams.get("token");
    const tokenFromHeader = req.headers
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "");
    const token = tokenFromQuery || tokenFromHeader;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!id || !EBOOKS[id]) {
      return new Response(JSON.stringify({ error: "E-book not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const book = EBOOKS[id];
    const upstream = await fetch(book.url, {
      headers: {
        // Some hosts (NCERT, etc.) reject empty UA
        "User-Agent":
          "Mozilla/5.0 (compatible; LovableEBookProxy/1.0; +https://lovable.dev)",
        Accept: "application/pdf,*/*",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch e-book (${upstream.status})`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${book.filename}"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    };
    const len = upstream.headers.get("content-length");
    if (len) headers["Content-Length"] = len;

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    console.error("ebook-proxy error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
