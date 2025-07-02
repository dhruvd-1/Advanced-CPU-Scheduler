// AI Advisor Functions

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
    const welcomeMessage = `Hello! I'm your AI scheduling assistant. I can help you optimize CPU scheduling performance, analyze workloads, and recommend the best algorithms for your specific needs. I'm context-aware and will consider your current processes and algorithm selection when providing advice.`;
    
    chatHistory = [{
        type: 'ai',
        message: welcomeMessage,
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

// Show typing indicator
function showTypingIndicator() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message ai-message';
    typingDiv.innerHTML = `
        <i class="fas fa-robot"></i>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Send chat message
async function sendChatMessage() {
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
    try {
        showTypingIndicator();
        const aiResponse = await generateAIResponse(message);
        hideTypingIndicator();
        
        chatHistory.push({
            type: 'ai',
            message: aiResponse,
            timestamp: new Date()
        });
        updateChatDisplay();
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        
        chatHistory.push({
            type: 'ai',
            message: 'I apologize, but I encountered an error. Please try asking about specific CPU scheduling topics like algorithm comparisons, performance optimization, or workload analysis.',
            timestamp: new Date()
        });
        updateChatDisplay();
    }
}

// Generate AI response
async function generateAIResponse(userMessage) {
    try {
        // Prepare context
        const context = {
            algorithm: currentAlgorithm,
            processCount: processes.length,
            avgBurstTime: processes.length > 0 ? (processes.reduce((sum, p) => sum + p.burstTime, 0) / processes.length).toFixed(2) : 0,
            workloadPattern: processes.length > 0 ? detectWorkloadPattern(processes).pattern : 'Unknown'
        };

        // Get response from AI API service
        if (aiApiService && typeof aiApiService.sendMessage === 'function') {
            return await aiApiService.sendMessage(userMessage, context);
        } else {
            return getOfflineAIResponse(userMessage, context);
        }
    } catch (error) {
        console.error('AI Response Error:', error);
        
        // Fallback to offline response
        return getOfflineAIResponse(userMessage, {
            algorithm: currentAlgorithm,
            processCount: processes.length,
            avgBurstTime: processes.length > 0 ? (processes.reduce((sum, p) => sum + p.burstTime, 0) / processes.length).toFixed(2) : 0,
            workloadPattern: processes.length > 0 ? detectWorkloadPattern(processes).pattern : 'Unknown'
        });
    }
}

// Offline AI response function
function getOfflineAIResponse(message, context) {
    const msg = message.toLowerCase();
    
    // Pattern matching for different types of questions
    if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('best algorithm')) {
        return generateAlgorithmRecommendation(message, context);
    } else if (msg.includes('quantum') || msg.includes('time slice')) {
        return generateQuantumAdvice(message, context);
    } else if (msg.includes('performance') || msg.includes('optimize')) {
        return generatePerformanceAdvice(message, context);
    } else if (msg.includes('workload') || msg.includes('process')) {
        return generateWorkloadAdvice(message, context);
    } else if (msg.includes('compare') || msg.includes('difference')) {
        return generateComparisonAdvice(message, context);
    } else if (msg.includes('help') || msg.includes('how')) {
        return generateHelpResponse(message);
    } else if (msg.includes('fcfs') || msg.includes('first come')) {
        return `**FCFS (First-Come, First-Served)**

✅ **Advantages:**
- Simple implementation
- Fair in arrival order
- No starvation
- Low overhead

❌ **Disadvantages:**
- Convoy effect with long processes
- Poor average waiting time
- Not optimal for interactive systems

🎯 **Best for:** Batch processing, simple systems, uniform workloads`;
    } else if (msg.includes('sjf') || msg.includes('shortest job')) {
        return `**SJF (Shortest Job First)**

✅ **Advantages:**
- Optimal average waiting time
- Minimizes total completion time
- Good for batch systems

❌ **Disadvantages:**
- Starvation of long processes
- Requires burst time prediction
- Not practical for interactive systems

🎯 **Best for:** Batch systems with known burst times, CPU-intensive workloads`;
    } else if (msg.includes('round robin') || msg.includes('rr')) {
        return `**Round Robin**

✅ **Advantages:**
- Fair CPU allocation
- Good responsiveness
- No starvation
- Suitable for time-sharing

❌ **Disadvantages:**
- Higher turnaround time
- Context switching overhead
- Performance depends on quantum size

🎯 **Best for:** Interactive systems, time-sharing, mixed workloads

💡 **Tip:** Optimal quantum = 80% of average burst time`;
    } else if (msg.includes('priority')) {
        return `**Priority Scheduling**

✅ **Advantages:**
- Important tasks get preference
- Flexible and configurable
- Good for real-time systems

❌ **Disadvantages:**
- Starvation of low-priority processes
- Priority inversion problems
- Complex priority assignment

🎯 **Best for:** Real-time systems, critical task handling

💡 **Tip:** Use aging to prevent starvation`;
    } else {
        return generateGeneralResponse();
    }
}

// Generate algorithm recommendation
function generateAlgorithmRecommendation(message, context) {
    if (!context.processCount || context.processCount === 0) {
        return "I'd be happy to recommend an algorithm! First, please configure some processes in the simulation tab so I can analyze your workload and provide personalized recommendations.";
    }
    
    const avgBurst = parseFloat(context.avgBurstTime) || 5;
    
    if (avgBurst < 3) {
        return `🎯 **Recommendation: Round Robin**

For your **I/O-intensive workload** (avg burst: ${avgBurst}):

✅ **Why Round Robin:**
- Excellent responsiveness for short bursts
- Fair CPU sharing among processes
- Prevents convoy effect
- Good for interactive systems

⚡ **Suggested quantum:** 1-2 time units
🎭 **Alternative:** SRTF for optimal times (with more overhead)`;
    } else if (avgBurst > 8) {
        return `🎯 **Recommendation: Shortest Job First (SJF)**

For your **CPU-intensive workload** (avg burst: ${avgBurst}):

✅ **Why SJF:**
- Optimal average waiting time
- Efficient for long processes
- Minimal context switching overhead
- Good throughput

⚡ **Alternative:** Priority scheduling for critical tasks
🎭 **Avoid:** Round Robin (high overhead for long processes)`;
    } else {
        return `🎯 **Recommendation: Round Robin**

For your **balanced workload** (avg burst: ${avgBurst}):

✅ **Why Round Robin:**
- Good balance of fairness and efficiency
- Prevents starvation
- Suitable for mixed process types
- Predictable response times

⚡ **Suggested quantum:** ${Math.max(2, Math.ceil(avgBurst * 0.8))} time units
🎭 **Alternative:** SRTF for better average times`;
    }
}

// Generate quantum advice
function generateQuantumAdvice(message, context) {
    if (!context.processCount || context.processCount === 0) {
        return "Configure some processes first and I'll help you optimize the time quantum for Round Robin!";
    }

    const avgBurst = parseFloat(context.avgBurstTime) || 4;
    const optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurst * 0.8)));

    return `⏰ **Time Quantum Optimization**

**Current Workload Analysis:**
- Average burst time: ${avgBurst} units
- Process count: ${context.processCount}

🎯 **Recommended Quantum: ${optimalQuantum} units**

**Why this quantum?**
- **Too small (< ${Math.ceil(avgBurst * 0.5)}):** Excessive context switching overhead
- **Too large (> ${Math.ceil(avgBurst * 1.2)}):** Degrades to FCFS behavior
- **Sweet spot:** ~80% of average burst time

📈 **Expected Results:**
- Balanced responsiveness and efficiency
- Reduced context switching overhead
- Fair CPU allocation

💡 **Pro tip:** Monitor response times and adjust if needed!`;
}

// Generate performance advice
function generatePerformanceAdvice(message, context) {
    return `📈 **Performance Optimization Guide**

**Key Metrics to Monitor:**
- **Turnaround Time:** Completion - Arrival
- **Waiting Time:** Turnaround - Burst
- **Response Time:** First execution - Arrival

🎯 **Optimization Strategies:**

**For Low Turnaround Time:**
- Use SJF or SRTF algorithms
- Avoid FCFS with mixed burst times
- Consider preemptive scheduling

**For Better Responsiveness:**
- Use Round Robin with optimal quantum
- Avoid large quantum values
- Consider priority scheduling for critical tasks

**For High Throughput:**
- Minimize context switching overhead
- Use non-preemptive algorithms for CPU-bound tasks
- Batch similar processes together

**General Tips:**
✅ Match algorithm to workload characteristics
✅ Monitor CPU utilization (aim for >95%)
✅ Consider memory and I/O constraints
✅ Use comparison mode to test different algorithms

🔍 **Current Context:** ${context.algorithm ? `Using ${context.algorithm.toUpperCase()}` : 'No algorithm selected'}`;
}

// Generate workload advice
function generateWorkloadAdvice(message, context) {
    if (!context.processCount) {
        return "Add some processes and I'll analyze your workload pattern for you!";
    }

    return `🔍 **Workload Analysis**

**Current Workload:**
- **Processes:** ${context.processCount}
- **Pattern:** ${context.workloadPattern || 'Mixed'}
- **Average Burst:** ${context.avgBurstTime || 'Unknown'} units

**Workload Classifications:**

**I/O Intensive (< 3 avg burst):**
- Frequent I/O operations
- Short CPU bursts
- Best: Round Robin, SRTF

**CPU Intensive (> 8 avg burst):**
- Long computation periods
- Minimal I/O interruptions
- Best: SJF, Priority scheduling

**Balanced Workload (3-8 avg burst):**
- Mix of I/O and CPU operations
- Moderate burst times
- Best: Round Robin, SRTF

**📈 Optimization Tips:**
- Group similar processes when possible
- Consider multilevel queue for mixed types
- Monitor context switching overhead
- Adjust scheduling based on system goals`;
}

// Generate comparison advice
function generateComparisonAdvice(message, context) {
    return `📊 **Algorithm Comparison Guide**

**🏃 Speed Champions:**
- **SJF/SRTF:** Best average waiting time
- **Priority:** Fast for high-priority tasks

**⚖️ Fairness Winners:**
- **Round Robin:** Equal time slices for all
- **FCFS:** Fair arrival-order processing

**🎯 Responsiveness Leaders:**
- **Round Robin:** Consistent response times
- **SRTF:** Quick response for short jobs

**🔧 Simplicity Award:**
- **FCFS:** Easiest to implement and understand

**⭐ Versatility Champion:**
- **Round Robin:** Good all-around performer

**🏆 Quick Decision Matrix:**
- **Batch systems:** SJF or FCFS
- **Interactive systems:** Round Robin
- **Real-time systems:** Priority scheduling
- **Mixed workloads:** Round Robin or SRTF

💡 Use the comparison tab to see actual performance differences!`;
}

// Generate help response
function generateHelpResponse(message) {
    if (message.includes('quantum') || message.includes('time slice')) {
        return `🕐 **Time Quantum Help**:

The time quantum is the maximum time a process can run before being preempted in Round Robin scheduling.

**Guidelines:**
- Small quantum (1-2): Better responsiveness, more overhead
- Large quantum (8+): Less overhead, degrades to FCFS
- Optimal: ~80% of average burst time

Use the "Optimize" button for automatic quantum tuning!`;
    } else if (message.includes('priority')) {
        return `🎯 **Priority Scheduling Help**:

Lower numbers = Higher priority (1 is highest priority)

**Types:**
- Non-preemptive: Runs to completion once started
- Preemptive: Can be interrupted by higher priority arrivals

**Watch out for**: Starvation of low-priority processes!`;
    } else {
        return `🤖 **I can help with**:

📊 Algorithm recommendations
⚡ Performance optimization
🔍 Workload analysis
🕐 Time quantum tuning
📈 Performance predictions
❓ Concept explanations

${aiApiService && aiApiService.hasAPIKey() ? '🌟 Enhanced with OpenAI - ask me anything!' : '🔑 Add OpenAI API key for enhanced responses!'}

Just ask me anything about CPU scheduling!`;
    }
}

// Generate general response
function generateGeneralResponse() {
    const responses = [
        "I'm here to help with CPU scheduling! Ask me about algorithms, optimization, or performance analysis.",
        "What would you like to know about CPU scheduling? I can explain algorithms, suggest optimizations, or analyze your workload.",
        "Feel free to ask about FCFS, SJF, Round Robin, Priority scheduling, or any performance optimization questions!",
        "I can help you choose the best algorithm, optimize parameters, or understand scheduling concepts. What interests you?"
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

// Main AI functions called by buttons
// Get AI recommendation for current workload - CORRECTED VERSION
async function getAIRecommendation() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first to get AI recommendations.');
        return;
    }

    try {
        updateStatusText('Analyzing workload and generating recommendation...');
        
        // Analyze workload
        const workloadAnalysis = detectWorkloadPattern(processes);
        const recommendations = getAlgorithmRecommendations(workloadAnalysis);
        
        // Get the recommended algorithm key
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
            
            // Update algorithm-specific settings
            updateQuantumVisibility();
            updatePriorityVisibility();
            updateAlgorithmInfo();
            
            // If Round Robin, set optimal quantum
            if (recommendedAlgo === 'rr') {
                const avgBurst = parseFloat(workloadAnalysis.avgBurstTime);
                const optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurst * 0.8)));
                const quantumInput = document.getElementById('quantum');
                if (quantumInput) {
                    quantumInput.value = optimalQuantum;
                    timeQuantum = optimalQuantum;
                }
            }
            
            updateStatusText(`AI recommended: ${recommendations.primary.name}`);
            
            // Show detailed recommendation modal
            showAIRecommendationModal(recommendations, workloadAnalysis);
            
            // Add to chat history if on AI tab
            const recommendationMessage = `🎯 **AI Recommendation Applied**

**Selected Algorithm:** ${recommendations.primary.name}

**Reasoning:** ${recommendations.primary.reason}

**Alternative Option:** ${recommendations.alternative.name}

**Pro Tip:** ${recommendations.tip}

The algorithm has been automatically selected for you. Click "Start Simulation" to see it in action!`;
            
            chatHistory.push({
                type: 'ai',
                message: recommendationMessage,
                timestamp: new Date()
            });
            
            // Update chat display if chat container exists
            if (document.getElementById('chatContainer')) {
                updateChatDisplay();
            }
        }
    } catch (error) {
        console.error('Recommendation error:', error);
        updateStatusText('Error generating recommendation');
        showAlert('Sorry, there was an error generating the recommendation. Please try again.');
    }
}

// Show AI recommendation modal - NEW FUNCTION
function showAIRecommendationModal(recommendations, workloadAnalysis) {
    // Remove any existing modal
    const existingModal = document.querySelector('.ai-recommendation-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'ai-recommendation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 16px;
        max-width: 700px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Get algorithm color for styling
    const algorithmKey = getAlgorithmKey(recommendations.primary.name);
    const algorithmColors = {
        'fcfs': '#10b981',
        'sjf': '#3b82f6', 
        'srtf': '#8b5cf6',
        'rr': '#f59e0b',
        'priority_np': '#ef4444',
        'priority_p': '#ec4899'
    };
    const primaryColor = algorithmColors[algorithmKey] || '#3b82f6';
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 0.5rem;">🤖</div>
            <h2 style="margin: 0; color: ${primaryColor}; font-size: 1.75rem;">AI Algorithm Recommendation</h2>
            <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">Based on your workload analysis</p>
        </div>
        
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid ${primaryColor};">
            <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.5rem;">📊</span>
                Workload Analysis
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                <div>
                    <strong>Pattern:</strong><br>
                    <span style="color: #6b7280;">${workloadAnalysis.pattern}</span>
                </div>
                <div>
                    <strong>Process Count:</strong><br>
                    <span style="color: #6b7280;">${workloadAnalysis.processCount}</span>
                </div>
                <div>
                    <strong>Avg Burst Time:</strong><br>
                    <span style="color: #6b7280;">${workloadAnalysis.avgBurstTime} units</span>
                </div>
                <div>
                    <strong>Characteristics:</strong><br>
                    <span style="color: #6b7280;">${workloadAnalysis.characteristics.join(', ')}</span>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <div style="background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05); padding: 1.5rem; border-radius: 12px; border: 2px solid ${primaryColor}30; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                    <span style="font-size: 2rem;">🥇</span>
                    <div>
                        <h3 style="margin: 0; color: ${primaryColor}; font-size: 1.3rem;">Recommended: ${recommendations.primary.name}</h3>
                        <p style="margin: 0.25rem 0 0 0; color: #4b5563; font-size: 0.9rem;">Primary choice for your workload</p>
                    </div>
                </div>
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                    ${recommendations.primary.reason}
                </p>
            </div>
            
            <div style="background: #f9fafb; padding: 1.25rem; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <span style="font-size: 1.5rem;">🥈</span>
                    <h4 style="margin: 0; color: #374151; font-size: 1.1rem;">Alternative: ${recommendations.alternative.name}</h4>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 0.9rem; line-height: 1.5;">
                    ${recommendations.alternative.reason}
                </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fbbf2415, #fbbf2405); padding: 1.25rem; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">💡</span>
                    <div>
                        <strong style="color: #92400e;">Pro Tip:</strong>
                        <p style="margin: 0.5rem 0 0 0; color: #78350f; line-height: 1.5; font-size: 0.9rem;">
                            ${recommendations.tip}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap;">
            <button onclick="this.closest('.ai-recommendation-modal').remove()" 
                    style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                Got it!
            </button>
            <button onclick="visualize(); this.closest('.ai-recommendation-modal').remove();" 
                    style="background: ${primaryColor}; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 500; box-shadow: 0 2px 4px ${primaryColor}40; transition: all 0.2s;">
                🚀 Run Simulation
            </button>
        </div>
    `;
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-30px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .ai-recommendation-modal button:hover {
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Auto-close after 45 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 45000);
}

// Improved getAlgorithmKey function
function getAlgorithmKey(name) {
    const mapping = {
        'First-Come, First-Served (FCFS)': 'fcfs',
        'FCFS': 'fcfs',
        'Shortest Job First (SJF)': 'sjf', 
        'SJF': 'sjf',
        'Shortest Remaining Time First (SRTF)': 'srtf',
        'SRTF': 'srtf',
        'Round Robin (RR)': 'rr',
        'Round Robin': 'rr',
        'RR': 'rr',
        'Priority Scheduling (Non-preemptive)': 'priority_np',
        'Priority Scheduling (Preemptive)': 'priority_p',
        'Priority': 'priority_np'
    };
    
    // Direct match first
    if (mapping[name]) {
        return mapping[name];
    }
    
    // Partial match
    const lowerName = name.toLowerCase();
    if (lowerName.includes('fcfs') || lowerName.includes('first come')) return 'fcfs';
    if (lowerName.includes('sjf') || lowerName.includes('shortest job')) return 'sjf';
    if (lowerName.includes('srtf') || lowerName.includes('shortest remaining')) return 'srtf';
    if (lowerName.includes('round robin') || lowerName.includes('rr')) return 'rr';
    if (lowerName.includes('priority')) {
        return lowerName.includes('preemptive') && !lowerName.includes('non') ? 'priority_p' : 'priority_np';
    }
    
    return 'fcfs'; // Default fallback
}

async function optimizeQuantum() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first.');
        return;
    }

    try {
        updateStatusText('Optimizing quantum...');
        
        const avgBurst = processes.reduce((sum, p) => sum + p.burstTime, 0) / processes.length;
        const optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurst * 0.8)));
        
        // Apply the quantum
        const quantumInput = document.getElementById('quantum');
        if (quantumInput) {
            quantumInput.value = optimalQuantum;
            timeQuantum = optimalQuantum;
        }
        
        const optimization = `⏰ **Quantum Optimized to ${optimalQuantum} units**

**Analysis:**
- Average burst time: ${avgBurst.toFixed(1)} units
- Optimal quantum: ~80% of average burst
- This provides balanced responsiveness and efficiency`;
        
        // Add to chat
        chatHistory.push({
            type: 'ai',
            message: optimization,
            timestamp: new Date()
        });
        updateChatDisplay();
        
        updateStatusText('Quantum optimization complete');
    } catch (error) {
        console.error('Optimization error:', error);
        updateStatusText('Applied offline quantum optimization');
    }
}

async function analyzeWorkload() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first.');
        return;
    }

    try {
        updateStatusText('Analyzing workload...');
        
        // Always update the UI display first
        const workloadAnalysis = detectWorkloadPattern(processes);
        const workloadTypeEl = document.getElementById('workloadType');
        const workloadComplexityEl = document.getElementById('workloadComplexity');
        const workloadPatternEl = document.getElementById('workloadPattern');
        
        if (workloadTypeEl) workloadTypeEl.textContent = workloadAnalysis.pattern;
        if (workloadComplexityEl) workloadComplexityEl.textContent = 
            workloadAnalysis.characteristics.includes('Varying execution times') ? 'High' : 'Low';
        if (workloadPatternEl) workloadPatternEl.textContent = workloadAnalysis.characteristics.join(', ');
        
        const analysis = `🔍 **Workload Analysis Complete**

**Type:** ${workloadAnalysis.pattern}
**Characteristics:** ${workloadAnalysis.characteristics.join(', ')}
**Processes:** ${workloadAnalysis.processCount}
**Avg Burst Time:** ${workloadAnalysis.avgBurstTime} units

Based on this analysis, I recommend ${workloadAnalysis.pattern === 'Uniform' ? 'FCFS or Round Robin' : 'Round Robin or SRTF'} for optimal performance.`;
        
        // Add to chat
        chatHistory.push({
            type: 'ai',
            message: analysis,
            timestamp: new Date()
        });
        updateChatDisplay();
        
        updateStatusText('Workload analysis complete');
    } catch (error) {
        console.error('Analysis error:', error);
        updateStatusText('Completed offline workload analysis');
    }
}

async function getSmartRecommendations() {
    collectProcesses();
    
    if (processes.length === 0) {
        showAlert('Please configure some processes first.');
        return;
    }
    
    const workloadAnalysis = detectWorkloadPattern(processes);
    const recommendations = generateSmartRecommendations(workloadAnalysis);
    
    // Update recommendations display
    const container = document.getElementById('aiRecommendations');
    if (container) {
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
    }
    
    updateStatusText('Smart recommendations generated');
}

// Generate smart recommendations
function generateSmartRecommendations(workloadAnalysis) {
    const recommendations = [];
    const avgBurst = parseFloat(workloadAnalysis.avgBurstTime);
    
    // Algorithm recommendation
    if (avgBurst < 3) {
        recommendations.push({
            icon: 'fas fa-brain',
            title: 'Algorithm Recommendation',
            description: 'Round Robin - Excellent for I/O-intensive workloads with frequent context switches',
            confidence: 85
        });
    } else if (avgBurst > 8) {
        recommendations.push({
            icon: 'fas fa-brain',
            title: 'Algorithm Recommendation',
            description: 'SJF - Optimal for CPU-intensive workloads with minimal context switching',
            confidence: 90
        });
    } else {
        recommendations.push({
            icon: 'fas fa-brain',
            title: 'Algorithm Recommendation',
            description: 'Round Robin - Balanced approach for mixed workloads',
            confidence: 80
        });
    }
    
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
    
    return recommendations;
}

async function predictPerformance() {
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
    const predictionMessage = `🔮 **Performance Prediction** for ${selectedAlgorithm.toUpperCase()}:

📊 **Overall Score**: ${prediction.overallScore}/100

**Breakdown:**
- Turnaround Time: ${prediction.turnaroundScore}/100
- Waiting Time: ${prediction.waitingScore}/100
- Response Time: ${prediction.responseScore}/100
- Throughput: ${prediction.throughputScore}/100
- CPU Utilization: ${prediction.utilizationScore}/100
- Fairness: ${prediction.fairnessScore}/100

${prediction.summary}`;
    
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
    
    let turnaroundScore, waitingScore, responseScore, throughputScore, utilizationScore, fairnessScore;
    
    // Algorithm-specific scoring
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
            fairnessScore = 60;
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