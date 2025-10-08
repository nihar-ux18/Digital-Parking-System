// Global Variables
let currentSection = 'home';
let bookingData = {};
let parkingSlots = {
    'A1': { status: 'available', bookedBy: null },
    'A2': { status: 'booked', bookedBy: 'John Doe' },
    'A3': { status: 'available', bookedBy: null },
    'B1': { status: 'available', bookedBy: null },
    'B2': { status: 'booked', bookedBy: 'Jane Smith' },
    'B3': { status: 'available', bookedBy: null },
    'C1': { status: 'available', bookedBy: null },
    'C2': { status: 'booked', bookedBy: 'Bob Johnson' },
    'C3': { status: 'available', bookedBy: null },
    'D1': { status: 'available', bookedBy: null },
    'D2': { status: 'booked', bookedBy: 'Alice Brown' },
    'D3': { status: 'available', bookedBy: null }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateAvailabilityStats();
    setMinDate();
});

// Initialize Application
function initializeApp() {
    showSection('home');
    updateNavigation();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            updateNavigation();
            
            // Close mobile menu
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.remove('active');
        });
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Booking Form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
        
        // Duration change listener for price calculation
        const durationSelect = document.getElementById('duration');
        durationSelect.addEventListener('change', calculateTotal);
    }

    // Payment Method Tabs
    const methodTabs = document.querySelectorAll('.method-tab');
    methodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchPaymentMethod(this.getAttribute('data-method'));
        });
    });

    // Card Number Formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    // Expiry Date Formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }

    // Contact Form
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Slot Selection
    const slots = document.querySelectorAll('.slot.available');
    slots.forEach(slot => {
        slot.addEventListener('click', function() {
            selectSlot(this.getAttribute('data-slot'));
        });
    });
}

// Navigation Functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
    }

    // Update navigation
    updateNavigation();
}

function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === currentSection) {
            link.classList.add('active');
        }
    });
}

// Booking Functions
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingInfo = {
        name: formData.get('name'),
        vehicle: formData.get('vehicle'),
        date: formData.get('date'),
        time: formData.get('time'),
        duration: formData.get('duration'),
        slot: formData.get('slot')
    };

    // Validate form
    if (!validateBookingForm(bookingInfo)) {
        return;
    }

    // Check if slot is available
    if (parkingSlots[bookingInfo.slot].status === 'booked') {
        showMessage('Selected slot is no longer available. Please choose another slot.', 'error');
        updateSlotDropdown();
        return;
    }

    // Store booking data
    bookingData = bookingInfo;
    
    // Update payment section
    updatePaymentSummary(bookingInfo);
    
    // Show success message and redirect to payment
    showMessage('Booking details saved! Redirecting to payment...', 'success');
    
    setTimeout(() => {
        showSection('payment');
    }, 2000);
}

function validateBookingForm(data) {
    const errors = [];
    
    if (!data.name.trim()) errors.push('Name is required');
    if (!data.vehicle.trim()) errors.push('Vehicle number is required');
    if (!data.date) errors.push('Date is required');
    if (!data.time) errors.push('Time is required');
    if (!data.duration) errors.push('Duration is required');
    if (!data.slot) errors.push('Parking slot is required');
    
    // Check if date is not in the past
    const selectedDate = new Date(data.date + 'T' + data.time);
    const now = new Date();
    if (selectedDate < now) {
        errors.push('Please select a future date and time');
    }

    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

function calculateTotal() {
    const durationSelect = document.getElementById('duration');
    const totalAmountSpan = document.getElementById('totalAmount');
    
    const duration = durationSelect.value;
    let amount = 0;
    
    switch(duration) {
        case '1': amount = 20; break;
        case '2': amount = 35; break;
        case '4': amount = 60; break;
        case '8': amount = 100; break;
        case '24': amount = 200; break;
        default: amount = 0;
    }
    
    totalAmountSpan.textContent = amount;
}

function updateSlotDropdown() {
    const slotSelect = document.getElementById('slot');
    slotSelect.innerHTML = '<option value="">Select Slot</option>';
    
    Object.keys(parkingSlots).forEach(slotId => {
        if (parkingSlots[slotId].status === 'available') {
            const option = document.createElement('option');
            option.value = slotId;
            option.textContent = `Slot ${slotId}`;
            slotSelect.appendChild(option);
        }
    });
}

function selectSlot(slotId) {
    if (parkingSlots[slotId].status === 'available') {
        // Remove previous selection
        const previouslySelected = document.querySelector('.slot.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        
        // Add selection to clicked slot
        const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
        slotElement.classList.add('selected');
        
        // Update form if on booking page
        const slotSelect = document.getElementById('slot');
        if (slotSelect) {
            slotSelect.value = slotId;
        }
        
        showMessage(`Slot ${slotId} selected`, 'success');
        setTimeout(() => {
            const successMsg = document.querySelector('.success-message');
            if (successMsg) successMsg.remove();
        }, 2000);
    }
}

// Availability Functions
function updateAvailabilityStats() {
    const totalSlots = Object.keys(parkingSlots).length;
    const availableSlots = Object.values(parkingSlots).filter(slot => slot.status === 'available').length;
    const bookedSlots = totalSlots - availableSlots;
    
    document.getElementById('totalSlots').textContent = totalSlots;
    document.getElementById('availableSlots').textContent = availableSlots;
    document.getElementById('bookedSlots').textContent = bookedSlots;
}

function refreshAvailability() {
    const button = document.querySelector('button[onclick="refreshAvailability()"]');
    const icon = button.querySelector('i');
    
    // Add spinning animation
    icon.style.animation = 'spin 1s linear infinite';
    
    // Simulate API call delay
    setTimeout(() => {
        // Randomly change some slot statuses for demo
        const slotIds = Object.keys(parkingSlots);
        const randomSlotId = slotIds[Math.floor(Math.random() * slotIds.length)];
        const currentStatus = parkingSlots[randomSlotId].status;
        
        // Toggle status for demo
        if (Math.random() > 0.7) { // 30% chance to change
            parkingSlots[randomSlotId].status = currentStatus === 'available' ? 'booked' : 'available';
            parkingSlots[randomSlotId].bookedBy = currentStatus === 'available' ? 'Demo User' : null;
        }
        
        updateParkingGrid();
        updateAvailabilityStats();
        updateSlotDropdown();
        
        // Remove spinning animation
        icon.style.animation = '';
        showMessage('Availability updated!', 'success');
        
        setTimeout(() => {
            const successMsg = document.querySelector('.success-message');
            if (successMsg) successMsg.remove();
        }, 2000);
    }, 1000);
}

function updateParkingGrid() {
    Object.keys(parkingSlots).forEach(slotId => {
        const slotElement = document.querySelector(`[data-slot="${slotId}"]`);
        if (slotElement) {
            slotElement.className = `slot ${parkingSlots[slotId].status}`;
        }
    });
}

// Payment Functions
function updatePaymentSummary(data) {
    document.getElementById('paymentSlot').textContent = data.slot;
    document.getElementById('paymentDuration').textContent = `${data.duration} hour${data.duration > 1 ? 's' : ''}`;
    document.getElementById('paymentDate').textContent = data.date;
    
    let amount = 0;
    switch(data.duration) {
        case '1': amount = 20; break;
        case '2': amount = 35; break;
        case '4': amount = 60; break;
        case '8': amount = 100; break;
        case '24': amount = 200; break;
    }
    
    document.getElementById('paymentTotal').textContent = `₹${amount}`;
}

function switchPaymentMethod(method) {
    // Update tabs
    const tabs = document.querySelectorAll('.method-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-method') === method) {
            tab.classList.add('active');
        }
    });
    
    // Update forms
    const forms = document.querySelectorAll('.payment-form');
    forms.forEach(form => {
        form.classList.remove('active');
        if (form.id === method + 'Form') {
            form.classList.add('active');
        }
    });
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function processPayment() {
    const activeMethod = document.querySelector('.method-tab.active').getAttribute('data-method');
    
    // Basic validation
    let isValid = true;
    let errors = [];
    
    if (activeMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            errors.push('Please enter a valid card number');
            isValid = false;
        }
        if (!expiry || expiry.length < 5) {
            errors.push('Please enter a valid expiry date');
            isValid = false;
        }
        if (!cvv || cvv.length < 3) {
            errors.push('Please enter a valid CVV');
            isValid = false;
        }
        if (!cardName.trim()) {
            errors.push('Please enter cardholder name');
            isValid = false;
        }
    } else if (activeMethod === 'upi') {
        const upiId = document.getElementById('upiId').value;
        if (!upiId.trim() || !upiId.includes('@')) {
            errors.push('Please enter a valid UPI ID');
            isValid = false;
        }
    }
    
    if (!isValid) {
        showMessage(errors.join('<br>'), 'error');
        return;
    }
    
    // Simulate payment processing
    const payButton = document.querySelector('button[onclick="processPayment()"]');
    const originalText = payButton.innerHTML;
    
    payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    payButton.disabled = true;
    
    setTimeout(() => {
        // Mark slot as booked
        if (bookingData.slot) {
            parkingSlots[bookingData.slot].status = 'booked';
            parkingSlots[bookingData.slot].bookedBy = bookingData.name;
        }
        
        // Update availability
        updateParkingGrid();
        updateAvailabilityStats();
        updateSlotDropdown();
        
        // Show success message
        showMessage('Payment successful! Your parking slot has been booked.', 'success');
        
        // Reset button
        payButton.innerHTML = originalText;
        payButton.disabled = false;
        
        // Redirect to home after success
        setTimeout(() => {
            showSection('home');
        }, 3000);
        
    }, 2000);
}

// Contact Form Handler
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[placeholder="Your Name"]').value;
    const email = formData.get('email') || e.target.querySelector('input[placeholder="Your Email"]').value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    
    if (!name.trim() || !email.trim() || !message.trim()) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate form submission
    showMessage('Thank you for your message! We will get back to you soon.', 'success');
    e.target.reset();
}

// Utility Functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.innerHTML = message;
    
    // Insert at the top of current section
    const currentSectionElement = document.querySelector('.section.active .container, .section.active');
    currentSectionElement.insertBefore(messageDiv, currentSectionElement.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setMinDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}

// CSS Animation for spinning
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .slot.selected {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
    }
`;
document.head.appendChild(style);

// Initialize slot dropdown on page load
document.addEventListener('DOMContentLoaded', function() {
    updateSlotDropdown();
});

// OpenStreetMap Integration using Leaflet
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.height = '400px';
    mapContainer.style.width = '100%';
    
    // Append the map below the home section if it exists
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.appendChild(mapContainer);
    } else {
        document.body.appendChild(mapContainer);
    }

    // Initialize map centered on Maharashtra
    const map = L.map('map').setView([19.8762, 75.3433], 7);

    // Use OpenStreetMap tiles (no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Example marker
    L.marker([19.8762, 75.3433])
        .addTo(map)
        .bindPopup('Welcome to Maharashtra!')
        .openPopup();
});