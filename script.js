let selectedSeat = null;
let selectedPrice = 599;
let selectedMonths = 1;
let expiryDateText = "";

// 1. Switch from Login to Booking
function openBooking() {
    const name = document.getElementById('userName').value.trim();
    if(!name) { alert("Please enter Student Name!"); return; }
    
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    
    renderSeats();
    updateValidity();
}

// 2. Generate Seats (Using LocalStorage instead of Firebase)
function renderSeats() {
    const layout = document.getElementById('libraryLayout');
    const bookedSeats = JSON.parse(localStorage.getItem('bookedSeats')) || {};
    layout.innerHTML = "";

    ['A', 'B', 'C', 'D', 'E'].forEach(sec => {
        let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
        for(let i=1; i<=14; i++) {
            if(i === 8) html += `<div class="aisle"></div>`;
            let id = `${sec}${i}`;
            let isOccupied = bookedSeats[id] ? "occupied" : "";
            let action = bookedSeats[id] ? "" : `onclick="pickSeat('${id}', this)"`;
            html += `<div class="seat ${isOccupied}" id="${id}" ${action}>${id}</div>`;
        }
        layout.innerHTML += html + `</div></div>`;
    });
}

// 3. Select Seat
function pickSeat(id, el) {
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSeat = id;
}

// 4. Plan Selection
function selectPlan(price, months, el) {
    document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    selectedPrice = price;
    selectedMonths = months;
    document.getElementById('totalPrice').innerText = price;
    updateValidity();
}

// 5. Date Calculation
function updateValidity() {
    const startInput = document.getElementById('startDate').value;
    if(!startInput) return;
    const start = new Date(startInput);
    const end = new Date(start);
    end.setDate(start.getDate() + (selectedMonths * 30));
    expiryDateText = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('validityInfo').innerText = `Valid Till: ${expiryDateText}`;
}

// 6. Payment (Razorpay)
function processPayment() {
    if(!selectedSeat) { alert("Please select a seat first!"); return; }

    const options = {
        "key": "rzp_test_SQHamHN8vRebZO", // Replace with your Live Key later
        "amount": selectedPrice * 100,
        "name": "JAG HARI LIBRARY",
        "description": "Seat " + selectedSeat,
        "handler": function (response){
            // Save seat as occupied in LocalStorage
            let booked = JSON.parse(localStorage.getItem('bookedSeats')) || {};
            booked[selectedSeat] = {
                name: document.getElementById('userName').value,
                expiry: expiryDateText
            };
            localStorage.setItem('bookedSeats', JSON.stringify(booked));

            showReceipt(response.razorpay_payment_id);
        },
        "theme": { "color": "#1a237e" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
}

// 7. Show Final Receipt
function showReceipt(txnId) {
    document.getElementById('receiptModal').style.display = 'flex';
    document.getElementById('rName').innerText = document.getElementById('userName').value;
    document.getElementById('rDate').innerText = document.getElementById('startDate').value;
    document.getElementById('rSeat').innerText = selectedSeat;
    document.getElementById('rPlan').innerText = selectedMonths + " Month(s)";
    document.getElementById('rAmt').innerText = selectedPrice;
    document.getElementById('rExpiry').innerText = expiryDateText;
    document.getElementById('rID').innerText = txnId;
}

