// 1. FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
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

// 2. ON LOAD
window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    loadLibrary(); // Prefetch seat data
};

// 3. LOGIN BUTTON FIX
function showBooking() {
    const name = document.getElementById('userName').value.trim();
    if(!name) { alert("Please enter your name!"); return; }
    
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
    
    calculateExpiry();
    window.scrollTo(0,0);
}

// 4. SEAT GENERATION
function loadLibrary() {
    const layout = document.getElementById('libraryLayout');
    database.ref('bookedSeats').on('value', (snapshot) => {
        const booked = snapshot.val() || {};
        layout.innerHTML = "";
        
        ['A', 'B', 'C', 'D', 'E'].forEach(sec => {
            let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
            for(let i=1; i<=14; i++) {
                if(i === 8) html += `<div class="aisle"></div>`;
                let id = `${sec}${i}`;
                let status = booked[id] ? "occupied" : "";
                let action = booked[id] ? "" : `onclick="markSeat('${id}', this)"`;
                html += `<div class="seat ${status}" id="seat-${id}" ${action}>${id}</div>`;
            }
            layout.innerHTML += html + `</div></div>`;
        });
    });
}

// 5. SEAT SELECTION FIX
function markSeat(id, el) {
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
    const start = new Date(document.getElementById('startDate').value);
    const end = new Date(start);
    end.setDate(start.getDate() + (selectedMonths * 30));
    expiryDateString = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('validityInfo').innerText = `Valid Till: ${expiryDateString}`;
}

// 6. PAYMENT
function payNow() {
    if(!selectedSeat) { alert("Please select a seat!"); return; }

    const options = {
        "key": "rzp_test_SQHamHN8vRebZO",
        "amount": currentPrice * 100,
        "currency": "INR",
        "name": "JAG HARI LIBRARY",
        "handler": function (response){
            database.ref('bookedSeats/' + selectedSeat).set({
                student: document.getElementById('userName').value,
                expiry: expiryDateString,
                payID: response.razorpay_payment_id
            }).then(() => {
                showFinalReceipt(response.razorpay_payment_id);
            });
        },
        "prefill": { "name": document.getElementById('userName').value },
        "theme": { "color": "#1a237e" }
    };
    new Razorpay(options).open();
}

function showFinalReceipt(id) {
    const modal = document.getElementById('receiptModal');
    modal.style.display = 'flex';
    document.getElementById('rID').innerText = id;
    document.getElementById('rSeat').innerText = selectedSeat;
    document.getElementById('rAmt').innerText = currentPrice;
    document.getElementById('rName').innerText = document.getElementById('userName').value;
    document.getElementById('rMobile').innerText = document.getElementById('userMobile').value;
    document.getElementById('rPlan').innerText = selectedMonths + " Month(s)";
    document.getElementById('rExpiry').innerText = expiryDateString;
}

