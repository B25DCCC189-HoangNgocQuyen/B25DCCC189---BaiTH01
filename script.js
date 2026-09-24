// ===== 1. MENU HAMBURGER =====
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");

hamburger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
  hamburger.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu");
});

function closeMenu() {
  nav.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "Mở menu");
}

// ===== 2. CHẾ ĐỘ SÁNG / TỐI (có lưu lựa chọn) =====
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ===== 3. SMOOTH SCROLL + ĐÁNH DẤU MỤC MENU ĐANG XEM =====
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    closeMenu();
  });
});

const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id)
      );
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => sectionObserver.observe(s));

// ===== 4. LỌC / TÌM KIẾM DỰ ÁN THEO TỪ KHÓA VÀ TAG =====
const searchInput = document.getElementById("projectSearch");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const emptyMessage = document.getElementById("emptyMessage");
let currentTag = "all";

function filterProjects() {
  const keyword = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    const tags = card.dataset.tags.split(" ");
    const matchKeyword = text.includes(keyword);
    const matchTag = currentTag === "all" || tags.includes(currentTag);
    const show = matchKeyword && matchTag;
    card.hidden = !show;
    if (show) visibleCount++;
  });

  emptyMessage.hidden = visibleCount > 0;
}

searchInput.addEventListener("input", filterProjects);
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTag = btn.dataset.filter;
    filterProjects();
  });
});

// ===== 5. ĐẾM KÝ TỰ TIN NHẮN =====
const message = document.getElementById("message");
const charCount = document.getElementById("charCount");
const MAX_CHARS = 500;

message.addEventListener("input", () => {
  const len = message.value.length;
  charCount.textContent = `${len}/${MAX_CHARS}`;
  charCount.classList.toggle("warn", len > MAX_CHARS - 50);
});

// ===== 6. VALIDATE FORM (nhiều điều kiện) =====
const form = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

const rules = {
  name(value) {
    if (!value) return "Vui lòng nhập họ tên.";
    if (value.length < 2) return "Họ tên phải có ít nhất 2 ký tự.";
    if (!/^[\p{L}\s]+$/u.test(value)) return "Họ tên chỉ gồm chữ cái và khoảng trắng.";
    return "";
  },
  email(value) {
    if (!value) return "Vui lòng nhập email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Email không đúng định dạng (vd: ten@gmail.com).";
    return "";
  },
  phone(value) {
    if (!value) return ""; // không bắt buộc
    if (!/^0\d{9}$/.test(value)) return "Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.";
    return "";
  },
  subject(value) {
    return value ? "" : "Vui lòng chọn chủ đề.";
  },
  message(value) {
    if (!value) return "Vui lòng nhập tin nhắn.";
    if (value.length < 20) return `Tin nhắn cần ít nhất 20 ký tự (còn thiếu ${20 - value.length}).`;
    if (value.length > MAX_CHARS) return `Tin nhắn tối đa ${MAX_CHARS} ký tự.`;
    return "";
  },
};

function validateField(field) {
  const errorText = rules[field.name](field.value.trim());
  const errorEl = form.querySelector(`.error[data-for="${field.name}"]`);
  errorEl.textContent = errorText;
  field.classList.toggle("invalid", errorText !== "");
  field.classList.toggle("valid", errorText === "" && field.value.trim() !== "");
  return errorText === "";
}

Object.keys(rules).forEach((name) => {
  const field = form.elements[name];
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.classList.contains("invalid")) validateField(field);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSuccess.hidden = true;

  let firstInvalid = null;
  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    if (!validateField(field) && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  formSuccess.hidden = false;
  form.reset();
  charCount.textContent = `0/${MAX_CHARS}`;
  form.querySelectorAll(".valid").forEach((f) => f.classList.remove("valid"));
});

// ===== 7. HIỆU ỨNG XUẤT HIỆN KHI CUỘN (scroll reveal) =====
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ===== 8. HIỂN THỊ NĂM HIỆN TẠI Ở FOOTER =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== 9. NÚT LÊN ĐẦU TRANG =====
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 500);
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
