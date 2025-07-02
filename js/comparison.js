// Algorithm Comparison Functions

let comparisonChart = null;

// Initialize comparison tab
function initializeComparisonTab() {
    updateComparisonDisplay();
    initializeComparisonChart();
}

// Run all algorithms for comparison
function runAllComparisons() {
    if (!validateInput()) return;
    
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please add at least one process.');
        return;
    }
    
    updateStatusText('Running all algorithms for comparison...');
    setProgress(10);
    
    const algorithms = ['fcfs', 'sjf', 'srtf', 'rr', 'priority_np', 'priority_p'];
    const originalAlgorithm = currentAlgorithm;
    const originalProcesses = JSON.parse(JSON.stringify(processes));
    
    comparisonResults = [];
    
    algorithms.forEach((algorithm, index) => {
        setTimeout(() => {
            // Reset processes for each algorithm
            processes = JSON.parse(JSON.stringify(originalProcesses));
            currentAlgorithm = algorithm;
            
            // Run algorithm
            let schedule = runSchedulingAlgorithm();
            
            // Store results
            const result = {
                algorithm: algorithm,
                algorithmName: algorithmDescriptions[algorithm].name,
                processes: JSON.parse(JSON.stringify(processes)),
                schedule: schedule,
                metrics: calculateMetrics(),
                timestamp: new Date()
            };
            
            comparisonResults.push(result);
            
            // Update progress
            const progress = 10 + ((index + 1) / algorithms.length) * 80;
            setProgress(progress);
            
            // If all algorithms are done
            if (index === algorithms.length - 1) {
                setTimeout(() => {
                    updateComparisonDisplay();
                    updateComparisonChart();
                    setProgress(100);
                    updateStatusText('Comparison complete');
                    
                    // Restore original state
                    currentAlgorithm = originalAlgorithm;
                    processes = originalProcesses;
                    
                    setTimeout(() => {
                        resetProgress();
                    }, 2000);
                }, 200);
            }
        }, index * 100);
    });
}

// Update comparison display
function updateComparisonDisplay() {
    updateAlgorithmRankings();
    updateSideBySideVisualization();
}

// Update algorithm rankings - MODIFIED to show only selected metric
function updateAlgorithmRankings() {
    const rankingsContainer = document.getElementById('algorithmRankings');
    if (!rankingsContainer || comparisonResults.length === 0) {
        if (rankingsContainer) {
            rankingsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-medal"></i>
                    <p>Run comparisons to see algorithm rankings</p>
                </div>
            `;
        }
        return;
    }
    
    rankingsContainer.innerHTML = '';
    
    // Get the currently selected metric from the dropdown
    const metricSelector = document.getElementById('metricSelector');
    const selectedMetricValue = metricSelector ? metricSelector.value : 'avgTurnaround';
    
    // Map dropdown values to metric objects
    const metricMap = {
        'avgTurnaround': { key: 'avgTurnaroundTime', name: 'Average Turnaround Time', lower: true },
        'avgWaiting': { key: 'avgWaitingTime', name: 'Average Waiting Time', lower: true },
        'avgResponse': { key: 'avgResponseTime', name: 'Average Response Time', lower: true },
        'throughput': { key: 'throughput', name: 'Throughput', lower: false }
    };
    
    // Get the metric object for the selected value
    const metric = metricMap[selectedMetricValue];
    
    if (!metric) {
        rankingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Invalid metric selected</p>
            </div>
        `;
        return;
    }
    
    // Create single ranking section for selected metric
    const section = document.createElement('div');
    section.className = 'ranking-section';
    section.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: var(--bg-primary);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
    `;
    
    const title = document.createElement('h4');
    title.textContent = metric.name + ' Rankings';
    title.style.cssText = `
        margin: 0 0 0.75rem 0;
        color: var(--text-primary);
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--primary-color);
    `;
    
    section.appendChild(title);
    
    // Sort results by selected metric
    const sortedResults = [...comparisonResults].sort((a, b) => {
        const aValue = a.metrics[metric.key];
        const bValue = b.metrics[metric.key];
        return metric.lower ? aValue - bValue : bValue - aValue;
    });
    
    sortedResults.forEach((result, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item fade-in';
        rankingItem.style.animationDelay = (index * 0.1) + 's';
        
        const positionClass = index === 0 ? 'first' : 
                            index === 1 ? 'second' : 
                            index === 2 ? 'third' : 'other';
        
        // Add ranking item styles
        rankingItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: var(--bg-secondary);
            border-radius: 8px;
            border: 1px solid var(--border-light);
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        `;
        
        // Add hover effect
        rankingItem.addEventListener('mouseenter', () => {
            rankingItem.style.transform = 'translateY(-2px)';
            rankingItem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        rankingItem.addEventListener('mouseleave', () => {
            rankingItem.style.transform = 'translateY(0)';
            rankingItem.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        });
        
        const performanceIndicator = index === 0 ? '🏆 BEST' : 
                                   index === 1 ? '🥈 GOOD' : 
                                   index === 2 ? '🥉 FAIR' : '📊 OK';
        
        const improvementText = metric.lower ? 
            (index === 0 ? 'Optimal Performance' : 'Lower is better') : 
            (index === 0 ? 'Optimal Performance' : 'Higher is better');
        
        rankingItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="ranking-position ${positionClass}" style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                    color: white;
                ">${index + 1}</div>
                <div>
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1rem;">
                        ${result.algorithmName}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        ${result.algorithm.toUpperCase()} • ${performanceIndicator}
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--primary-color); font-size: 1.2rem;">
                    ${result.metrics[metric.key].toFixed(2)}${metric.key === 'throughput' ? '' : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">
                    ${metric.key === 'throughput' ? 'proc/time' : 'time units'}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.25rem; font-style: italic;">
                    ${improvementText}
                </div>
            </div>
        `;
        
        section.appendChild(rankingItem);
    });
    
    rankingsContainer.appendChild(section);
    
    // Add performance insights for the selected metric
    addPerformanceInsights(sortedResults, metric, rankingsContainer);
}

// Add performance insights based on the selected metric
function addPerformanceInsights(sortedResults, metric, container) {
    const insightsSection = document.createElement('div');
    insightsSection.style.cssText = `
        margin-top: 1.5rem;
        padding: 1rem;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
    `;
    
    const bestResult = sortedResults[0];
    const worstResult = sortedResults[sortedResults.length - 1];
    const bestValue = bestResult.metrics[metric.key];
    const worstValue = worstResult.metrics[metric.key];
    
    let improvementPercentage = 0;
    if (metric.lower) {
        improvementPercentage = ((worstValue - bestValue) / worstValue * 100);
    } else {
        improvementPercentage = ((bestValue - worstValue) / worstValue * 100);
    }
    
    insightsSection.innerHTML = `
        <h5 style="margin: 0 0 0.75rem 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-lightbulb" style="color: var(--warning-color);"></i>
            Performance Insights
        </h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
            <div>
                <strong style="color: var(--success-color);">Best Performer:</strong><br>
                ${bestResult.algorithmName} with ${bestValue.toFixed(2)} ${metric.key === 'throughput' ? 'proc/time' : 'units'}
            </div>
            <div>
                <strong style="color: var(--error-color);">Improvement Potential:</strong><br>
                Up to ${improvementPercentage.toFixed(1)}% better performance possible
            </div>
        </div>
        <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.1); border-radius: 6px; font-size: 0.8rem; color: var(--text-secondary);">
            <i class="fas fa-info-circle" style="color: var(--primary-color);"></i>
            ${getMetricRecommendation(metric, bestResult, sortedResults)}
        </div>
    `;
    
    container.appendChild(insightsSection);
}

// Get recommendation text based on metric and results
function getMetricRecommendation(metric, bestResult, sortedResults) {
    const algorithmName = bestResult.algorithmName;
    
    switch(metric.key) {
        case 'avgTurnaroundTime':
            return `${algorithmName} provides the shortest average turnaround time. This is ideal when you want processes to complete quickly overall. Consider this for batch processing systems.`;
        case 'avgWaitingTime':
            return `${algorithmName} minimizes waiting time, reducing the time processes spend in the ready queue. This improves system responsiveness and user satisfaction.`;
        case 'avgResponseTime':
            return `${algorithmName} offers the best response time, making it excellent for interactive systems where quick initial response is crucial. Perfect for user-facing applications.`;
        case 'throughput':
            return `${algorithmName} maximizes throughput, completing the most processes per unit time. This is valuable for high-volume processing environments.`;
        default:
            return `${algorithmName} performs best for this metric. Consider your specific system requirements when choosing an algorithm.`;
    }
}

// Initialize comparison chart
function initializeComparisonChart() {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Performance Metric',
                data: [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const algorithm = comparisonResults[context.dataIndex];
                            const metric = document.getElementById('metricSelector').value;
                            return `${algorithm.algorithmName}: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    updateComparisonChart();
}

// Update comparison chart
function updateComparisonChart() {
    if (!comparisonChart || comparisonResults.length === 0) return;
    
    const metricSelector = document.getElementById('metricSelector');
    const selectedMetric = metricSelector ? metricSelector.value : 'avgTurnaround';
    
    const labels = comparisonResults.map(result => result.algorithm.toUpperCase());
    const data = comparisonResults.map(result => {
        switch(selectedMetric) {
            case 'avgTurnaround': return result.metrics.avgTurnaroundTime;
            case 'avgWaiting': return result.metrics.avgWaitingTime;
            case 'avgResponse': return result.metrics.avgResponseTime;
            case 'throughput': return result.metrics.throughput;
            default: return result.metrics.avgTurnaroundTime;
        }
    });
    
    comparisonChart.data.labels = labels;
    comparisonChart.data.datasets[0].data = data;
    comparisonChart.data.datasets[0].label = metricSelector.options[metricSelector.selectedIndex].text;
    
    comparisonChart.update();
}

// Update side-by-side visualization
function updateSideBySideVisualization() {
    const container = document.getElementById('sideBySideContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (comparisonResults.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-gantt"></i>
                <p>Add algorithms to comparison to view side-by-side</p>
            </div>
        `;
        return;
    }
    
    comparisonResults.forEach((result, index) => {
        const algorithmContainer = document.createElement('div');
        algorithmContainer.className = 'side-by-side-item fade-in';
        algorithmContainer.style.animationDelay = (index * 0.1) + 's';
        
        const header = document.createElement('div');
        header.className = 'side-by-side-header';
        header.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${result.algorithmName}</span>
                <span style="font-size: 0.875rem; opacity: 0.9;">
                    Avg TT: ${result.metrics.avgTurnaroundTime.toFixed(1)}
                </span>
            </div>
        `;
        
        const ganttContainer = document.createElement('div');
        ganttContainer.style.cssText = `
            padding: 1rem;
            min-height: 120px;
        `;
        
        // Create mini gantt chart
        const miniGantt = createMiniGanttChart(result.schedule, result.algorithm);
        ganttContainer.appendChild(miniGantt);
        
        // Add metrics summary
        const metricsSummary = document.createElement('div');
        metricsSummary.style.cssText = `
            padding: 0.75rem 1rem;
            background: var(--bg-tertiary);
            border-top: 1px solid var(--border-color);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            font-size: 0.75rem;
        `;
        
        metricsSummary.innerHTML = `
            <div style="text-align: center;">
                <div style="color: var(--text-secondary);">Waiting</div>
                <div style="font-weight: 600; color: var(--warning-color);">${result.metrics.avgWaitingTime.toFixed(1)}</div>
            </div>
            <div style="text-align: center;">
                <div style="color: var(--text-secondary);">Response</div>
                <div style="font-weight: 600; color: var(--accent-color);">${result.metrics.avgResponseTime.toFixed(1)}</div>
            </div>
            <div style="text-align: center;">
                <div style="color: var(--text-secondary);">Throughput</div>
                <div style="font-weight: 600; color: var(--primary-color);">${result.metrics.throughput.toFixed(2)}</div>
            </div>
        `;
        
        algorithmContainer.appendChild(header);
        algorithmContainer.appendChild(ganttContainer);
        algorithmContainer.appendChild(metricsSummary);
        
        container.appendChild(algorithmContainer);
    });
}

// Create mini gantt chart for side-by-side comparison
function createMiniGanttChart(schedule, algorithm) {
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1px;
        height: 40px;
        background: var(--bg-primary);
        border-radius: 4px;
        border: 1px solid var(--border-color);
        padding: 0.25rem;
        overflow: hidden;
    `;
    
    if (schedule.length === 0) {
        container.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.75rem;">No data</span>';
        return container;
    }
    
    const maxTime = Math.max(...schedule.map(s => s.endTime));
    const containerWidth = 300; // Fixed width for consistency
    
    // Consolidate schedule for better visualization
    const consolidatedSchedule = consolidateSchedule(schedule);
    
    consolidatedSchedule.forEach(item => {
        const block = document.createElement('div');
        const widthPercent = (item.duration / maxTime) * 100;
        
        block.style.cssText = `
            height: 100%;
            width: ${widthPercent}%;
            min-width: 2px;
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.6rem;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `;
        
        // Get process index for color
        const processIndex = processes.findIndex(p => p.id === item.processId);
        block.style.background = processColors[processIndex % processColors.length];
        
        // Only show process ID if block is wide enough
        if (widthPercent > 8) {
            block.textContent = item.processId;
        }
        
        block.title = `${item.processId}: ${item.startTime}-${item.endTime}`;
        
        container.appendChild(block);
    });
    
    return container;
}

// Clear comparisons
function clearComparisons() {
    comparisonResults = [];
    updateComparisonDisplay();
    
    if (comparisonChart) {
        comparisonChart.data.labels = [];
        comparisonChart.data.datasets[0].data = [];
        comparisonChart.update();
    }
    
    updateStatusText('Comparisons cleared');
}

// Export comparison report
function exportComparison() {
    if (comparisonResults.length === 0) {
        showAlert('No comparison data to export. Please run comparisons first.');
        return;
    }
    
    const report = generateComparisonReport();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `algorithm_comparison_report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStatusText('Comparison report exported');
}

// Generate detailed comparison report
function generateComparisonReport() {
    const timestamp = new Date().toLocaleString();
    const processCount = comparisonResults[0]?.processes.length || 0;
    
    let report = `CPU SCHEDULING ALGORITHM COMPARISON REPORT
Generated: ${timestamp}
Process Count: ${processCount}
${'='.repeat(60)}

`;
    
    // Add process information
    if (comparisonResults.length > 0) {
        const processes = comparisonResults[0].processes;
        report += `PROCESS INFORMATION:
`;
        processes.forEach(process => {
            report += `${process.id}: Arrival=${process.arrivalTime}, Burst=${process.burstTime}, Priority=${process.priority}
`;
        });
        report += `
`;
    }
    
    // Add algorithm results
    report += `ALGORITHM PERFORMANCE COMPARISON:
`;
    
    comparisonResults.forEach(result => {
        report += `
${result.algorithmName} (${result.algorithm.toUpperCase()}):
  Average Turnaround Time: ${result.metrics.avgTurnaroundTime.toFixed(2)} units
  Average Waiting Time: ${result.metrics.avgWaitingTime.toFixed(2)} units
  Average Response Time: ${result.metrics.avgResponseTime.toFixed(2)} units
  Throughput: ${result.metrics.throughput.toFixed(3)} processes/time unit
  Context Switches: ${result.metrics.contextSwitches}
`;
    });
    
    // Add rankings
    report += `
${'='.repeat(60)}
PERFORMANCE RANKINGS:

`;
    
    const metrics = [
        { key: 'avgTurnaroundTime', name: 'Average Turnaround Time', lower: true },
        { key: 'avgWaitingTime', name: 'Average Waiting Time', lower: true },
        { key: 'avgResponseTime', name: 'Average Response Time', lower: true },
        { key: 'throughput', name: 'Throughput', lower: false }
    ];
    
    metrics.forEach(metric => {
        const sortedResults = [...comparisonResults].sort((a, b) => {
            const aValue = a.metrics[metric.key];
            const bValue = b.metrics[metric.key];
            return metric.lower ? aValue - bValue : bValue - aValue;
        });
        
        report += `${metric.name} (${metric.lower ? 'lower is better' : 'higher is better'}):
`;
        sortedResults.forEach((result, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
            report += `  ${medal} ${index + 1}. ${result.algorithmName}: ${result.metrics[metric.key].toFixed(3)}
`;
        });
        report += `
`;
    });
    
    // Add recommendations
    report += `RECOMMENDATIONS:
`;
    
    const bestTurnaround = [...comparisonResults].sort((a, b) => a.metrics.avgTurnaroundTime - b.metrics.avgTurnaroundTime)[0];
    const bestWaiting = [...comparisonResults].sort((a, b) => a.metrics.avgWaitingTime - b.metrics.avgWaitingTime)[0];
    const bestResponse = [...comparisonResults].sort((a, b) => a.metrics.avgResponseTime - b.metrics.avgResponseTime)[0];
    const bestThroughput = [...comparisonResults].sort((a, b) => b.metrics.throughput - a.metrics.throughput)[0];
    
    report += `
• For minimum turnaround time: ${bestTurnaround.algorithmName}
• For minimum waiting time: ${bestWaiting.algorithmName}
• For best response time: ${bestResponse.algorithmName}
• For maximum throughput: ${bestThroughput.algorithmName}

`;
    
    // Add workload analysis
    if (comparisonResults.length > 0) {
        const workloadAnalysis = detectWorkloadPattern(comparisonResults[0].processes);
        report += `WORKLOAD ANALYSIS:
Pattern: ${workloadAnalysis.pattern}
Characteristics: ${workloadAnalysis.characteristics.join(', ')}
Average Burst Time: ${workloadAnalysis.avgBurstTime}
Burst Time Range: ${workloadAnalysis.burstTimeRange}

`;
        
        // Add algorithm recommendations based on workload
        report += `ALGORITHM RECOMMENDATIONS FOR THIS WORKLOAD:
`;
        
        if (workloadAnalysis.characteristics.includes('I/O intensive')) {
            report += `• Recommended: Round Robin or SRTF for good responsiveness
• Avoid: FCFS due to potential convoy effect
`;
        } else if (workloadAnalysis.characteristics.includes('CPU intensive')) {
            report += `• Recommended: SJF or Priority-based for efficiency
• Consider: FCFS for simplicity if fairness is not critical
`;
        } else {
            report += `• Recommended: Round Robin for balanced performance
• Alternative: SRTF for optimal average times
`;
        }
    }
    
    report += `
${'='.repeat(60)}
End of Report
`;
    
    return report;
}

// Advanced comparison features

// Compare algorithms with different quantum values (for Round Robin)
function compareQuantumValues() {
    if (!validateInput()) return;
    
    collectProcesses();
    
    const quantumValues = [1, 2, 3, 4, 5, 8];
    const originalQuantum = timeQuantum;
    const originalAlgorithm = currentAlgorithm;
    const originalProcesses = JSON.parse(JSON.stringify(processes));
    
    currentAlgorithm = 'rr';
    const quantumResults = [];
    
    quantumValues.forEach(quantum => {
        processes = JSON.parse(JSON.stringify(originalProcesses));
        timeQuantum = quantum;
        
        const schedule = runSchedulingAlgorithm();
        const metrics = calculateMetrics();
        
        quantumResults.push({
            quantum: quantum,
            metrics: metrics,
            schedule: schedule
        });
    });
    
    // Restore original values
    timeQuantum = originalQuantum;
    currentAlgorithm = originalAlgorithm;
    processes = originalProcesses;
    
    // Display quantum comparison
    displayQuantumComparison(quantumResults);
}

// Display quantum comparison results
function displayQuantumComparison(results) {
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
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    content.innerHTML = `
        <h3 style="margin: 0 0 1.5rem 0; color: var(--text-primary);">
            <i class="fas fa-clock"></i> Round Robin Quantum Analysis
        </h3>
        <div id="quantumChart" style="height: 300px; margin-bottom: 1.5rem;"></div>
        <div id="quantumTable"></div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button onclick="this.closest('.modal').remove()" 
                    style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Create quantum comparison chart and table
    setTimeout(() => {
        createQuantumChart(results);
        createQuantumTable(results);
    }, 100);
}

// Create quantum comparison chart
function createQuantumChart(results) {
    const container = document.getElementById('quantumChart');
    if (!container || typeof Chart === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: results.map(r => `Q=${r.quantum}`),
            datasets: [{
                label: 'Avg Turnaround Time',
                data: results.map(r => r.metrics.avgTurnaroundTime),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }, {
                label: 'Avg Waiting Time',
                data: results.map(r => r.metrics.avgWaitingTime),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
            }, {
                label: 'Context Switches',
                data: results.map(r => r.metrics.contextSwitches),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Time Units'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Context Switches'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Create quantum comparison table
function createQuantumTable(results) {
    const container = document.getElementById('quantumTable');
    if (!container) return;
    
    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
                <tr style="background: var(--bg-tertiary);">
                    <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color);">Quantum</th>
                    <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">Avg TT</th>
                    <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">Avg WT</th>
                    <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">Avg RT</th>
                    <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border-color);">Context Switches</th>
                    <th style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--border-color);">Recommendation</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const bestTurnaround = Math.min(...results.map(r => r.metrics.avgTurnaroundTime));
    const bestWaiting = Math.min(...results.map(r => r.metrics.avgWaitingTime));
    const bestResponse = Math.min(...results.map(r => r.metrics.avgResponseTime));
    
    results.forEach(result => {
        const isBestTT = result.metrics.avgTurnaroundTime === bestTurnaround;
        const isBestWT = result.metrics.avgWaitingTime === bestWaiting;
        const isBestRT = result.metrics.avgResponseTime === bestResponse;
        
        let recommendation = '';
        if (isBestTT && isBestWT && isBestRT) {
            recommendation = '🏆 Best Overall';
        } else if (isBestTT) {
            recommendation = '🥇 Best TT';
        } else if (isBestWT) {
            recommendation = '🥈 Best WT';
        } else if (isBestRT) {
            recommendation = '🥉 Best RT';
        } else {
            recommendation = '📊 Good';
        }
        
        tableHTML += `
            <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 600;">${result.quantum}</td>
                <td style="padding: 0.75rem; text-align: right; ${isBestTT ? 'color: var(--success-color); font-weight: 600;' : ''}">${result.metrics.avgTurnaroundTime.toFixed(2)}</td>
                <td style="padding: 0.75rem; text-align: right; ${isBestWT ? 'color: var(--success-color); font-weight: 600;' : ''}">${result.metrics.avgWaitingTime.toFixed(2)}</td>
                <td style="padding: 0.75rem; text-align: right; ${isBestRT ? 'color: var(--success-color); font-weight: 600;' : ''}">${result.metrics.avgResponseTime.toFixed(2)}</td>
                <td style="padding: 0.75rem; text-align: right;">${result.metrics.contextSwitches}</td>
                <td style="padding: 0.75rem; text-align: center;">${recommendation}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}