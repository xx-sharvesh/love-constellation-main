// @ts-ignore - Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedMessage {
  datetime: string;
  sender: string;
  content: string;
  isSystem: boolean;
  raw_line: string;
}

function parseWhatsAppChat(text: string): ParsedMessage[] {
  const lines = text.split('\n');
  const messages: ParsedMessage[] = [];
  
  // Regex to match WhatsApp message format: DD/MM/YY, H:MM am/pm - Sender: Message
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2})(?:\s*(am|pm|AM|PM))?\s*-\s*(.*)$/;
  
  let currentMessage: ParsedMessage | null = null;
  
  for (const line of lines) {
    const match = line.match(messageRegex);
    
    if (match) {
      // Save previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [, date, time, meridian, remainder] = match;
      
      // Parse datetime
      const [day, month, year] = date.split('/').map(Number);
      const fullYear = year < 100 ? 2000 + year : year;
      const [hour, minute] = time.split(':').map(Number);
      
      // Adjust for AM/PM
      let adjustedHour = hour;
      if (meridian) {
        const isPM = meridian.toLowerCase() === 'pm';
        if (isPM && hour !== 12) adjustedHour += 12;
        if (!isPM && hour === 12) adjustedHour = 0;
      }
      
      const datetime = new Date(fullYear, month - 1, day, adjustedHour, minute);
      
      // Extract sender and content
      const colonIndex = remainder.indexOf(':');
      let sender = 'System';
      let content = remainder;
      let isSystem = true;
      
      if (colonIndex > 0 && colonIndex < 100) {
        const potentialSender = remainder.substring(0, colonIndex).trim();
        if (potentialSender && !potentialSender.match(/^[\s\p{P}]+$/u)) {
          sender = potentialSender;
          content = remainder.substring(colonIndex + 1).trim();
          isSystem = false;
        }
      }
      
      currentMessage = {
        datetime: datetime.toISOString(),
        sender,
        content,
        isSystem,
        raw_line: line,
      };
    } else if (currentMessage && line.trim()) {
      // Multi-line continuation
      currentMessage.content += '\n' + line;
      currentMessage.raw_line += '\n' + line;
    } else if (!currentMessage && line.trim()) {
      // First line without proper format
      messages.push({
        datetime: new Date().toISOString(),
        sender: 'System',
        content: line,
        isSystem: true,
        raw_line: line,
      });
    }
  }
  
  // Push last message
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the file content from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting to parse file:', file.name, 'Size:', file.size);
    const text = await file.text();
    const messages = parseWhatsAppChat(text);
    console.log('Parsed messages count:', messages.length);

    // Batch insert messages to avoid timeout (1000 at a time)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      console.log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}, messages ${i} to ${i + batch.length}`);
      
      const { error } = await supabaseClient
        .from('chat_messages')
        .insert(
          batch.map(msg => ({
            datetime: msg.datetime,
            sender: msg.sender,
            content: msg.content,
            is_system: msg.isSystem,
            raw_line: msg.raw_line,
          }))
        );

      if (error) {
        console.error('Database error on batch:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to save messages', 
            details: error,
            inserted: totalInserted 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      totalInserted += batch.length;
    }

    console.log('Successfully inserted all messages:', totalInserted);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: totalInserted,
        messages: messages.slice(0, 5), // Return first 5 as preview
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
