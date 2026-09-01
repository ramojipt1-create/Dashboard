// ==========================================
// DEFAULT SEED DATA (UPDATED FROM LATEST METRICS & CURRENT DATE)
// ==========================================

const getTodayStr = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

const DEFAULT_MANUAL_DATA = [
    { release: "11.5 Release", jira: 7, cases: 80, bugs: 3, sit: 80, bat: 80, regression: 350 },
    { release: "11.4 Release", jira: 8, cases: 100, bugs: 5, sit: 100, bat: 100, regression: 350 },
    { release: "11.3 and 11.2 Release", jira: 9, cases: 100, bugs: 4, sit: 100, bat: 100, regression: 350 },
    { release: "11.1 and 11.0 Release", jira: 12, cases: 130, bugs: 4, sit: 130, bat: 130, regression: 350 },
    { release: "10.9 Release", jira: 8, cases: 100, bugs: 2, sit: 100, bat: 100, regression: 350 },
    { release: "10.7 Release", jira: 6, cases: 50, bugs: 3, sit: 50, bat: 50, regression: 350 }
];

const DEFAULT_PERFORMANCE_DATA = [
    { 
        project: "Load Test_PST 1", 
        scripts: 10, 
        testData: 100, 
        dryRun: "Passed", 
        loadTests: 5, 
        reports: "Load Test_PST 1 Report: Completed. Response time under 200ms at peak load (500 virtual users). Zero failures recorded.",
        recommendations: ""
    },
    { 
        project: "Load Test_PST 2", 
        scripts: 10, 
        testData: 100, 
        dryRun: "Passed", 
        loadTests: 5, 
        reports: "Load Test_PST 2 API Load Report: Completed. CPU usage peaked at 85% with 200 concurrent requests/sec. Latency within SLA.",
        recommendations: ""
    },
    { 
        project: "Load Test_PST 3", 
        scripts: 10, 
        testData: 100, 
        dryRun: "Passed", 
        loadTests: 5, 
        reports: "Load Test_PST 3 Benchmark Report: Completed. Checked all 10 endpoints under load. Average latency: 150ms.",
        recommendations: ""
    },
    { 
        project: "Load Test_PST 4", 
        scripts: 5, 
        testData: 10000, 
        dryRun: "Passed", 
        loadTests: 3, 
        reports: "Load Test_PST 4 High Volume Report: Completed. Processed 10,000 data records under load.",
        recommendations: ""
    },
    { 
        project: "Load Test_PST 5", 
        scripts: 6, 
        testData: 10000, 
        dryRun: "Passed", 
        loadTests: 4, 
        reports: "Load Test_PST 5 Load Test Report: Completed with 10,000 dataset size.",
        recommendations: ""
    }
];

const DEFAULT_TARGETS_DATA = [
    { id: 1, title: "Complete automated API test suite for Release 11.5", category: "Automation", date: getTodayStr(7), completed: false },
    { id: 2, title: "Run scalability benchmark tests for Load Test_PST 4", category: "Performance", date: getTodayStr(14), completed: false },
    { id: 3, title: "Set up bug triage workflow with Jira webhooks", category: "Infrastructure", date: getTodayStr(-2), completed: true },
    { id: 4, title: "Review 11.5 Release regression results with stakeholders", category: "Manual", date: getTodayStr(0), completed: true }
];

// ==========================================
// APP STATE MANAGEMENT
// ==========================================

let state = {
    manual: DEFAULT_MANUAL_DATA,
    performance: DEFAULT_PERFORMANCE_DATA,
    targets: DEFAULT_TARGETS_DATA,
    theme: localStorage.getItem("qa_dashboard_theme") || "lightblue"
};

function saveState() {
    localStorage.setItem("qa_manual_data", JSON.stringify(state.manual));
    localStorage.setItem("qa_perf_data", JSON.stringify(state.performance));
    localStorage.setItem("qa_targets_data", JSON.stringify(state.targets));
    localStorage.setItem("qa_dashboard_theme", state.theme);
}

// ==========================================
// CHART INSTANCES
// ==========================================

let manualChartInstance = null;
let performanceChartInstance = null;

// ==========================================
// INITIALIZATION AND EVENT LISTENERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Icons
    lucide.createIcons();

    // 2. Set Up Date
    updateHeaderDate();
    setInterval(updateHeaderDate, 60000); // update every minute

    // 3. Initialize Theme
    applyTheme();

    // 4. Render All Panels
    renderAll();

    // 5. Setup Listeners
    setupTabNavigation();
    setupSubTabNavigation();
    setupThemeToggle();
    setupSearch();
    setupModals();
    setupForms();
    setupTargetsFilter();
    setupSidebarToggle();
});

// Update top bar date
function updateHeaderDate() {
    const dateSpan = document.getElementById("current-date-span");
    if (dateSpan) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateSpan.innerText = new Date().toLocaleDateString('en-US', options);
    }
}

// Apply Dark/Light/LightBlue theme variables
function applyTheme() {
    const body = document.body;
    body.classList.remove("dark-theme", "light-theme", "lightblue-theme");
    
    if (state.theme === "light") {
        body.classList.add("light-theme");
    } else if (state.theme === "dark") {
        body.classList.add("dark-theme");
    } else {
        body.classList.add("lightblue-theme");
    }
    
    // Update charts to match theme grid lines if rendered
    updateChartColors();
}

function setupSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("mobile-toggle");
    
    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });

        // Close sidebar clicking outside on mobile view
        document.addEventListener("click", (e) => {
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !toggle.contains(e.target) && 
                sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
            }
        });
    }
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            if (state.theme === "lightblue") state.theme = "dark";
            else if (state.theme === "dark") state.theme = "light";
            else state.theme = "lightblue";
            
            saveState();
            applyTheme();
        });
    }
}

// ==========================================
// NAVIGATION AND SEARCH
// ==========================================

function setupTabNavigation() {
    const navItems = document.querySelectorAll(".sidebar-menu li");
    const panels = document.querySelectorAll(".tab-panel");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = item.getAttribute("data-tab");

            // Update Nav active classes
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            // Show appropriate panel
            panels.forEach(panel => {
                panel.classList.remove("active");
                if (panel.id === `tab-${tabId}`) {
                    panel.classList.add("active");
                }
            });

            // If switching to overview, re-render charts for size responsiveness
            if (tabId === "overview") {
                renderCharts();
            }

            // Close sidebar on mobile after clicking item
            const sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.remove("active");
        });
    });

    // Overview Metric Tiles Quick Jumps
    const gotoLinks = document.querySelectorAll("[data-goto]");
    gotoLinks.forEach(link => {
        link.addEventListener("click", () => {
            const dest = link.getAttribute("data-goto");
            
            // Trigger matching menu click
            let targetNav;
            if (dest === "manual" || dest === "performance") {
                targetNav = document.querySelector('[data-tab="activities"]');
                // Switch subtab
                const subtabBtn = document.querySelector(`[data-subtab="${dest}"]`);
                if (subtabBtn) subtabBtn.click();
            } else {
                targetNav = document.querySelector(`[data-tab="${dest}"]`);
            }

            if (targetNav) targetNav.click();
        });
    });
}

function setupSubTabNavigation() {
    const subTabBtns = document.querySelectorAll(".sub-tab");
    const subPanels = document.querySelectorAll(".subtab-panel");

    subTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const subtabId = btn.getAttribute("data-subtab");

            subTabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            subPanels.forEach(panel => {
                panel.classList.remove("active");
                if (panel.id === `subtab-${subtabId}`) {
                    panel.classList.add("active");
                }
            });

            // Adjust Add button context
            const addBtnText = document.getElementById("add-btn-text");
            if (addBtnText) {
                addBtnText.innerText = subtabId === "manual" ? "Add Release" : "Add Project";
            }
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById("global-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            
            // Filter manual table rows
            const manualRows = document.querySelectorAll("#manual-table-body tr");
            manualRows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });

            // Filter performance table rows
            const perfRows = document.querySelectorAll("#performance-table-body tr");
            perfRows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });

            // Filter target checklist cards
            const targetCards = document.querySelectorAll(".target-todo-card");
            targetCards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(query) ? "" : "none";
            });
        });
    }
}

// ==========================================
// RENDER LOGIC
// ==========================================

function renderAll() {
    renderOverview();
    renderManualTable();
    renderPerformanceTable();
    renderTargets();
    renderCharts();
}

function renderOverview() {
    // 1. Manual Testing Card Calculation
    const manualReleasesCount = state.manual.length;
    const totalJira = state.manual.reduce((sum, item) => sum + parseInt(item.jira || 0), 0);
    const totalCases = state.manual.reduce((sum, item) => sum + parseInt(item.cases || 0), 0);
    const totalBugs = state.manual.reduce((sum, item) => sum + parseInt(item.bugs || 0), 0);
    const totalSit = state.manual.reduce((sum, item) => sum + parseInt(item.sit || 0), 0);
    const totalBat = state.manual.reduce((sum, item) => sum + parseInt(item.bat !== undefined ? item.bat : (item.pat || 0)), 0);
    const totalRegression = state.manual.reduce((sum, item) => sum + parseInt(item.regression || 0), 0);

    document.getElementById("manual-overview-title").innerText = `${manualReleasesCount} Release${manualReleasesCount !== 1 ? 's' : ''} Active`;
    document.getElementById("manual-total-jira").innerText = totalJira;
    document.getElementById("manual-total-cases").innerText = totalCases;
    document.getElementById("manual-total-bugs").innerText = totalBugs;
    document.getElementById("manual-total-sit").innerText = totalSit;
    document.getElementById("manual-total-bat").innerText = totalBat;
    document.getElementById("manual-total-regression").innerText = totalRegression;

    // 2. Performance Testing Card Calculation
    const perfProjectsCount = state.performance.length;
    const totalScripts = state.performance.reduce((sum, item) => sum + parseInt(item.scripts || 0), 0);
    const totalLoads = state.performance.reduce((sum, item) => sum + parseInt(item.loadTests || 0), 0);
    const passedDryRuns = state.performance.filter(item => item.dryRun === "Passed").length;
    const dryRunPercent = perfProjectsCount > 0 ? Math.round((passedDryRuns / perfProjectsCount) * 100) : 0;

    document.getElementById("performance-overview-title").innerText = `${perfProjectsCount} Project${perfProjectsCount !== 1 ? 's' : ''}`;
    document.getElementById("perf-total-scripts").innerText = totalScripts;
    document.getElementById("perf-total-loads").innerText = totalLoads;
    document.getElementById("perf-dry-percent").innerText = `${dryRunPercent}%`;

    const reportsReadyText = document.getElementById("perf-reports-status");
    if (perfProjectsCount > 0) {
        reportsReadyText.innerText = "Available";
        reportsReadyText.className = "text-success";
    } else {
        reportsReadyText.innerText = "None";
        reportsReadyText.className = "text-muted";
    }

    // 3. Targets Progress Card Calculation
    const totalTargets = state.targets.length;
    const completedTargets = state.targets.filter(t => t.completed).length;
    const targetPercent = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;
    
    document.getElementById("target-progress-bar").style.width = `${targetPercent}%`;
    document.getElementById("target-percent-text").innerText = `${targetPercent}% Completed`;
    document.getElementById("target-ratio-text").innerText = `${completedTargets} / ${totalTargets} Targets`;

    const nextMilestoneSpan = document.getElementById("target-next-milestone");
    const pendingTargets = state.targets.filter(t => !t.completed).sort((a,b) => new Date(a.date) - new Date(b.date));
    if (pendingTargets.length > 0) {
        nextMilestoneSpan.innerText = pendingTargets[0].title;
    } else {
        nextMilestoneSpan.innerText = "All targets completed!";
    }
}

function renderManualTable() {
    const tbody = document.getElementById("manual-table-body");
    tbody.innerHTML = "";

    if (state.manual.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="text-align: center; color: var(--text-muted); padding: 30px;">No manual testing activities recorded yet. Click "Add Record" to start.</td></tr>`;
        return;
    }

    state.manual.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="table-release-name">${escapeHTML(item.release)}</td>
            <td><span class="badge badge-info">${item.jira} Jiras</span></td>
            <td><strong>${item.cases}</strong></td>
            <td><span class="badge ${item.bugs > 0 ? 'badge-danger' : 'badge-success'}">${item.bugs} Bugs</span></td>
            <td>${item.sit !== undefined ? item.sit : item.cases}</td>
            <td>${item.bat !== undefined ? item.bat : (item.pat !== undefined ? item.pat : item.cases)}</td>
            <td>${item.regression}</td>
            <td class="actions-col">
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editManual(${index})" title="Edit release details">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteManual(${index})" title="Delete release record">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

function renderPerformanceTable() {
    const tbody = document.getElementById("performance-table-body");
    tbody.innerHTML = "";

    if (state.performance.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="text-align: center; color: var(--text-muted); padding: 30px;">No performance projects recorded yet. Click "Add Record" to start.</td></tr>`;
        return;
    }

    state.performance.forEach((item, index) => {
        let dryBadgeClass = "badge-info";
        if (item.dryRun === "Passed") dryBadgeClass = "badge-success";
        else if (item.dryRun === "Failed") dryBadgeClass = "badge-danger";
        else dryBadgeClass = "badge-warning";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="table-release-name">${escapeHTML(item.project)}</td>
            <td><strong>${item.scripts} APIs</strong></td>
            <td>${item.testData} records</td>
            <td><span class="badge ${dryBadgeClass}">${item.dryRun}</span></td>
            <td><span class="badge badge-info">${item.loadTests} Runs</span></td>
            <td>
                <span class="view-btn" onclick="viewReports(${index})">
                    <i data-lucide="file-text"></i> View Report
                </span>
            </td>
            <td>
                <span class="view-btn" onclick="viewRecommendations(${index})">
                    <i data-lucide="lightbulb"></i> Recommendations
                </span>
            </td>
            <td class="actions-col">
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editPerformance(${index})" title="Edit project details">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletePerformance(${index})" title="Delete project record">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

let activeTargetFilter = "all";

function setupTargetsFilter() {
    const filterChips = document.querySelectorAll(".filter-chip");
    filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activeTargetFilter = chip.getAttribute("data-filter");
            renderTargets();
        });
    });
}

function renderTargets() {
    const targetsList = document.getElementById("targets-list-element");
    targetsList.innerHTML = "";

    let filteredTargets = state.targets;
    if (activeTargetFilter === "pending") {
        filteredTargets = state.targets.filter(t => !t.completed);
    } else if (activeTargetFilter === "completed") {
        filteredTargets = state.targets.filter(t => t.completed);
    }

    if (filteredTargets.length === 0) {
        targetsList.innerHTML = `<div class="no-targets" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">No targets matching filter criteria.</div>`;
        return;
    }

    // Sort targets: uncompleted first, then completed. Next sorted by due date
    filteredTargets.sort((a,b) => {
        if (a.completed === b.completed) {
            return new Date(a.date) - new Date(b.date);
        }
        return a.completed ? 1 : -1;
    });

    filteredTargets.forEach(target => {
        let catBadgeClass = "badge-info";
        if (target.category === "Performance") catBadgeClass = "badge-success";
        else if (target.category === "Automation") catBadgeClass = "badge-info";
        else if (target.category === "Infrastructure") catBadgeClass = "badge-warning";
        else catBadgeClass = "badge-danger";

        const card = document.createElement("div");
        card.className = `target-todo-card ${target.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="target-card-top">
                <label class="checkbox-container">
                    <input type="checkbox" ${target.completed ? 'checked' : ''} onchange="toggleTarget(${target.id})">
                    <span class="checkmark"></span>
                </label>
                <span class="target-title-text">${escapeHTML(target.title)}</span>
            </div>
            <div class="target-card-meta">
                <span class="badge ${catBadgeClass}">${target.category}</span>
                <span class="target-date-badge">
                    <i data-lucide="clock"></i>
                    <span>${formatDate(target.date)}</span>
                </span>
                <span class="target-delete-btn" onclick="deleteTarget(${target.id})" title="Delete target">
                    <i data-lucide="trash-2"></i>
                </span>
            </div>
        `;
        targetsList.appendChild(card);
    });

    lucide.createIcons();
}

// ==========================================
// CHARTS LOGIC
// ==========================================

function renderCharts() {
    const isDark = state.theme === "dark";
    const textThemeColor = isDark ? "#a1a1aa" : "#71717a";
    const gridColor = isDark ? "rgba(63, 63, 70, 0.4)" : "rgba(228, 228, 231, 0.8)";
    
    // 1. Manual Testing Chart
    const manualCanvas = document.getElementById("manualChart");
    if (manualCanvas) {
        const labels = state.manual.map(m => m.release.replace("Release ", "R"));
        const testCasesData = state.manual.map(m => m.cases);
        const sitData = state.manual.map(m => m.sit !== undefined ? m.sit : m.cases);
        const batData = state.manual.map(m => m.bat !== undefined ? m.bat : (m.pat !== undefined ? m.pat : m.cases));
        const regressionData = state.manual.map(m => m.regression);
        const bugsData = state.manual.map(m => m.bugs * 10); // scale bugs for visualization

        if (manualChartInstance) {
            manualChartInstance.destroy();
        }

        manualChartInstance = new Chart(manualCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Test Cases',
                        data: testCasesData,
                        backgroundColor: 'rgba(99, 102, 241, 0.75)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'SIT Env',
                        data: sitData,
                        backgroundColor: 'rgba(59, 130, 246, 0.75)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'BAT Env',
                        data: batData,
                        backgroundColor: 'rgba(14, 165, 233, 0.75)',
                        borderColor: 'rgb(14, 165, 233)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Regression Run',
                        data: regressionData,
                        backgroundColor: 'rgba(139, 92, 246, 0.75)',
                        borderColor: 'rgb(139, 92, 246)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Bugs Identified (x10)',
                        data: bugsData,
                        backgroundColor: 'rgba(239, 68, 68, 0.75)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textThemeColor, font: { family: 'Inter', size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label.includes('(x10)')) {
                                    return `Bugs Identified: ${context.raw / 10}`;
                                }
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textThemeColor, font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textThemeColor, font: { family: 'Inter' } }
                    }
                }
            }
        });
    }

    // 2. Performance Testing Chart
    const perfCanvas = document.getElementById("performanceChart");
    if (perfCanvas) {
        const labels = state.performance.map(p => p.project);
        const scriptsData = state.performance.map(p => p.scripts);
        const testDataVal = state.performance.map(p => p.testData);
        const loadTestsData = state.performance.map(p => p.loadTests);

        if (performanceChartInstance) {
            performanceChartInstance.destroy();
        }

        performanceChartInstance = new Chart(perfCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Scripts / APIs',
                        data: scriptsData,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Test Data (scaled /10)',
                        data: testDataVal.map(d => d / 10),
                        backgroundColor: 'rgba(245, 158, 11, 0.75)',
                        borderColor: 'rgb(245, 158, 11)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Load Tests Run',
                        data: loadTestsData,
                        backgroundColor: 'rgba(6, 182, 212, 0.75)',
                        borderColor: 'rgb(6, 182, 212)',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textThemeColor, font: { family: 'Inter', size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label.includes('/10')) {
                                    return `Test Data Size: ${context.raw * 10}`;
                                }
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textThemeColor, font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textThemeColor, font: { family: 'Inter' } }
                    }
                }
            }
        });
    }
}

function updateChartColors() {
    if (manualChartInstance && performanceChartInstance) {
        renderCharts();
    }
}

// ==========================================
// ACTIONS AND MODALS
// ==========================================

function setupModals() {
    // Add record button setup
    const addBtn = document.getElementById("add-activity-btn");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            // Find which subtab is active
            const activeSubtab = document.querySelector(".sub-tab.active").getAttribute("data-subtab");
            
            if (activeSubtab === "manual") {
                openManualModal();
            } else {
                openPerformanceModal();
            }
        });
    }

    // Connect close triggers
    const closeBtns = document.querySelectorAll("[data-close]");
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetModal = document.getElementById(btn.getAttribute("data-close"));
            if (targetModal) targetModal.classList.remove("active");
        });
    });

    // Close modal clicking outside the container box
    const overlays = document.querySelectorAll(".modal-overlay");
    overlays.forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
            }
        });
    });

    // Close modal on escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            overlays.forEach(o => o.classList.remove("active"));
        }
    });
}

function openManualModal(editIndex = null) {
    const modal = document.getElementById("manual-modal");
    const title = document.getElementById("manual-modal-title");
    const form = document.getElementById("manual-form");
    
    // Reset Form
    form.reset();
    document.getElementById("manual-edit-index").value = "";

    if (editIndex !== null) {
        title.innerText = "Edit Manual Testing Activity";
        const item = state.manual[editIndex];
        
        document.getElementById("manual-edit-index").value = editIndex;
        document.getElementById("manual-release").value = item.release;
        document.getElementById("manual-jira").value = item.jira;
        document.getElementById("manual-cases").value = item.cases;
        document.getElementById("manual-bugs").value = item.bugs;
        document.getElementById("manual-sit").value = item.sit !== undefined ? item.sit : item.cases;
        document.getElementById("manual-bat").value = item.bat !== undefined ? item.bat : (item.pat !== undefined ? item.pat : item.cases);
        document.getElementById("manual-regression").value = item.regression;
    } else {
        title.innerText = "Add Manual Testing Activity";
    }

    modal.classList.add("active");
}

function openPerformanceModal(editIndex = null) {
    const modal = document.getElementById("performance-modal");
    const title = document.getElementById("performance-modal-title");
    const form = document.getElementById("performance-form");

    // Reset Form
    form.reset();
    document.getElementById("performance-edit-index").value = "";

    if (editIndex !== null) {
        title.innerText = "Edit Performance Testing Activity";
        const item = state.performance[editIndex];

        document.getElementById("performance-edit-index").value = editIndex;
        document.getElementById("perf-project").value = item.project;
        document.getElementById("perf-scripts").value = item.scripts;
        document.getElementById("perf-testdata").value = item.testData;
        document.getElementById("perf-dryrun").value = item.dryRun;
        document.getElementById("perf-loadtests").value = item.loadTests;
        document.getElementById("perf-reports").value = item.reports;
        document.getElementById("perf-recs").value = item.recommendations;
    } else {
        title.innerText = "Add Performance Testing Activity";
    }

    modal.classList.add("active");
}

function setupForms() {
    // 1. Manual Testing Activity Submit
    const manualForm = document.getElementById("manual-form");
    if (manualForm) {
        manualForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const editIndexVal = document.getElementById("manual-edit-index").value;
            const record = {
                release: document.getElementById("manual-release").value,
                jira: parseInt(document.getElementById("manual-jira").value),
                cases: parseInt(document.getElementById("manual-cases").value),
                bugs: parseInt(document.getElementById("manual-bugs").value),
                sit: parseInt(document.getElementById("manual-sit").value),
                bat: parseInt(document.getElementById("manual-bat").value),
                regression: parseInt(document.getElementById("manual-regression").value)
            };

            if (editIndexVal !== "") {
                state.manual[parseInt(editIndexVal)] = record;
            } else {
                state.manual.push(record);
            }

            saveState();
            renderAll();
            document.getElementById("manual-modal").classList.remove("active");
        });
    }

    // 2. Performance Testing Activity Submit
    const performanceForm = document.getElementById("performance-form");
    if (performanceForm) {
        performanceForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const editIndexVal = document.getElementById("performance-edit-index").value;
            const record = {
                project: document.getElementById("perf-project").value,
                scripts: parseInt(document.getElementById("perf-scripts").value),
                testData: parseInt(document.getElementById("perf-testdata").value),
                dryRun: document.getElementById("perf-dryrun").value,
                loadTests: parseInt(document.getElementById("perf-loadtests").value),
                reports: document.getElementById("perf-reports").value,
                recommendations: document.getElementById("perf-recs").value
            };

            if (editIndexVal !== "") {
                state.performance[parseInt(editIndexVal)] = record;
            } else {
                state.performance.push(record);
            }

            saveState();
            renderAll();
            document.getElementById("performance-modal").classList.remove("active");
        });
    }

    // 3. New Target Form Submit
    const targetForm = document.getElementById("new-target-form");
    if (targetForm) {
        targetForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const newTarget = {
                id: Date.now(),
                title: document.getElementById("target-title").value,
                category: document.getElementById("target-category").value,
                date: document.getElementById("target-date").value,
                completed: false
            };

            state.targets.push(newTarget);
            saveState();
            renderOverview();
            renderTargets();
            targetForm.reset();
        });
    }
}

// Global actions mapped to window for inline onclick handles
window.editManual = function(index) {
    openManualModal(index);
};

window.deleteManual = function(index) {
    if (confirm("Are you sure you want to delete this manual testing activity?")) {
        state.manual.splice(index, 1);
        saveState();
        renderAll();
    }
};

window.editPerformance = function(index) {
    openPerformanceModal(index);
};

window.deletePerformance = function(index) {
    if (confirm("Are you sure you want to delete this performance testing activity?")) {
        state.performance.splice(index, 1);
        saveState();
        renderAll();
    }
};

window.viewReports = function(index) {
    const item = state.performance[index];
    const content = `
        <div class="view-item">
            <h4>Performance Analysis for ${escapeHTML(item.project)}</h4>
            <p>${escapeHTML(item.reports).replace(/\n/g, '<br>')}</p>
            <br>
            <ul>
                <li><strong>Associated APIs/Scripts:</strong> ${item.scripts}</li>
                <li><strong>Generated Test Data Volume:</strong> ${item.testData} records</li>
                <li><strong>Dry Run Status:</strong> ${item.dryRun}</li>
                <li><strong>Total Load Iterations:</strong> ${item.loadTests}</li>
            </ul>
        </div>
    `;
    openViewerModal(`Reports: ${item.project}`, content);
};

window.viewRecommendations = function(index) {
    const item = state.performance[index];
    const rawRecs = (item.recommendations || "").trim();
    
    let content = "";
    if (rawRecs) {
        const recsHTML = escapeHTML(rawRecs)
            .replace(/\n/g, '<br>')
            .replace(/-\s+(.*?)(<br>|$)/g, '<li>$1</li>');

        content = `
            <div class="view-item">
                <h4>Optimizations for ${escapeHTML(item.project)}</h4>
                <p>Based on performance metrics under peak loads, the following updates are recommended:</p>
                <ul>
                    ${recsHTML.includes("<li>") ? recsHTML : `<li>${recsHTML}</li>`}
                </ul>
            </div>
        `;
    } else {
        content = `
            <div class="view-item" style="text-align: center; color: var(--text-muted); padding: 20px 0;">
                <p>No recommendations recorded for ${escapeHTML(item.project)} yet.</p>
            </div>
        `;
    }
    openViewerModal(`Recommendations: ${item.project}`, content);
};

function openViewerModal(title, bodyHTML) {
    document.getElementById("viewer-modal-title").innerText = title;
    document.getElementById("viewer-modal-content").innerHTML = bodyHTML;
    document.getElementById("viewer-modal").classList.add("active");
}

window.toggleTarget = function(id) {
    state.targets = state.targets.map(target => {
        if (target.id === id) {
            return { ...target, completed: !target.completed };
        }
        return target;
    });
    saveState();
    renderOverview();
    renderTargets();
};

window.deleteTarget = function(id) {
    if (confirm("Are you sure you want to delete this target?")) {
        state.targets = state.targets.filter(t => t.id !== id);
        saveState();
        renderOverview();
        renderTargets();
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options = { month: 'short', day: 'numeric', year: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}
