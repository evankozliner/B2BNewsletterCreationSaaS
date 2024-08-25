document.addEventListener("DOMContentLoaded", function() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.right-group');

    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
});