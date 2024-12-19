import { URL_PATTERN } from "@/app/_constants/scraper";
import { Logger } from "@/app/_utils/logger";

const logger = new Logger("scraper");

export function extractUrlFromMessage(message: string) {
    logger.info("Extracting URL from message");
    const match = message.match(URL_PATTERN);
    logger.info(`Match extracted ${match}`);
    return match ? match[0] : null;
}

export function clean(content: string) {
    logger.info("Cleaning content");
    return content.replace(/\s+/g, " ").replace(/\n+/g, "").trim();
}

export function isValidPageContent(data: any): data is PageContent {
    logger.info("Validating page content");
    return (
        typeof data === "object" &&
        data !== null &&
        typeof data.url === "string" &&
        typeof data.title === "string" &&
        typeof data.metadata === "string" &&
        typeof data.content === "string"
    );
}

export interface PageContentError {
    url: string;
    error: string;
}

export interface PageContent {
    url: string;
    title: string;
    metadata: string;
    content: string;
    cachedAt?: number;
}
