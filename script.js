document.addEventListener('DOMContentLoaded', () => {
    
    // 1. STATE
    let visibleCount = 6;
    let currentGroup = [];
    let currentIndex = 0;

    // 2. SELECTORS
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const projectLinks = document.querySelectorAll('.project-card-link');
    // We select only the category filters, excluding the Load More button
    const categoryBtns = document.querySelectorAll('.filter-btn:not(#loadMoreBtn)');
    const lightbox = document.getElementById('videoLightbox');
    const videoPlayer = document.getElementById('videoPlayer');
    const indicatorContainer = document.getElementById('videoIndicators');

    // 3. THE REFRESH FUNCTION
    function refreshView() {
        // Find which category is actually selected
        const activeBtn = document.querySelector('.filter-btn.active:not(#loadMoreBtn)') || categoryBtns[0];
        const currentFilter = activeBtn.getAttribute('data-filter');
        
        let matchCount = 0;
        let totalMatches = 0;

        projectLinks.forEach((link) => {
            const isSupplementary = link.getAttribute('data-gallery-role') === 'supplementary';
            const matchesCategory = (currentFilter === 'all' || link.classList.contains(currentFilter));

            if (!isSupplementary && matchesCategory) {
                totalMatches++;
                if (matchCount < visibleCount) {
                    link.style.setProperty('display', 'block', 'important');
                    link.style.opacity = '1';
                    matchCount++;
                } else {
                    link.style.setProperty('display', 'none', 'important');
                }
            } else {
                link.style.setProperty('display', 'none', 'important');
            }
        });

        // Toggle Load More Button Visibility
        if (loadMoreBtn) {
            loadMoreBtn.style.display = (totalMatches > visibleCount) ? 'inline-block' : 'none';
        }
    }

    // 4. LOAD MORE LOGIC (Stand-alone)
    if (loadMoreBtn) {
        loadMoreBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            visibleCount += 6; 
            refreshView();
            loadMoreBtn.blur();
        };
    }

    // 5. FILTER LOGIC
    categoryBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            visibleCount = 6; // Reset count when changing categories
            refreshView();
        };
    });

    // 6. LIGHTBOX & GALLERY
    function updateLightbox() {
        if (!videoPlayer || currentGroup.length === 0) return;
        const videoURL = currentGroup[currentIndex].getAttribute('data-video');
        const sep = videoURL.includes('?') ? '&' : '?';
        videoPlayer.src = `${videoURL}${sep}autoplay=1&rel=0&modestbranding=1`;

        const next = document.getElementById('nextVid');
        const prev = document.getElementById('prevVid');
        const showArrows = currentGroup.length > 1;
        if (next) next.style.display = showArrows ? 'block' : 'none';
        if (prev) prev.style.display = showArrows ? 'block' : 'none';

        if (indicatorContainer) {
            indicatorContainer.innerHTML = '';
            if (showArrows) {
                currentGroup.forEach((_, i) => {
                    const dot = document.createElement('div');
                    dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
                    dot.onclick = (ev) => { ev.stopPropagation(); currentIndex = i; updateLightbox(); };
                    indicatorContainer.appendChild(dot);
                });
            }
        }
    }

    projectLinks.forEach(link => {
        link.onclick = function(e) {
            const videoURL = this.getAttribute('data-video');
            if (!videoURL || videoURL === "#") return;
            e.preventDefault();

            const projectName = this.getAttribute('data-project');
            if (projectName) {
                currentGroup = Array.from(projectLinks).filter(item => item.getAttribute('data-project') === projectName);
            } else {
                currentGroup = [this];
            }
            currentIndex = currentGroup.indexOf(this);
            if (currentIndex === -1) currentIndex = 0;

            lightbox.style.display = 'block';
            updateLightbox();
        };
    });

    // 7. CLOSE LIGHTBOX
    function closeLightbox() {
        lightbox.style.display = 'none';
        videoPlayer.src = '';
    }

    const closeBtn = document.querySelector('.close-lightbox');
    if (closeBtn) closeBtn.onclick = closeLightbox;

    lightbox.onclick = function(e) {
        if (e.target === lightbox) closeLightbox();
    };

    // 8. KEYBOARD NAVIGATION
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display !== 'block') return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % currentGroup.length;
            updateLightbox();
        }
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
            updateLightbox();
        }
    });

    // 9. PREV / NEXT BUTTONS
    const nextBtn = document.getElementById('nextVid');
    const prevBtn = document.getElementById('prevVid');
    if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); currentIndex = (currentIndex + 1) % currentGroup.length; updateLightbox(); };
    if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length; updateLightbox(); };

    // 10. EMAIL COPY
    const emailLink = document.getElementById('emailLink');
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = 'ebkane793@gmail.com';
            const value = this.querySelector('.value');
            const originalText = value ? value.textContent : '';

            function showCopied() {
                if (value) {
                    value.style.minWidth = value.offsetWidth + 'px';
                    value.textContent = 'COPIED!';
                    setTimeout(() => {
                        value.textContent = originalText;
                        value.style.minWidth = '';
                    }, 2000);
                }
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(showCopied).catch(() => {
                    window.location.href = 'mailto:' + email;
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = email;
                ta.style.cssText = 'position:fixed;opacity:0;';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); showCopied(); }
                catch { window.location.href = 'mailto:' + email; }
                document.body.removeChild(ta);
            }
        });
    }

    // 11. ACTIVE NAV ON SCROLL
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let current = 'top';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - window.innerHeight / 2) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // 12. INITIAL RENDER
    refreshView();

    // 13. HOVER IMAGE SHUFFLE
    document.querySelectorAll('.project-image[data-hover-images]').forEach(img => {
        const images = img.getAttribute('data-hover-images').split(',');
        if (images.length <= 1) return;
        const FADE = 200;
        const HOLD = 600;
        let interval = null;
        let idx = 0;
        img.style.transition = `opacity ${FADE}ms ease, filter 0.6s ease, transform 0.6s ease`;
        const card = img.closest('.project-card-link');
        card.addEventListener('mouseenter', () => {
            idx = 0;
            interval = setInterval(() => {
                img.style.opacity = '0';
                setTimeout(() => {
                    idx = (idx + 1) % images.length;
                    img.src = images[idx];
                    img.style.opacity = '1';
                }, FADE);
            }, HOLD + FADE * 2);
        });
        card.addEventListener('mouseleave', () => {
            clearInterval(interval);
            interval = null;
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = images[0];
                img.style.opacity = '1';
            }, FADE);
        });
    });
});
