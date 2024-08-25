// TO-DO:

// Hamburger menu for mobile
const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll(".mlinks");
let tg = true;
function toggleNav() {
    if (tg) {
        tg = false;
        nav.style.height = "80px";
        for (let i = 0; i < navLinks.length; i++) {setTimeout(() => {navLinks[i].style.visibility = "visible";}, 100);}
        hamburger.innerText = "close";
    } else {
        tg = true;
        nav.style.height = "0";
        for (let i = 0; i < navLinks.length; i++) {setTimeout(() => {navLinks[i].style.visibility = "hidden";}, 150);}
        hamburger.innerText = "menu";
    }
};
hamburger.addEventListener("click", toggleNav);
// FAQ dropdowns
