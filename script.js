let selectedSeat = null;
let currentPrice = 599;

// Generate 5 Sections with 14 seats each (7+7)
const layoutDiv = document.getElementById('libraryLayout');
const sections = ['A', 'B', 'C', 'D', 'E'];

sections.forEach(sec => {
    let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
    // Top 7
    for(let i=1; i<=7; i++) {
        html += `<div class="seat" onclick="selectSeat('${sec}${i}', this)">${sec}${i}</div>`;
    }
    html += `<div class="aisle"></div>`; // Mirror gap
    // Bottom 7
    for(let i=8; i<=14; i++) {
        html += `<div class="seat" onclick="selectSeat('${sec}${i}', this)">${sec}${i}</div>`;
    }
    html += `</div></div>`;
    layoutDiv.innerHTML += html;
});

function showBooking() {
    if(document.getElementById('userName').value === "") return alert("Enter Name");
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
}

function selectSeat(id, el) {
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSeat = id;
}

function selectPlan(price, el) {
    document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentPrice = price;
    document.getElementById('displayPrice').innerText = price;
}

function payNow() {
    if(!selectedSeat) return alert("Please select a seat!");

    var options = {
        "key": "YOUR_RAZORPAY_KEY", // Get from Razorpay Dashboard
        "amount": currentPrice * 100,
        "currency": "INR",
        "name": "JAG HARI LIBRARY",
        "description": "Booking for Seat " + selectedSeat,
        "handler": function (response){
            showReceipt(response.razorpay_payment_id);
        },
        "prefill": {
            "name": document.getElementById('userName').value,
            "contact": document.getElementById('userMobile').value
        },
        "theme": { "color": "#1a237e" }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function showReceipt(payID) {
    document.getElementById('receiptModal').classList.remove('hidden');
    document.getElementById('rID').innerText = payID;
    document.getElementById('rSeat').innerText = selectedSeat;
    document.getElementById('rAmt').innerText = currentPrice;
}
