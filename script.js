const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.querySelector(".sr-only").textContent = isExpanded ? "Open navigation" : "Close navigation";
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation";
    navigation.classList.remove("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation";
    navigation.classList.remove("is-open");
    menuToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 800 && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation";
    navigation.classList.remove("is-open");
  }
});

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const navigationSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const navigationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      sectionLinks.forEach((link) => {
        const isActive = link.hash === `#${entry.target.id}`;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-18% 0px -68% 0px" });

  navigationSections.forEach((section) => navigationObserver.observe(section));
}

const revealElements = document.querySelectorAll(
  ".intro__copy, .intro__portrait, .selling-item, .property-search__content, .gallery__stage, .service, .contact__inner",
);

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => {
    element.classList.add("reveal-on-scroll");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-revealed"));
}

const galleryPhotos = [
  { src: "assets/roseworthy-52.jpg", alt: "Interior of a Pahrump home" },
  { src: "assets/ailanto-14.jpg", alt: "Living room with a view of the desert landscape" },
  { src: "assets/ailanto-45.jpg", alt: "Interior detail from a Pahrump property" },
  { src: "assets/ailanto-50.jpg", alt: "Interior of a home in Pahrump" },
  { src: "assets/beacon-ridge-54.jpg", alt: "Exterior detail of a Pahrump home" },
  { src: "assets/beacon-ridge-53.jpg", alt: "Home in the Beacon Ridge neighborhood" },
  { src: "assets/beacon-ridge-41.jpg", alt: "Interior of a Beacon Ridge home" },
];

const galleryMain = document.querySelector(".gallery__main");
const galleryCount = document.querySelector(".gallery__count");
const galleryThumbnails = [...document.querySelectorAll(".gallery__thumbnail")];
const gallery = document.querySelector(".gallery");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const galleryInterval = 5000;
let currentPhotoIndex = 0;
let galleryTimer;
let photoTransitionTimer;
let photoChangeId = 0;
let galleryIsVisible = true;

function showGalleryPhoto(index) {
  const nextPhotoIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  if (nextPhotoIndex === currentPhotoIndex) {
    return;
  }

  clearTimeout(photoTransitionTimer);
  const changeId = ++photoChangeId;
  currentPhotoIndex = nextPhotoIndex;
  const photo = galleryPhotos[nextPhotoIndex];
  const nextImage = new Image();

  const updateGallery = () => {
    if (changeId !== photoChangeId) {
      return;
    }

    galleryMain.classList.add("is-changing");
    photoTransitionTimer = window.setTimeout(() => {
      galleryMain.src = photo.src;
      galleryMain.alt = photo.alt;
      galleryCount.textContent = `${String(nextPhotoIndex + 1).padStart(2, "0")} / ${String(galleryPhotos.length).padStart(2, "0")}`;

      galleryThumbnails.forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === nextPhotoIndex;
        thumbnail.classList.toggle("is-active", isActive);
        thumbnail.setAttribute("aria-pressed", String(isActive));
      });

      requestAnimationFrame(() => galleryMain.classList.remove("is-changing"));
    }, reducedMotion.matches ? 0 : 120);
  };

  nextImage.onload = updateGallery;
  nextImage.onerror = updateGallery;
  nextImage.src = photo.src;
}

function pauseGalleryAutoplay() {
  window.clearTimeout(galleryTimer);
}

function scheduleGalleryAutoplay() {
  pauseGalleryAutoplay();
  if (
    reducedMotion.matches
    || !galleryIsVisible
    || document.hidden
    || gallery.matches(":hover")
    || gallery.contains(document.activeElement)
  ) {
    return;
  }

  galleryTimer = window.setTimeout(() => {
    showGalleryPhoto(currentPhotoIndex + 1);
    scheduleGalleryAutoplay();
  }, galleryInterval);
}

document.querySelector(".gallery__arrow--previous").addEventListener("click", () => {
  pauseGalleryAutoplay();
  showGalleryPhoto(currentPhotoIndex - 1);
  scheduleGalleryAutoplay();
});

document.querySelector(".gallery__arrow--next").addEventListener("click", () => {
  pauseGalleryAutoplay();
  showGalleryPhoto(currentPhotoIndex + 1);
  scheduleGalleryAutoplay();
});

galleryThumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", () => {
    pauseGalleryAutoplay();
    showGalleryPhoto(Number(thumbnail.dataset.index));
    scheduleGalleryAutoplay();
  });
});

gallery.addEventListener("pointerenter", pauseGalleryAutoplay);
gallery.addEventListener("pointerleave", scheduleGalleryAutoplay);
gallery.addEventListener("focusin", pauseGalleryAutoplay);
gallery.addEventListener("focusout", () => window.setTimeout(scheduleGalleryAutoplay, 0));
document.addEventListener("visibilitychange", scheduleGalleryAutoplay);
reducedMotion.addEventListener("change", scheduleGalleryAutoplay);

if ("IntersectionObserver" in window) {
  const galleryObserver = new IntersectionObserver(([entry]) => {
    galleryIsVisible = entry.isIntersecting;
    scheduleGalleryAutoplay();
  });
  galleryObserver.observe(gallery);
}

scheduleGalleryAutoplay();

document.querySelector("#listing-search").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const minPriceInput = form.elements.namedItem("min-price");
  const maxPriceInput = form.elements.namedItem("max-price");
  const minPrice = minPriceInput.valueAsNumber;
  const maxPrice = maxPriceInput.valueAsNumber;
  const notice = document.querySelector("#search-notice");

  if (!form.reportValidity()) {
    [minPriceInput, maxPriceInput].forEach((input) => {
      if (!input.validity.valid) {
        input.setAttribute("aria-invalid", "true");
      }
    });
    notice.textContent = "Please enter valid non-negative prices.";
    return;
  }

  if (Number.isFinite(minPrice) && Number.isFinite(maxPrice) && minPrice > maxPrice) {
    minPriceInput.setAttribute("aria-invalid", "true");
    notice.textContent = "Minimum price must be less than or equal to maximum price.";
    minPriceInput.focus();
    return;
  }

  minPriceInput.removeAttribute("aria-invalid");
  maxPriceInput.removeAttribute("aria-invalid");
  notice.textContent =
    "Live listing search is not connected in this static preview. Call Marci for current properties.";
});

document.querySelector("#message-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const notice = document.querySelector("#message-notice");

  if (!form.reportValidity()) {
    notice.textContent = "Please complete the required fields with a valid email address.";
    notice.classList.add("is-error");
    return;
  }

  notice.textContent = "Your message was not sent. This static preview has no message service. Please call Marci at (206) 919-6886.";
  notice.classList.remove("is-error");
});
