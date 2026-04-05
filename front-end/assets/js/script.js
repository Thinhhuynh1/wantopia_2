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

function initThoughtPrompts() {
  const allPrompts = [
    "Điều gì mình chưa từng nói ra?",
    "Mình muốn trở thành phiên bản nào?",
    "5 năm nữa mình sẽ trở thành",
    "Một bài hát khi nghe bạn sẽ liên tưởng đến TDTU",
    "Cái tên mà bạn quý nhất Tôn Đức Thắng?",
    "Đại học Tôn Đức Thắng, vì một…",
    "Món ăn mà bạn yêu thích nhất khi học tại TDTU",
    "Kỷ niệm mà mình nhớ nhất tại TDTU là",
    "Nếu có 1 điều ước",
    "Nếu được quay lại năm nhất, bạn sẽ?",
  ];

  const batchSize = 2;
  const suggestionList = document.querySelector("[data-suggestion-list]");
  const nextButton = document.querySelector("[data-suggestion-next]");
  const textarea = document.querySelector("[data-thought-textarea]");

  if (!suggestionList || !nextButton || !textarea) {
    return;
  }

  let promptPool = [];

  function refillPromptPool() {
    promptPool = [...allPrompts];
  }

  function fillTextarea(text) {
    textarea.value = text;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  function createSuggestionChip(text) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "suggestion-chip";
    chip.textContent = text;
    // chip.addEventListener("click", () => fillTextarea(text));
    return chip;
  }

  function drawRandomPrompts(count) {
    const selectedPrompts = [];

    while (selectedPrompts.length < count) {
      if (promptPool.length === 0) {
        refillPromptPool();
      }

      const randomIndex = Math.floor(Math.random() * promptPool.length);
      const [prompt] = promptPool.splice(randomIndex, 1);
      selectedPrompts.push(prompt);
    }

    return selectedPrompts;
  }

  function renderSuggestions(prompts) {
    suggestionList.innerHTML = "";
    prompts.forEach((prompt) => {
      suggestionList.appendChild(createSuggestionChip(prompt));
    });
  }

  nextButton.addEventListener("click", () => {
    renderSuggestions(drawRandomPrompts(batchSize));
  });

  refillPromptPool();
  renderSuggestions(drawRandomPrompts(batchSize));
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
    formStatus.textContent = `Cảm ơn ${name} đã gửi tâm tư. Wantopia đã nhận được lời nhắn của bạn trong bản demo này.`;
  });
}

if (loginForm && loginStatus) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim() || "tài khoản của bạn";

    loginForm.reset();
    loginStatus.textContent = `Đăng nhập demo thành công cho ${email}. Bạn có thể nối form này với Firebase, Supabase hoặc API riêng khi cần.`;
  });
}

initThoughtPrompts();

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


//Popup coming-soon Page su kien
document.addEventListener('DOMContentLoaded', function() {
  // Logic xử lý popup "Coming Soon"
  const comingSoonBoxes = document.querySelectorAll('.coming-soon');
  const toast = document.getElementById('custom-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer;

  if(comingSoonBoxes.length > 0 && toast) {
    comingSoonBoxes.forEach(box => {
      box.addEventListener('click', function(e) {
        e.preventDefault(); // Ngăn trình duyệt nhảy trang khi click vào link #
        
        const message = this.getAttribute('data-message');
        toastMessage.textContent = message;

        toast.classList.add('show');

        clearTimeout(toastTimer); 
        toastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      });
    });
  }
});