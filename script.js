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

    let percent = 0;
    if (budget > 0) percent = Math.floor((spent / budget) * 100);
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
    localStorage.setItem("currentPeriod", period);

    document.getElementById("currentPeriodText").innerText =
        period == 1 ? "Current period: Days 1 - 10" :
        period == 2 ? "Current period: Days 11 - 20" :
                      "Current period: Days 21 - 30";

    document.querySelectorAll(".period").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".period")[period - 1].classList.add("active");
}

/* =========================
   Add Expense
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
    let periodBudget = Math.floor(budget / 3);
    if (periodBudget <= 0) periodBudget = 1;

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

    let expenses = JSON.parse(localStorage.getItem("expenses"));
    expenses.push({
        amount: expense,
        period: period,
        date: new Date().toISOString()
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
    let periodBudget = Math.floor(budget / 3);
    if (periodBudget <= 0) periodBudget = 1;

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
    if (percent < 0) percent = 0;

    bar.style.width = percent + "%";
    bar.innerText = percent + "%";
    bar.style.background = percent < 70 ? "green" : percent < 90 ? "orange" : "red";
}

/* =========================
   Period Details
   ========================= */
function openPeriodDetails(period) {
    localStorage.setItem("currentPeriod", period);
    window.location.href = "period.html";
}

function loadPeriodDetails() {
    let period = localStorage.getItem("currentPeriod");
    let budget = Number(localStorage.getItem("monthlyBudget"));
    let periodBudget = Math.floor(budget / 3);
    if (periodBudget <= 0) periodBudget = 1;

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
   Period Expense List
   ========================= */
function renderPeriodExpenseList() {
    let list = document.getElementById("periodExpenseList");
    list.innerHTML = "";

    let period = localStorage.getItem("currentPeriod");
    let expenses = JSON.parse(localStorage.getItem("expenses"));

    let filtered = expenses
        .filter(e => e.period == period)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        list.innerHTML = "<li>No expenses recorded</li>";
        return;
    }

    filtered.forEach(e => {
        let li = document.createElement("li");
        li.innerText = "💰 " + e.amount + " | 📅 " + e.date.split("T")[0];
        list.appendChild(li);
    });
}

/* =========================
   Export CSV
   ========================= */
function exportPeriodExpenses() {
    let period = localStorage.getItem("currentPeriod");
    let expenses = JSON.parse(localStorage.getItem("expenses"))
        .filter(e => e.period == period);

    if (expenses.length === 0) {
        alert("No expenses to export");
        return;
    }

    let csv = "Amount,Date\n";
    expenses.forEach(e => {
        csv += `${e.amount},${e.date.split("T")[0]}\n`;
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
