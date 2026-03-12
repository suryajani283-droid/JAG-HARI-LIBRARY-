// JAG HARI LIBRARY - Official Script
let selectedSeat = null;
let currentPrice = 599; 

// 1. Generate 5 Sections with 14 seats each (7+7)
const layoutDiv = document.getElementById('libraryLayout');
const sections = ['A', 'B', 'C', 'D', 'E'];

if (layoutDiv) {
    layoutDiv.innerHTML = ""; // Clear existing to prevent duplicates
    sections.forEach(sec => {
        let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
        for(let i=1; i<=14; i++) {
            if(i === 8) html += `<div class="aisle"></div>`; 
            html += `<div class="seat" id="seat-${sec}${i}" onclick="selectSeat('${sec}${i}', this)">${sec}${i}</div>`;
        }
        html += `</div></div>`;
        layoutDiv.innerHTML += html;
    });
}

// 2. Handle Seat Selection
function selectSeat(id, el) {
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSeat = id;
}

// 3. Handle Plan Selection
function selectPlan(price, el) {
    document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentPrice = parseInt(price); // Ensure it's a number
    document.getElementById('displayPrice').innerText = price;
}

// 4. Navigation
function showBooking() {
    const name = document.getElementById('userName').value;
    if(!name || name.trim() === "") {
        alert("Please enter your name.");
        return;
    }
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
}

// 5. Razorpay Integration (Fixed & Robust)
function payNow() {
    // Check if Razorpay script is actually loaded
    if (typeof Razorpay === 'undefined') {
        alert("Razorpay SDK not loaded. Please check your internet or index.html script tag.");
        return;
    }

    if(!selectedSeat) {
        alert("Please select a seat first!");
        return;
    }

    const userName = document.getElementById('userName').value;
    const userMobile = document.getElementById('userMobile').value;

    // Razorpay amount must be an integer in Paise (e.g. 59900)
    const totalAmountPaise = Math.round(currentPrice * 100);

    const options = {
        "key": "rzp_test_SQHamHN8vRebZO", 
        "amount": totalAmountPaise, 
        "currency": "INR",
        "name": "JAG HARI LIBRARY",
        "description": "Library Seat: " + selectedSeat,
        "image": "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
        "handler": function (response){
            console.log("Payment Success ID:", response.razorpay_payment_id);
            showReceipt(response.razorpay_payment_id);
        },
        "prefill": {
            "name": userName,
            "contact": userMobile
        },
        "theme": { "color": "#1a237e" },
        "modal": {
            "ondismiss": function(){ console.log('Checkout closed'); }
        }
    };

    try {
        const rzp1 = new Razorpay(options);
        
        rzp1.on('payment.failed', function (response){
            console.error("Reason:", response.error.reason);
            alert("Payment Failed: " + response.error.description);
        });

        rzp1.open();
    } catch (err) {
        console.error("Razorpay Open Error:", err);
        alert("Could not open Razorpay. Check console for details.");
    }
}

// 6. Receipt Display
function showReceipt(payID) {
    const modal = document.getElementById('receiptModal');
    if(modal) {
        modal.classList.remove('hidden');
        document.getElementById('rID').innerText = payID;
        document.getElementById('rSeat').innerText = selectedSeat;
        document.getElementById('rAmt').innerText = currentPrice;
    }
}

