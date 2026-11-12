/**
 * WanderLux Travel Booking Agency - Master Application Logic
 * Pure Vanilla JavaScript (No Frameworks, No Templates)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 40
    });
  }

  // Application State
  const AppState = {
    wishlist: getWishlist(),
    currentHotelForBooking: hotelsData[0],
    appliedCoupon: null,
    guestConfig: {
      adults: 2,
      children: 0,
      rooms: 1
    },
    activeDestinationCategory: "all",
    testimonialCurrentIndex: 0,
    hotelFilters: {
      searchQuery: "",
      destinationId: "all",
      maxPrice: 800,
      minRating: 0,
      sortBy: "featured",
      amenities: []
    }
  };

  // Initialize Elements & Handlers
  initNavbar();
  initHeroSearchWidget();
  initHeroSlider();
  initDestinationsSection();
  initHotelsSection();
  initOffersSection();
  initTestimonialsSlider();
  initNewsletter();
  initBookingEstimatorModal();
  initWishlistDrawer();
  initLoginModal();
  initContactForm();
  initGSAPAnimations();
  updateWishlistCounters();
  updateUserAuthUI();

  // Set Current Year in Footer
  const yearElem = document.getElementById("current-year");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     Navbar & Mobile Navigation
     ========================================================================== */
  function initNavbar() {
    const navbar = document.getElementById("navbar");
    const mobileToggleBtn = document.getElementById("mobile-toggle-btn");
    const closeMobileNavBtn = document.getElementById("close-mobile-nav-btn");
    const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
    const mobileNavItems = document.querySelectorAll(".mobile-nav-item");

    // Scroll styling
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });

    // Mobile drawer toggle
    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener("click", () => {
        mobileNavOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    }

    function closeMobileMenu() {
      if (mobileNavOverlay) {
        mobileNavOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    }

    if (closeMobileNavBtn) closeMobileNavBtn.addEventListener("click", closeMobileMenu);
    if (mobileNavOverlay) {
      mobileNavOverlay.addEventListener("click", (e) => {
        if (e.target === mobileNavOverlay) closeMobileMenu();
      });
    }

    mobileNavItems.forEach(item => {
      item.addEventListener("click", closeMobileMenu);
    });

    const mobileWishlistBtn = document.getElementById("mobile-wishlist-btn");
    if (mobileWishlistBtn) {
      mobileWishlistBtn.addEventListener("click", () => {
        closeMobileMenu();
        openWishlistDrawer();
      });
    }
  }

  /* ==========================================================================
     Hero Search Widget & Date Validation
     ========================================================================== */
  function initHeroSearchWidget() {
    const checkinInput = document.getElementById("hero-checkin");
    const checkoutInput = document.getElementById("hero-checkout");
    const checkinFeedback = document.getElementById("checkin-feedback");
    const checkoutFeedback = document.getElementById("checkout-feedback");
    const destinationSelect = document.getElementById("hero-destination-select");
    const searchBtn = document.getElementById("hero-search-btn");

    // Stepper elements
    const guestTrigger = document.getElementById("guest-picker-trigger");
    const guestPopover = document.getElementById("guest-popover");
    const guestDisplay = document.getElementById("guest-picker-display");

    const adultsCountElem = document.getElementById("adults-count");
    const childrenCountElem = document.getElementById("children-count");
    const roomsCountElem = document.getElementById("rooms-count");

    const adultsMinus = document.getElementById("adults-minus");
    const adultsPlus = document.getElementById("adults-plus");
    const childrenMinus = document.getElementById("children-minus");
    const childrenPlus = document.getElementById("children-plus");
    const roomsMinus = document.getElementById("rooms-minus");
    const roomsPlus = document.getElementById("rooms-plus");

    // Initialize Dates (Min date = Today)
    const today = new Date();
    const todayStr = formatDate(today);
    
    // Default Check-in: Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    // Default Check-out: 4 days from today
    const defaultCheckout = new Date();
    defaultCheckout.setDate(today.getDate() + 4);
    const checkoutStr = formatDate(defaultCheckout);

    if (checkinInput && checkoutInput) {
      checkinInput.min = todayStr;
      checkinInput.value = tomorrowStr;
      checkoutInput.min = tomorrowStr;
      checkoutInput.value = checkoutStr;

      // Event listener: Check-in change
      checkinInput.addEventListener("change", () => {
        const selectedCheckin = new Date(checkinInput.value);
        if (isNaN(selectedCheckin.getTime())) return;

        // Set min checkout to checkin + 1 day
        const nextDay = new Date(selectedCheckin);
        nextDay.setDate(selectedCheckin.getDate() + 1);
        const nextDayStr = formatDate(nextDay);
        checkoutInput.min = nextDayStr;

        // If current checkout is before or equal to checkin, adjust it automatically
        const currentCheckout = new Date(checkoutInput.value);
        if (currentCheckout <= selectedCheckin) {
          checkoutInput.value = nextDayStr;
        }
        validateDates();
      });

      // Event listener: Check-out change
      checkoutInput.addEventListener("change", validateDates);
    }

    function validateDates() {
      const inDate = new Date(checkinInput.value);
      const outDate = new Date(checkoutInput.value);

      if (outDate <= inDate) {
        checkoutFeedback.textContent = "Check-out must be after check-in";
        checkoutFeedback.classList.add("show");
        checkoutInput.style.borderColor = "var(--danger)";
        return false;
      } else {
        checkoutFeedback.classList.remove("show");
        checkoutInput.style.borderColor = "";
        return true;
      }
    }

    // Guest & Room Popover Toggle
    if (guestTrigger && guestPopover) {
      guestTrigger.addEventListener("click", (e) => {
        // Prevent toggle if clicking inside the popover buttons
        if (e.target.closest(".guest-popover")) return;
        guestPopover.classList.toggle("active");
      });

      // Close on click outside
      document.addEventListener("click", (e) => {
        if (!guestTrigger.contains(e.target)) {
          guestPopover.classList.remove("active");
        }
      });
    }

    // Guest Steppers
    function updateGuestDisplay() {
      const { adults, children, rooms } = AppState.guestConfig;
      let text = `${adults} Adult${adults > 1 ? "s" : ""}`;
      if (children > 0) {
        text += `, ${children} Child${children > 1 ? "ren" : ""}`;
      }
      text += `, ${rooms} Room${rooms > 1 ? "s" : ""}`;
      guestDisplay.textContent = text;

      // Update stepper counters
      adultsCountElem.textContent = adults;
      childrenCountElem.textContent = children;
      roomsCountElem.textContent = rooms;

      // Disable/enable minus buttons
      adultsMinus.disabled = adults <= 1;
      childrenMinus.disabled = children <= 0;
      roomsMinus.disabled = rooms <= 1;

      adultsPlus.disabled = adults >= 10;
      childrenPlus.disabled = children >= 6;
      roomsPlus.disabled = rooms >= 5;
    }

    adultsMinus.addEventListener("click", () => {
      if (AppState.guestConfig.adults > 1) {
        AppState.guestConfig.adults--;
        updateGuestDisplay();
      }
    });
    adultsPlus.addEventListener("click", () => {
      if (AppState.guestConfig.adults < 10) {
        AppState.guestConfig.adults++;
        updateGuestDisplay();
      }
    });

    childrenMinus.addEventListener("click", () => {
      if (AppState.guestConfig.children > 0) {
        AppState.guestConfig.children--;
        updateGuestDisplay();
      }
    });
    childrenPlus.addEventListener("click", () => {
      if (AppState.guestConfig.children < 6) {
        AppState.guestConfig.children++;
        updateGuestDisplay();
      }
    });

    roomsMinus.addEventListener("click", () => {
      if (AppState.guestConfig.rooms > 1) {
        AppState.guestConfig.rooms--;
        updateGuestDisplay();
      }
    });
    roomsPlus.addEventListener("click", () => {
      if (AppState.guestConfig.rooms < 5) {
        AppState.guestConfig.rooms++;
        updateGuestDisplay();
      }
    });

    updateGuestDisplay();

    // Hero Search Button Click
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        if (!validateDates()) {
          showToast("Please select a valid check-out date.", "warning");
          return;
        }

        const selectedDest = destinationSelect.value;
        const hotelDestSelect = document.getElementById("hotel-dest-select");

        // Sync destination filter in hotels section
        if (hotelDestSelect) {
          hotelDestSelect.value = selectedDest;
          AppState.hotelFilters.destinationId = selectedDest;
          applyHotelFilters();
        }

        // Calculate nights
        const inDate = new Date(checkinInput.value);
        const outDate = new Date(checkoutInput.value);
        const nights = Math.max(1, Math.round((outDate - inDate) / (1000 * 60 * 60 * 24)));

        // Scroll smoothly to hotel section
        const hotelsSection = document.getElementById("hotels");
        if (hotelsSection) {
          hotelsSection.scrollIntoView({ behavior: "smooth" });
        }

        showToast(`Searching stays for ${nights} night(s) & ${AppState.guestConfig.rooms} room(s)...`, "info");
      });
    }
  }

  /* ==========================================================================
     Interactive Hero Destination Slider
     ========================================================================== */
  function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const prevBtn = document.getElementById("hero-slider-prev");
    const nextBtn = document.getElementById("hero-slider-next");
    const indicatorsContainer = document.getElementById("hero-slider-indicators");
    const locationText = document.getElementById("hero-location-text");
    const headlineText = document.getElementById("hero-headline-text");
    const subheadText = document.getElementById("hero-subhead-text");
    const destinationSelect = document.getElementById("hero-destination-select");
    const heroSection = document.getElementById("hero");

    if (!slides || slides.length === 0) return;

    let currentSlide = 0;
    let isTransitioning = false;
    let autoPlayTimer = null;

    // Render Indicator Dots
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = "";
      slides.forEach((slide, idx) => {
        const dot = document.createElement("button");
        dot.className = `hero-slider-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `Go to slide ${idx + 1}: ${slide.dataset.location}`);
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
        indicatorsContainer.appendChild(dot);
      });
    }

    function goToSlide(targetIdx) {
      if (targetIdx === currentSlide || isTransitioning) return;
      isTransitioning = true;

      // Remove active from current
      slides[currentSlide].classList.remove("active");
      
      // Update target
      currentSlide = targetIdx;
      const activeSlide = slides[currentSlide];
      activeSlide.classList.add("active");

      // Update dots
      if (indicatorsContainer) {
        const dots = indicatorsContainer.querySelectorAll(".hero-slider-dot");
        dots.forEach((d, idx) => {
          d.classList.toggle("active", idx === currentSlide);
        });
      }

      // Update location pill
      if (locationText && activeSlide.dataset.location) {
        locationText.textContent = activeSlide.dataset.location;
      }

      // Update destination select if matches
      if (destinationSelect && activeSlide.dataset.destId) {
        destinationSelect.value = activeSlide.dataset.destId;
      }

      // Smooth text transition with GSAP
      if (typeof gsap !== "undefined" && headlineText && subheadText) {
        gsap.to([headlineText, subheadText], {
          opacity: 0.15,
          y: -8,
          duration: 0.22,
          onComplete: () => {
            if (activeSlide.dataset.headline) headlineText.innerHTML = activeSlide.dataset.headline;
            if (activeSlide.dataset.subhead) subheadText.textContent = activeSlide.dataset.subhead;
            gsap.to([headlineText, subheadText], {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
              onComplete: () => {
                isTransitioning = false;
              }
            });
          }
        });
      } else {
        if (activeSlide.dataset.headline) headlineText.innerHTML = activeSlide.dataset.headline;
        if (activeSlide.dataset.subhead) subheadText.textContent = activeSlide.dataset.subhead;
        isTransitioning = false;
      }
    }

    function nextSlide() {
      const nextIdx = (currentSlide + 1) % slides.length;
      goToSlide(nextIdx);
    }

    function prevSlide() {
      const prevIdx = (currentSlide - 1 + slides.length) % slides.length;
      goToSlide(prevIdx);
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    // Auto-advance every 5.5 seconds
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 5500);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    if (heroSection) {
      heroSection.addEventListener("mouseenter", stopAutoPlay);
      heroSection.addEventListener("mouseleave", startAutoPlay);

      // Mobile Touch Swipe Handling (Strict 375px, 390px, 414px mobile UX)
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartY = 0;
      let touchEndY = 0;

      heroSection.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      heroSection.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      }
    }

    startAutoPlay();
  }

  /* ==========================================================================
     Popular Destinations Section
     ========================================================================== */
  function initDestinationsSection() {
    const grid = document.getElementById("destinations-grid");
    const filterTabs = document.querySelectorAll(".filter-tab-btn");

    function renderDestinations(category = "all") {
      if (!grid) return;
      const filtered = category === "all" 
        ? destinationsData 
        : destinationsData.filter(d => d.category === category);

      grid.innerHTML = filtered.map(dest => `
        <div class="destination-card">
          <div class="dest-img-wrap">
            <img src="${dest.image}" alt="${dest.name}" loading="lazy">
            <span class="dest-badge">${dest.badge}</span>
            <div class="dest-rating">
              <i class="fa-solid fa-star"></i>
              <span>${dest.rating}</span>
            </div>
          </div>
          <div class="dest-content">
            <div class="dest-header-row">
              <h3 class="dest-name">${dest.name}</h3>
            </div>
            <div class="dest-country">
              <i class="fa-solid fa-location-dot"></i> ${dest.country}
            </div>
            <p class="dest-desc">${dest.description}</p>
            <div class="dest-footer">
              <div>
                <span class="dest-price-label">Avg. from</span>
                <span class="dest-price-value">$${dest.avgPrice}<small style="font-size:0.75rem; font-weight:500; color:var(--text-muted);">/night</small></span>
              </div>
              <button class="dest-explore-btn" onclick="filterByDestinationDirect('${dest.id}')">
                Explore Stays <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `).join("");

      if (typeof gsap !== "undefined" && category !== "initial") {
        gsap.killTweensOf(grid.children);
        gsap.fromTo(grid.children, 
          { y: 16, opacity: 0.8 }, 
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: "power2.out", clearProps: "all" }
        );
      }
    }

    filterTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        filterTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const category = tab.dataset.category;
        renderDestinations(category);
      });
    });

    renderDestinations("initial");
  }

  // Global helper for direct destination filtering from buttons / footer
  window.filterByDestinationDirect = function(destId) {
    const hotelDestSelect = document.getElementById("hotel-dest-select");
    const heroDestSelect = document.getElementById("hero-destination-select");
    if (hotelDestSelect) {
      hotelDestSelect.value = destId;
      AppState.hotelFilters.destinationId = destId;
      applyHotelFilters();
    }
    if (heroDestSelect) {
      heroDestSelect.value = destId;
    }
    const hotelsSection = document.getElementById("hotels");
    if (hotelsSection) {
      hotelsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ==========================================================================
     Featured Hotels Section & Real-Time Filtering
     ========================================================================== */
  function initHotelsSection() {
    const searchInput = document.getElementById("hotel-search-input");
    const destSelect = document.getElementById("hotel-dest-select");
    const priceSlider = document.getElementById("hotel-price-slider");
    const priceDisplay = document.getElementById("price-slider-display");
    const ratingSelect = document.getElementById("hotel-rating-select");
    const sortSelect = document.getElementById("hotel-sort-select");
    const amenityCheckboxes = document.querySelectorAll(".amenity-checkbox");
    const resetBtn = document.getElementById("reset-filters-btn");

    // Debounce helper to prevent rapid consecutive re-renders
    function debounce(fn, delay = 120) {
      let timer = null;
      return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    const debouncedApplyFilters = debounce(() => applyHotelFilters(), 100);

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        AppState.hotelFilters.searchQuery = e.target.value.toLowerCase().trim();
        debouncedApplyFilters();
      });
    }

    if (destSelect) {
      destSelect.addEventListener("change", (e) => {
        AppState.hotelFilters.destinationId = e.target.value;
        applyHotelFilters();
      });
    }

    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        priceDisplay.textContent = `$${val}`;
        AppState.hotelFilters.maxPrice = val;
        debouncedApplyFilters();
      });
    }

    if (ratingSelect) {
      ratingSelect.addEventListener("change", (e) => {
        AppState.hotelFilters.minRating = parseFloat(e.target.value) || 0;
        applyHotelFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        AppState.hotelFilters.sortBy = e.target.value;
        applyHotelFilters();
      });
    }

    amenityCheckboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const checked = Array.from(amenityCheckboxes)
          .filter(c => c.checked)
          .map(c => c.value);
        AppState.hotelFilters.amenities = checked;
        applyHotelFilters();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        AppState.hotelFilters = {
          searchQuery: "",
          destinationId: "all",
          maxPrice: 800,
          minRating: 0,
          sortBy: "featured",
          amenities: []
        };
        if (searchInput) searchInput.value = "";
        if (destSelect) destSelect.value = "all";
        if (priceSlider) {
          priceSlider.value = 800;
          priceDisplay.textContent = "$800";
        }
        if (ratingSelect) ratingSelect.value = "0";
        if (sortSelect) sortSelect.value = "featured";
        amenityCheckboxes.forEach(cb => cb.checked = false);
        applyHotelFilters();
        showToast("Hotel filters reset to default.", "info");
      });
    }

    // Initial render
    applyHotelFilters();
  }

  function applyHotelFilters() {
    const grid = document.getElementById("hotels-grid");
    const countDisplay = document.getElementById("hotels-count-display");
    if (!grid) return;

    let filtered = hotelsData.filter(hotel => {
      // Search Query
      if (AppState.hotelFilters.searchQuery) {
        const q = AppState.hotelFilters.searchQuery;
        const matchesName = hotel.name.toLowerCase().includes(q);
        const matchesLocation = hotel.location.toLowerCase().includes(q);
        const matchesCountry = hotel.country.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation && !matchesCountry) return false;
      }

      // Destination
      if (AppState.hotelFilters.destinationId !== "all") {
        if (hotel.destinationId !== AppState.hotelFilters.destinationId) return false;
      }

      // Price Slider
      if (hotel.pricePerNight > AppState.hotelFilters.maxPrice) {
        return false;
      }

      // Rating Filter
      if (AppState.hotelFilters.minRating > 0 && hotel.rating < AppState.hotelFilters.minRating) {
        return false;
      }

      // Amenities filter (must include all selected)
      if (AppState.hotelFilters.amenities.length > 0) {
        const hasAll = AppState.hotelFilters.amenities.every(amenity => 
          hotel.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      return true;
    });

    // Sorting
    switch (AppState.hotelFilters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price-high":
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating-high":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews-count":
        filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      default:
        // Featured
        break;
    }

    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} luxury stay${filtered.length !== 1 ? "s" : ""}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="hotels-empty-state">
          <i class="fa-solid fa-hotel"></i>
          <h3>No Matching Properties Found</h3>
          <p>Try adjusting your search criteria, price range, or amenity preferences.</p>
          <button class="btn btn-outline" id="empty-reset-btn">Reset All Filters</button>
        </div>
      `;
      const emptyResetBtn = document.getElementById("empty-reset-btn");
      if (emptyResetBtn) {
        emptyResetBtn.addEventListener("click", () => {
          document.getElementById("reset-filters-btn")?.click();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(hotel => {
      const isSaved = AppState.wishlist.includes(hotel.id);
      return `
        <div class="hotel-card">
          <div class="hotel-card-image-wrap">
            <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
            <span class="hotel-badge">${hotel.badge}</span>
            <button class="hotel-wishlist-toggle ${isSaved ? "active" : ""}" 
                    data-hotel-id="${hotel.id}" 
                    aria-label="Save to Wishlist"
                    title="${isSaved ? "Remove from Wishlist" : "Save to Wishlist"}">
              <i class="${isSaved ? "fa-solid" : "fa-regular"} fa-heart"></i>
            </button>
          </div>
          <div class="hotel-card-body">
            <div class="hotel-location-rating">
              <div class="hotel-location">
                <i class="fa-solid fa-location-dot"></i> ${hotel.location}
              </div>
              <div class="hotel-rating-badge">
                <i class="fa-solid fa-star"></i>
                <span>${hotel.rating}</span>
                <small style="color:var(--text-muted); font-weight:500;">(${hotel.reviewsCount})</small>
              </div>
            </div>
            <h3 class="hotel-name">${hotel.name}</h3>
            <p class="hotel-description">${hotel.description}</p>
            <div class="hotel-amenities-tags">
              ${hotel.amenities.slice(0, 4).map(am => `
                <span class="amenity-pill"><i class="fa-solid fa-check"></i> ${am}</span>
              `).join("")}
            </div>
            <div class="hotel-card-footer">
              <div class="hotel-price-block">
                <span class="hotel-original-price">$${hotel.originalPrice}</span>
                <div>
                  <span class="hotel-current-price">$${hotel.pricePerNight}</span>
                  <span class="hotel-price-unit">/ night</span>
                </div>
              </div>
              <button class="hotel-book-btn" onclick="openBookingEstimatorModal('${hotel.id}')">
                <i class="fa-solid fa-calendar-check"></i> Book Now
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach Wishlist toggle listeners
    const wishlistBtns = grid.querySelectorAll(".hotel-wishlist-toggle");
    wishlistBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const hotelId = btn.dataset.hotelId;
        toggleWishlist(hotelId);
      });
    });

    // Smooth card entrance using GSAP fromTo with full cleanup
    if (typeof gsap !== "undefined" && filtered.length > 0) {
      gsap.killTweensOf(grid.children);
      gsap.fromTo(grid.children, 
        { y: 16, opacity: 0.8 }, 
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: "power2.out", clearProps: "all" }
      );
    }
  }

  /* ==========================================================================
     Special Offers Section & Coupon Copying
     ========================================================================== */
  function initOffersSection() {
    const grid = document.getElementById("offers-grid");
    if (!grid) return;

    grid.innerHTML = offersData.map(offer => `
      <div class="offer-card">
        <div class="offer-img-wrap">
          <img src="${offer.image}" alt="${offer.title}" loading="lazy">
          <span class="offer-badge">${offer.badge}</span>
        </div>
        <div class="offer-content">
          <h3 class="offer-title">${offer.title}</h3>
          <p class="offer-subtitle">${offer.subtitle}</p>
          <div class="coupon-box">
            <span class="coupon-code-text">${offer.code}</span>
            <button class="copy-coupon-btn" data-code="${offer.code}">
              <i class="fa-regular fa-copy"></i> Copy
            </button>
          </div>
          <div class="offer-expiry">
            <i class="fa-regular fa-clock"></i> ${offer.expiryDate}
          </div>
        </div>
      </div>
    `).join("");

    // Copy Coupon Handler
    const copyBtns = grid.querySelectorAll(".copy-coupon-btn");
    copyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        copyToClipboard(code);
        btn.classList.add("copied");
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        showToast(`Coupon code "${code}" copied to clipboard! Paste it during checkout.`, "success");

        setTimeout(() => {
          btn.classList.remove("copied");
          btn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
        }, 2200);
      });
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(err => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    document.body.removeChild(textArea);
  }

  /* ==========================================================================
     Customer Testimonials Slider
     ========================================================================== */
  function initTestimonialsSlider() {
    const track = document.getElementById("testimonials-track");
    const prevBtn = document.getElementById("testi-prev-btn");
    const nextBtn = document.getElementById("testi-next-btn");
    const dotsContainer = document.getElementById("testi-dots-container");

    if (!track) return;

    // Render testimonial slides
    track.innerHTML = testimonialsData.map(t => `
      <div class="testimonial-card-slide">
        <div class="testimonial-card">
          <div class="testi-stars">
            ${Array(t.rating).fill('<i class="fa-solid fa-star"></i>').join("")}
          </div>
          <span class="testi-trip-tag">${t.tripTitle}</span>
          <p class="testi-text">"${t.reviewText}"</p>
          <div class="testi-author-info">
            <img src="${t.avatar}" alt="${t.name}" class="testi-avatar" loading="lazy">
            <div class="testi-author-meta">
              <h4>${t.name}</h4>
              <p>${t.role} &bull; ${t.location}</p>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    // Calculate slides per view based on window width
    function getVisibleCount() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1200) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, testimonialsData.length - getVisibleCount());
    }

    function renderDots() {
      if (!dotsContainer) return;
      const maxIdx = getMaxIndex();
      dotsContainer.innerHTML = "";
      for (let i = 0; i <= maxIdx; i++) {
        const dot = document.createElement("div");
        dot.className = `slider-dot ${i === AppState.testimonialCurrentIndex ? "active" : ""}`;
        dot.addEventListener("click", () => {
          AppState.testimonialCurrentIndex = i;
          updateSliderPosition();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateSliderPosition() {
      const maxIdx = getMaxIndex();
      if (AppState.testimonialCurrentIndex > maxIdx) {
        AppState.testimonialCurrentIndex = maxIdx;
      }
      if (AppState.testimonialCurrentIndex < 0) {
        AppState.testimonialCurrentIndex = 0;
      }

      const visible = getVisibleCount();
      const slideWidthPercent = 100 / visible;
      const offset = AppState.testimonialCurrentIndex * slideWidthPercent;
      track.style.transform = `translateX(-${offset}%)`;

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll(".slider-dot");
        dots.forEach((dot, idx) => {
          dot.classList.toggle("active", idx === AppState.testimonialCurrentIndex);
        });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (AppState.testimonialCurrentIndex > 0) {
          AppState.testimonialCurrentIndex--;
        } else {
          AppState.testimonialCurrentIndex = getMaxIndex();
        }
        updateSliderPosition();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const maxIdx = getMaxIndex();
        if (AppState.testimonialCurrentIndex < maxIdx) {
          AppState.testimonialCurrentIndex++;
        } else {
          AppState.testimonialCurrentIndex = 0;
        }
        updateSliderPosition();
      });
    }

    window.addEventListener("resize", () => {
      renderDots();
      updateSliderPosition();
    });

    renderDots();
    updateSliderPosition();

    // Auto-advance every 6 seconds with pause on hover
    let autoInterval = setInterval(() => {
      if (nextBtn) nextBtn.click();
    }, 6000);

    const sliderWrapper = document.querySelector(".testimonials-slider-wrapper");
    if (sliderWrapper) {
      sliderWrapper.addEventListener("mouseenter", () => clearInterval(autoInterval));
      sliderWrapper.addEventListener("mouseleave", () => {
        clearInterval(autoInterval);
        autoInterval = setInterval(() => {
          if (nextBtn) nextBtn.click();
        }, 6000);
      });
    }
  }

  /* ==========================================================================
     Newsletter Form Validation
     ========================================================================== */
  function initNewsletter() {
    const form = document.getElementById("newsletter-form");
    const emailInput = document.getElementById("newsletter-email");
    const feedback = document.getElementById("newsletter-feedback");

    if (!form || !emailInput || !feedback) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        feedback.textContent = "Please enter an email address.";
        feedback.className = "newsletter-feedback show-error";
        emailInput.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        feedback.textContent = "Please provide a valid email format (e.g. explorer@wanderlux.com).";
        feedback.className = "newsletter-feedback show-error";
        emailInput.focus();
        return;
      }

      // Success
      feedback.innerHTML = `
        <i class="fa-solid fa-circle-check"></i> Welcome aboard! Your $50 voucher code is <strong>WELCOME50</strong>.
      `;
      feedback.className = "newsletter-feedback show-success";
      emailInput.value = "";

      // Save subscriber in LocalStorage
      const subscribers = JSON.parse(localStorage.getItem("wanderlux_subscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("wanderlux_subscribers", JSON.stringify(subscribers));
      }

      showToast("Subscription successful! Use promo code WELCOME50 for $50 off.", "success");
    });
  }

  /* ==========================================================================
     Wishlist Functionality (LocalStorage)
     ========================================================================== */
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem("wanderlux_wishlist")) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(list) {
    try {
      localStorage.setItem("wanderlux_wishlist", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }

  function toggleWishlist(hotelId) {
    const hotel = hotelsData.find(h => h.id === hotelId);
    if (!hotel) return;

    const index = AppState.wishlist.indexOf(hotelId);
    if (index > -1) {
      AppState.wishlist.splice(index, 1);
      showToast(`Removed "${hotel.name}" from your wishlist.`, "info");
    } else {
      AppState.wishlist.push(hotelId);
      showToast(`Saved "${hotel.name}" to your wishlist!`, "success");
    }

    saveWishlist(AppState.wishlist);
    updateWishlistCounters();

    // Update active state of buttons in DOM
    const buttons = document.querySelectorAll(`[data-hotel-id="${hotelId}"]`);
    buttons.forEach(btn => {
      const isSaved = AppState.wishlist.includes(hotelId);
      btn.classList.toggle("active", isSaved);
      btn.innerHTML = `<i class="${isSaved ? "fa-solid" : "fa-regular"} fa-heart"></i>`;
    });

    renderWishlistDrawerItems();
  }

  function updateWishlistCounters() {
    const navCount = document.getElementById("nav-wishlist-count");
    const mobileCount = document.getElementById("mobile-wishlist-count");
    const drawerCount = document.getElementById("drawer-wishlist-count");

    const count = AppState.wishlist.length;
    if (navCount) navCount.textContent = count;
    if (mobileCount) mobileCount.textContent = count;
    if (drawerCount) drawerCount.textContent = count;
  }

  function initWishlistDrawer() {
    const openBtn = document.getElementById("open-wishlist-btn");
    const closeBtn = document.getElementById("close-wishlist-drawer-btn");
    const drawerBackdrop = document.getElementById("wishlist-drawer-backdrop");
    const clearBtn = document.getElementById("clear-wishlist-btn");

    if (openBtn) openBtn.addEventListener("click", openWishlistDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeWishlistDrawer);
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener("click", (e) => {
        if (e.target === drawerBackdrop) closeWishlistDrawer();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (AppState.wishlist.length === 0) return;
        AppState.wishlist = [];
        saveWishlist(AppState.wishlist);
        updateWishlistCounters();
        applyHotelFilters();
        renderWishlistDrawerItems();
        showToast("Cleared all saved stays from your wishlist.", "info");
      });
    }
  }

  function openWishlistDrawer() {
    const drawerBackdrop = document.getElementById("wishlist-drawer-backdrop");
    if (drawerBackdrop) {
      renderWishlistDrawerItems();
      drawerBackdrop.classList.add("active");
      document.body.style.overflow = "hidden";
      if (typeof gsap !== "undefined") {
        gsap.killTweensOf(".wishlist-item-card");
        gsap.fromTo(".wishlist-item-card", 
          { x: 30, opacity: 0.8 }, 
          { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: "power2.out", clearProps: "all" }
        );
      }
    }
  }

  function closeWishlistDrawer() {
    const drawerBackdrop = document.getElementById("wishlist-drawer-backdrop");
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function renderWishlistDrawerItems() {
    const container = document.getElementById("wishlist-items-container");
    if (!container) return;

    if (AppState.wishlist.length === 0) {
      container.innerHTML = `
        <div class="wishlist-empty-state">
          <i class="fa-regular fa-heart"></i>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 6px;">Your Wishlist is Empty</h4>
          <p style="font-size: 0.85rem;">Click the heart icon on any hotel card to save properties for quick access and comparison.</p>
        </div>
      `;
      return;
    }

    const savedHotels = hotelsData.filter(h => AppState.wishlist.includes(h.id));
    container.innerHTML = savedHotels.map(h => `
      <div class="wishlist-item-card">
        <img src="${h.image}" alt="${h.name}" class="wishlist-thumb">
        <div class="wishlist-item-info">
          <h4 class="wishlist-item-title">${h.name}</h4>
          <p class="wishlist-item-location"><i class="fa-solid fa-location-dot"></i> ${h.location}</p>
          <div class="wishlist-item-price">$${h.pricePerNight}<span style="font-size:0.75rem; font-weight:500; color:var(--text-muted);">/night</span></div>
          <div class="wishlist-item-actions">
            <button class="wishlist-book-now-btn" onclick="openBookingEstimatorModal('${h.id}'); closeWishlistDrawer();">
              Estimate & Book
            </button>
            <button class="wishlist-remove-btn" onclick="removeWishlistItem('${h.id}')">
              <i class="fa-solid fa-trash-can"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  window.removeWishlistItem = function(hotelId) {
    toggleWishlist(hotelId);
  };
  window.closeWishlistDrawer = closeWishlistDrawer;

  /* ==========================================================================
     Dynamic Booking Price Estimator Modal
     ========================================================================== */
  function initBookingEstimatorModal() {
    const modalBackdrop = document.getElementById("booking-modal-backdrop");
    const closeBtn = document.getElementById("close-booking-modal-btn");
    const checkinInput = document.getElementById("modal-checkin");
    const checkoutInput = document.getElementById("modal-checkout");
    const roomTypeSelect = document.getElementById("modal-room-type");
    const roomsCountSelect = document.getElementById("modal-rooms-count");
    const couponInput = document.getElementById("modal-coupon-code");
    const applyCouponBtn = document.getElementById("apply-modal-coupon-btn");
    const couponFeedback = document.getElementById("coupon-feedback-msg");
    const confirmBtn = document.getElementById("confirm-reservation-btn");
    const addonCheckboxes = document.querySelectorAll(".estimator-addon");

    if (closeBtn) closeBtn.addEventListener("click", closeBookingEstimatorModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) closeBookingEstimatorModal();
      });
    }

    // Input change triggers re-calculation
    [checkinInput, checkoutInput, roomTypeSelect, roomsCountSelect].forEach(elem => {
      if (elem) elem.addEventListener("change", recalculateBookingPrice);
    });

    addonCheckboxes.forEach(cb => {
      cb.addEventListener("change", recalculateBookingPrice);
    });

    // Promo code apply
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener("click", () => {
        const code = couponInput.value.trim().toUpperCase();
        if (!code) {
          couponFeedback.textContent = "Please enter a promo code.";
          couponFeedback.className = "coupon-feedback-msg invalid";
          return;
        }

        // Support coupons from data.js + special newsletter code WELCOME50
        const allCoupons = {
          ...promoCoupons,
          "WELCOME50": { type: "percentage", value: 10, minSpend: 200, desc: "10% Off Welcome Voucher" }
        };

        if (allCoupons[code]) {
          AppState.appliedCoupon = { code, ...allCoupons[code] };
          couponFeedback.textContent = `Promo code "${code}" applied: ${allCoupons[code].desc}!`;
          couponFeedback.className = "coupon-feedback-msg valid";
          recalculateBookingPrice();
          showToast(`Coupon "${code}" applied successfully!`, "success");
        } else {
          AppState.appliedCoupon = null;
          couponFeedback.textContent = `Invalid promo code "${code}". Try SUMMER25, LUXESCAPE, or ISLAND30.`;
          couponFeedback.className = "coupon-feedback-msg invalid";
          recalculateBookingPrice();
        }
      });
    }

    // Confirm Reservation
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        const inDate = new Date(checkinInput.value);
        const outDate = new Date(checkoutInput.value);

        if (outDate <= inDate) {
          showToast("Check-out date must be strictly after check-in date.", "warning");
          return;
        }

        const totalFormatted = document.getElementById("calc-final-total")?.textContent || "$0";
        const refId = "WL-" + Math.floor(10000 + Math.random() * 90000);

        // Store reservation in LocalStorage
        const bookings = JSON.parse(localStorage.getItem("wanderlux_bookings") || "[]");
        bookings.push({
          bookingRef: refId,
          hotelName: AppState.currentHotelForBooking.name,
          checkin: checkinInput.value,
          checkout: checkoutInput.value,
          roomType: roomTypeSelect.options[roomTypeSelect.selectedIndex].text,
          rooms: roomsCountSelect.value,
          total: totalFormatted,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("wanderlux_bookings", JSON.stringify(bookings));

        closeBookingEstimatorModal();
        showToast(`🎉 Reservation confirmed! Booking Ref #${refId} for ${AppState.currentHotelForBooking.name} (${totalFormatted}).`, "success");
      });
    }
  }

  window.openBookingEstimatorModal = function(hotelId) {
    const hotel = hotelsData.find(h => h.id === hotelId) || hotelsData[0];
    AppState.currentHotelForBooking = hotel;

    const modalBackdrop = document.getElementById("booking-modal-backdrop");
    const hotelImg = document.getElementById("modal-hotel-img");
    const hotelName = document.getElementById("modal-hotel-name");
    const hotelLocation = document.getElementById("modal-hotel-location");
    const hotelPrice = document.getElementById("modal-hotel-price");

    if (hotelImg) hotelImg.src = hotel.image;
    if (hotelName) hotelName.textContent = hotel.name;
    if (hotelLocation) hotelLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${hotel.location}`;
    if (hotelPrice) hotelPrice.textContent = `$${hotel.pricePerNight}`;

    // Sync dates from hero search if valid
    const heroCheckin = document.getElementById("hero-checkin");
    const heroCheckout = document.getElementById("hero-checkout");
    const modalCheckin = document.getElementById("modal-checkin");
    const modalCheckout = document.getElementById("modal-checkout");

    const todayStr = formatDate(new Date());
    if (modalCheckin) {
      modalCheckin.min = todayStr;
      modalCheckin.value = heroCheckin ? heroCheckin.value : todayStr;
    }
    if (modalCheckout) {
      modalCheckout.min = modalCheckin.value;
      modalCheckout.value = heroCheckout ? heroCheckout.value : formatDate(new Date(Date.now() + 3 * 86400000));
    }

    // Reset addons and coupon
    AppState.appliedCoupon = null;
    const couponInput = document.getElementById("modal-coupon-code");
    const couponFeedback = document.getElementById("coupon-feedback-msg");
    if (couponInput) couponInput.value = "";
    if (couponFeedback) {
      couponFeedback.className = "coupon-feedback-msg";
      couponFeedback.textContent = "";
    }

    recalculateBookingPrice();

    if (modalBackdrop) {
      modalBackdrop.classList.add("active");
      document.body.style.overflow = "hidden";
      if (typeof gsap !== "undefined") {
        gsap.fromTo(modalBackdrop.querySelector(".modal-container"), 
          { scale: 0.92, opacity: 0, y: 30 }, 
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }
        );
      }
    }
  };

  function closeBookingEstimatorModal() {
    const modalBackdrop = document.getElementById("booking-modal-backdrop");
    if (modalBackdrop) {
      modalBackdrop.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function recalculateBookingPrice() {
    const checkinInput = document.getElementById("modal-checkin");
    const checkoutInput = document.getElementById("modal-checkout");
    const roomTypeSelect = document.getElementById("modal-room-type");
    const roomsCountSelect = document.getElementById("modal-rooms-count");

    if (!checkinInput || !checkoutInput || !AppState.currentHotelForBooking) return;

    const inDate = new Date(checkinInput.value);
    const outDate = new Date(checkoutInput.value);
    let nights = 1;
    if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate > inDate) {
      nights = Math.max(1, Math.round((outDate - inDate) / (1000 * 60 * 60 * 24)));
    }
    const rooms = parseInt(roomsCountSelect.value, 10) || 1;

    // Room upgrade price
    const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
    const upgradePerNight = parseInt(selectedOption?.dataset?.extra || "0", 10);
    const totalUpgrade = upgradePerNight * nights * rooms;

    // Base Stay Subtotal
    const baseRate = AppState.currentHotelForBooking.pricePerNight;
    const baseSubtotal = baseRate * nights * rooms;

    // Addons
    let addonsTotal = 0;
    const transferCb = document.getElementById("addon-transfer");
    const breakfastCb = document.getElementById("addon-breakfast");
    const tourCb = document.getElementById("addon-tour");
    const insuranceCb = document.getElementById("addon-insurance");

    if (transferCb && transferCb.checked) addonsTotal += 45; // flat
    if (breakfastCb && breakfastCb.checked) addonsTotal += (25 * nights * rooms);
    if (tourCb && tourCb.checked) addonsTotal += 80; // flat
    if (insuranceCb && insuranceCb.checked) addonsTotal += 35; // flat

    // Subtotal before taxes & coupon
    const subtotal = baseSubtotal + totalUpgrade + addonsTotal;

    // Taxes & Fees (10%)
    const taxes = Math.round(subtotal * 0.10);

    // Coupon discount
    let discountAmount = 0;
    const discountRow = document.getElementById("calc-discount-row");
    const discountTag = document.getElementById("calc-discount-tag");
    const discountSubtotalElem = document.getElementById("calc-discount-subtotal");

    if (AppState.appliedCoupon && subtotal >= (AppState.appliedCoupon.minSpend || 0)) {
      if (AppState.appliedCoupon.type === "percentage") {
        discountAmount = Math.round((subtotal * AppState.appliedCoupon.value) / 100);
      } else if (AppState.appliedCoupon.type === "fixed") {
        discountAmount = AppState.appliedCoupon.value;
      }
      if (discountRow) discountRow.style.display = "flex";
      if (discountTag) discountTag.textContent = AppState.appliedCoupon.code;
      if (discountSubtotalElem) discountSubtotalElem.textContent = `-$${discountAmount}`;
    } else {
      if (discountRow) discountRow.style.display = "none";
    }

    const finalTotal = Math.max(0, subtotal + taxes - discountAmount);

    // Update UI elements
    const nightsCountElem = document.getElementById("calc-nights-count");
    const roomsCountElem = document.getElementById("calc-rooms-count");
    const baseSubtotalElem = document.getElementById("calc-base-subtotal");
    const upgradeSubtotalElem = document.getElementById("calc-upgrade-subtotal");
    const addonsSubtotalElem = document.getElementById("calc-addons-subtotal");
    const taxesSubtotalElem = document.getElementById("calc-taxes-subtotal");
    const finalTotalElem = document.getElementById("calc-final-total");

    if (nightsCountElem) nightsCountElem.textContent = nights;
    if (roomsCountElem) roomsCountElem.textContent = rooms;
    if (baseSubtotalElem) baseSubtotalElem.textContent = `$${baseSubtotal.toLocaleString()}`;
    if (upgradeSubtotalElem) upgradeSubtotalElem.textContent = `$${totalUpgrade.toLocaleString()}`;
    if (addonsSubtotalElem) addonsSubtotalElem.textContent = `$${addonsTotal.toLocaleString()}`;
    if (taxesSubtotalElem) taxesSubtotalElem.textContent = `$${taxes.toLocaleString()}`;
    if (finalTotalElem) finalTotalElem.textContent = `$${finalTotal.toLocaleString()}`;
  }

  /* ==========================================================================
     Toast Notification System
     ========================================================================== */
  function showToast(message, type = "info", duration = 3500) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";

    let iconClass = "fa-circle-info";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "warning") iconClass = "fa-triangle-exclamation";

    toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i class="fa-solid ${iconClass}"></i>
      </div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
      }, 350);
    }, duration);
  }

  /* ==========================================================================
     User Authentication & Login Modal
     ========================================================================== */
  function getLoggedInUser() {
    try {
      return JSON.parse(localStorage.getItem("wanderlux_user")) || null;
    } catch (e) {
      return null;
    }
  }

  function updateUserAuthUI() {
    const user = getLoggedInUser();
    const navLoginText = document.getElementById("nav-login-text");
    const mobileLoginText = document.getElementById("mobile-login-text");

    if (user && user.loggedIn) {
      const displayName = user.name ? user.name.split(" ")[0] : "Account";
      if (navLoginText) navLoginText.textContent = displayName;
      if (mobileLoginText) mobileLoginText.textContent = `Account (${displayName})`;
    } else {
      if (navLoginText) navLoginText.textContent = "Login";
      if (mobileLoginText) mobileLoginText.textContent = "Login";
    }
  }

  function initLoginModal() {
    const navLoginBtn = document.getElementById("nav-login-btn");
    const mobileLoginBtn = document.getElementById("mobile-login-btn");
    const closeBtn = document.getElementById("close-login-modal-btn");
    const modalBackdrop = document.getElementById("login-modal-backdrop");
    const formView = document.getElementById("login-form-view");
    const profileView = document.getElementById("login-profile-view");

    const tabSignIn = document.getElementById("tab-signin-btn");
    const tabSignUp = document.getElementById("tab-signup-btn");
    const signupNameField = document.getElementById("signup-name-field");
    const signinMetaRow = document.getElementById("signin-meta-row");
    const authSubmitLabel = document.getElementById("auth-submit-label");
    const modalHeading = document.getElementById("login-modal-heading");

    const authForm = document.getElementById("auth-form");
    const authNameInput = document.getElementById("auth-name");
    const authEmailInput = document.getElementById("auth-email");
    const authPasswordInput = document.getElementById("auth-password");
    const togglePassBtn = document.getElementById("toggle-password-visibility");

    const socialGoogle = document.getElementById("social-google-btn");
    const socialApple = document.getElementById("social-apple-btn");
    const logoutBtn = document.getElementById("logout-user-btn");

    let isSignUp = false;

    function openLoginModal() {
      const user = getLoggedInUser();
      if (user && user.loggedIn) {
        if (formView) formView.style.display = "none";
        if (profileView) profileView.style.display = "block";
        if (modalHeading) modalHeading.textContent = "Your WanderLux Account";

        const profileName = document.getElementById("profile-user-name");
        const profileEmail = document.getElementById("profile-user-email");
        const profileWishlist = document.getElementById("profile-wishlist-count");
        const profileBookings = document.getElementById("profile-bookings-count");

        const bookings = JSON.parse(localStorage.getItem("wanderlux_bookings") || "[]");

        if (profileName) profileName.textContent = user.name || "Valued Explorer";
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileWishlist) profileWishlist.textContent = AppState.wishlist.length;
        if (profileBookings) profileBookings.textContent = bookings.length;
      } else {
        if (formView) formView.style.display = "block";
        if (profileView) profileView.style.display = "none";
        if (modalHeading) modalHeading.textContent = isSignUp ? "Join WanderLux Explorers" : "Account Login";
      }

      if (modalBackdrop) {
        modalBackdrop.classList.add("active");
        document.body.style.overflow = "hidden";
        if (typeof gsap !== "undefined") {
          gsap.fromTo(modalBackdrop.querySelector(".modal-container"), 
            { scale: 0.92, opacity: 0, y: 30 }, 
            { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }
          );
        }
      }
    }

    function closeLoginModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove("active");
        document.body.style.overflow = "";
      }
    }

    if (navLoginBtn) navLoginBtn.addEventListener("click", openLoginModal);
    if (mobileLoginBtn) {
      mobileLoginBtn.addEventListener("click", () => {
        const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
        if (mobileNavOverlay) mobileNavOverlay.classList.remove("active");
        openLoginModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLoginModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) closeLoginModal();
      });
    }

    if (tabSignIn && tabSignUp) {
      tabSignIn.addEventListener("click", () => {
        isSignUp = false;
        tabSignIn.classList.add("active");
        tabSignUp.classList.remove("active");
        if (signupNameField) signupNameField.style.display = "none";
        if (signinMetaRow) signinMetaRow.style.display = "flex";
        if (authSubmitLabel) authSubmitLabel.textContent = "Sign In to WanderLux";
        if (modalHeading) modalHeading.textContent = "Account Login";
      });

      tabSignUp.addEventListener("click", () => {
        isSignUp = true;
        tabSignUp.classList.add("active");
        tabSignIn.classList.remove("active");
        if (signupNameField) signupNameField.style.display = "block";
        if (signinMetaRow) signinMetaRow.style.display = "none";
        if (authSubmitLabel) authSubmitLabel.textContent = "Create Free Account";
        if (modalHeading) modalHeading.textContent = "Join WanderLux Explorers";
      });
    }

    if (togglePassBtn && authPasswordInput) {
      togglePassBtn.addEventListener("click", () => {
        const type = authPasswordInput.getAttribute("type") === "password" ? "text" : "password";
        authPasswordInput.setAttribute("type", type);
        togglePassBtn.innerHTML = type === "password" 
          ? '<i class="fa-regular fa-eye"></i>' 
          : '<i class="fa-regular fa-eye-slash"></i>';
      });
    }

    if (authForm) {
      authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value.trim();
        const name = isSignUp ? (authNameInput.value.trim() || "Explorer") : (email.split("@")[0] || "Explorer");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          showToast("Please provide a valid email address.", "warning");
          return;
        }

        if (password.length < 4) {
          showToast("Password must be at least 4 characters long.", "warning");
          return;
        }

        const userData = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email,
          loggedIn: true
        };

        localStorage.setItem("wanderlux_user", JSON.stringify(userData));
        updateUserAuthUI();
        closeLoginModal();

        showToast(isSignUp ? `🎉 Welcome to WanderLux, ${userData.name}!` : `👋 Welcome back, ${userData.name}!`, "success");
      });
    }

    function simulateSocialLogin(provider) {
      const userData = {
        name: `${provider} Traveler`,
        email: `traveler@${provider.toLowerCase()}.com`,
        loggedIn: true
      };
      localStorage.setItem("wanderlux_user", JSON.stringify(userData));
      updateUserAuthUI();
      closeLoginModal();
      showToast(`Signed in successfully with ${provider}!`, "success");
    }

    if (socialGoogle) socialGoogle.addEventListener("click", () => simulateSocialLogin("Google"));
    if (socialApple) socialApple.addEventListener("click", () => simulateSocialLogin("Apple"));

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("wanderlux_user");
        updateUserAuthUI();
        closeLoginModal();
        showToast("You have been signed out successfully.", "info");
      });
    }
  }

  /* ==========================================================================
     Contact Form Handler
     ========================================================================== */
  function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name")?.value.trim();
      const email = document.getElementById("contact-email")?.value.trim();
      const message = document.getElementById("contact-message")?.value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) {
        showToast("Please enter your full name.", "warning");
        return;
      }
      if (!email || !emailRegex.test(email)) {
        showToast("Please enter a valid email address.", "warning");
        return;
      }
      if (!message) {
        showToast("Please enter your travel vision or message.", "warning");
        return;
      }

      showToast(`Thank you, ${name}! Your inquiry has been sent to our VIP Concierge team.`, "success");
      contactForm.reset();
    });
  }

  /* ==========================================================================
     GSAP & ScrollTrigger Animations
     ========================================================================== */
  function initGSAPAnimations() {
    if (typeof gsap === "undefined") return;

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero Entrance Orchestrated Timeline
    const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTL
      .from("#navbar", {
        y: -50,
        opacity: 0,
        duration: 0.8
      })
      .from(".hero-content .section-badge", {
        scale: 0.85,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.5)"
      }, "-=0.3")
      .from(".hero-headline", {
        y: 35,
        opacity: 0,
        duration: 0.8
      }, "-=0.3")
      .from(".hero-subhead", {
        y: 25,
        opacity: 0,
        duration: 0.7
      }, "-=0.4")
      .from(".search-widget-container", {
        y: 40,
        opacity: 0,
        scale: 0.96,
        duration: 0.9,
        ease: "back.out(1.2)"
      }, "-=0.4")
      .from(".hero-stat-item", {
        y: 20,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6
      }, "-=0.4");

    // 2. Ambient Floating Background Blobs
    gsap.to(".hero-blob-1", {
      x: 35,
      y: 25,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(".hero-blob-2", {
      x: -30,
      y: -35,
      duration: 8.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // 3. Mouse Parallax Depth on Hero
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 35;
        const yPos = (clientY / window.innerHeight - 0.5) * 35;
        gsap.to(".hero-blob-1", { x: xPos * 1.3, y: yPos * 1.3, duration: 1.2, ease: "power1.out" });
        gsap.to(".hero-blob-2", { x: -xPos * 1.1, y: -yPos * 1.1, duration: 1.4, ease: "power1.out" });
      });
    }

    // 4. Animated Counters on ScrollTrigger
    if (typeof ScrollTrigger !== "undefined") {
      // Hero Counters
      const heroCounters = document.querySelectorAll(".hero-counter-num");
      if (heroCounters.length > 0) {
        heroCounters.forEach(el => {
          const target = parseFloat(el.dataset.target) || 0;
          const suffix = el.dataset.suffix || "";
          const isDecimal = el.dataset.decimal === "true";
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            delay: 0.8,
            onUpdate: () => {
              el.textContent = (isDecimal ? obj.val.toFixed(2) : Math.round(obj.val)) + suffix;
            }
          });
        });
      }

      // About Section Counters
      const aboutStats = document.querySelectorAll(".about-stat");
      if (aboutStats.length > 0) {
        ScrollTrigger.create({
          trigger: ".about-stats-row",
          start: "top 85%",
          once: true,
          onEnter: () => {
            document.querySelectorAll(".about-stat-num").forEach(numEl => {
              const target = parseFloat(numEl.dataset.target) || 0;
              const suffix = numEl.dataset.suffix || "";
              const isDecimal = numEl.dataset.decimal === "true";
              const obj = { val: 0 };
              gsap.to(obj, {
                val: target,
                duration: 1.8,
                ease: "power2.out",
                onUpdate: () => {
                  numEl.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val)) + suffix;
                }
              });
            });
          }
        });
      }

      // Parallax on About Image
      gsap.to(".about-main-img", {
        scrollTrigger: {
          trigger: ".about-hero-grid",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2
        },
        y: -25,
        ease: "none"
      });

      // Subtle Parallax on Newsletter
      gsap.to(".newsletter-card", {
        scrollTrigger: {
          trigger: "#newsletter",
          start: "top 90%",
          end: "bottom 20%",
          scrub: 1
        },
        y: -15,
        ease: "none"
      });
    }

    // 5. Spring Scale Interaction on Brand Logo & Interactive Buttons
    document.querySelectorAll(".brand-logo-img, .btn-primary, .search-submit-btn, .wishlist-btn").forEach(el => {
      el.addEventListener("mouseenter", () => {
        gsap.to(el, { scale: 1.05, duration: 0.25, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ==========================================================================
     Date Formatting Helper (YYYY-MM-DD)
     ========================================================================== */
  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
});
