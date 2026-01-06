/* =========================
   Save Budget
   ========================= */
function saveBudget() {
    let budget = Math.floor(Number(document.getElementById("budgetInput").value));

    if (!budget || budget <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    localStorage.setItem("monthlyBudget", budget);
    localStorage.setItem("spent", 0);
    localStorage.setItem("period1Spent", 0);
    localStorage.setItem("period2Spent", 0);
    localStorage.setItem("period3Spent", 0);
    localStorage.setItem("expenses", JSON.stringify([]));
    localStorage.removeItem("currentPeriod");

    window.location.href = "dashboard.html";
}

/* =========================
   Dashboard
   ========================= */
function loadDashboard() {
    let budget = Number(localStorage.getItem("monthlyBudget")) || 0;
    let spent = Number(localStorage.getItem("spent")) || 0;

    let remaining = budget - spent;
    if (remaining < 0) remaining = 0;

    document.getElementById("totalBudget").innerText = "💼 Budget: " + budget;
    document.getElementById("spentAmount").innerText = "💸 Spent: " + spent;
    document.getElementById("remainingAmount").innerText = "💰 Remaining: " + remaining;

    let percent = budget > 0 ? Math.floor((spent / budget) * 100) : 0;
    if (percent > 100) percent = 100;

    let bar = document.getElementById("progressBar");
    bar.style.width = percent + "%";
    bar.innerText = percent + "%";
    bar.style.background = percent < 70 ? "green" : percent < 90 ? "orange" : "red";

    updatePeriodBars();
}

/* =========================
   Select Period
   ========================= */
function selectPeriod(period) {
    localStorage.setItem("currentPeriod", String(period));

    document.getElementById("currentPeriodText").innerText =
        period == 1 ? "Current period: Days 1 - 10" :
        period == 2 ? "Current period: Days 11 - 20" :
                      "Current period: Days 21 - 30";

    document.querySelectorAll(".period").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".period")[period - 1].classList.add("active");
}

/* =========================
   FIX for Details (used with <a>)
   ========================= */
function setPeriod(period) {
    localStorage.setItem("currentPeriod", String(period));
}

/* =========================
   Add Expense (DATE + TIME)
   ========================= */
function addExpense() {
    let expense = Math.floor(Number(document.getElementById("expenseInput").value));
    let period = localStorage.getItem("currentPeriod");

    if (!period) {
        alert("Please select a period first");
        return;
    }

    if (!expense || expense <= 0) {
        alert("Please enter a valid expense amount");
        return;
    }

    let budget = Number(localStorage.getItem("monthlyBudget"));
    let periodBudget = Math.floor(budget / 3) || 1;

    let key = "period" + period + "Spent";
    let periodSpent = Number(localStorage.getItem(key)) || 0;

    let newTotal = periodSpent + expense;
    let percent = Math.floor((newTotal / periodBudget) * 100);

    if (percent >= 95) {
        alert("❌ You have exceeded this period's budget");
        return;
    }

    localStorage.setItem(key, newTotal);
    localStorage.setItem("spent", Number(localStorage.getItem("spent")) + expense);

    let now = new Date();
    let date = now.toLocaleDateString("en-GB");
    let time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push({
        amount: expense,
        period: period,
        date: date,
        time: time
    });

    localStorage.setItem("expenses", JSON.stringify(expenses));
    document.getElementById("expenseInput").value = "";

    loadDashboard();
}

/* =========================
   Period Progress Bars
   ========================= */
function updatePeriodBars() {
    let budget = Number(localStorage.getItem("monthlyBudget"));
    let periodBudget = Math.floor(budget / 3) || 1;

    updateSingleBar("p1Bar", localStorage.getItem("period1Spent"), periodBudget);
    updateSingleBar("p2Bar", localStorage.getItem("period2Spent"), periodBudget);
    updateSingleBar("p3Bar", localStorage.getItem("period3Spent"), periodBudget);
}

function updateSingleBar(id, spent, budget) {
    let bar = document.getElementById(id);
    if (!bar) return;

    spent = Number(spent) || 0;
    let percent = Math.floor((spent / budget) * 100);
    if (percent > 100) percent = 100;

    bar.style.width = percent + "%";
    bar.innerText = percent + "%";
    bar.style.background = percent < 70 ? "green" : percent < 90 ? "orange" : "red";
}

/* =========================
   Period Details (SAFE)
   ========================= */
function loadPeriodDetails() {
    let period = localStorage.getItem("currentPeriod");
    if (!period) {
        window.location.href = "dashboard.html";
        return;
    }

    let budget = Number(localStorage.getItem("monthlyBudget"));
    let periodBudget = Math.floor(budget / 3) || 1;

    let spent = Number(localStorage.getItem("period" + period + "Spent")) || 0;
    let remaining = periodBudget - spent;
    if (remaining < 0) remaining = 0;

    document.getElementById("periodTitle").innerText =
        period == 1 ? "Days 1 - 10" :
        period == 2 ? "Days 11 - 20" :
                      "Days 21 - 30";

    document.getElementById("periodBudget").innerText = "Budget: " + periodBudget;
    document.getElementById("periodSpent").innerText = "Spent: " + spent;
    document.getElementById("periodRemaining").innerText = "Remaining: " + remaining;

    let percent = Math.floor((spent / periodBudget) * 100);
    if (percent > 100) percent = 100;

    let bar = document.getElementById("periodBar");
    bar.style.width = percent + "%";
    bar.innerText = percent + "%";
    bar.style.background = percent < 70 ? "green" : percent < 90 ? "orange" : "red";

    renderPeriodExpenseList();
}

/* =========================
   Period Expense List (DATE + TIME)
   ========================= */
function renderPeriodExpenseList() {
    let list = document.getElementById("periodExpenseList");
    list.innerHTML = "";

    let period = localStorage.getItem("currentPeriod");
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let filtered = expenses.filter(e => e.period == period);

    if (filtered.length === 0) {
        list.innerHTML = "<li>No expenses recorded</li>";
        return;
    }

    filtered.forEach(e => {
        let li = document.createElement("li");
        li.innerText = `💰 ${e.amount} | 📅 ${e.date} | ⏰ ${e.time}`;
        list.appendChild(li);
    });
}

/* =========================
   Export CSV (DATE + TIME)
   ========================= */
function exportPeriodExpenses() {
    let period = localStorage.getItem("currentPeriod");
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let filtered = expenses.filter(e => e.period == period);

    if (filtered.length === 0) {
        alert("No expenses to export");
        return;
    }

    let csv = "Amount,Date,Time\n";
    filtered.forEach(e => {
        csv += `${e.amount},${e.date},${e.time}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "period_expenses.csv";
    a.click();
}

/* =========================
   Back
   ========================= */
function goBack() {
    window.location.href = "dashboard.html";
}
