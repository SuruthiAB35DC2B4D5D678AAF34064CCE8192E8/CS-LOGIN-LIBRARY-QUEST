import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIBRARY_SYSTEM_PROMPT = `You are a friendly and helpful library assistant for MMES College Library. You help students and faculty with library-related queries.

**Library Information:**
- Library Name: MMES College Library
- Location: MMES College Campus, Main Building, Ground Floor
- Working Hours: 
  - Monday to Friday: 8:00 AM - 8:00 PM
  - Saturday: 9:00 AM - 5:00 PM
  - Sunday: Closed
- Total Books: 15,420+ books across various departments
- E-Resources: Access to NPTEL, SWAYAM, and digital journals

**Departments & Collections:**
- Computer Science: Programming, AI/ML, Data Structures, Web Development
- Electronics: Digital Electronics, Circuit Analysis, Communication Systems
- Mechanical: Thermodynamics, Machine Design, Manufacturing
- Civil: Structural Analysis, Concrete Technology, Surveying
- Electrical: Power Systems, Control Systems, Electrical Machines
- General: Literature, History, Philosophy, Religious texts

**Services:**
- Book borrowing (14-day loan period for students, 30 days for faculty)
- Reference section (in-library use only)
- Digital library with e-books and journals
- Study rooms and reading halls
- Photocopy services
- Inter-library loan requests
- Book reservation system

**Rules:**
- Maximum 3 books at a time for students
- Maximum 5 books at a time for faculty
- Late fee: ₹2 per day per book
- ID card required for entry
- Maintain silence in reading areas
- No food or drinks allowed

**Popular Books:**
- Introduction to Algorithms by Cormen
- Digital Electronics by Morris Mano
- Thermodynamics by P.K. Nag
- Structural Analysis by R.C. Hibbeler
- Power Systems by C.L. Wadhwa

Answer questions about library timing, book availability, borrowing rules, services, and general library queries. Be concise, friendly, and helpful. If you don't know something specific, guide them to contact the library staff.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: LIBRARY_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Library chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
