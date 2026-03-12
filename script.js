// JAG HARI LIBRARY - Official Script
let selectedSeat = null;
let currentPrice = 599; // Default price for 1 month

// 1. Generate 5 Sections with 14 seats each (7+7)
const layoutDiv = document.getElementById('libraryLayout');
const sections = ['A', 'B', 'C', 'D', 'E'];

if (layoutDiv) {
    sections.forEach(sec => {
        let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
        // Top 7 seats
        for(let i=1; i<=7; i++) {
            html += `<div class="seat" data-id="${sec}${i}" onclick="selectSeat('${sec}${i}', this)">${sec}${i}</div>`;
        }
        html += `<div class="aisle"></div>`; // Mirror gap
        // Bottom 7 seats
        for(let i=8; i<=14; i++) {
            html += `<div class="seat" data-id="${sec}${i}" onclick="selectSeat('${sec}${i}', this)">${sec}${i}</div>`;
        }
        html += `</div></div>`;
        layoutDiv.innerHTML += html;
    });
}

// 2. Handle Seat Selection
function selectSeat(id, el) {
    // Remove selected class from all seats
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    // Add to clicked seat
    el.classList.add('selected');
    selectedSeat = id;
    console.log("Selected Seat:", selectedSeat);
}

// 3. Handle Plan Selection
function selectPlan(price, el) {
    document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentPrice = price;
    document.getElementById('displayPrice').innerText = price;
    console.log("Selected Price:", currentPrice);
}

// 4. Show Booking Section
function showBooking() {
    const name = document.getElementById('userName').value;
    if(name.trim() === "") {
        alert("Please enter your name to continue.");
        return;
    }
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
}

// 5. Razorpay Payment Integration
function payNow() {
    if(!selectedSeat) {
        alert("Please select a seat in the library layout first!");
        return;
    }

    const userName = document.getElementById('userName').value;
    const userMobile = document.getElementById('userMobile').value;

    const options = {
        "key": "rzp_test_SQHamHN8vRebZO", // Your provided Key ID
        "amount": parseInt(currentPrice) * 100, // Amount in paise
        "currency": "INR",
        "name": "JAG HARI LIBRARY",
        "description": "Seat Booking: " + selectedSeat,
        "image": "https://cdn-icons-png.flaticon.com/512/2232/2232688.png", // Placeholder Logo
        "handler": function (response){
            // Success Callback
            showReceipt(response.razorpay_payment_id);
        },
        "prefill": {
            "name": userName,
            "contact": userMobile
        },
        "theme": {
            "color": "#1a237e"
        },
        "modal": {
            "ondismiss": function(){
                console.log('Checkout form closed');
            }
        }
    };

    const rzp1 = new Razorpay(options);
    
    rzp1.on('payment.failed', function (response){
        alert("Payment Failed! Error: " + response.error.description);
        console.error("Payment Error Details:", response.error);
    });

    rzp1.open();
}

// 6. Final Receipt display
function showReceipt(payID) {
    document.getElementById('receiptModal').classList.remove('hidden');
    document.getElementById('rID').innerText = payID;
    document.getElementById('rSeat').innerText = selectedSeat;
    document.getElementById('rAmt').innerText = currentPrice;
}

