// Get algorithm recommendations based on workload
function getAlgorithmRecommendations(workloadAnalysis) {
    const avgBurst = parseFloat(workloadAnalysis.avgBurstTime);
    const isUniform = workloadAnalysis.pattern === 'Uniform';
    const isCPUIntensive = workloadAnalysis.characteristics.includes('CPU intensive');
    const isIOIntensive = workloadAnalysis.characteristics.includes('I/O intensive');
    
    let primary, alternative, tip;
    
    if (isIOIntensive) {
        primary = {
            name: "Round Robin (RR)",
            reason: "Provides excellent responsiveness for I/O-bound processes with fair CPU allocation"
        };
        alternative = {
            name: "Shortest Remaining Time First (SRTF)",
            reason: "Minimizes waiting time and provides good preemptive scheduling"
        };
        tip = "Consider a time quantum of 1-2 units for better responsiveness with short burst times.";
    } else if (isCPUIntensive) {
        primary = {
            name: "Shortest Job First (SJF)",
            reason: "Optimal for minimizing average waiting time with longer CPU-bound processes"
        };
        alternative = {
            name: "Priority Scheduling (Non-preemptive)",
            reason: "Allows important CPU-intensive tasks to run to completion"
        };
        tip = "Non-preemptive algorithms work well here as context switching overhead is minimized.";
    } else if (isUniform) {
        primary = {
            name: "First-Come, First-Served (FCFS)",
            reason: "Simple and fair for uniform workloads with predictable execution times"
        };
        alternative = {
            name: "Round Robin (RR)",
            reason: "Provides time-sharing benefits even with uniform processes"
        };
        tip = "With uniform burst times, simple algorithms often perform surprisingly well.";
    } else {
        primary = {
            name: "Round Robin (RR)",
            reason: "Best general-purpose algorithm for mixed workloads providing fairness and responsiveness"
        };
        alternative = {
            name: "Shortest Remaining Time First (SRTF)",
            reason: "Optimal average performance but with higher context switching overhead"
        };
        tip = "For mixed workloads, consider a time quantum equal to 80% of average burst time.";
    }
    
    return { primary, alternative, tip };
}

// Generate quantum advice
function generateQuantumAdvice(message) {
    collectProcesses();
    
    if (processes.length === 0) {
        return "To provide quantum recommendations, I need to analyze your process workload. Please configure some processes first!";
    }
    
    const avgBurst = processes.reduce((sum, p) => sum + p.burstTime, 0) / processes.length;
    const maxBurst = Math.max(...processes.map(p => p.burstTime));
    const minBurst = Math.min(...processes.map(p => p.burstTime));
    
    const optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurst * 0.8)));
    
    return `For your current workload:\n\n` +
           `📊 **Analysis**: Avg burst = ${avgBurst.toFixed(1)}, Range = ${minBurst}-${maxBurst}\n\n` +
           `⚡ **Optimal Quantum**: ${optimalQuantum} time units\n\n` +
           `**Reasoning**:\n` +
           `• Too small (< ${Math.ceil(avgBurst * 0.5)}): Excessive context switching overhead\n` +
           `• Too large (> ${Math.ceil(avgBurst * 1.2)}): Degrades to FCFS, poor responsiveness\n` +
           `• Sweet spot: ~80% of average burst time for balanced performance\n\n` +
           `💡 **Pro tip**: Adjust based on system responsiveness requirements!`;
}

// Generate performance advice
function generatePerformanceAdvice(message) {
    if (simulationHistory.length === 0) {
        return "I don't have any simulation history to analyze yet. Run some simulations and I'll provide personalized performance insights!";
    }
    
    const recentSims = simulationHistory.slice(-5);
    const avgTurnaround = recentSims.reduce((sum, sim) => sum + sim.metrics.avgTurnaroundTime, 0) / recentSims.length;
    const avgWaiting = recentSims.reduce((sum, sim) => sum + sim.metrics.avgWaitingTime, 0) / recentSims.length;
    
    let advice = `📈 **Performance Analysis** (last ${recentSims.length} simulations):\n\n`;
    advice += `• Average Turnaround: ${avgTurnaround.toFixed(2)} units\n`;
    advice += `• Average Waiting: ${avgWaiting.toFixed(2)} units\n\n`;
    
    // Performance recommendations
    if (avgWaiting > avgTurnaround * 0.6) {
        advice += `⚠️ **High waiting time detected!** Consider:\n`;
        advice += `• Preemptive algorithms (SRTF, RR) for better responsiveness\n`;
        advice += `• Shorter time quantum if using Round Robin\n`;
        advice += `• Priority scheduling for important processes\n\n`;
    } else if (avgTurnaround > 15) {
        advice += `🎯 **Optimization opportunities**:\n`;
        advice += `• Try SJF or SRTF to minimize average times\n`;
        advice += `• Consider workload batching for similar processes\n`;
        advice += `• Evaluate if preemption benefits outweigh context switching costs\n\n`;
    } else {
        advice += `✅ **Good performance!** Your current setup is working well.\n\n`;
    }
    
    advice += `💡 **Next steps**: Try the comparison mode to see how different algorithms perform with your workload.`;
    
    return advice;
}

// Generate workload advice
function generateWorkloadAdvice(message) {
    collectProcesses();
    
    if (processes.length === 0) {
        return "Please configure some processes so I can analyze your workload characteristics and provide tailored advice!";
    }
    
    const analysis = detectWorkloadPattern(processes);
    
    let advice = `🔍 **Workload Analysis**:\n\n`;
    advice += `**Pattern**: ${analysis.pattern}\n`;
    advice += `**Characteristics**: ${analysis.characteristics.join(', ')}\n`;
    advice += `**Process Count**: ${analysis.processCount}\n`;
    advice += `**Burst Time Range**: ${analysis.burstTimeRange} units\n`;
    advice += `**Average Burst**: ${analysis.avgBurstTime} units\n\n`;
    
    // Specific advice based on pattern
    if (analysis.pattern === 'Uniform') {
        advice += `📋 **Uniform Workload Tips**:\n`;
        advice += `• FCFS works well due to predictable execution times\n`;
        advice += `• Consider batch processing for efficiency\n`;
        advice += `• Minimal benefit from complex scheduling algorithms\n`;
    } else if (analysis.characteristics.includes('CPU intensive')) {
        advice += `💻 **CPU-Intensive Workload Tips**:\n`;
        advice += `• Non-preemptive algorithms reduce context switching overhead\n`;
        advice += `• SJF optimal for minimizing average waiting time\n`;
        advice += `• Consider priority scheduling for critical tasks\n`;
    } else if (analysis.characteristics.includes('I/O intensive')) {
        advice += `📀 **I/O-Intensive Workload Tips**:\n`;
        advice += `• Preemptive scheduling improves system responsiveness\n`;
        advice += `• Small time quantum (1-2 units) works well\n`;
        advice += `• SRTF or RR provide good interactive performance\n`;
    } else {
        advice += `🔄 **Mixed Workload Tips**:\n`;
        advice += `• Round Robin provides good balance of fairness and performance\n`;
        advice += `• Consider multilevel queue for different process types\n`;
        advice += `• Time quantum = 80% of average burst time\n`;
    }
    
    return advice;
}

// Generate comparison advice
function generateComparisonAdvice(message) {
    const algorithms = ['FCFS', 'SJF', 'SRTF', 'Round Robin', 'Priority'];
    
    let advice = `🔍 **Algorithm Comparison Guide**:\n\n`;
    
    if (message.includes('fcfs') || message.includes('fifo')) {
        advice += `**FCFS (First-Come, First-Served)**:\n`;
        advice += `✅ Simple, fair, no starvation\n`;
        advice += `❌ Convoy effect with long processes\n`;
        advice += `🎯 Best for: Batch systems, uniform workloads\n\n`;
    } else if (message.includes('sjf')) {
        advice += `**SJF (Shortest Job First)**:\n`;
        advice += `✅ Optimal average waiting time\n`;
        advice += `❌ Starvation of long processes\n`;
        advice += `🎯 Best for: CPU-intensive, known burst times\n\n`;
    } else if (message.includes('round robin') || message.includes('rr')) {
        advice += `**Round Robin**:\n`;
        advice += `✅ Fair, good responsiveness, no starvation\n`;
        advice += `❌ Higher turnaround time, context switching overhead\n`;
        advice += `🎯 Best for: Interactive systems, mixed workloads\n\n`;
    } else {
        advice += `**Quick Comparison**:\n\n`;
        advice += `🏃 **For Speed**: SJF, SRTF\n`;
        advice += `⚖️ **For Fairness**: Round Robin, FCFS\n`;
        advice += `🎯 **For Responsiveness**: SRTF, RR\n`;
        advice += `🔧 **For Simplicity**: FCFS\n`;
        advice += `⭐ **For Critical Tasks**: Priority Scheduling\n\n`;
    }
    
    advice += `💡 **Pro tip**: Use the comparison tab to see actual performance differences with your specific workload!`;
    
    return advice;
}

// Generate help response
function generateHelpResponse(message) {
    if (message.includes('quantum') || message.includes('time slice')) {
        return `🕐 **Time Quantum Help**:\n\n` +
               `The time quantum is the maximum time a process can run before being preempted in Round Robin scheduling.\n\n` +
               `**Guidelines**:\n` +
               `• Small quantum (1-2): Better responsiveness, more overhead\n` +
               `• Large quantum (8+): Less overhead, degrades to FCFS\n` +
               `• Optimal: ~80% of average burst time\n\n` +
               `Use the "Optimize" button for automatic quantum tuning!`;
    } else if (message.includes('priority')) {
        return `🎯 **Priority Scheduling Help**:\n\n` +
               `Lower numbers = Higher priority (1 is highest priority)\n\n` +
               `**Types**:\n` +
               `• Non-preemptive: Runs to completion once started\n` +
               `• Preemptive: Can be interrupted by higher priority arrivals\n\n` +
               `**Watch out for**: Starvation of low-priority processes!`;
    } else if (message.includes('context switch')) {
        return `🔄 **Context Switching**:\n\n` +
               `When the CPU switches from one process to another:\n\n` +
               `**Cost**: Time to save/restore process state\n` +
               `**Impact**: More switches = higher overhead\n` +
               `**Trade-off**: Responsiveness vs. efficiency\n\n` +
               `Preemptive algorithms generally have more context switches.`;
    } else {
        return `🤖 **I can help with**:\n\n` +
               `📊 Algorithm recommendations\n` +
               `⚡ Performance optimization\n` +
               `🔍 Workload analysis\n` +
               `🕐 Time quantum tuning\n` +
               `📈 Performance predictions\n` +
               `❓ Concept explanations\n\n` +
               `Just ask me anything about CPU scheduling!`;
    }
}

// Generate general response
function generateGeneralResponse(message) {
    const responses = [
        "That's an interesting question! Could you be more specific about what aspect of CPU scheduling you'd like to explore?",
        "I'd be happy to help! Are you looking for algorithm recommendations, performance analysis, or concept explanations?",
        "Let me know what you'd like to learn about - I can analyze your workloads, suggest optimizations, or explain scheduling concepts!",
        "I'm here to help with CPU scheduling! Try asking about algorithm recommendations, performance optimization, or workload analysis."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Update chat display
function updateChatDisplay() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${chat.type}-message fade-in`;
        
        const icon = chat.type === 'ai' ? 'fas fa-robot' : 'fas fa-user';
        const time = chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <i class="${icon}"></i>
            <div class="message-content">
                <div style="margin-bottom: 0.5rem;">${formatMessage(chat.message)}</div>
                <div style="font-size: 0.7rem; color: var(--text-tertiary); opacity: 0.7;">${time}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Format message with markdown-like styling
function formatMessage(message) {
    return message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background: var(--bg-tertiary); padding: 0.125rem 0.25rem; border-radius: 3px; font-family: monospace;">$1</code>')
        .replace(/\n/g, '<br>');
}

// Analyze workload
function analyzeWorkload() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first.');
        return;
    }
    
    const analysis = detectWorkloadPattern(processes);
    
    // Update workload analysis display
    document.getElementById('workloadType').textContent = analysis.pattern;
    document.getElementById('workloadComplexity').textContent = 
        analysis.characteristics.includes('Varying execution times') ? 'High' : 'Low';
    document.getElementById('workloadPattern').textContent = analysis.characteristics.join(', ');
    
    updateStatusText('Workload analysis complete');
    
    // Add to chat
    const analysisMessage = `🔍 **Workload Analysis Complete**:\n\n` +
                          `**Type**: ${analysis.pattern}\n` +
                          `**Characteristics**: ${analysis.characteristics.join(', ')}\n` +
                          `**Processes**: ${analysis.processCount}\n` +
                          `**Avg Burst Time**: ${analysis.avgBurstTime} units\n\n` +
                          `I've updated the analysis panel with details!`;
    
    chatHistory.push({
        type: 'ai',
        message: analysisMessage,
        timestamp: new Date()
    });
    
    updateChatDisplay();
}

// Get smart recommendations
function getSmartRecommendations() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first.');
        return;
    }
    
    const workloadAnalysis = detectWorkloadPattern(processes);
    const recommendations = generateSmartRecommendations(workloadAnalysis);
    
    // Update recommendations display
    const container = document.getElementById('aiRecommendations');
    container.innerHTML = '';
    
    recommendations.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item fade-in';
        recElement.innerHTML = `
            <div class="recommendation-header">
                <i class="${rec.icon}"></i>
                <span>${rec.title}</span>
            </div>
            <div class="recommendation-desc">${rec.description}</div>
            <div class="recommendation-score">Confidence: ${rec.confidence}%</div>
        `;
        container.appendChild(recElement);
    });
    
    updateStatusText('Smart recommendations generated');
}

// Generate smart recommendations
function generateSmartRecommendations(workloadAnalysis) {
    const recommendations = [];
    const avgBurst = parseFloat(workloadAnalysis.avgBurstTime);
    
    // Algorithm recommendation
    const algoRec = getAlgorithmRecommendations(workloadAnalysis);
    recommendations.push({
        icon: 'fas fa-brain',
        title: 'Algorithm Recommendation',
        description: `${algoRec.primary.name} - ${algoRec.primary.reason}`,
        confidence: 85
    });
    
    // Quantum recommendation (if applicable)
    if (currentAlgorithm === 'rr' || !currentAlgorithm) {
        const optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurst * 0.8)));
        recommendations.push({
            icon: 'fas fa-clock',
            title: 'Time Quantum Optimization',
            description: `Set quantum to ${optimalQuantum} units for optimal balance of responsiveness and efficiency`,
            confidence: 90
        });
    }
    
    // Performance tip
    if (workloadAnalysis.characteristics.includes('Varying execution times')) {
        recommendations.push({
            icon: 'fas fa-tachometer-alt',
            title: 'Performance Optimization',
            description: 'Consider preemptive algorithms (SRTF, RR) to handle execution time variance effectively',
            confidence: 80
        });
    }
    
    // Fairness consideration
    if (workloadAnalysis.processCount > 4) {
        recommendations.push({
            icon: 'fas fa-balance-scale',
            title: 'Fairness Consideration',
            description: 'With multiple processes, Round Robin ensures fair CPU allocation and prevents starvation',
            confidence: 75
        });
    }
    
    return recommendations;
}

// Predict performance
function predictPerformance() {
    const algorithmSelect = document.getElementById('predictionAlgorithm');
    const selectedAlgorithm = algorithmSelect ? algorithmSelect.value : 'fcfs';
    
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes for performance prediction.');
        return;
    }
    
    // Run prediction algorithm
    const prediction = generatePerformancePrediction(selectedAlgorithm, processes);
    
    // Update prediction chart
    if (predictionChart) {
        predictionChart.data.datasets[0].data = [
            prediction.turnaroundScore,
            prediction.waitingScore,
            prediction.responseScore,
            prediction.throughputScore,
            prediction.utilizationScore,
            prediction.fairnessScore
        ];
        predictionChart.update();
    }
    
    // Add prediction to chat
    const predictionMessage = `🔮 **Performance Prediction** for ${algorithmDescriptions[selectedAlgorithm]?.name}:\n\n` +
                            `📊 **Overall Score**: ${prediction.overallScore}/100\n\n` +
                            `**Breakdown**:\n` +
                            `• Turnaround Time: ${prediction.turnaroundScore}/100\n` +
                            `• Waiting Time: ${prediction.waitingScore}/100\n` +
                            `• Response Time: ${prediction.responseScore}/100\n` +
                            `• Throughput: ${prediction.throughputScore}/100\n` +
                            `• CPU Utilization: ${prediction.utilizationScore}/100\n` +
                            `• Fairness: ${prediction.fairnessScore}/100\n\n` +
                            `${prediction.summary}`;
    
    chatHistory.push({
        type: 'ai',
        message: predictionMessage,
        timestamp: new Date()
    });
    
    updateChatDisplay();
    updateStatusText(`Performance predicted for ${selectedAlgorithm.toUpperCase()}`);
}

// Generate performance prediction
function generatePerformancePrediction(algorithm, processes) {
    const workloadAnalysis = detectWorkloadPattern(processes);
    const avgBurst = parseFloat(workloadAnalysis.avgBurstTime);
    const processCount = processes.length;
    
    let turnaroundScore, waitingScore, responseScore, throughputScore, utilizationScore, fairnessScore;
    
    // Algorithm-specific scoring based on workload characteristics
    switch (algorithm) {
        case 'fcfs':
            turnaroundScore = workloadAnalysis.pattern === 'Uniform' ? 85 : 60;
            waitingScore = 50;
            responseScore = 40;
            throughputScore = 90;
            utilizationScore = 100;
            fairnessScore = 85;
            break;
            
        case 'sjf':
            turnaroundScore = 95;
            waitingScore = 95;
            responseScore = 70;
            throughputScore = 85;
            utilizationScore = 100;
            fairnessScore = 60; // Potential starvation
            break;
            
        case 'srtf':
            turnaroundScore = 98;
            waitingScore = 98;
            responseScore = 90;
            throughputScore = 80;
            utilizationScore = 95;
            fairnessScore = 75;
            break;
            
        case 'rr':
            turnaroundScore = 70;
            waitingScore = 75;
            responseScore = 95;
            throughputScore = 75;
            utilizationScore = 90;
            fairnessScore = 100;
            break;
            
        case 'priority_np':
            turnaroundScore = 80;
            waitingScore = 75;
            responseScore = 70;
            throughputScore = 85;
            utilizationScore = 100;
            fairnessScore = 65;
            break;
            
        case 'priority_p':
            turnaroundScore = 85;
            waitingScore = 80;
            responseScore = 85;
            throughputScore = 80;
            utilizationScore = 90;
            fairnessScore = 70;
            break;
            
        default:
            turnaroundScore = waitingScore = responseScore = throughputScore = utilizationScore = fairnessScore = 70;
    }
    
    // Adjust scores based on workload characteristics
    if (workloadAnalysis.characteristics.includes('I/O intensive')) {
        if (['rr', 'srtf'].includes(algorithm)) {
            responseScore += 10;
            fairnessScore += 5;
        }
    }
    
    if (workloadAnalysis.characteristics.includes('CPU intensive')) {
        if (['sjf', 'priority_np'].includes(algorithm)) {
            turnaroundScore += 5;
            waitingScore += 5;
        }
    }
    
    // Clamp scores to 0-100
    turnaroundScore = Math.min(100, Math.max(0, turnaroundScore));
    waitingScore = Math.min(100, Math.max(0, waitingScore));
    responseScore = Math.min(100, Math.max(0, responseScore));
    throughputScore = Math.min(100, Math.max(0, throughputScore));
    utilizationScore = Math.min(100, Math.max(0, utilizationScore));
    fairnessScore = Math.min(100, Math.max(0, fairnessScore));
    
    const overallScore = Math.round((turnaroundScore + waitingScore + responseScore + throughputScore + utilizationScore + fairnessScore) / 6);
    
    let summary;
    if (overallScore >= 85) {
        summary = "🌟 Excellent choice! This algorithm should perform very well with your workload.";
    } else if (overallScore >= 70) {
        summary = "✅ Good performance expected. Consider comparing with other algorithms for optimization.";
    } else if (overallScore >= 55) {
        summary = "⚠️ Moderate performance. You might want to consider alternative algorithms.";
    } else {
        summary = "❌ Poor match for your workload. I recommend trying a different algorithm.";
    }
    
    return {
        turnaroundScore,
        waitingScore,
        responseScore,
        throughputScore,
        utilizationScore,
        fairnessScore,
        overallScore,
        summary
    };
}

// Get AI recommendation for current workload
function getAIRecommendation() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first to get AI recommendations.');
        return;
    }
    
    const workloadAnalysis = detectWorkloadPattern(processes);
    const recommendations = getAlgorithmRecommendations(workloadAnalysis);
    
    // Select the recommended algorithm
    const recommendedAlgo = getAlgorithmKey(recommendations.primary.name);
    if (recommendedAlgo) {
        // Update UI to select recommended algorithm
        document.querySelectorAll('.algo-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.algorithm === recommendedAlgo) {
                card.classList.add('selected');
                currentAlgorithm = recommendedAlgo;
            }
        });
        
        updateQuantumVisibility();
        updatePriorityVisibility();
        updateAlgorithmInfo();
        
        updateStatusText(`AI recommended: ${recommendations.primary.name}`);
        
        // Show recommendation modal
        showRecommendationModal(recommendations, workloadAnalysis);
    }
}

// Get algorithm key from name
function getAlgorithmKey(name) {
    const mapping = {
        'First-Come, First-Served (FCFS)': 'fcfs',
        'Shortest Job First (SJF)': 'sjf',
        'Shortest Remaining Time First (SRTF)': 'srtf',
        'Round Robin (RR)': 'rr',
        'Priority Scheduling (Non-preemptive)': 'priority_np',
        'Priority Scheduling (Preemptive)': 'priority_p'
    };
    
    return mapping[name] || Object.keys(mapping).find(key => key.includes(name.split(' ')[0]));
}

// Show recommendation modal
function showRecommendationModal(recommendations, workloadAnalysis) {
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
        max-width: 600px;
        width: 90%;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🤖</div>
            <h3 style="margin: 0; color: var(--primary-color);">AI Algorithm Recommendation</h3>
        </div>
        
        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Workload Analysis</h4>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
                ${workloadAnalysis.pattern} workload with ${workloadAnalysis.characteristics.join(', ')}
            </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🥇</span>
                <strong>Primary Recommendation: ${recommendations.primary.name}</strong>
            </div>
            <p style="margin: 0 0 1rem 2rem; color: var(--text-secondary); font-size: 0.875rem;">
                ${recommendations.primary.reason}
            </p>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🥈</span>
                <strong>Alternative: ${recommendations.alternative.name}</strong>
            </div>
            <p style="margin: 0 0 1rem 2rem; color: var(--text-secondary); font-size: 0.875rem;">
                ${recommendations.alternative.reason}
            </p>
            
            <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                <strong>💡 Pro Tip:</strong> ${recommendations.tip}
            </div>
        </div>
        
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button onclick="this.closest('.modal').remove()" 
                    style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                Got it!
            </button>
            <button onclick="visualize(); this.closest('.modal').remove();" 
                    style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                Run Simulation
            </button>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-close after 30 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 30000);
}// AI Advisor Functions

let predictionChart = null;
let chatHistory = [];

// Initialize AI Advisor tab
function initializeAIAdvisorTab() {
    initializePredictionChart();
    setupChatInterface();
    displayWelcomeMessage();
}

// Initialize prediction chart
function initializePredictionChart() {
    const canvas = document.getElementById('predictionChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    
    if (predictionChart) {
        predictionChart.destroy();
    }
    
    predictionChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Turnaround Time', 'Waiting Time', 'Response Time', 'Throughput', 'CPU Utilization', 'Fairness'],
            datasets: [{
                label: 'Predicted Performance',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        display: false
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 10
                        },
                        color: '#64748b'
                    }
                }
            }
        }
    });
}

// Setup chat interface
function setupChatInterface() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatInput);
    }
}

// Display welcome message
function displayWelcomeMessage() {
    const welcomeMessages = [
        "Hello! I'm your AI scheduling assistant. I can help you optimize CPU scheduling performance, analyze workloads, and recommend the best algorithms for your specific needs.",
        "I can analyze your process patterns, predict performance outcomes, and suggest optimizations. What would you like to know about CPU scheduling?",
        "Feel free to ask me about algorithm performance, workload optimization, or any scheduling concepts you'd like to understand better!"
    ];
    
    chatHistory = [{
        type: 'ai',
        message: welcomeMessages[0],
        timestamp: new Date()
    }];
    
    updateChatDisplay();
}

// Handle chat input
function handleChatInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
    }
}

// Send chat message
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput || !chatInput.value.trim()) return;
    
    const message = chatInput.value.trim();
    chatInput.value = '';
    
    // Add user message to history
    chatHistory.push({
        type: 'user',
        message: message,
        timestamp: new Date()
    });
    
    updateChatDisplay();
    
    // Process AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        chatHistory.push({
            type: 'ai',
            message: aiResponse,
            timestamp: new Date()
        });
        updateChatDisplay();
    }, 1000);
}

// Generate AI response
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Pattern matching for different types of questions
    if (message.includes('recommend') || message.includes('suggest') || message.includes('best algorithm')) {
        return generateAlgorithmRecommendation(message);
    } else if (message.includes('quantum') || message.includes('time slice')) {
        return generateQuantumAdvice(message);
    } else if (message.includes('performance') || message.includes('optimize')) {
        return generatePerformanceAdvice(message);
    } else if (message.includes('workload') || message.includes('process')) {
        return generateWorkloadAdvice(message);
    } else if (message.includes('compare') || message.includes('difference')) {
        return generateComparisonAdvice(message);
    } else if (message.includes('help') || message.includes('how')) {
        return generateHelpResponse(message);
    } else {
        return generateGeneralResponse(message);
    }
}

// Generate algorithm recommendation
function generateAlgorithmRecommendation(message) {
    collectProcesses();
    
    if (processes.length === 0) {
        return "I'd be happy to recommend an algorithm! First, please configure some processes in the simulation tab so I can analyze your workload and provide personalized recommendations.";
    }
    
    const workloadAnalysis = detectWorkloadPattern(processes);
    const recommendations = getAlgorithmRecommendations(workloadAnalysis);
    
    return `Based on your current workload (${workloadAnalysis.pattern} - ${workloadAnalysis.characteristics.join(', ')}), I recommend:\n\n` +
           `🥇 **Primary**: ${recommendations.primary.name} - ${recommendations.primary.reason}\n\n` +
           `🥈 **Alternative**: ${recommendations.alternative.name} - ${recommendations.alternative.reason}\n\n` +
           `💡 **Tip**: ${recommendations.tip}`;
}
