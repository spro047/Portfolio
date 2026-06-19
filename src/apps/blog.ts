import { createWindow } from '../window-manager';

export const blogPosts = [
    {
        title: 'Building a Retro OS-Style Portfolio with TypeScript',
        date: 'June 2026',
        excerpt: 'How I built an interactive macOS-themed portfolio with a boot sequence, window manager, dock, and retro CRT effects — all in vanilla TypeScript and CSS.',
        content: `
            <h2>Building a Retro OS-Style Portfolio</h2>
            <p>When I set out to rebuild my portfolio, I wanted something that stood out — not just another static page with cards and links. I decided to build it as a retro operating system, complete with a boot sequence, draggable windows, and a functional dock.</p>
            <h3>Tech Stack</h3>
            <p>The entire project is built with TypeScript, vanilla CSS, and Vite as the bundler. No React, no Vue — just pure DOM manipulation. This keeps the bundle tiny (~46KB gzipped) and gives full control over every pixel.</p>
            <h3>Key Challenges</h3>
            <p>The CRT monitor effect was the trickiest part. It uses layered CSS gradients for scanlines, radial gradients for screen curvature, and a subtle flicker animation. Getting the boot sequence to feel authentic while staying snappy took careful timing orchestration with async/await.</p>
            <p>The window manager supports dragging, resizing, minimize/maximize, and z-index stacking — all in about 100 lines of TypeScript.</p>
        `
    },
    {
        title: 'ADHD Detection with XGBoost and FLAML',
        date: 'May 2025',
        excerpt: 'Published research on a dual-model framework for ADHD prediction using multimodal data fusion, achieving AUC scores of 0.84.',
        content: `
            <h2>ADHD Detection with XGBoost and FLAML</h2>
            <p>This paper presents a machine learning architecture that predicts ADHD and biological sex from multimodal inputs. The framework uses XGBoost for tabular features and FLAML for automated model selection.</p>
            <p>The model achieved an AUC of 0.84 for ADHD prediction and 0.77 for gender classification — competitive results that led to publication in MDPI's Computer Sciences & Mathematics Forum.</p>
            <p><strong>Key Findings:</strong> Combining imaging-derived features with automated model selection yields more robust ADHD detection than single-model approaches.</p>
        `
    },
    {
        title: 'Alzheimer\'s Detection Using Deep Learning',
        date: 'April 2025',
        excerpt: 'Comparative analysis of CNN architectures for multi-class Alzheimer\'s classification using brain MRI scans.',
        content: `
            <h2>Alzheimer's Detection Using Deep Learning</h2>
            <p>This study compares six deep learning architectures — CNN, VGG16, ResNet50, DenseNet201, InceptionV3, and EfficientNet-B1 — for stage-wise Alzheimer's disease classification.</p>
            <p>The key insight: carefully tuned 2D CNN architectures are sufficient for accurate multi-class classification from MRI scans, challenging the assumption that deeper models always perform better.</p>
        `
    },
    {
        title: 'Knowledge Graph-Based RAG for Generative AI',
        date: 'March 2025',
        excerpt: 'Building a Knowledge Graph-based Retrieval Augmented Generation (RAG) assistant for improved contextual AI responses.',
        content: `
            <h2>Knowledge Graph-Based RAG Assistant</h2>
            <p>Retrieval Augmented Generation (RAG) is powerful, but most implementations use flat vector search. I built a system that integrates Knowledge Graphs to provide structured context, significantly improving the relevance of AI-generated responses.</p>
            <p>The KG acts as a semantic backbone, ensuring the model retrieves conceptually related information even when exact keywords don't match.</p>
        `
    }
];

export function openBlog() {
    let html = '<div class="blog-list">';
    blogPosts.forEach((post, i) => {
        html += `
            <div class="blog-post" data-index="${i}">
                <h3>${post.title}</h3>
                <div class="blog-meta">${post.date}</div>
                <div class="blog-excerpt">${post.excerpt}</div>
            </div>
        `;
    });
    html += '</div>';

    createWindow('Blog / Articles', html, 520, 450);

    setTimeout(() => {
        document.querySelectorAll('.blog-post').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt((el as HTMLElement).getAttribute('data-index') || '0');
                const post = blogPosts[idx];
                if (post) {
                    createWindow(post.title, `<div class="content-page">${post.content}</div>`, 550, 500);
                }
            });
        });
    }, 100);
}
