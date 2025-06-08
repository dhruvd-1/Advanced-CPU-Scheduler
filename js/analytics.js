// Enhanced Analytics Module
class AnalyticsManager {
    constructor() {
        this.schedulingHistory = this.loadHistoryFromStorage();
        this.charts = {};
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        this.createTrendsChart();
        this.createUsageChart();
        this.createWorkloadChart();
        this.updateEfficiencyMetrics();
        this.generateInsights();
    }

    loadHistoryFromStorage() {
        try {
            const stored = localStorage.getItem('schedulingHistory');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading analytics history:', error);
            return [];
        }
    }

    saveHistoryToStorage() {
        try {
            localStorage.setItem('schedulingHistory', JSON.stringify(this.schedulingHistory));
        } catch (error) {
            console.error('Error saving analytics history:', error);
        }
    }

    addSimulationResult(algorithmName, processes, results) {
        const entry = {
            algorithm: algorithmName,
            processes: processes.map(p => ({
                id: p.id,
                arrival: p.arrival,
                burst: p.burst,
                priority: p.priority || 0
            })),
            results: {
                avgTurnaround: results.avgTurnaround || 0,
                avgWaiting: results.avgWaiting || 0,
                avgResponse: results.avgResponse || 0,
                throughput: results.throughput || 0,
                cpuUtilization: results.cpuUtilization || 100
            },
            timestamp: Date.now(),
            processCount: processes.length,
            totalBurstTime: processes.reduce((sum, p) => sum + p.burst, 0)
        };

        this.schedulingHistory.push(entry);
        this.saveHistoryToStorage();
        this.refreshAnalytics();
        
        console.log('Analytics: Added simulation result', entry);
    }

    refreshAnalytics() {
        if (document.getElementById('analytics-tab').classList.contains('active')) {
            this.updateTrendsChart();
            this.updateUsageChart();
            this.updateWorkloadChart();
            this.updateEfficiencyMetrics();
            this.generateInsights();
        }
    }

    createTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Average Turnaround Time',
                        data: [],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Average Waiting Time',
                        data: [],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Average Response Time',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Performance Trends Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Units'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Simulation Number'
                        }
                    }
                }
            }
        });
    }

    updateTrendsChart() {
        if (!this.charts.trends || this.schedulingHistory.length === 0) return;

        const labels = this.schedulingHistory.map((_, index) => `Sim ${index + 1}`);
        const turnaroundData = this.schedulingHistory.map(entry => entry.results.avgTurnaround);
        const waitingData = this.schedulingHistory.map(entry => entry.results.avgWaiting);
        const responseData = this.schedulingHistory.map(entry => entry.results.avgResponse);

        this.charts.trends.data.labels = labels;
        this.charts.trends.data.datasets[0].data = turnaroundData;
        this.charts.trends.data.datasets[1].data = waitingData;
        this.charts.trends.data.datasets[2].data = responseData;
        this.charts.trends.update();
    }

    createUsageChart() {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;

        this.charts.usage = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#8b5cf6', '#06b6d4', '#10b981', 
                        '#f59e0b', '#ef4444', '#ec4899'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Algorithm Usage Distribution'
                    }
                }
            }
        });
    }

    updateUsageChart() {
        if (!this.charts.usage || this.schedulingHistory.length === 0) return;

        const algorithmCounts = {};
        this.schedulingHistory.forEach(entry => {
            algorithmCounts[entry.algorithm] = (algorithmCounts[entry.algorithm] || 0) + 1;
        });

        const labels = Object.keys(algorithmCounts);
        const data = Object.values(algorithmCounts);

        this.charts.usage.data.labels = labels.map(algo => this.getAlgorithmDisplayName(algo));
        this.charts.usage.data.datasets[0].data = data;
        this.charts.usage.update();
    }

    createWorkloadChart() {
        const ctx = document.getElementById('workloadChart');
        if (!ctx) return;

        this.charts.workload = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Simulations',
                    data: [],
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Workload Characteristics'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Processes'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total Burst Time'
                        }
                    }
                }
            }
        });
    }

    updateWorkloadChart() {
        if (!this.charts.workload || this.schedulingHistory.length === 0) return;

        const data = this.schedulingHistory.map(entry => ({
            x: entry.processCount,
            y: entry.totalBurstTime
        }));

        this.charts.workload.data.datasets[0].data = data;
        this.charts.workload.update();
    }

    updateEfficiencyMetrics() {
        if (this.schedulingHistory.length === 0) {
            document.getElementById('bestTurnaround').textContent = '-';
            document.getElementById('bestTurnaroundAlgo').textContent = '-';
            document.getElementById('bestWaiting').textContent = '-';
            document.getElementById('bestWaitingAlgo').textContent = '-';
            document.getElementById('bestResponse').textContent = '-';
            document.getElementById('bestResponseAlgo').textContent = '-';
            return;
        }

        // Find best performers
        let bestTurnaround = this.schedulingHistory[0];
        let bestWaiting = this.schedulingHistory[0];
        let bestResponse = this.schedulingHistory[0];

        this.schedulingHistory.forEach(entry => {
            if (entry.results.avgTurnaround < bestTurnaround.results.avgTurnaround) {
                bestTurnaround = entry;
            }
            if (entry.results.avgWaiting < bestWaiting.results.avgWaiting) {
                bestWaiting = entry;
            }
            if (entry.results.avgResponse < bestResponse.results.avgResponse) {
                bestResponse = entry;
            }
        });

        // Update display
        document.getElementById('bestTurnaround').textContent = bestTurnaround.results.avgTurnaround.toFixed(2);
        document.getElementById('bestTurnaroundAlgo').textContent = this.getAlgorithmDisplayName(bestTurnaround.algorithm);
        
        document.getElementById('bestWaiting').textContent = bestWaiting.results.avgWaiting.toFixed(2);
        document.getElementById('bestWaitingAlgo').textContent = this.getAlgorithmDisplayName(bestWaiting.algorithm);
        
        document.getElementById('bestResponse').textContent = bestResponse.results.avgResponse.toFixed(2);
        document.getElementById('bestResponseAlgo').textContent = this.getAlgorithmDisplayName(bestResponse.algorithm);
    }

    generateInsights() {
        const container = document.getElementById('analyticsInsights');
        if (!container || this.schedulingHistory.length === 0) {
            container.innerHTML = `
                <div class="insight-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Run simulations to generate AI-powered insights</span>
                </div>
            `;
            return;
        }

        const insights = this.calculateInsights();
        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-${insight.icon}"></i>
                <span>${insight.text}</span>
            </div>
        `).join('');
    }

    calculateInsights() {
        const insights = [];
        
        if (this.schedulingHistory.length < 2) {
            insights.push({
                icon: 'info-circle',
                text: 'Run more simulations for comprehensive insights'
            });
            return insights;
        }

        // Algorithm performance comparison
        const algorithmPerformance = {};
        this.schedulingHistory.forEach(entry => {
            if (!algorithmPerformance[entry.algorithm]) {
                algorithmPerformance[entry.algorithm] = {
                    turnaround: [],
                    waiting: [],
                    response: []
                };
            }
            algorithmPerformance[entry.algorithm].turnaround.push(entry.results.avgTurnaround);
            algorithmPerformance[entry.algorithm].waiting.push(entry.results.avgWaiting);
            algorithmPerformance[entry.algorithm].response.push(entry.results.avgResponse);
        });

        // Generate insights based on data
        const algorithms = Object.keys(algorithmPerformance);
        
        if (algorithms.includes('sjf') && algorithms.includes('fcfs')) {
            const sjfAvg = this.average(algorithmPerformance.sjf.turnaround);
            const fcfsAvg = this.average(algorithmPerformance.fcfs.turnaround);
            const improvement = ((fcfsAvg - sjfAvg) / fcfsAvg * 100).toFixed(1);
            
            insights.push({
                icon: 'chart-line',
                text: `SJF shows ${improvement}% better turnaround time than FCFS`
            });
        }

        if (algorithms.includes('rr')) {
            const rrResponse = this.average(algorithmPerformance.rr.response);
            insights.push({
                icon: 'clock',
                text: `Round Robin provides fair response time of ${rrResponse.toFixed(2)} units`
            });
        }

        // Workload insights
        const avgProcessCount = this.average(this.schedulingHistory.map(e => e.processCount));
        if (avgProcessCount > 5) {
            insights.push({
                icon: 'tasks',
                text: 'Heavy workloads detected - consider preemptive algorithms'
            });
        }

        // General recommendation
        const bestAlgorithm = this.findBestOverallAlgorithm();
        insights.push({
            icon: 'trophy',
            text: `${this.getAlgorithmDisplayName(bestAlgorithm)} performs best overall for your workloads`
        });

        return insights;
    }

    findBestOverallAlgorithm() {
        const algorithmScores = {};
        
        this.schedulingHistory.forEach(entry => {
            if (!algorithmScores[entry.algorithm]) {
                algorithmScores[entry.algorithm] = [];
            }
            
            // Simple scoring: lower times are better
            const score = entry.results.avgTurnaround + entry.results.avgWaiting + entry.results.avgResponse;
            algorithmScores[entry.algorithm].push(score);
        });

        let bestAlgorithm = null;
        let bestScore = Infinity;

        Object.keys(algorithmScores).forEach(algorithm => {
            const avgScore = this.average(algorithmScores[algorithm]);
            if (avgScore < bestScore) {
                bestScore = avgScore;
                bestAlgorithm = algorithm;
            }
        });

        return bestAlgorithm || 'fcfs';
    }

    getAlgorithmDisplayName(algorithm) {
        const names = {
            'fcfs': 'FCFS',
            'sjf': 'SJF',
            'srtf': 'SRTF',
            'rr': 'Round Robin',
            'priority_np': 'Priority NP',
            'priority_p': 'Priority P'
        };
        return names[algorithm] || algorithm.toUpperCase();
    }

    average(array) {
        return array.length > 0 ? array.reduce((sum, val) => sum + val, 0) / array.length : 0;
    }

    clearAnalyticsData() {
        this.schedulingHistory = [];
        this.saveHistoryToStorage();
        this.refreshAnalytics();
    }

    exportAnalyticsData() {
        const dataStr = JSON.stringify(this.schedulingHistory, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'cpu_scheduler_analytics.json';
        link.click();
    }
}

// Global analytics manager instance
let analyticsManager;

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    analyticsManager = new AnalyticsManager();
});

// Functions called by other modules
function addToAnalytics(algorithmName, processes, results) {
    if (analyticsManager) {
        analyticsManager.addSimulationResult(algorithmName, processes, results);
    }
}

function loadAnalyticsData() {
    if (analyticsManager) {
        analyticsManager.refreshAnalytics();
    }
}

function clearAnalytics() {
    if (analyticsManager) {
        analyticsManager.clearAnalyticsData();
    }
}

function exportAnalytics() {
    if (analyticsManager) {
        analyticsManager.exportAnalyticsData();
    }
}