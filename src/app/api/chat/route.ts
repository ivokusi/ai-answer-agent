// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/_utils/groq-client";
import { extractUrlFromMessage } from "@/app/_utils/scrapers/_scraper";
import { scrapeStatic } from "@/app/_utils/scrapers/static-website-scraper";

export async function POST(req: Request) {
  try {

    const { message, messages } = await req.json();

    const url = extractUrlFromMessage(message);
    const hasUrl = !!url;

    let scraperContent = "";
    if (hasUrl) {
      const scraperResponse = await scrapeStatic(url);
      if ('content' in scraperResponse) {
        scraperContent = scraperResponse.content;
      }
    }

    // Extract the user's query by removing the URL if present
    const userQuery = message.replace(url ? url : "", "").trim();

    const prompt = `
    Answer my question "${userQuery}" based on the following website content:

    <Content>
      ${scraperContent}
    </Content>
    `;

    const history = [
      ...messages,
      { role: "user", content: prompt }
    ]
    
    const response = await getGroqResponse(history);

    return NextResponse.json({ message: response });

  } catch (error) {

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

  } 
}
