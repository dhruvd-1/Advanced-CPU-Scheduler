// Core JavaScript Functions for Advanced CPU Scheduler

// Global Variables
let processes = [];
let currentAlgorithm = null;
let timeQuantum = 2;
let isAnimating = false;
let animationStep = 0;
let animationData = [];
let animationSpeed = 500;
let simulationHistory = [];
let comparisonResults = [];

// Process Colors
const processColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

// Algorithm Descriptions
const algorithmDescriptions = {
    fcfs: {
        name: "First-Come, First-Served (FCFS)",
        desc: "Non-preemptive algorithm that processes jobs in the order they arrive. Simple implementation but can cause convoy effect when long processes block shorter ones."
    },
    sjf: {
        name: "Shortest Job First (SJF)",
        desc: "Non-preemptive algorithm that selects the process with the shortest burst time. Optimal for minimizing average waiting time but can cause starvation."
    },
    srtf: {
        name: "Shortest Remaining Time First (SRTF)",
        desc: "Preemptive version of SJF that can interrupt running processes when a shorter job arrives. Provides optimal average waiting time but requires more context switches."
    },
    rr: {
        name: "Round Robin (RR)",
        desc: "Preemptive algorithm where each process gets a fixed time slice (quantum). Provides fair CPU allocation and prevents starvation but may increase turnaround time."
    },
    priority_np: {
        name: "Priority Scheduling (Non-preemptive)",
        desc: "Non-preemptive algorithm that executes processes based on priority levels. Higher priority processes run first but can cause starvation of low-priority processes."
    },
    priority_p: {
        name: "Priority Scheduling (Preemptive)",
        desc: "Preemptive version that can interrupt running processes for higher priority arrivals. More responsive but generates higher overhead."
    }
};

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    setupEventListeners();
    loadSampleData();
});

function initializeApplication() {
    updateStatusText('System initialized - Select an algorithm to begin');
    updateMetricsDisplay({
        avgTurnaroundTime: 0,
        avgWaitingTime: 0,
        avgResponseTime: 0,
        cpuUtilization: 100
    });
    
    // Initialize AI components
    if (typeof initializeAIAdvisorTab === 'function') {
        setTimeout(() => {
            initializeAIAdvisorTab();
        }, 100);
    }
    
    // Initialize analytics
    if (typeof initializeAnalyticsTab === 'function') {
        setTimeout(() => {
            initializeAnalyticsTab();
        }, 100);
    }
    
    // Initialize charts
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
}

function initializeCharts() {
    // Initialize comparison chart if on comparison tab
    if (typeof initializeComparisonTab === 'function') {
        initializeComparisonTab();
    }
}

function setupEventListeners() {
    // Algorithm card selection
    document.querySelectorAll('.algo-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.algo-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            currentAlgorithm = this.dataset.algorithm;
            updateQuantumVisibility();
            updatePriorityVisibility();
            updateAlgorithmInfo();
            updateStatusText('Algorithm selected: ' + algorithmDescriptions[currentAlgorithm].name);
        });
    });

    // Time quantum change
    const quantumInput = document.getElementById('quantum');
    if (quantumInput) {
        quantumInput.addEventListener('change', function() {
            timeQuantum = parseInt(this.value);
            updateStatusText(`Time quantum set to ${timeQuantum} units`);
        });
    }

    // Animation speed control
    const speedControl = document.getElementById('speedControl');
    if (speedControl) {
        speedControl.addEventListener('input', function() {
            updateAnimationSpeed(this.value);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                visualize();
                break;
            case 'n':
                e.preventDefault();
                addProcess();
                break;
            case 'Backspace':
                e.preventDefault();
                removeProcess();
                break;
            case ' ':
                e.preventDefault();
                playAnimation();
                break;
        }
    }
}

// Tab Management
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    const clickedTab = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    const tabContent = document.getElementById(tabName + '-tab');
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Initialize tab-specific content with error handling
    setTimeout(() => {
        try {
            switch(tabName) {
                case 'comparison':
                    if (typeof initializeComparisonTab === 'function') {
                        initializeComparisonTab();
                    }
                    break;
                case 'analytics':
                    if (typeof initializeAnalyticsTab === 'function') {
                        initializeAnalyticsTab();
                    }
                    break;
                case 'ai-advisor':
                    if (typeof initializeAIAdvisorTab === 'function') {
                        initializeAIAdvisorTab();
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error initializing ${tabName} tab:`, error);
        }
    }, 100);
}

// Process Management
function addProcess() {
    const processInputs = document.getElementById('processInputs');
    const processCount = processInputs.querySelectorAll('.process-grid').length;
    const newProcess = document.createElement('div');
    newProcess.className = 'process-grid fade-in';
    
    const priorityDisplay = (currentAlgorithm === 'priority_np' || currentAlgorithm === 'priority_p') ? 'block' : 'none';
    
    newProcess.innerHTML = `
        <div>
            <label>Process ID</label>
            <input type="text" class="process-input" value="P${processCount + 1}">
        </div>
        <div>
            <label>Arrival</label>
            <input type="number" class="process-input" value="0" min="0">
        </div>
        <div>
            <label>Burst</label>
            <input type="number" class="process-input" value="${Math.floor(Math.random() * 8) + 1}" min="1">
        </div>
        <div class="priority-input" style="display: ${priorityDisplay};">
            <label>Priority</label>
            <input type="number" class="process-input" value="${Math.floor(Math.random() * 5) + 1}" min="1">
        </div>
    `;
    
    const btnGroup = processInputs.querySelector('.btn-group');
    processInputs.insertBefore(newProcess, btnGroup);
    updateStatusText(`Process P${processCount + 1} added`);
}

function removeProcess() {
    const processInputs = document.getElementById('processInputs');
    const processGrids = processInputs.querySelectorAll('.process-grid');
    if (processGrids.length > 1) {
        processInputs.removeChild(processGrids[processGrids.length - 1]);
        updateStatusText('Process removed');
    }
}

function generateRandomProcesses() {
    const processInputs = document.getElementById('processInputs');
    const btnGroup = processInputs.querySelector('.btn-group');
    
    // Clear existing processes
    processInputs.innerHTML = '';
    processInputs.appendChild(btnGroup);
    
    // Generate 4-6 random processes
    const numProcesses = Math.floor(Math.random() * 3) + 4;
    for (let i = 0; i < numProcesses; i++) {
        addProcess();
    }
    
    updateStatusText(`Generated ${numProcesses} random processes`);
}

function loadPreset() {
    const presets = [
        // CPU-bound workload
        [
            {id: 'P1', arrival: 0, burst: 8, priority: 2},
            {id: 'P2', arrival: 1, burst: 12, priority: 1},
            {id: 'P3', arrival: 2, burst: 4, priority: 3},
            {id: 'P4', arrival: 3, burst: 6, priority: 2}
        ],
        // Mixed workload
        [
            {id: 'P1', arrival: 0, burst: 3, priority: 1},
            {id: 'P2', arrival: 2, burst: 9, priority: 3},
            {id: 'P3', arrival: 4, burst: 2, priority: 2},
            {id: 'P4', arrival: 6, burst: 5, priority: 1},
            {id: 'P5', arrival: 8, burst: 1, priority: 4}
        ],
        // I/O intensive simulation
        [
            {id: 'P1', arrival: 0, burst: 2, priority: 1},
            {id: 'P2', arrival: 1, burst: 1, priority: 2},
            {id: 'P3', arrival: 2, burst: 3, priority: 1},
            {id: 'P4', arrival: 4, burst: 1, priority: 3},
            {id: 'P5', arrival: 5, burst: 2, priority: 2},
            {id: 'P6', arrival: 7, burst: 1, priority: 1}
        ]
    ];
    
    const selectedPreset = presets[Math.floor(Math.random() * presets.length)];
    
    // Clear existing processes
    const processInputs = document.getElementById('processInputs');
    const btnGroup = processInputs.querySelector('.btn-group');
    processInputs.innerHTML = '';
    processInputs.appendChild(btnGroup);
    
    // Load preset data
    selectedPreset.forEach((processData, index) => {
        addProcess();
        const processGrids = processInputs.querySelectorAll('.process-grid');
        const inputs = processGrids[index].querySelectorAll('input');
        
        inputs[0].value = processData.id;
        inputs[1].value = processData.arrival;
        inputs[2].value = processData.burst;
        if (inputs[3]) inputs[3].value = processData.priority;
    });
    
    updateStatusText('Preset workload loaded');
}

function clearAll() {
    // Clear process inputs
    const processInputs = document.getElementById('processInputs');
    const btnGroup = processInputs.querySelector('.btn-group');
    processInputs.innerHTML = `
        <div class="process-grid">
            <div>
                <label>Process ID</label>
                <input type="text" class="process-input" value="P1">
            </div>
            <div>
                <label>Arrival</label>
                <input type="number" class="process-input" value="0" min="0">
            </div>
            <div>
                <label>Burst</label>
                <input type="number" class="process-input" value="5" min="1">
            </div>
            <div class="priority-input" style="display: none;">
                <label>Priority</label>
                <input type="number" class="process-input" value="1" min="1">
            </div>
        </div>
    `;
    processInputs.appendChild(btnGroup);
    
    // Clear visualization
    document.getElementById('ganttTimeline').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-chart-gantt"></i>
            <p>Configure processes and run simulation</p>
        </div>
    `;
    document.getElementById('timeAxis').innerHTML = '';
    
    // Clear results table
    document.getElementById('resultsBody').innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <i class="fas fa-info-circle"></i>
                Run simulation to view detailed results
            </td>
        </tr>
    `;
    
    resetProgress();
    updateStatusText('All data cleared');
}

function loadSampleData() {
    setTimeout(() => {
        // Add sample processes
        addProcess();
        addProcess();
        addProcess();
        
        const processGrids = document.querySelectorAll('.process-grid');
        if (processGrids.length >= 4) {
            // Configure sample data
            const sampleData = [
                {arrival: 0, burst: 5},
                {arrival: 1, burst: 3},
                {arrival: 2, burst: 2},
                {arrival: 3, burst: 4}
            ];
            
            sampleData.forEach((data, index) => {
                if (processGrids[index]) {
                    const inputs = processGrids[index].querySelectorAll('input');
                    inputs[1].value = data.arrival;
                    inputs[2].value = data.burst;
                }
            });
        }
        
        updateStatusText('Sample data loaded - Select algorithm and click Run Simulation');
    }, 100);
}

// UI Update Functions
function updateQuantumVisibility() {
    const quantumGroup = document.getElementById('quantumGroup');
    if (quantumGroup) {
        quantumGroup.style.display = currentAlgorithm === 'rr' ? 'block' : 'none';
    }
}

function updatePriorityVisibility() {
    const priorityInputs = document.querySelectorAll('.priority-input');
    const showPriority = currentAlgorithm === 'priority_np' || currentAlgorithm === 'priority_p';
    priorityInputs.forEach(input => {
        input.style.display = showPriority ? 'block' : 'none';
    });
}

function updateAlgorithmInfo() {
    if (!currentAlgorithm) return;
    
    const info = algorithmDescriptions[currentAlgorithm];
    const algorithmInfo = document.getElementById('algorithmInfo');
    if (algorithmInfo) {
        algorithmInfo.innerHTML = `
            <div class="algo-info-name">${info.name}</div>
            <div class="algo-info-desc">${info.desc}</div>
        `;
    }
}

function updateStatusText(text) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = text;
    }
}

function updateAnimationSpeed(speed) {
    animationSpeed = 1100 - (speed * 100);
    updateStatusText(`Animation speed: ${speed}/10`);
}

function setProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressPercent) progressPercent.textContent = percent + '%';
}

function resetProgress() {
    setProgress(0);
}

// Data Collection and Validation
function collectProcesses() {
    const processGrids = document.querySelectorAll('.process-grid');
    processes = [];
    
    processGrids.forEach((grid, index) => {
        const inputs = grid.querySelectorAll('input');
        if (inputs.length >= 3) {
            processes.push({
                id: inputs[0].value || `P${index + 1}`,
                arrivalTime: parseInt(inputs[1].value) || 0,
                burstTime: parseInt(inputs[2].value) || 1,
                priority: inputs.length > 3 ? (parseInt(inputs[3].value) || 1) : 1,
                remainingTime: parseInt(inputs[2].value) || 1,
                completionTime: 0,
                turnaroundTime: 0,
                waitingTime: 0,
                responseTime: -1,
                startTime: -1
            });
        }
    });
}

function validateInput() {
    if (!currentAlgorithm) {
        showAlert('Please select a scheduling algorithm first.');
        updateStatusText('Please select an algorithm');
        return false;
    }

    const processGrids = document.querySelectorAll('.process-grid');
    let isValid = true;
    let errors = [];

    processGrids.forEach((grid, index) => {
        const inputs = grid.querySelectorAll('input');
        const processId = inputs[0].value.trim();
        const arrivalTime = parseInt(inputs[1].value);
        const burstTime = parseInt(inputs[2].value);

        if (!processId) {
            errors.push(`Process ${index + 1}: Process ID cannot be empty`);
            isValid = false;
        }

        if (isNaN(arrivalTime) || arrivalTime < 0) {
            errors.push(`Process ${index + 1}: Invalid arrival time`);
            isValid = false;
        }

        if (isNaN(burstTime) || burstTime <= 0) {
            errors.push(`Process ${index + 1}: Burst time must be positive`);
            isValid = false;
        }
    });

    if (!isValid) {
        showAlert('Input Validation Errors:\n\n' + errors.join('\n'));
        updateStatusText('Validation failed - Please fix input errors');
    }

    return isValid;
}

// Simulation Control
function visualize() {
    if (!validateInput()) return;
    
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please add at least one process.');
        return;
    }

    updateStatusText('Running ' + algorithmDescriptions[currentAlgorithm].name + ' simulation...');
    setProgress(10);

    setTimeout(() => {
        let schedule = runSchedulingAlgorithm();
        setProgress(60);
        
        setTimeout(() => {
            renderGanttChart(schedule);
            setProgress(80);
            
            setTimeout(() => {
                calculateAndDisplayStats();
                renderResultsTable();
                setProgress(100);
                updateStatusText('Simulation complete - Results ready');
                
                // Store results in history
                storeSimulationResult();
                
                setTimeout(() => {
                    resetProgress();
                }, 2000);
            }, 300);
        }, 300);
    }, 500);
}

function runSchedulingAlgorithm() {
    switch (currentAlgorithm) {
        case 'fcfs': return fcfsScheduling();
        case 'sjf': return sjfScheduling();
        case 'srtf': return srtfScheduling();
        case 'rr': return roundRobinScheduling();
        case 'priority_np': return prioritySchedulingNonPreemptive();
        case 'priority_p': return prioritySchedulingPreemptive();
        default: return [];
    }
}

function storeSimulationResult() {
    const result = {
        algorithm: currentAlgorithm,
        processes: JSON.parse(JSON.stringify(processes)),
        schedule: JSON.parse(JSON.stringify(animationData)),
        timestamp: new Date(),
        metrics: calculateMetrics()
    };
    
    simulationHistory.push(result);
    
    // Limit history to last 50 simulations
    if (simulationHistory.length > 50) {
        simulationHistory.shift();
    }
    
    // Update analytics if available
    if (typeof addToAnalytics === 'function') {
        addToAnalytics(currentAlgorithm, processes, result.metrics);
    }
}

function calculateMetrics() {
    const totalTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const totalWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalResponseTime = processes.reduce((sum, p) => sum + p.responseTime, 0);
    const processCount = processes.length;
    const maxCompletionTime = Math.max(...processes.map(p => p.completionTime));

    return {
        avgTurnaroundTime: (totalTurnaroundTime / processCount),
        avgWaitingTime: (totalWaitingTime / processCount),
        avgResponseTime: (totalResponseTime / processCount),
        cpuUtilization: 100,
        throughput: (processCount / maxCompletionTime),
        contextSwitches: animationData.length
    };
}

function updateMetricsDisplay(stats) {
    const metricCards = document.querySelectorAll('.metric-card');
    const values = [
        stats.avgTurnaroundTime.toFixed(2),
        stats.avgWaitingTime.toFixed(2),
        stats.avgResponseTime.toFixed(2),
        stats.cpuUtilization.toFixed(1) + '%'
    ];

    metricCards.forEach((card, index) => {
        if (index < values.length) {
            const valueElement = card.querySelector('.metric-value');
            if (valueElement) {
                valueElement.textContent = values[index];
                
                // Add animation
                valueElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    valueElement.style.transform = 'scale(1)';
                }, 200);
            }
        }
    });
}

function calculateAndDisplayStats() {
    const stats = calculateMetrics();
    updateMetricsDisplay(stats);
}

// Enhanced quantum optimization using simple heuristics
function optimizeQuantum() {
    collectProcesses();
    
    if (!processes || processes.length === 0) {
        showAlert('Please configure processes first.');
        return;
    }
    
    // Calculate optimal quantum based on burst times
    const avgBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0) / processes.length;
    const maxBurstTime = Math.max(...processes.map(p => p.burstTime));
    const minBurstTime = Math.min(...processes.map(p => p.burstTime));
    const stdDev = Math.sqrt(processes.reduce((sum, p) => sum + Math.pow(p.burstTime - avgBurstTime, 2), 0) / processes.length);
    
    // Advanced heuristic: quantum should be slightly larger than average burst time
    // but adjusted based on variance and process characteristics
    let optimalQuantum;
    
    if (stdDev < 2) {
        // Low variance - uniform workload
        optimalQuantum = Math.max(1, Math.min(6, Math.ceil(avgBurstTime * 0.6)));
    } else if (maxBurstTime - minBurstTime > 8) {
        // High variance - mixed workload
        optimalQuantum = Math.max(2, Math.min(4, Math.ceil(avgBurstTime * 0.4)));
    } else {
        // Moderate variance - balanced approach
        optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurstTime * 0.8)));
    }
    
    // Apply quantum
    document.getElementById('quantum').value = optimalQuantum;
    timeQuantum = optimalQuantum;
    
    // Show optimization details
    const optimizationDetails = `
🔧 **Quantum Optimization Complete**

**Analysis:**
• Average Burst Time: ${avgBurstTime.toFixed(1)} units
• Range: ${minBurstTime} - ${maxBurstTime} units
• Standard Deviation: ${stdDev.toFixed(1)}

**Recommended Quantum: ${optimalQuantum} units**

**Reasoning:**
${stdDev < 2 ? '• Low variance detected - using smaller quantum for responsiveness' :
  maxBurstTime - minBurstTime > 8 ? '• High variance detected - balanced quantum to handle mixed workload' :
  '• Moderate variance - optimal quantum at 80% of average burst time'}

This quantum should provide a good balance between responsiveness and efficiency.
    `;
    
    // Add to chat if AI tab is active
    if (document.getElementById('ai-advisor-tab').classList.contains('active')) {
        if (typeof chatHistory !== 'undefined') {
            chatHistory.push({
                type: 'ai',
                message: optimizationDetails,
                timestamp: new Date()
            });
            if (typeof updateChatDisplay === 'function') {
                updateChatDisplay();
            }
        }
    }
    
    updateStatusText(`Quantum optimized to ${optimalQuantum} time units`);
}

// Utility Functions
function showAlert(message) {
    // Create custom alert modal for better UX
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    content.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; color: #ef4444;">
            <i class="fas fa-exclamation-triangle"></i> Alert
        </h3>
        <p style="margin: 0 0 1.5rem 0; white-space: pre-line;">${message}</p>
        <button onclick="this.closest('.modal').remove()" 
                style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
            OK
        </button>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 5000);
}

function exportData() {
    if (processes.length === 0) {
        showAlert('No data to export. Please run a simulation first.');
        return;
    }

    const data = {
        algorithm: currentAlgorithm,
        processes: processes,
        schedule: animationData,
        metrics: calculateMetrics(),
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cpu_schedule_${currentAlgorithm}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStatusText('Data exported successfully');
}

// Add to comparison functionality
function addToComparison() {
    if (!currentAlgorithm || processes.length === 0) {
        showAlert('Please run a simulation first before adding to comparison.');
        return;
    }
    
    const result = {
        algorithm: currentAlgorithm,
        algorithmName: algorithmDescriptions[currentAlgorithm].name,
        processes: JSON.parse(JSON.stringify(processes)),
        schedule: JSON.parse(JSON.stringify(animationData)),
        metrics: calculateMetrics(),
        timestamp: new Date()
    };
    
    // Check if algorithm already exists in comparison
    const existingIndex = comparisonResults.findIndex(r => r.algorithm === currentAlgorithm);
    if (existingIndex !== -1) {
        comparisonResults[existingIndex] = result;
        updateStatusText(`Updated ${result.algorithmName} in comparison`);
    } else {
        comparisonResults.push(result);
        updateStatusText(`Added ${result.algorithmName} to comparison`);
    }
    
    // Update comparison tab if it's active
    if (document.getElementById('comparison-tab').classList.contains('active')) {
        updateComparisonDisplay();
    }
}

// Setup algorithm selection
function setupAlgorithmSelection() {
    const algoCards = document.querySelectorAll('.algo-card');
    
    algoCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            algoCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Set current algorithm
            currentAlgorithm = this.dataset.algorithm;
            
            // Update UI based on selected algorithm
            updateQuantumVisibility();
            updatePriorityVisibility();
            updateAlgorithmInfo();
            
            console.log('Selected algorithm:', currentAlgorithm);
        });
    });
}

function setupProcessInputs() {
    // Already implemented in setupEventListeners and other functions
}

function setupTabNavigation() {
    // Tab switching is handled by the switchTab function
}

// Initialize the app
function initializeApp() {
    setupAlgorithmSelection();
    setupProcessInputs();
    setupTabNavigation();
    
    // Add export button after DOM is ready
    setTimeout(() => {
        addExportButton();
        addExportToResults(); // Alternative placement
    }, 100);
}

// Add export button to Gantt controls
function addExportButton() {
    const ganttControls = document.querySelector('.gantt-controls');
    if (ganttControls && !document.querySelector('.export-gantt-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'control-btn export-gantt-btn';
        exportBtn.innerHTML = '<i class="fas fa-camera"></i>';
        exportBtn.title = 'Export Gantt Chart';
        exportBtn.onclick = exportGanttChart;
        ganttControls.appendChild(exportBtn);
    }
}

// Alternative: Add export to results section
function addExportToResults() {
    const resultsSection = document.querySelector('.results-section h3');
    if (resultsSection && !document.querySelector('.export-results-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-results-btn';
        exportBtn.style.cssText = 'margin-left: 1rem; padding: 0.5rem 1rem; font-size: 0.875rem;';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Chart';
        exportBtn.onclick = exportGanttChart;
        resultsSection.appendChild(exportBtn);
    }
}

// Export Gantt chart functionality
function exportGanttChart() {
    const ganttContainer = document.querySelector('.gantt-container');
    if (!ganttContainer) {
        showAlert('No Gantt chart to export. Please run a simulation first.');
        return;
    }
    
    // Use html2canvas if available, otherwise provide alternative
    if (typeof html2canvas !== 'undefined') {
        html2canvas(ganttContainer, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Create download link
            const link = document.createElement('a');
            link.download = `gantt_chart_${currentAlgorithm}_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            updateStatusText('Gantt chart exported successfully');
        }).catch(error => {
            console.error('Export failed:', error);
            showAlert('Export failed. Trying alternative method...');
            exportGanttAsSVG();
        });
    } else {
        // Fallback: Export as SVG
        exportGanttAsSVG();
    }
}

// Export Gantt chart as SVG
function exportGanttAsSVG() {
    const ganttTimeline = document.getElementById('ganttTimeline');
    if (!ganttTimeline || ganttTimeline.children.length === 0) {
        showAlert('No Gantt chart data to export.');
        return;
    }
    
    const svg = createSVGFromGantt();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `gantt_chart_${currentAlgorithm}_${Date.now()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    updateStatusText('Gantt chart exported as SVG');
}

// Create SVG representation of Gantt chart
function createSVGFromGantt() {
    const ganttBars = document.querySelectorAll('.gantt-block');
    const ganttContainer = document.querySelector('.gantt-container');
    
    if (!ganttBars.length) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="50" y="100">No data to export</text></svg>';
    }
    
    const containerRect = ganttContainer.getBoundingClientRect();
    const width = Math.max(800, containerRect.width);
    const height = Math.max(400, containerRect.height);
    
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <style>
            .process-label { font-family: Arial, sans-serif; font-size: 12px; fill: #333; }
            .time-label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }
            .gantt-rect { stroke: #fff; stroke-width: 1; }
        </style>
        <rect width="100%" height="100%" fill="#f8fafc"/>`;
    
    // Process colors
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    
    ganttBars.forEach((bar, index) => {
        const rect = bar.getBoundingClientRect();
        const containerRect = ganttContainer.getBoundingClientRect();
        
        // Calculate relative position
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const barWidth = rect.width;
        const barHeight = rect.height;
        
        const processId = bar.textContent || `P${index + 1}`;
        const color = colors[index % colors.length];
        
        // Add rectangle
        svgContent += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                       fill="${color}" class="gantt-rect"/>`;
        
        // Add process label
        svgContent += `<text x="${x + 5}" y="${y + barHeight/2 + 4}" class="process-label" fill="white">${processId}</text>`;
    });
    
    // Add time axis
    const timeAxis = document.getElementById('timeAxis');
    if (timeAxis) {
        const timeLabels = timeAxis.querySelectorAll('.time-marker');
        timeLabels.forEach((label, index) => {
            const labelRect = label.getBoundingClientRect();
            const containerRect = ganttContainer.getBoundingClientRect();
            const x = labelRect.left - containerRect.left;
            const y = height - 30;
            
            svgContent += `<text x="${x}" y="${y}" class="time-label">${label.textContent}</text>`;
        });
    }
    
    svgContent += '</svg>';
    return svgContent;
}

// Debug function to check AI functionality
function debugAIFeatures() {
    console.log('=== AI Features Debug ===');
    
    // Check if all required elements exist
    const elements = [
        'chatContainer',
        'chatInput', 
        'predictionChart',
        'workloadType',
        'workloadComplexity',
        'workloadPattern',
        'aiRecommendations'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}: ${element ? 'Found' : 'Missing'}`);
    });
    
    // Check if all required functions exist
    const functions = [
        'initializeAIAdvisorTab',
        'sendChatMessage',
        'analyzeWorkload',
        'getSmartRecommendations', 
        'predictPerformance',
        'optimizeQuantum',
        'getAIRecommendation'
    ];
    
    functions.forEach(funcName => {
        console.log(`${funcName}: ${typeof window[funcName] === 'function' ? 'Available' : 'Missing'}`);
    });
    
    // Check Chart.js
    console.log(`Chart.js: ${typeof Chart !== 'undefined' ? 'Available' : 'Missing'}`);
    
    // Check global variables
    console.log(`processes: ${Array.isArray(processes) ? `Array with ${processes.length} items` : 'Not array'}`);
    console.log(`currentAlgorithm: ${currentAlgorithm || 'Not set'}`);
    console.log(`chatHistory: ${Array.isArray(chatHistory) ? `Array with ${chatHistory.length} items` : 'Not array'}`);
    
    console.log('=== End Debug ===');
}

// Analytics Integration
function updateAnalytics() {
    if (typeof addToAnalytics === 'function' && currentResults && currentProcesses) {
        addToAnalytics(selectedAlgorithm, currentProcesses, currentResults);
        console.log('Analytics updated with simulation results');
    }
}