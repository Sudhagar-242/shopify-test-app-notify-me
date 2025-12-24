class ModalNotification {
  constructor(variants) {
    this.modalContainer = document.getElementById("notifyModal");
    this.overlay = document.querySelector(".notify-overlay");
    this.openBtn = document.querySelector(".btn-open");
    this.closeBtn = this.modalContainer.querySelector(".btn-close");
    this.form = document.getElementById("notifyForm");
    this.contactEmail = document.getElementById("contactInput");
    this.selectedCountry = document.getElementById("notify_country_code");
    this.contactNumber = document.getElementById("notify_number");
    this.errorMessage = document.getElementById("error-message");
    this.variants = variants; // Store the variants in the class instance
    this.currentVariantId = variants[0];

    this.init();
  }

  // Initialize event listeners and URL change tracking
  init() {
    if (this.openBtn)
      this.openBtn.addEventListener("click", this.openModal.bind(this));
    if (this.closeBtn)
      this.closeBtn.addEventListener("click", this.closeModal.bind(this));
    // Log when overlay is clicked
    this.overlay.addEventListener("click", () => {
      this.closeModal();
    });

    // Prevent clicks INSIDE the modal from bubbling to overlay (just in case)
    this.modalContainer.addEventListener("click", (e) => e.stopPropagation());

    if (this.form) {
      this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
    }

    // Start tracking URL changes
    this.tracksTheUrlChanges();
  }

  // Show notify buttons
  showNotifyButtons() {
    document.querySelectorAll("#zuper-notify-button").forEach((elem) => {
      elem.style.display = "inline-flex";
    });
  }

  // Hide notify buttons
  hideNotifyButtons() {
    document.querySelectorAll("#zuper-notify-button").forEach((elem) => {
      elem.style.display = "none";
    });
  }

  // Open the modal
  openModal() {
    this.modalContainer.removeAttribute("inert");
    this.modalContainer.setAttribute("aria-hidden", "false");
    // this.modalContainer.classList.remove('closing');
    this.modalContainer.classList.add("is-open");
    document.body.style.overflow = "hidden";

    setTimeout(() => this.contactEmail.focus(), 50);
  }

  // Close the modal
  closeModal() {
    document.activeElement.blur();
    // this.modalContainerclassList.add('closing');
    this.modalContainer.classList.remove("is-open");
    // setTimeout(() => {
    //     this.modalContainer.classList.remove("is-open");
    // }, 250);
    this.modalContainer.setAttribute("aria-hidden", "true");
    this.modalContainer.setAttribute("inert", "");
    document.body.style.overflow = "";
  }

  // Handle overlay click
  overlayClicked() {
    console.log("Overlay clicked");
  }

  // Function to validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  }

  // Function to validate phone number
  validatePhoneNumber(number) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    if (number && !phoneRegex.test(number)) {
      return "Please enter a valid phone number.";
    }
    if (number.replace(/\D/g, "").length < 8) {
      return "Phone number must have at least 8 digits.";
    }
    return "";
  }

  // Function to validate country selection
  validateCountry(country) {
    if (!country) {
      return "Please select a country.";
    }
    return "";
  }

  // Function to validate the form
  validateForm() {
    const email = this.contactEmail.value.trim();
    const number = this.contactNumber.value.trim();
    const country = this.selectedCountry.value;

    let errorMessages = [];

    // Check if either email or phone number is provided
    if (!email && !number) {
      errorMessages.push("Please enter either a valid email or phone number.");
    }

    // Validate email and phone number separately
    if (email) {
      const emailError = this.validateEmail(email);
      if (emailError) {
        errorMessages.push(emailError);
      }
    }

    if (number) {
      const phoneError = this.validatePhoneNumber(number);
      if (phoneError) {
        errorMessages.push(phoneError);
      }
    }

    // Validate country selection
    const countryError = this.validateCountry(country);
    if (countryError) {
      errorMessages.push(countryError);
    }

    return errorMessages;
  }

  // Function to handle form submission
  handleFormSubmit(e) {
    e.preventDefault();

    // Clear any previous error messages
    this.errorMessage.textContent = "";

    // Validate form
    const errorMessages = this.validateForm();

    if (errorMessages.length > 0) {
      // If there are any validation errors, display them
      this.errorMessage.innerHTML = errorMessages.join("<br>");
      return;
    }

    // Collect form data if validation passes
    const email =
      this.contactEmail.value.trim().length > 0
        ? this.contactEmail.value.trim()
        : null;
    const number =
      this.contactNumber.value.trim().length > 0
        ? this.contactNumber.value.trim()
        : null;
    const countryValue = JSON.parse(this.selectedCountry.value);

    // Prepare the data object to send to the backend
    window.ex_data = {
      ...window.ex_data,
      variant_id: this.currentVariantId,
      email: email,
      number: number,
      country: countryValue.country,
      country_code: countryValue.code,
    };

    console.log("Form Data Submitted:", window.ex_data);

    // Prepare the request headers
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    // Send the data via fetch to the backend
    fetch("http://localhost:3000/notification/subscribe", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(window.ex_data),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
        this.errorMessage.textContent =
          "An error occurred while processing your request. Please try again.";
      });

    // Reset the form and close the modal after successful submission
    this.form.reset();
    this.closeModal();
  }

  // Get the URL parameters as an object
  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  // Track changes to the URL
  tracksTheUrlChanges() {
    let lastParams = {};

    const checkUrlChanges = () => {
      const currentParams = this.getUrlParams();
      if (currentParams.variant) {
        this.currentVariantId = currentParams.variant;
        console.log(this.currentVariantId);
      }

      if (JSON.stringify(currentParams) !== JSON.stringify(lastParams)) {
        lastParams = currentParams;
        const variantId = parseInt(currentParams.variant);

        if (isNaN(variantId)) {
          const availableVariant = this.variants.find(
            (variant) => variant.available,
          );
          if (availableVariant) {
            this.hideNotifyButtons();
          } else {
            this.showNotifyButtons();
          }
          return;
        }

        const foundVariant = this.variants.find(
          (variant) => variant.id === variantId,
        );
        if (foundVariant) {
          if (foundVariant.available) {
            this.hideNotifyButtons();
          } else {
            this.showNotifyButtons();
          }
        } else {
          this.showNotifyButtons();
        }
      }
    };

    window.addEventListener("popstate", checkUrlChanges);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (state, title, url) {
      originalPushState.apply(this, arguments);
      checkUrlChanges();
    };

    history.replaceState = function (state, title, url) {
      originalReplaceState.apply(this, arguments);
      checkUrlChanges();
    };

    checkUrlChanges();
  }
}

// Assuming `product.variants` is passed as a JSON object
document.addEventListener("DOMContentLoaded", () => {
  new ModalNotification(window.variants_zuper);
});
