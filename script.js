// 1. DATABASE CONFIG (Replace with your Firebase details)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let selectedSeat = null;
let currentPrice = 599;
let selectedMonths = 1;
let expiryDateString = "";

// 2. LOAD SEATS ON START
window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    loadLibrary();
};

function loadLibrary() {
    const layout = document.getElementById('libraryLayout');
    layout.innerHTML = "";
    database.ref('bookedSeats').once('value', (snapshot) => {
        const booked = snapshot.val() || {};
        ['A', 'B', 'C', 'D', 'E'].forEach(sec => {
            let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
            for(let i=1; i<=14; i++) {
                if(i === 8) html += `<div class="aisle"></div>`;
                let id = `${sec}${i}`;
                let isTaken = booked[id] ? "occupied" : "";
                let click = booked[id] ? "" : `onclick="selectSeat('${id}', this)"`;
                html += `<div class="seat ${isTaken}" id="seat-${id}" ${click}>${id}</div>`;
            }
            layout.innerHTML += html + `</div></div>`;
        });
    });
}

// 3. SELECTION LOGIC
function selectSeat(id, el) {
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSeat = id;
}

function selectPlan(price, months, el) {
    document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentPrice = price;
    selectedMonths = months;
    document.getElementById('displayPrice').innerText = price;
    calculateExpiry();
}

function calculateExpiry() {
    const startVal = document.getElementById('startDate').value;
    if(!startVal) return;
    const start = new Date(startVal);
    const end = new Date(start);
    end.setDate(start.getDate() + (selectedMonths * 30));
    expiryDateString = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('validityInfo').innerText = `Membership Valid Till: ${expiryDateString}`;
}

function showBooking() {
    const name = document.getElementById('userName').value;
    if(!name || name.trim() === "") return alert("Please enter Student Name");
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
    calculateExpiry();
}

// 4. PAYMENT & FIREBASE SAVE
function payNow() {
    if(!selectedSeat) return alert("Please select a seat first!");
    
    const options = {
        "key": "rzp_test_SQHamHN8vRebZO", // Your Test Key
        "amount": currentPrice * 100,
        "currency": "INR",
        "name": "JAG HARI LIBRARY",
        "description": "Booking Seat " + selectedSeat,
        "handler": function (response){
            // Save to Firebase Database
            database.ref('bookedSeats/' + selectedSeat).set({
                studentName: document.getElementById('userName').value,
                expiry: expiryDateString,
                paymentID: response.razorpay_payment_id
            }).then(() => {
                showReceipt(response.razorpay_payment_id);
            });
        },
        "prefill": {
            "name": document.getElementById('userName').value,
            "contact": document.getElementById('userMobile').value
        },
        "theme": { "color": "#1a237e" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
}

// 5. RECEIPT MODAL
function showReceipt(payID) {
    document.getElementById('receiptModal').classList.remove('hidden');
    document.getElementById('rID').innerText = payID;
    document.getElementById('rSeat').innerText = selectedSeat;
    document.getElementById('rAmt').innerText = currentPrice;
    document.getElementById('rName').innerText = document.getElementById('userName').value;
    document.getElementById('rMobile').innerText = document.getElementById('userMobile').value;
    document.getElementById('rPlan').innerText = selectedMonths + " Month(s)";
    document.getElementById('rExpiry').innerText = expiryDateString;
}

