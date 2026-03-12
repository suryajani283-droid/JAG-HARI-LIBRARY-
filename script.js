// FIREBASE CONFIG - REPLACE WITH YOUR ACTUAL KEYS
const firebaseConfig = {
    apiKey: "YOUR_KEY",
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

// THIS IS THE BUTTON FUNCTION
function showBooking() {
    const name = document.getElementById('userName').value.trim();
    if(!name) {
        alert("Please enter Student Name!");
        return;
    }
    // Switch visibility using direct style (more reliable than classes)
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('bookingSection').style.display = 'block';
    
    loadLibrary(); // Load seats now
    calculateExpiry();
    window.scrollTo(0, 0);
}

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
                let action = booked[id] ? "" : `onclick="selectMySeat('${id}', this)"`;
                html += `<div class="seat ${status}" id="seat-${id}" ${action}>${id}</div>`;
            }
            layout.innerHTML += html + `</div></div>`;
        });
    });
}

function selectMySeat(id, el) {
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
    const dateInput = document.getElementById('startDate');
    if(!dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    const start = new Date(dateInput.value);
    const end = new Date(start);
    end.setDate(start.getDate() + (selectedMonths * 30));
    expiryDateString = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('validityInfo').innerText = `Membership Valid Till: ${expiryDateString}`;
}

function payNow() {
    if(!selectedSeat) { alert("Please select a seat!"); return; }
    const options = {
        "key": "rzp_test_SQHamHN8vRebZO",
        "amount": currentPrice * 100,
        "name": "JAG HARI LIBRARY",
        "handler": function (response){
            database.ref('bookedSeats/' + selectedSeat).set({
                student: document.getElementById('userName').value,
                expiry: expiryDateString,
                payID: response.razorpay_payment_id
            }).then(() => {
                const modal = document.getElementById('receiptModal');
                modal.style.display = 'flex';
                document.getElementById('rName').innerText = document.getElementById('userName').value;
                document.getElementById('rSeat').innerText = selectedSeat;
                document.getElementById('rAmt').innerText = currentPrice;
                document.getElementById('rPlan').innerText = selectedMonths + " Month(s)";
                document.getElementById('rExpiry').innerText = expiryDateString;
                document.getElementById('rID').innerText = response.razorpay_payment_id;
            });
        },
        "theme": { "color": "#1a237e" }
    };
    new Razorpay(options).open();
}

