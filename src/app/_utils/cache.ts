import { Logger } from "@/app/_utils/logger";
import { redis } from "@/app/_utils/upstash-redis-client";
import { MAX_CACHE_SIZE, CACHE_TTL } from "@/app/_constants/scraper";
import { isValidPageContent, PageContent } from "@/app/_utils/scrapers/_scraper";

const logger = new Logger("cache");

function getCacheKey(url: string) {
    const sanitizedUrl = url.substring(0, 200);
    logger.info(`Cache key: ${sanitizedUrl}`);
    return `scrape:${sanitizedUrl}`;
}

export async function getCachedPageContent(url: string): Promise<PageContent | null> {
    try {
        const cacheKey = getCacheKey(url);
        logger.info(`Checking cache for key: ${cacheKey}`);
        const cached = await redis.get(cacheKey);

        if (!cached) {
            logger.info(`Cache miss - No cached content found for ${url}`);
            return null;
        }

        logger.info(`Cache hit - Found cached content for ${url}`);

        let parsed: any;
        if (typeof cached === "string") {
            try {
                parsed = JSON.parse(cached);
            } catch (parseError) {
                logger.error(`JSON parse error for cached content - ${parseError}`);
                await redis.del(cacheKey);
                return null;
            }
        } else {
            parsed = cached;
        }

        if (isValidPageContent(parsed)) {
            const age = Date.now() - (parsed.cachedAt || 0);
            logger.info(`Cache content age: ${Math.round(age / 1000 / 60)} minutes`);
            return parsed;
        }

        logger.warn(`Invalid cached content format`);
        await redis.del(cacheKey);
        return null;
    } catch (error) {
        logger.error(`Cache retrieval error: ${error}`);
        return null;
    }
}

export async function cachePageContent(
    url: string,
    content: PageContent
): Promise<void> {
    try {
        
        const cacheKey = getCacheKey(url);
        content.cachedAt = Date.now();
        
        if (!isValidPageContent(content)) {
            logger.error(`Attempted to cache invalid content`);
            return;
        } 

        const serialized = JSON.stringify(content);
        
        if (serialized.length > MAX_CACHE_SIZE) {
            logger.warn(`Content too large to cache - size ${serialized.length} bytes`);
            return;
        }

        await redis.set(cacheKey, serialized, { ex: CACHE_TTL});
        logger.info(`Successfully cached content - size ${serialized.length} bytes and TTL ${CACHE_TTL} seconds`);

    } catch (error) {
        logger.error(`Cache storage error - ${error}`);
    }
}