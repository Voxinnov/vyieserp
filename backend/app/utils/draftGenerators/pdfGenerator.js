
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function findBrowserExecutable() {
    const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
    ];

    for (const browserPath of possiblePaths) {
        if (fs.existsSync(browserPath)) {
            return browserPath;
        }
    }
    return null;
}

exports.generatePdfFromHtml = async (htmlContent, filename) => {
    const storageDir = path.join(__dirname, "../../../storage/drafts");
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    const outputPath = path.join(storageDir, filename);

    let browser;
    try {
        const executablePath = await findBrowserExecutable();
        const launchOptions = {
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        };
        if (executablePath) launchOptions.executablePath = executablePath;

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle2" });

        await page.pdf({
            path: outputPath,
            format: "A4",
            margin: { top: "0.5in", bottom: "0.7in", left: "0.5in", right: "0.5in" },
            printBackground: true
        });

        await browser.close();
        return outputPath;
    } catch (error) {
        if (browser) await browser.close();
        console.error("PDF Generation Error:", error);
        throw error;
    }
};
