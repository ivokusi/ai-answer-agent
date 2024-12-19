import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { Logger } from "@/app/_utils/logger";

const logger = new Logger("dynamic-scraper");

export async function scrapeDynamic(url: string) {
    
    logger.info("Starting")
    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

    logger.info("Initializing browser")
    const browser = await puppeteer.launch({
        args: isLocal ? puppeteer.defaultArgs() : [...chromium.args, "--hide-scrollbars", "--incognito", "--no-sandbox"],
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.CHROME_EXECUTABLE_PATH,
        headless: chromium.headless,
    });

    logger.info("Navigating to URL")
    const page = await browser.newPage();
    await page.goto(url);
    const pageTitle = await page.title();
    await browser.close();
    logger.info("Closing browser")

    return pageTitle;

}