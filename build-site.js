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
            scripts: ['faq.js', 'hamburger.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/',
            navTargetPage: '' // Marketing page: nav stays within this page
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
            scripts: ['hamburger.js'],
            canonicalUrl: 'https://withpotions.com/samples.html',
            navTargetPage: '/' // Normal page: nav points to homepage
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
            tracking: true,
            scripts: ['hamburger.js'],
            canonicalUrl: 'https://withpotions.com/blog/',
            navTargetPage: '/' // Normal page: nav points to homepage
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
            scripts: ['faq.js', 'hamburger.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-service.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-platform',
        template: 'pages/newsletter-platform.ejs',
        output: 'newsletter-platform.html',
        data: {
            title: 'The Newsletter Platform That Does the Work For You | Potions',
            description: 'Potions is the only newsletter platform with done-for-you content, email delivery, and list management.',
            keywords: 'Newsletter, Newsletters, Email, Email Marketing, Platform, Newsletter Platform, Content Creation',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-platform.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-writing-service',
        template: 'pages/newsletter-writing-service.ejs',
        output: 'newsletter-writing-service.html',
        data: {
            title: 'On-Brand Newsletter Writing Service Powered by AI | Potions',
            description: 'Potions is your dedicated newsletter writer and platform in one streamlined service, for a fraction of the cost of both.',
            keywords: 'Newsletter, Newsletter Writing, Email Writing, Content Writing, Done-for-You, Newsletter Service',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-writing-service.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-service-for-agencies',
        template: 'pages/newsletter-service-for-agencies.ejs',
        output: 'newsletter-service-for-agencies.html',
        data: {
            title: 'Done-for-You Newsletter Service for Agencies',
            description: 'We write, design, and send newsletters for agencies that nurture leads into clients without draining your team\'s time',
            keywords: 'Newsletter, Agency Newsletter, Email Marketing, Marketing Agency, Done-for-You Newsletter',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-service-for-agencies.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-service-for-consultants',
        template: 'pages/newsletter-service-for-consultants.ejs',
        output: 'newsletter-service-for-consultants.html',
        data: {
            title: 'Done-for-You Newsletter Service for Consultants',
            description: 'We write, design, and send newsletters for consultants that nurture leads into clients with just 15 minutes of your time per week.',
            keywords: 'Newsletter, Consultant Newsletter, Email Marketing, Consultancy, Done-for-You Newsletter',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-service-for-consultants.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-service-for-b2b-saas',
        template: 'pages/newsletter-service-for-b2b-saas.ejs',
        output: 'newsletter-service-for-b2b-saas.html',
        data: {
            title: 'Done-for-You Newsletter Service for B2B SaaS Companies',
            description: 'We build, design, write, and manage newsletters for B2B SaaS companies to nurture leads and support sales.',
            keywords: 'Newsletter, B2B SaaS Newsletter, Email Marketing, SaaS, Done-for-You Newsletter',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-service-for-b2b-saas.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-service-for-small-business',
        template: 'pages/newsletter-service-for-small-business.ejs',
        output: 'newsletter-service-for-small-business.html',
        data: {
            title: 'Done-for-You Newsletter Service for Small Businesses',
            description: 'We\'re the newsletter service for small businesses that want completely done-for-you newsletters that turn past leads into repeat customers.',
            keywords: 'Newsletter, Small Business Newsletter, Email Marketing, Small Business, Done-for-You Newsletter',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-service-for-small-business.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'newsletter-service-for-lawyers',
        template: 'pages/newsletter-service-for-lawyers.ejs',
        output: 'newsletter-service-for-lawyers.html',
        data: {
            title: 'Done-for-You Newsletter Service for Lawyers',
            description: 'We\'re the done-for-you newsletter service for lawyers who want to turn leads into cases without hiring writers or managing platforms.',
            keywords: 'Newsletter, Lawyer Newsletter, Email Marketing, Legal, Done-for-You Newsletter',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/newsletter-service-for-lawyers.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'b2b-newsletter-service',
        template: 'pages/b2b-newsletter-service.ejs',
        output: 'b2b-newsletter-service.html',
        data: {
            title: 'Done-for-You B2B Newsletter Service for Busy Teams',
            description: 'Get a done-for-you B2B newsletter service and platform that nurtures your old leads into sales conversations.',
            keywords: 'B2B Newsletter, B2B Email Marketing, Lead Nurturing, Sales Enablement, Done-for-You Newsletter',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js', 'billing.js', 'https://embed.typeform.com/next/embed.js'],
            canonicalUrl: 'https://withpotions.com/b2b-newsletter-service.html',
            navTargetPage: '' // Marketing page: nav stays within this page
        }
    },
    {
        name: 'book',
        template: 'pages/book.ejs',
        output: 'book.html',
        data: {
            title: 'Book a Call with Potions',
            description: 'Schedule your onboarding call with Potions to get started with your newsletter.',
            keywords: 'Book Call, Schedule, Onboarding, Newsletter Consultation',
            author: 'Potions',
            baseUrl: '',
            styleSheet: 'style.css',
            additionalCSS: [],
            showBlogLink: false,
            tracking: true,
            scripts: ['faq.js', 'hamburger.js'],
            canonicalUrl: 'https://withpotions.com/book.html',
            navTargetPage: '', // Marketing page: nav stays within this page
            hideHeaderFooter: true
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
