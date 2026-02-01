// (Preloader removed) Show content immediately without overlay.

// ===========================
// THEME TOGGLE
// ===========================
const themeToggleInput = document.getElementById('themeToggle');

const applyTheme = (theme) => {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleInput) {
        themeToggleInput.checked = isLight;
    }
};

const storedTheme = localStorage.getItem('portfolioTheme');
if (storedTheme) {
    applyTheme(storedTheme);
} else {
    applyTheme('dark');
}

themeToggleInput?.addEventListener('change', (event) => {
    const theme = event.target.checked ? 'light' : 'dark';
    applyTheme(theme);
    localStorage.setItem('portfolioTheme', theme);
});

// ===========================
// NAVIGATION
// ===========================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
    });
});

// Active link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    // If in portfolio fullscreen mode, always highlight Portfolio
    if (document.body.classList.contains('portfolio-fullscreen')) {
        current = 'portfolio';
    } else {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
    }

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===========================
// SMOOTH SCROLL
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// PARALLAX EFFECT
// ===========================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    parallaxLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.05;
        layer.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===========================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
document.querySelectorAll('.service-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});
document.querySelectorAll('.category-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});
document.querySelectorAll('.spotlight-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ===========================
// SCROLL RESTORATION UTILITIES
// ===========================
const scrollHistory = [];
const saveScrollPosition = () => {
    scrollHistory.push(window.scrollY);
};
const restoreScrollPosition = (smooth = false) => {
    const y = scrollHistory.pop();
    if (typeof y !== 'number') return;

    const html = document.documentElement;
    const body = document.body;

    // Temporarily force instant scroll to avoid CSS html{scroll-behavior:smooth}
    const prevHtmlBehavior = html.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;
    html.style.scrollBehavior = smooth ? 'smooth' : 'auto';
    body.style.scrollBehavior = smooth ? 'smooth' : 'auto';

    // Ensure DOM is painted before restoring position (2 rAFs for safety)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Use both APIs for cross-browser reliability
            window.scrollTo(0, y);
            html.scrollTop = y;
            body.scrollTop = y;

            // Cleanup override on next frame to restore normal behavior
            requestAnimationFrame(() => {
                html.style.scrollBehavior = prevHtmlBehavior;
                body.style.scrollBehavior = prevBodyBehavior;
            });
        });
    });
};

// ===========================
// SPOTLIGHT OVERLAYS (Education, Certificates, Experience, Team)
// ===========================
const spotlightInteractiveCards = document.querySelectorAll('.spotlight-card[data-spotlight-target]');
const spotlightDetails = document.querySelectorAll('.spotlight-detail');
const spotlightBackButtons = document.querySelectorAll('.spotlight-back');

let activeSpotlightSectionId = null;

spotlightDetails.forEach(detail => {
    detail.setAttribute('aria-hidden', 'true');
});

const closeSpotlightDetail = () => {
    spotlightDetails.forEach(detail => {
        detail.classList.remove('show');
        detail.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('spotlight-fullscreen');

    // Restore the exact scroll position where the user opened the spotlight
    restoreScrollPosition(true);

    activeSpotlightSectionId = null;
};

const openSpotlightDetail = (detailId) => {
    const detail = document.getElementById(detailId);
    if (!detail) return;

    spotlightDetails.forEach(item => {
        item.classList.remove('show');
        item.setAttribute('aria-hidden', 'true');
    });

    detail.classList.add('show');
    detail.setAttribute('aria-hidden', 'false');

    activeSpotlightSectionId = detail.getAttribute('data-spotlight-group') || null;

    document.body.classList.add('spotlight-fullscreen');
    document.body.classList.remove('portfolio-fullscreen');
    
    // Save current scroll position so we can return to it on close
    saveScrollPosition();
};

const teamCardCTAButtons = document.querySelectorAll('.team-card-cta-btn');

teamCardCTAButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const explicitTarget = button.getAttribute('data-target');
        const fallbackTarget = button.closest('.spotlight-card')?.getAttribute('data-spotlight-target');
        const targetId = explicitTarget || fallbackTarget;

        if (targetId) {
            openSpotlightDetail(targetId);
        }
    });
});

spotlightInteractiveCards.forEach(card => {
    card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-spotlight-target');
        if (targetId) {
            openSpotlightDetail(targetId);
        }
    });
});

spotlightBackButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeSpotlightDetail();
    });
});

spotlightDetails.forEach(detail => {
    detail.addEventListener('click', (event) => {
        if (event.target === detail) {
            closeSpotlightDetail();
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('spotlight-fullscreen')) {
        closeSpotlightDetail();
    }
});

// ===========================
// PORTFOLIO CATEGORY NAVIGATION
// ===========================
const categoryCards = document.querySelectorAll('.category-card');
const categoryDetails = document.querySelectorAll('.category-details');
const categoriesGrid = document.getElementById('categoriesGrid');
const portfolioHeader = document.querySelector('#portfolio .section-header');
const backButtons = document.querySelectorAll('.back-button');

// Get all page sections except portfolio
const allSections = document.querySelectorAll('section:not(#portfolio)');
const footer = document.querySelector('.footer');

// Declare app/software navigation elements at the top so they're available for back button handler
const appCards = document.querySelectorAll('.app-card');
const appDetailViews = document.querySelectorAll('.app-detail-view');
const appGrid = document.getElementById('appGrid');
const backToAppsButtons = document.querySelectorAll('.back-to-apps-button');

const softwareCards = document.querySelectorAll('.software-card');
const softwareDetailViews = document.querySelectorAll('.software-detail-view');
const softwareGrid = document.getElementById('softwareGrid');
const backToSoftwareButtons = document.querySelectorAll('.back-to-software-button');

categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        const detailSection = document.getElementById(category);
        
        if (detailSection) {
            // Save current scroll position before switching views
            saveScrollPosition();
            
            // Add fade-out class to categories grid for smooth transition
            categoriesGrid.classList.add('fade-out');
            
            // Wait for fade-out animation before switching
            setTimeout(() => {
                // Hide ALL other sections
                allSections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // Hide footer
                if (footer) {
                    footer.style.display = 'none';
                }
                
                // Hide portfolio section header
                if (portfolioHeader) {
                    portfolioHeader.style.display = 'none';
                }
                
                // Hide categories grid
                categoriesGrid.style.display = 'none';
                categoriesGrid.classList.remove('fade-out');
                
                // Hide all detail sections
                categoryDetails.forEach(detail => {
                    detail.style.display = 'none';
                });
                
                // Show selected detail section
                detailSection.style.display = 'block';
                
                // Add class to body for full-screen mode
                document.body.classList.add('portfolio-fullscreen');
                
                // Scroll to top of the detail view instantly
                requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                });
                
                // Fade in the detail section
                detailSection.classList.add('fade-in-active');
                
                // Initialize slideshows for this category
                initializeSlideshows(detailSection);
            }, 300); // Match the CSS transition duration
        }
    });
});

backButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Check if we're coming from an app/software detail view (nested navigation)
        const isFromAppDetail = appDetailViews && Array.from(appDetailViews).some(view => view.style.display !== 'none');
        const isFromSoftwareDetail = softwareDetailViews && Array.from(softwareDetailViews).some(view => view.style.display !== 'none');
        
        // If coming from a nested detail view, discard the intermediate scroll position
        if (isFromAppDetail || isFromSoftwareDetail) {
            scrollHistory.pop(); // Discard the scroll position saved when clicking the card
        }
        
        // Add fade-out to current detail section
        const activeDetail = document.querySelector('.category-details[style*="display: block"]');
        if (activeDetail) {
            activeDetail.classList.add('fade-out');
        }
        
        // Wait for fade-out animation
        setTimeout(() => {
            // Reset all app/software detail views and grids to default state
            appDetailViews.forEach(view => {
                view.style.display = 'none';
            });
            softwareDetailViews.forEach(view => {
                view.style.display = 'none';
            });
            if (appGrid) {
                appGrid.style.display = 'grid';
            }
            if (softwareGrid) {
                softwareGrid.style.display = 'grid';
            }
            
            // Hide all detail sections
            categoryDetails.forEach(detail => {
                detail.style.display = 'none';
                detail.classList.remove('fade-out', 'fade-in-active');
            });
            
            // Show ALL other sections again - clear inline styles to restore defaults
            allSections.forEach(section => {
                section.style.display = '';
            });
            
            // Show footer
            if (footer) {
                footer.style.display = '';
            }
            
            // Show portfolio section header
            if (portfolioHeader) {
                portfolioHeader.style.display = '';
            }
            
            // Show categories grid
            categoriesGrid.style.display = '';
            
            // Remove full-screen class
            document.body.classList.remove('portfolio-fullscreen');
            
            // Restore previous scroll position instantly (no smooth scrolling)
            restoreScrollPosition(false);
            
            // Fade in the categories grid
            categoriesGrid.classList.add('fade-in-active');
            setTimeout(() => {
                categoriesGrid.classList.remove('fade-in-active');
            }, 300);
        }, 300); // Match the CSS transition duration
    });
});

// ===========================
// APP CARDS NAVIGATION (within App Development)
// ===========================
appCards.forEach(card => {
    card.addEventListener('click', () => {
        const appId = card.getAttribute('data-app');
        const appDetailView = document.getElementById(appId);
        
        if (appDetailView) {
            saveScrollPosition();
            // Hide app grid
            appGrid.style.display = 'none';
            
            // Hide all app detail views
            appDetailViews.forEach(view => {
                view.style.display = 'none';
            });
            
            // Show selected app detail view
            appDetailView.style.display = 'block';
            
            // Scroll to top of the detail view
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });
            
            // Initialize slideshows for this app
            initializeSlideshows(appDetailView);
        }
    });
});

backToAppsButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Hide all app detail views
        appDetailViews.forEach(view => {
            view.style.display = 'none';
        });
        
        // Show app grid
        appGrid.style.display = 'grid';
        // Restore previous scroll position instantly
        restoreScrollPosition(false);
    });
});

// ===========================
// SOFTWARE CARDS NAVIGATION (within Software Development)
// ===========================
softwareCards.forEach(card => {
    card.addEventListener('click', () => {
        const softwareId = card.getAttribute('data-software');
        const youtubeUrl = card.getAttribute('data-youtube');
        
        // If it's a YouTube card, open in new tab
        if (youtubeUrl) {
            window.open(youtubeUrl, '_blank');
            return;
        }
        
        // Otherwise, show detail view
        const softwareDetailView = document.getElementById(softwareId);
        
        if (softwareDetailView) {
            saveScrollPosition();
            // Hide software grid
            softwareGrid.style.display = 'none';
            
            // Hide all software detail views
            softwareDetailViews.forEach(view => {
                view.style.display = 'none';
            });
            
            // Show selected software detail view
            softwareDetailView.style.display = 'block';
            
            // Keep current scroll position
            
            // Initialize slideshows for this software
            initializeSlideshows(softwareDetailView);
        }
    });
});

backToSoftwareButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Hide all software detail views
        softwareDetailViews.forEach(view => {
            view.style.display = 'none';
        });
        
        // Show software grid
        softwareGrid.style.display = 'grid';
        // Restore previous scroll position instantly
        restoreScrollPosition(false);
    });
});

// ===========================
// SLIDESHOW FUNCTIONALITY
// ===========================
const slideshows = new Map();

function initializeSlideshows(container) {
    const slideshowContainers = container.querySelectorAll('.slideshow-container');
    
    slideshowContainers.forEach((slideshowContainer, index) => {
        const slides = slideshowContainer.querySelectorAll('.slide');
        const prevBtn = slideshowContainer.querySelector('.prev');
        const nextBtn = slideshowContainer.querySelector('.next');
        
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        
        // Create unique ID for this slideshow
        const slideshowId = `slideshow-${Date.now()}-${index}`;
        
        // Show first slide
        slides[0].classList.add('active');
        
        function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        }
        
        function nextSlide() {
            showSlide(currentSlide + 1);
        }
        
        function prevSlide() {
            showSlide(currentSlide - 1);
        }
        
        // Event listeners
        prevBtn?.addEventListener('click', prevSlide);
        nextBtn?.addEventListener('click', nextSlide);
        
        // Auto play
        const autoPlay = setInterval(nextSlide, 3000);
        
        // Store slideshow data
        slideshows.set(slideshowId, {
            slides,
            currentSlide,
            autoPlay
        });
        
        // Pause on hover
        slideshowContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlay);
        });
        
        slideshowContainer.addEventListener('mouseleave', () => {
            const newAutoPlay = setInterval(nextSlide, 3000);
            slideshows.set(slideshowId, {
                ...slideshows.get(slideshowId),
                autoPlay: newAutoPlay
            });
        });
    });
}

// ===========================
// ENHANCED LIGHTBOX SYSTEM
// ===========================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxZoomIn = document.getElementById('lightbox-zoom-in');
const lightboxZoomOut = document.getElementById('lightbox-zoom-out');
const lightboxZoomReset = document.getElementById('lightbox-zoom-reset');
const lightboxDownload = document.getElementById('lightbox-download');
const lightboxWrapper = document.querySelector('.lightbox-image-wrapper');

let currentImageIndex = 0;
let currentGallery = [];
let zoomLevel = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

const ORIENTATION_CLASSES = ['landscape', 'portrait', 'square'];

const applyOrientationClass = () => {
    if (!lightboxWrapper || !lightboxImg) return;
    const { naturalWidth: w, naturalHeight: h } = lightboxImg;
    if (!w || !h) return;
    lightboxWrapper.classList.remove(...ORIENTATION_CLASSES);
    if (Math.abs(w - h) / Math.max(w, h) < 0.12) {
        lightboxWrapper.classList.add('square');
    } else if (w > h) {
        lightboxWrapper.classList.add('landscape');
    } else {
        lightboxWrapper.classList.add('portrait');
    }
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.2;

const applyZoom = () => {
    const maxPan = 200 + (zoomLevel - 1) * 220;
    if (zoomLevel > 1) {
        translateX = Math.max(-maxPan, Math.min(maxPan, translateX));
        translateY = Math.max(-maxPan, Math.min(maxPan, translateY));
    } else {
        translateX = 0;
        translateY = 0;
    }

    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;

    if (zoomLevel > 1) {
        lightboxImg.classList.add('zoomed');
    } else {
        lightboxImg.classList.remove('zoomed');
    }

    lightboxImg.style.cursor = zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in';
};

const zoomIn = () => {
    if (zoomLevel < ZOOM_MAX) {
        zoomLevel = Math.min(ZOOM_MAX, +(zoomLevel + ZOOM_STEP).toFixed(2));
        applyZoom();
    }
};

const zoomOut = () => {
    if (zoomLevel > ZOOM_MIN) {
        zoomLevel = Math.max(ZOOM_MIN, +(zoomLevel - ZOOM_STEP).toFixed(2));
        applyZoom();
    }
};

const resetZoom = () => {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    applyZoom();
    lightboxImg.classList.remove('zoomed');
};

const collectGalleryImages = (clickedElement) => {
    const gallery = [];
    
    // Try to find parent gallery container (expanded to include all sections)
    const parentGallery = clickedElement.closest(
        '.app-screenshots-gallery, .logo-gallery, .feedback-gallery, .screenshot-item, .feedback-item, .logo-item, .graphics-grid, .graphic-card, .certificate-detail, .certificate-proof-card'
    );
    
    if (parentGallery) {
    const isGraphicCard = clickedElement.closest('.graphic-card');
    const isScreenshotItem = clickedElement.closest('.screenshot-item');
    const isLogoItem = clickedElement.closest('.logo-item');
    const isFeedbackItem = clickedElement.closest('.feedback-item');
    const isCertificateDetail = clickedElement.closest('.certificate-detail');
    const isCertificateProof = clickedElement.closest('.certificate-proof-card');
        
        let container = parentGallery;
        if (isGraphicCard) container = parentGallery.closest('.graphics-grid') || parentGallery;
        if (isScreenshotItem) container = parentGallery.closest('.app-screenshots-gallery') || parentGallery;
        if (isLogoItem) container = parentGallery.closest('.logo-gallery') || parentGallery;
        if (isFeedbackItem) container = parentGallery.closest('.feedback-gallery') || parentGallery;
    if (isCertificateProof || isCertificateDetail) container = parentGallery.closest('.certificate-detail') || parentGallery;
        
        // Get images from specific gallery type
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && !img.classList.contains('exclude-lightbox')) {
                gallery.push({
                    src: img.src,
                    alt: img.alt || '',
                    title: img.closest('.graphic-overlay')?.querySelector('h3')?.textContent || 
                           img.closest('[data-text]')?.getAttribute('data-text') || 
                           img.alt || ''
                });
            }
        });
    }
    
    return gallery;
};

// Open lightbox
const openLightbox = (imageSrc, imageAlt, imageTitle, galleryImages, index) => {
    currentGallery = galleryImages;
    currentImageIndex = index;
    
    lightboxWrapper?.classList.remove(...ORIENTATION_CLASSES);
    lightbox.classList.add('active');
    lightboxImg.src = imageSrc;
    lightboxImg.alt = imageAlt;
    if (lightboxImg.complete) {
        applyOrientationClass();
    }
    
    updateLightboxInfo();
    updateNavigationButtons();
    
    document.body.style.overflow = 'hidden';
    resetZoom();
};

// Close lightbox
const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    resetZoom();
    lightboxWrapper?.classList.remove(...ORIENTATION_CLASSES);
    currentGallery = [];
    currentImageIndex = 0;
};

// Navigate to specific image (smooth crossfade - no resize)
const showImage = (index, direction = 'next') => {
    if (currentGallery.length === 0) return;
    
    currentImageIndex = (index + currentGallery.length) % currentGallery.length;
    const image = currentGallery[currentImageIndex];
    
    // Smooth crossfade - only fade the image, don't touch wrapper classes during transition
    lightboxImg.style.opacity = '0';
    
    setTimeout(() => {
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        updateLightboxInfo();
        resetZoom();
        
        // Wait for image to load then fade in
        if (lightboxImg.complete) {
            lightboxImg.style.opacity = '1';
        } else {
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
            };
        }
    }, 200);
    
    updateNavigationButtons();
};

// Update counter and title
const updateLightboxInfo = () => {
    if (currentGallery.length > 0) {
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentGallery.length}`;
        lightboxTitle.textContent = currentGallery[currentImageIndex].title;
    }
};

// Update navigation button visibility
const updateNavigationButtons = () => {
    if (currentGallery.length <= 1) {
        lightboxPrev.classList.add('hidden');
        lightboxNext.classList.add('hidden');
    } else {
        lightboxPrev.classList.remove('hidden');
        lightboxNext.classList.remove('hidden');
    }
};

// Drag to pan when zoomed
lightboxImg.addEventListener('mousedown', (e) => {
    if (zoomLevel > 1) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyZoom();
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        lightboxImg.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
    }
});

// Download image
const downloadImage = () => {
    if (currentGallery.length > 0) {
        const link = document.createElement('a');
        link.href = lightboxImg.src;
        link.download = currentGallery[currentImageIndex].alt || `image-${currentImageIndex + 1}.jpg`;
        link.click();
    }
};

// Event Listeners
lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => showImage(currentImageIndex - 1, 'prev'));
lightboxNext?.addEventListener('click', () => showImage(currentImageIndex + 1, 'next'));
lightboxZoomIn?.addEventListener('click', zoomIn);
lightboxZoomOut?.addEventListener('click', zoomOut);
lightboxZoomReset?.addEventListener('click', resetZoom);
lightboxDownload?.addEventListener('click', downloadImage);
lightboxImg?.addEventListener('load', applyOrientationClass);

// Click outside to close
lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Global click handler for all gallery images
document.addEventListener('click', (e) => {
    const clickedImg = e.target.closest('img');
    if (!clickedImg || clickedImg.classList.contains('exclude-lightbox')) return;
    
    // Check if image is in a gallery container (expanded to include all sections)
    const isInGallery = clickedImg.closest(
        '.app-screenshots-gallery, .logo-gallery, .feedback-gallery, .screenshot-item, .feedback-item, .logo-item, .graphics-grid, .graphic-card, .certificate-detail, .certificate-proof-card'
    );
    
    if (isInGallery) {
        e.preventDefault();
        
        const gallery = collectGalleryImages(clickedImg);
        const index = gallery.findIndex(img => img.src === clickedImg.src);
        
        if (index !== -1) {
            openLightbox(
                clickedImg.src,
                clickedImg.alt,
                clickedImg.closest('[data-text]')?.getAttribute('data-text') || clickedImg.alt || '',
                gallery,
                index
            );
        }
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            showImage(currentImageIndex - 1, 'prev');
            break;
        case 'ArrowRight':
            showImage(currentImageIndex + 1, 'next');
            break;
        case '+':
        case '=':
            zoomIn();
            break;
        case '-':
        case '_':
            zoomOut();
            break;
        case '0':
            resetZoom();
            break;
    }
});

// Touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

lightbox?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - next image
        showImage(currentImageIndex + 1, 'next');
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - previous image
        showImage(currentImageIndex - 1, 'prev');
    }
};

// ===========================
// CONTACT FORM HANDLER (EmailJS)
// ===========================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Send email using EmailJS
        emailjs.sendForm('service_dv7wlhx', 'template_au2wihm', this)
            .then(() => {
                // Success
                submitButton.textContent = 'Message Sent! ✓';
                submitButton.style.background = 'linear-gradient(135deg, #00C853, #00E676)';
                
                // Show success alert
                alert('Thank you! Your message has been sent successfully.');
                
                // Reset form
                contactForm.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 3000);
            }, (error) => {
                // Error
                console.error('EmailJS Error:', error);
                submitButton.textContent = 'Failed to Send ✗';
                submitButton.style.background = 'linear-gradient(135deg, #D32F2F, #F44336)';
                
                alert('Oops! Something went wrong. Please try again or contact me directly at roastingwzain@gmail.com');
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 3000);
            });
    });
}
