/* =========================
   حفظ الميزانية
   ========================= */
function saveBudget() {
    let budget = Math.floor(Number(document.getElementById("budgetInput").value));

    if (!budget || budget <= 0) {
        alert("من فضلك أدخل مبلغ صحيح");
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
   لوحة المتابعة
   ========================= */
function loadDashboard() {
    let budget = Number(localStorage.getItem("monthlyBudget")) || 0;
    let spent = Number(localStorage.getItem("spent")) || 0;

    let remaining = budget - spent;
    if (remaining < 0) remaining = 0;

    document.getElementById("totalBudget").innerText = "💼 الميزانية: " + budget;
    document.getElementById("spentAmount").innerText = "💸 المصروف: " + spent;
    document.getElementById("remainingAmount").innerText = "💰 المتبقي: " + remaining;

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
   اختيار فترة
   ========================= */
function selectPeriod(period) {
    localStorage.setItem("currentPeriod", period);

    document.getElementById("currentPeriodText").innerText =
        period == 1 ? "الفترة: 1 - 10" :
        period == 2 ? "الفترة: 11 - 20" :
                      "الفترة: 21 - 30";

    document.querySelectorAll(".period").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".period")[period - 1].classList.add("active");
}

/* =========================
   إضافة مصروف
   ========================= */
function addExpense() {
    let expense = Math.floor(Number(document.getElementById("expenseInput").value));
    let period = localStorage.getItem("currentPeriod");

    if (!period) {
        alert("اختر فترة أولاً");
        return;
    }

    if (!expense || expense <= 0) {
        alert("أدخل مبلغ صحيح");
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
        alert("❌ تجاوزت ميزانية هذه الفترة");
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
   أشرطة الفترات
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
   تفاصيل الفترة
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
        period == 1 ? "الأيام 1 - 10" :
        period == 2 ? "الأيام 11 - 20" :
                      "الأيام 21 - 30";

    document.getElementById("periodBudget").innerText = "الميزانية: " + periodBudget;
    document.getElementById("periodSpent").innerText = "المصروف: " + spent;
    document.getElementById("periodRemaining").innerText = "المتبقي: " + remaining;

    let percent = Math.floor((spent / periodBudget) * 100);
    if (percent > 100) percent = 100;

    let bar = document.getElementById("periodBar");
    bar.style.width = percent + "%";
    bar.innerText = percent + "%";
    bar.style.background = percent < 70 ? "green" : percent < 90 ? "orange" : "red";

    renderPeriodExpenseList();
}

/* =========================
   سجل الفترة
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
        list.innerHTML = "<li>لا توجد مصروفات</li>";
        return;
    }

    filtered.forEach(e => {
        let li = document.createElement("li");
        li.innerText = "💰 " + e.amount + " | 📅 " + e.date.split("T")[0];
        list.appendChild(li);
    });
}

/* =========================
   تصدير CSV
   ========================= */
function exportPeriodExpenses() {
    let period = localStorage.getItem("currentPeriod");
    let expenses = JSON.parse(localStorage.getItem("expenses"))
        .filter(e => e.period == period);

    if (expenses.length === 0) {
        alert("لا توجد مصروفات");
        return;
    }

    let csv = "المبلغ,التاريخ\n";
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
   رجوع
   ========================= */
function goBack() {
    window.location.href = "dashboard.html";
}