import axios from "axios";
import * as cheerio from "cheerio";
import { Logger } from "@/app/_utils/logger";
import { cachePageContent, getCachedPageContent } from "@/app/_utils/cache";
import { PageContent, PageContentError } from "@/app/_utils/scrapers/_scraper";
import { clean } from "@/app/_utils/scrapers/_scraper";

const logger = new Logger("static-scraper");

export async function scrapeStatic(url: string): Promise<PageContent | PageContentError> {
    try {

        logger.info(`Starting scrape process for ${url}`);
        
        const cached = await getCachedPageContent(url);
        if (cached) {
            logger.info(`Cache hit - Found cached content for ${url}`);
            return cached;
        }

        logger.info(`Cache miss - proceeding with fresh scrape for ${url}`);
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove script and style tags
        $("script").remove();
        $("style").remove();

        // Remove navigation, header, and footer
        $("nav").remove();
        $("header").remove();
        $("footer").remove();

        // Remove interactive elements
        $("input").remove();
        $("button").remove();
        $("form").remove();

        // Remove social media links
        $("a[href*='facebook.com']").remove();
        $("a[href*='twitter.com']").remove();
        $("a[href*='instagram.com']").remove();
        $("a[href*='linkedin.com']").remove();
        $("a[href*='youtube.com']").remove();
        $("a[href*='tiktok.com']").remove();

        // Remove separator elements
        $("hr").remove();
        $("br").remove();

        // Title
        const title = $("title").text();

        // Metadata
        const metadata = $('meta[name="description"]').attr("content") || "";

        // Content
        var content = $("article p, article p.content, article p.text, article p.description, article h1, article h2, article h3, article ul, article ol, article li").map((_, el) => $(el).text()).get().join(" ");
        content = clean(content);

        const hyperlinks = $("p > a[href^='http'], p > a[href^='https'], li > a[href^='http'], li > a[href^='https']").map((_, el) => $(el).attr("href")).get();
        console.info(hyperlinks);

        const pageContent: PageContent = {
            url,
            title,
            metadata,
            content
        };

        await cachePageContent(url, pageContent);

        return pageContent;

    } catch (error) {
        console.error(`Error scraping ${url} - ${error}`);
        return {
            url,
            error: "Internal Server Error"
        }
    }
}