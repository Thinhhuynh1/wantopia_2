const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const siteHeader = document.querySelector(".site-header");
const navLinks = Array.from(document.querySelectorAll(".nav-panel a, .nav-cta, .brand"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const yearTargets = Array.from(document.querySelectorAll("[data-year]"));
const messageForm = document.querySelector("#message-form");
const formStatus = document.querySelector("#form-status");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const enterClassMap = {
  left: "enter-from-left",
  right: "enter-from-right",
  top: "enter-from-top",
  bottom: "enter-from-bottom",
  scale: "enter-from-scale",
};

const leaveClassMap = {
  left: "leave-to-left",
  right: "leave-to-right",
  top: "leave-to-top",
  bottom: "leave-to-bottom",
  scale: "leave-to-scale",
};

let isLeaving = false;
let previousScroll = window.pageYOffset;

function closeMenu() {
  if (!menuToggle || !navPanel) {
    return;
  }

  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  navPanel.classList.remove("is-open");
  body.classList.remove("menu-open");
}

function setMenuState(isOpen) {
  if (!menuToggle || !navPanel) {
    return;
  }

  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  navPanel.classList.toggle("is-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
}

function applyEnterTransition() {
  const storedDirection = sessionStorage.getItem("page-transition-direction") || "scale";
  const enterClass = enterClassMap[storedDirection] || enterClassMap.scale;

  body.classList.add(enterClass);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      body.classList.remove("preload");
      body.classList.remove(enterClass);
    });
  });

  sessionStorage.removeItem("page-transition-direction");
}

function handlePageTransition(link, event) {
  if (event.defaultPrevented || isLeaving || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const href = link.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return;
  }

  const targetUrl = new URL(link.href, window.location.href);

  if (targetUrl.origin !== window.location.origin) {
    return;
  }

  if (targetUrl.pathname === window.location.pathname && targetUrl.hash === window.location.hash) {
    closeMenu();
    return;
  }

  event.preventDefault();

  const direction = link.dataset.transition || "scale";
  const leaveClass = leaveClassMap[direction] || leaveClassMap.scale;

  sessionStorage.setItem("page-transition-direction", direction);
  isLeaving = true;
  closeMenu();
  body.classList.add("is-leaving", leaveClass);

  window.setTimeout(() => {
    window.location.href = targetUrl.href;
  }, reduceMotion ? 0 : 380);
}

if (menuToggle && navPanel) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Node &&
      menuToggle.getAttribute("aria-expanded") === "true" &&
      !menuToggle.contains(target) &&
      !navPanel.contains(target)
    ) {
      closeMenu();
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => handlePageTransition(link, event));
});

if (siteHeader) {
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (window.innerWidth > 980 && currentScroll > 120 && currentScroll > previousScroll) {
      siteHeader.classList.add("site-header--hidden");
    } else {
      siteHeader.classList.remove("site-header--hidden");
    }

    previousScroll = currentScroll;
  });
}

yearTargets.forEach((target) => {
  target.textContent = String(new Date().getFullYear());
});

if (messageForm && formStatus) {
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(messageForm);
    const name = String(formData.get("name") || "bạn").trim() || "bạn";

    messageForm.reset();
    formStatus.textContent =
      `Cảm ơn ${name} đã gửi tâm tư. Wantopia đã nhận được lời nhắn của bạn trong bản demo này.`;
  });
}

if (loginForm && loginStatus) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim() || "tài khoản của bạn";

    loginForm.reset();
    loginStatus.textContent =
      `Đăng nhập demo thành công cho ${email}. Bạn có thể nối form này với Firebase, Supabase hoặc API riêng khi cần.`;
  });
}

if (reduceMotion) {
  body.classList.remove("preload");
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  applyEnterTransition();

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}
