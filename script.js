let selectedSeat = null;
let currentPrice = 599;
let currentMonths = 1;
let expiryDate = "";

function startBookingFlow() {
    const name = document.getElementById('userName').value.trim();
    if(!name) { alert("Please enter name!"); return; }

    // FORCE SWITCHING PAGES
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'block';

    // Set Date & Load Seats
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    
    renderLayout();
    updateInfo();
}

function renderLayout() {
    const layout = document.getElementById('libraryLayout');
    // We use LocalStorage to keep bookings even if page refreshes
    const bookedData = JSON.parse(localStorage.getItem('lib_bookings')) || {};
    
    layout.innerHTML = "";
    ['A', 'B', 'C', 'D', 'E'].forEach(sec => {
        let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
        for(let i=1; i<=14; i++) {
            if(i === 8) html += `<div class="aisle"></div>`;
            let id = `${sec}${i}`;
            let isFull = bookedData[id] ? "occupied" : "";
            let click = bookedData[id] ? "" : `onclick="selectThisSeat('${id}', this)"`;
            html += `<div class="seat ${isFull}" id="${id}" ${click}>${id}</div>`;
        }
        layout.innerHTML += html + `</div></div>`;
    });
}

function selectThisSeat(id, el) {
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSeat = id;
}

function setPlan(p, m, el) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    currentPrice = p;
    currentMonths = m;
    document.getElementById('priceText').innerText = p;
    updateInfo();
}

function updateInfo() {
    const start = new Date(document.getElementById('startDate').value);
    const end = new Date(start);
    end.setDate(start.getDate() + (currentMonths * 30));
    expiryDate = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('validityInfo').innerText = `Expires on: ${expiryDate}`;
}

function handlePay() {
    if(!selectedSeat) { alert("Select a seat first!"); return; }

    const options = {
        "key": "rzp_test_SQHamHN8vRebZO",
        "amount": currentPrice * 100,
        "name": "JAG HARI LIBRARY",
        "handler": function (response){
            // Save seat locally
            let bookings = JSON.parse(localStorage.getItem('lib_bookings')) || {};
            bookings[selectedSeat] = { name: document.getElementById('userName').value, expiry: expiryDate };
            localStorage.setItem('lib_bookings', JSON.stringify(bookings));

            showReceipt(response.razorpay_payment_id);
        },
        "theme": { "color": "#1a237e" }
    };
    new Razorpay(options).open();
}

function showReceipt(id) {
    document.getElementById('receiptModal').style.display = 'flex';
    document.getElementById('rName').innerText = document.getElementById('userName').value;
    document.getElementById('rSeat').innerText = selectedSeat;
    document.getElementById('rPlan').innerText = currentMonths + " Month(s)";
    document.getElementById('rAmt').innerText = currentPrice;
    document.getElementById('rExpiry').innerText = expiryDate;
    document.getElementById('rID').innerText = id;
}

