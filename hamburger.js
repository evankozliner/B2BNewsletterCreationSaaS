    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });

    // Hide/show navbar on scroll
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    let scrollThreshold = 100; // Only activate after scrolling 100px

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Only apply hide/show behavior after scrolling past threshold
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down - hide navbar
                header.classList.add('nav-hidden');
            } else {
                // Scrolling up - show navbar
                header.classList.remove('nav-hidden');
            }
        } else {
            // At top of page - always show navbar
            header.classList.remove('nav-hidden');
        }

        lastScrollTop = scrollTop;
    });