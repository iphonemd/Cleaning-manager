const openNavBarBtn = document.getElementById("open-nav-bar-button");
const closeNavBarBtn = document.querySelector(".close-sidebar-button");
const closeNavBarOverlay = document.getElementById("overlay");

const navbar = document.getElementById("navbar");

function openSideBar() {
navbar.classList.add("show");
}

function closeSideBar() {
navbar.classList.remove("show");
}

openNavBarBtn.addEventListener("click", () => openSideBar());
closeNavBarBtn.addEventListener("click", () => closeSideBar());
closeNavBarOverlay.addEventListener("click", () => closeSideBar());