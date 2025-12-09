const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

router.post('/pdf', async (req, res) => {
    try {
        const { html, css } = req.body; // Expecting full HTML fragment and CSS styles

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Construct full HTML document
        const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${css}
          /* Print overrides */
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
