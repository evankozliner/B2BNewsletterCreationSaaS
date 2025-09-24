#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const templatesDir = path.join(__dirname, 'templates');
const outputDir = __dirname;

// Page configurations
const pages = [
    {
        name: 'index',
        template: 'pages/index.ejs',
        output: 'index.html',
        data: {
            title: 'Potions | We make building newsletters easy',
            description: 'Potions helps businesses build newsletters.',
            keywords: 'Newsletter, Newsletters, Email, Email Marketing, Marketing, Business',
            author: 'Evan Kozliner',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'https://embed.typeform.com/next/embed.js']
        }
    },
    {
        name: 'samples',
        template: 'pages/samples.ejs',
        output: 'samples.html',
        data: {
            title: 'Potions | We make building newsletters easy',
            description: 'Potions helps businesses build newsletters.',
            keywords: 'Newsletter, Newsletters, Email, Email Marketing, Marketing, Business',
            author: 'Evan Kozliner',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['hamburger.js']
        }
    },
    {
        name: 'blog-index',
        template: 'pages/blog-index.ejs',
        output: 'blog/index.html',
        data: {
            title: 'Potions Blog | Master newsletter marketing',
            description: 'Potions Blog - Master newsletter marketing with actionable playbooks and real life case studies.',
            keywords: 'Newsletter, Email Marketing, Marketing, Blog, Content Tips',
            author: 'Potions',
            baseUrl: '../',
            styleSheet: 'style.css',
            additionalCSS: ['blog/blog.css'],
            showBlogLink: false,
            tracking: false,
            scripts: ['hamburger.js']
        }
    },
    {
        name: 'newsletter-service',
        template: 'pages/newsletter-service.ejs',
        output: 'newsletter-service.html',
        data: {
            title: 'Done-for-You Newsletter Service for Busy Teams',
            description: 'Potions is a done-for-you newsletter service and platform in one for busy founders and marketers, all at a fraction of the cost of an agency.',
            keywords: 'Newsletter, Newsletters, Email, Email Marketing, Marketing, Business',
            author: 'Evan Kozliner',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'https://embed.typeform.com/next/embed.js']
        }
    },
    {
        name: 'newsletter-platform',
        template: 'pages/newsletter-platform.ejs',
        output: 'newsletter-platform.html',
        data: {
            title: 'The Newsletter Platform That Does the Work For You | Potions',
            description: 'Potions is your newsletter platform, email consultant, and content team in one. Send newsletters your audience wants to read without the hassle.',
            keywords: 'Newsletter, Newsletters, Email, Email Marketing, Platform, Newsletter Platform, Content Creation',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js']
        }
    },
    {
        name: 'newsletter-service-for-agencies',
        template: 'pages/newsletter-service-for-agencies.ejs',
        output: 'newsletter-service-for-agencies.html',
        data: {
            title: 'Done-for-You Newsletter Service for Agencies | Potions',
            description: 'We write, design, and send newsletters for agencies that nurture leads into clients without draining your team\'s time',
            keywords: 'Agency Newsletter, Marketing Agency Newsletter, Done-for-You Newsletter, Agency Email Marketing, Newsletter Service for Agencies',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js']
        }
    }
];

// Function to build a single page
async function buildPage(pageConfig) {
    console.log(`Building ${pageConfig.name}...`);
    
    try {
        // Load the page content template
        const pageTemplatePath = path.join(templatesDir, pageConfig.template);
        const pageContent = await ejs.renderFile(pageTemplatePath, pageConfig.data);
        
        // Render the full layout with the page content
        const layoutPath = path.join(templatesDir, 'layout.ejs');
        const templateData = {
            ...pageConfig.data,
            body: pageContent
        };
        
        const html = await ejs.renderFile(layoutPath, templateData);
        
        // Write the output file
        const outputPath = path.join(outputDir, pageConfig.output);
        
        // Ensure directory exists
        const outputDirPath = path.dirname(outputPath);
        if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, html);
        
        console.log(`✓ Built ${pageConfig.output}`);
    } catch (error) {
        console.error(`✗ Error building ${pageConfig.name}:`, error.message);
        throw error;
    }
}

// Main build function
async function buildSite() {
    console.log('Building main site pages...');
    
    try {
        // Build all pages
        for (const pageConfig of pages) {
            await buildPage(pageConfig);
        }
        
        console.log(`\nBuild complete! Generated ${pages.length} pages.`);
        console.log('Generated files:');
        pages.forEach(page => console.log(`  - ${page.output}`));
        
    } catch (error) {
        console.error('Build failed:', error.message);
        process.exit(1);
    }
}

// Run the build
buildSite();
