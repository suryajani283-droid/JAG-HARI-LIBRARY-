// 1. FIREBASE SETUP
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

let selectedSeatId = null;
let price = 599;
let months = 1;
let expiryDate = "";

// 2. PAGE NAVIGATION (The Registration Button Fix)
function goToBooking() {
    const nameInput = document.getElementById('userName').value.trim();
    if(!nameInput) {
        alert("Please enter Student Name to proceed.");
        return;
    }
    
    // Switch Screens
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('bookingSection').classList.remove('hidden');
    
    // Set default date and load seats
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    
    fetchSeats();
    updateExpiry();
    window.scrollTo(0,0);
}

// 3. SEAT LOGIC
function fetchSeats() {
    const layout = document.getElementById('libraryLayout');
    database.ref('bookedSeats').on('value', (snapshot) => {
        const booked = snapshot.val() || {};
        layout.innerHTML = "";
        
        ['A', 'B', 'C', 'D', 'E'].forEach(sec => {
            let html = `<div class="section-container"><h3>Section ${sec}</h3><div class="seat-grid">`;
            for(let i=1; i<=14; i++) {
                if(i === 8) html += `<div class="aisle"></div>`;
                let id = `${sec}${i}`;
                let isBooked = booked[id] ? "occupied" : "";
                let clickAction = booked[id] ? "" : `onclick="selectSeat('${id}', this)"`;
                html += `<div class="seat ${isBooked}" id="seat-${id}" ${clickAction}>${id}</div>`;
            }
            layout.innerHTML += html + `</div></div>`;
        });
    });
}

function selectSeat(id, element) {
    // Clear previous selection
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    // Select new seat
    element.classList.add('selected');
    selectedSeatId = id;
}

// 4. PLAN & DATE LOGIC
function setPlan(amt, duration, element) {
    document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('active'));
    element.classList.add('active');
    price = amt;
    months = duration;
    document.getElementById('displayPrice').innerText = amt;
    updateExpiry();
}

function updateExpiry() {
    const startVal = document.getElementById('startDate').value;
    if(!startVal) return;
    const start = new Date(startVal);
    const end = new Date(start);
    end.setDate(start.getDate() + (months * 30));
    expiryDate = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('validityInfo').innerText = `Valid Till: ${expiryDate}`;
}

// 5. PAYMENT & FIREBASE SAVE
function handlePayment() {
    if(!selectedSeatId) {
        alert("Please click on a seat to select it.");
        return;
    }

    const options = {
        "key": "rzp_test_SQHamHN8vRebZO", // Replace with your Live Key later
        "amount": price * 100,
        "currency": "INR",
        "name": "JAG HARI LIBRARY",
        "handler": function (response){
            // Save to Firebase
            database.ref('bookedSeats/' + selectedSeatId).set({
                student: document.getElementById('userName').value,
                expiry: expiryDate,
                payID: response.razorpay_payment_id
            }).then(() => {
                showReceipt(response.razorpay_payment_id);
            });
        },
        "theme": { "color": "#1a237e" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
}

function showReceipt(id) {
    const modal = document.getElementById('receiptModal');
    modal.style.display = 'flex';
    
    document.getElementById('rName').innerText = document.getElementById('userName').value;
    document.getElementById('rMobile').innerText = document.getElementById('userMobile').value;
    document.getElementById('rSeat').innerText = selectedSeatId;
    document.getElementById('rAmt').innerText = price;
    document.getElementById('rPlan').innerText = months + " Month(s)";
    document.getElementById('rExpiry').innerText = expiryDate;
    document.getElementById('rID').innerText = id;
}

