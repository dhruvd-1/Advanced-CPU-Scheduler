// AI API Integration with Open Source LLM

class AIAPIService {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-3.5-turbo'; // or 'gpt-4' if you have access
        this.systemPrompt = this.getSystemPrompt();
        
        updateStatusText('OpenAI Assistant ready');
        console.log('AI API Service initialized with OpenAI');
    }

    // Get API endpoint from environment or use default
    getAPIEndpoint() {
        // You can change this to your preferred LLM endpoint
        // Examples:
        // - Ollama: 'http://localhost:11434/api/generate'
        // - OpenAI: 'https://api.openai.com/v1/chat/completions'
        // - Hugging Face: 'https://api-inference.huggingface.co/models/your-model'
        return 'https://api.openai.com/v1/chat/completions';
    }

    // Get model name
    getModel() {
        // You can change this to your preferred model
        // Examples: 'llama2', 'codellama', 'mistral', 'gpt-3.5-turbo'
        return 'gpt-3.5-turbo';
    }

    // Get system prompt for the LLM
    getSystemPrompt() {
        return `You are an expert AI assistant specializing in CPU scheduling algorithms and operating systems. You have deep knowledge of:

1. CPU Scheduling Algorithms: FCFS, SJF, SRTF, Round Robin, Priority Scheduling (preemptive and non-preemptive)
2. Performance Metrics: Turnaround time, waiting time, response time, throughput, CPU utilization
3. Algorithm Analysis: Trade-offs, advantages, disadvantages, best use cases
4. Optimization: Time quantum tuning, workload analysis, performance prediction
5. Operating Systems Concepts: Context switching, convoy effect, starvation, aging

Guidelines for responses:
- Focus primarily on CPU scheduling topics
- Provide practical, actionable advice
- Use clear explanations with examples when helpful
- Include relevant metrics and recommendations
- Use emojis and formatting to make responses engaging
- Keep responses concise but comprehensive (under 300 words)
- Always be helpful and educational

Current context: The user is working with a CPU scheduling simulator that allows them to configure processes, run different algorithms, and compare performance.

Respond in a helpful, knowledgeable, and engaging manner while staying focused on CPU scheduling and related topics.`;
    }

    // Main method to send message to LLM
    async sendMessage(message, context = {}) {
        try {
            // Build context-aware prompt
            const contextualPrompt = this.buildContextualPrompt(message, context);
            
            // Try to send to LLM API
            const response = await this.sendToLLM(contextualPrompt);
            return response;
        } catch (error) {
            console.error('LLM API error:', error);
            // Fallback to enhanced offline responses
            return this.getEnhancedOfflineResponse(message, context);
        }
    }

    // Send message to LLM API (works with multiple LLM providers)
    async sendToLLM(prompt) {
        try {
            // For Ollama
            if (this.baseURL.includes('ollama') || this.baseURL.includes('11434')) {
                return await this.sendToOllama(prompt);
            }
            // For OpenAI-compatible APIs
            else if (this.baseURL.includes('openai') || this.baseURL.includes('chat/completions')) {
                return await this.sendToOpenAI(prompt);
            }
            // For Hugging Face
            else if (this.baseURL.includes('huggingface')) {
                return await this.sendToHuggingFace(prompt);
            }
            // Default fallback
            else {
                throw new Error('Unsupported API endpoint');
            }
        } catch (error) {
            console.error('LLM API call failed:', error);
            throw error;
        }
    }

    // Send to Ollama
    async sendToOllama(prompt) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 400
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || 'Sorry, I couldn\'t generate a response.';
    }

    // Send to OpenAI-compatible API
    async sendToOpenAI(prompt) {
        // Get API key from environment variable or process.env
        const apiKey = process.env.OPENAI_API_KEY || window.ENV?.OPENAI_API_KEY || '';
        
        if (!apiKey) {
            throw new Error('OpenAI API key not found in environment variables');
        }
        
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: this.systemPrompt
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,  // Increased for better responses
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    }

    // Send to Hugging Face
    async sendToHuggingFace(prompt) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 400,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data[0]?.generated_text || 'Sorry, I couldn\'t generate a response.';
    }

    // Build contextual prompt with current workload info
    buildContextualPrompt(message, context) {
        const contextInfo = this.buildContextString(context);
        
        return `${this.systemPrompt}

Current Context: ${contextInfo}

User Question: ${message}

Please provide a helpful response focused on CPU scheduling:`;
    }

    // Build context string from current application state
    buildContextString(context) {
        const parts = [];
        
        if (context.algorithm) {
            parts.push(`Current algorithm: ${context.algorithm.toUpperCase()}`);
        }
        
        if (context.processCount && context.processCount > 0) {
            parts.push(`${context.processCount} processes configured`);
        }
        
        if (context.avgBurstTime) {
            parts.push(`Average burst time: ${context.avgBurstTime} units`);
        }
        
        if (context.workloadPattern) {
            parts.push(`Workload pattern: ${context.workloadPattern}`);
        }

        // Add detailed process information if available
        if (typeof processes !== 'undefined' && processes && processes.length > 0) {
            const processInfo = processes.map(p => 
                `${p.id}(arrival:${p.arrivalTime}, burst:${p.burstTime}${p.priority ? `, priority:${p.priority}` : ''})`
            ).join(', ');
            parts.push(`Process details: ${processInfo}`);
        }

        // Add current metrics if available
        if (typeof lastCalculatedMetrics !== 'undefined' && lastCalculatedMetrics) {
            parts.push(`Last metrics - Avg Turnaround: ${lastCalculatedMetrics.avgTurnaroundTime?.toFixed(2) || 'N/A'}, Avg Waiting: ${lastCalculatedMetrics.avgWaitingTime?.toFixed(2) || 'N/A'}`);
        }

        return parts.length > 0 ? parts.join('; ') : 'No context available';
    }

    // Enhanced offline responses with context awareness
    getEnhancedOfflineResponse(message, context) {
        const msg = message.toLowerCase();
        
        // Context-aware greeting
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            const contextGreeting = context.processCount > 0 ? 
                `I can see you have ${context.processCount} processes configured with ${context.algorithm || 'no algorithm selected'}. ` : '';
            
            return `👋 Hello! I'm your CPU scheduling expert assistant. ${contextGreeting}I'm here to help you understand algorithms, optimize performance, and analyze your workloads. What would you like to explore?`;
        }

        // Context-aware algorithm recommendations
        if (msg.includes('recommend') || msg.includes('best algorithm') || msg.includes('suggest')) {
            return this.getContextualAlgorithmRecommendation(context);
        }
        
        // Other pattern matching with context
        if (msg.includes('quantum') || msg.includes('time slice')) {
            return this.getContextualQuantumAdvice(context);
        }
        
        if (msg.includes('performance') || msg.includes('optimize') || msg.includes('improve')) {
            return this.getContextualPerformanceAdvice(context);
        }
        
        if (msg.includes('workload') || msg.includes('analyze')) {
            return this.getContextualWorkloadAdvice(context);
        }
        
        if (msg.includes('compare') || msg.includes('difference') || msg.includes('vs')) {
            return this.getComparisonAdvice(context);
        }
        
        // Algorithm-specific explanations
        if (msg.includes('fcfs') || msg.includes('first come')) {
            return this.getFCFSExplanation();
        }
        
        if (msg.includes('sjf') || msg.includes('shortest job')) {
            return this.getSJFExplanation();
        }
        
        if (msg.includes('round robin') || msg.includes('rr')) {
            return this.getRoundRobinExplanation();
        }
        
        if (msg.includes('priority')) {
            return this.getPriorityExplanation();
        }

        if (msg.includes('srtf') || msg.includes('shortest remaining')) {
            return this.getSRTFExplanation();
        }
        
        if (msg.includes('help') || msg.includes('how') || msg.includes('what')) {
            return this.getHelpResponse();
        }
        
        return this.getGeneralResponse(context);
    }

    // Context-aware algorithm recommendation
    getContextualAlgorithmRecommendation(context) {
        if (!context.processCount || context.processCount === 0) {
            return `🎯 **Algorithm Recommendation Engine**

Please configure some processes first so I can analyze your workload and provide personalized recommendations!

Once you add processes, I'll analyze:
- Burst time patterns (${context.avgBurstTime || 'unknown'} avg currently)
- Arrival time distribution  
- Workload characteristics
- System requirements

Then recommend the optimal algorithm with reasoning! 🚀`;
        }

        const avgBurst = parseFloat(context.avgBurstTime) || 5;
        const currentAlgo = context.algorithm ? ` (currently using ${context.algorithm.toUpperCase()})` : '';
        
        if (avgBurst < 3) {
            return `🎯 **Recommendation: Round Robin** ${currentAlgo}

**Analysis of your I/O-intensive workload** (${context.processCount} processes, avg burst: ${avgBurst} units):

✅ **Why Round Robin is perfect:**
- Excellent responsiveness for short, frequent bursts
- Fair CPU sharing prevents any process from hogging resources
- Prevents convoy effect that would hurt FCFS
- Ideal for interactive systems with frequent I/O

⚡ **Optimized Settings:**
- **Suggested quantum:** 1-2 time units
- **Expected benefits:** Low response time, fair execution

🎭 **Alternative consideration:** SRTF for absolute optimal times (with higher overhead)

📈 **Predicted performance:** Excellent response times, good overall efficiency`;
        } else if (avgBurst > 8) {
            return `🎯 **Recommendation: Shortest Job First (SJF)** ${currentAlgo}

**Analysis of your CPU-intensive workload** (${context.processCount} processes, avg burst: ${avgBurst} units):

✅ **Why SJF is optimal:**
- Minimizes average waiting time (mathematically proven)
- Efficient for long-running processes
- Minimal context switching overhead
- Maximizes throughput for CPU-bound tasks

⚡ **Performance benefits:**
- **Optimal average waiting time**
- **Reduced context switching**
- **High CPU utilization**

🎭 **Alternatives to consider:**
- Priority scheduling for critical task handling
- Avoid Round Robin (high overhead for long processes)

📈 **Predicted performance:** Optimal average times, excellent throughput`;
        } else {
            const optimalQuantum = Math.max(2, Math.ceil(avgBurst * 0.8));
            return `🎯 **Recommendation: Round Robin** ${currentAlgo}

**Analysis of your balanced workload** (${context.processCount} processes, avg burst: ${avgBurst} units):

✅ **Why Round Robin excels here:**
- Perfect balance of fairness and efficiency
- Prevents starvation of any process type
- Suitable for mixed process characteristics
- Predictable, consistent response times

⚡ **Optimized quantum setting:**
- **Recommended:** ${optimalQuantum} time units
- **Reasoning:** ~80% of average burst time
- **Benefits:** Balanced responsiveness + efficiency

🎭 **High-performance alternative:** SRTF for better average times (with more overhead)

📈 **Predicted performance:** Good overall balance, fair execution, predictable behavior`;
        }
    }

    // Context-aware quantum advice
    getContextualQuantumAdvice(context) {
        if (!context.processCount || context.processCount === 0) {
            return `⏰ **Time Quantum Optimization**

Configure some processes first and I'll help you find the perfect quantum size for Round Robin!

I'll analyze your specific workload to provide personalized quantum recommendations.`;
        }

        const avgBurst = parseFloat(context.avgBurstTime) || 4;
        const optimalQuantum = Math.max(1, Math.min(8, Math.ceil(avgBurst * 0.8)));
        const currentAlgo = context.algorithm === 'rr' ? ' (perfect timing since you\'re using Round Robin!)' : '';

        return `⏰ **Time Quantum Optimization Analysis** ${currentAlgo}

**Your Current Workload:**
- 📊 Average burst time: ${avgBurst} units
- 🔢 Process count: ${context.processCount}
- 📈 Pattern: ${context.workloadPattern || 'Mixed'}

🎯 **Optimal Quantum: ${optimalQuantum} units**

**Scientific Reasoning:**
- **Lower bound (${Math.ceil(avgBurst * 0.5)} units):** Prevents excessive context switching
- **Upper bound (${Math.ceil(avgBurst * 1.2)} units):** Maintains time-sharing benefits
- **Sweet spot:** 80% of average burst = optimal balance

📈 **Expected Performance Improvements:**
✅ Balanced responsiveness and efficiency
✅ Reduced context switching overhead  
✅ Fair CPU allocation across processes
✅ Optimal for your specific workload pattern

💡 **Pro monitoring tip:** Watch for response time vs throughput trade-offs and adjust if needed!`;
    }

    // Context-aware performance advice
    getContextualPerformanceAdvice(context) {
        const currentAlgo = context.algorithm ? context.algorithm.toUpperCase() : 'None selected';
        const processInfo = context.processCount ? `with ${context.processCount} processes` : '';
        
        return `📈 **Performance Optimization for Your Workload** ${processInfo}

**🔍 Current System Analysis:**
- **Algorithm in use:** ${currentAlgo}
- **Process count:** ${context.processCount || 'Not configured'}
- **Workload type:** ${context.workloadPattern || 'Unknown'}
- **Avg burst time:** ${context.avgBurstTime || 'Unknown'} units

**🎯 Key Performance Metrics:**
- **Turnaround Time:** Total time from arrival to completion
- **Waiting Time:** Time spent in ready queue  
- **Response Time:** Time to first execution
- **Throughput:** Processes completed per time unit

**⚡ Specific Optimizations for Your Setup:**

${context.algorithm === 'rr' ? `
**Round Robin Optimizations:**
- Current quantum should be ~${Math.ceil(parseFloat(context.avgBurstTime || 4) * 0.8)} units for your workload
- Monitor context switching overhead
- Consider SRTF if you need better average times` : 
context.algorithm === 'fcfs' ? `
**FCFS Optimizations:**
- Consider sorting processes by burst time first
- Watch for convoy effect with mixed burst times
- Switch to Round Robin for better responsiveness` :
context.algorithm === 'sjf' ? `
**SJF Optimizations:**
- Monitor for starvation of long processes
- Consider aging mechanism for fairness
- Perfect choice for your CPU-intensive workload` : `
**General Optimizations:**
- Match algorithm to workload characteristics
- Use comparison tab to test different algorithms
- Monitor CPU utilization (aim for >95%)`}

💡 **Next Steps:** ${context.processCount > 0 ? 'Run your simulation and check the metrics!' : 'Configure some processes to get specific advice!'}`;
    }

    // Context-aware workload advice
    getContextualWorkloadAdvice(context) {
        if (!context.processCount) {
            return `🔍 **Workload Analysis Engine**

Add some processes and I'll perform a comprehensive workload analysis for you!

I'll analyze burst time patterns, arrival characteristics, and provide optimization recommendations.`;
        }

        const avgBurst = parseFloat(context.avgBurstTime) || 0;
        const processCount = context.processCount || 0;
        const pattern = context.workloadPattern || 'Unknown';

        return `🔍 **Live Workload Analysis**

**📊 Current Workload Profile:**
- **Processes:** ${processCount} configured
- **Pattern Classification:** ${pattern}
- **Average Burst Time:** ${avgBurst} units
- **Complexity Level:** ${processCount > 5 ? 'High' : processCount > 2 ? 'Medium' : 'Low'}

**🎯 Detailed Classification:**

${avgBurst < 3 ? `
**I/O Intensive Workload Detected** 🔄
- Frequent context switches expected
- Short CPU bursts with I/O waits
- **Optimal algorithms:** Round Robin, SRTF
- **Quantum recommendation:** 1-2 units
- **Focus:** Responsiveness and fairness` : avgBurst > 8 ? `
**CPU Intensive Workload Detected** ⚡
- Long computation periods
- Minimal I/O interruptions  
- **Optimal algorithms:** SJF, Priority scheduling
- **Focus:** Throughput and efficiency
- **Avoid:** Small quantum Round Robin` : `
**Balanced Workload Detected** ⚖️
- Mix of I/O and CPU operations
- Moderate burst times
- **Optimal algorithms:** Round Robin, SRTF
- **Quantum recommendation:** ${Math.ceil(avgBurst * 0.8)} units
- **Focus:** Overall balanced performance`}

**🚀 Immediate Actions:**
${context.algorithm ? `You're using ${context.algorithm.toUpperCase()} - ${this.getAlgorithmFeedback(context.algorithm, avgBurst)}` : 'Select an algorithm based on the recommendations above'}

Try running the simulation to see actual performance metrics!`;
    }

    // Get algorithm feedback based on workload
    getAlgorithmFeedback(algorithm, avgBurst) {
        switch(algorithm) {
            case 'rr':
                return avgBurst < 5 ? 'Great choice for your workload!' : 'Consider SJF for better efficiency with longer processes';
            case 'sjf':
                return avgBurst > 5 ? 'Excellent choice for CPU-intensive tasks!' : 'Round Robin might be better for shorter processes';
            case 'fcfs':
                return 'Simple but may not be optimal - consider Round Robin for better responsiveness';
            case 'srtf':
                return 'Optimal performance choice, but watch for context switching overhead';
            case 'priority_np':
            case 'priority_p':
                return 'Good for systems with different priority requirements';
            default:
                return 'analysis pending';
        }
    }

    // Algorithm explanations (keeping existing ones)
    getFCFSExplanation() {
        return `**🚀 FCFS (First-Come, First-Served)**

**How it works:** Processes execute in arrival order - simple queue-based scheduling.

✅ **Advantages:**
- Simple implementation and understanding
- Fair in terms of arrival order
- No starvation (every process eventually runs)
- Very low scheduling overhead

❌ **Disadvantages:**
- **Convoy Effect:** Short processes wait for long ones
- Poor average waiting time with mixed burst times
- Not suitable for interactive systems

🎯 **Best for:** Batch processing, simple systems, uniform workloads

💡 **Pro Tip:** Works best when processes have similar execution times!`;
    }

    getSJFExplanation() {
        return `**🎯 SJF (Shortest Job First)**

**How it works:** Selects the process with shortest burst time first.

✅ **Advantages:**
- **Optimal average waiting time** (mathematically proven)
- Minimizes total completion time
- Good throughput for known workloads
- Efficient CPU utilization

❌ **Disadvantages:**
- **Starvation** of long processes
- Requires accurate burst time prediction
- Not practical for interactive systems

🎯 **Best for:** Batch systems with known execution times, CPU-intensive workloads

💡 **Pro Tip:** Consider aging to prevent starvation of long processes!`;
    }

    getSRTFExplanation() {
        return `**⏱️ SRTF (Shortest Remaining Time First)**

**How it works:** Preemptive SJF - switches to newly arrived shorter processes.

✅ **Advantages:**
- **Optimal average waiting time** among preemptive algorithms
- Better response time than SJF
- Adapts dynamically to new arrivals
- Excellent for mixed workloads

❌ **Disadvantages:**
- High context switching overhead
- Starvation of long processes
- Complex implementation

🎯 **Best for:** Interactive systems, mixed workloads, when optimal times are crucial

💡 **Pro Tip:** Ideal when you need optimal performance and can handle context switching overhead!`;
    }

    getRoundRobinExplanation() {
        return `**🔄 Round Robin**

**How it works:** Each process gets a fixed time quantum in circular fashion.

✅ **Advantages:**
- **Fair CPU allocation** for all processes
- No starvation (everyone gets turns)
- Good for interactive/time-sharing systems
- Predictable response times

❌ **Disadvantages:**
- Higher average turnaround time
- Context switching overhead
- Performance depends on quantum size

🎯 **Best for:** Time-sharing systems, interactive applications, mixed workloads

💡 **Pro Tip:** Optimal quantum = ~80% of average burst time!`;
    }

    getPriorityExplanation() {
        return `**📊 Priority Scheduling**

**How it works:** Processes scheduled based on priority values.

✅ **Advantages:**
- Important tasks get preference
- Flexible and configurable
- Good for real-time systems

❌ **Disadvantages:**
- **Starvation** of low-priority processes
- Priority inversion problems
- Complex priority assignment

🎯 **Best for:** Real-time systems, critical task handling

💡 **Pro Tip:** Use aging mechanism to prevent starvation!`;
    }

    getComparisonAdvice(context) {
        return `📊 **Algorithm Comparison Guide**

**🏃‍♂️ Performance Leaders:**
- **SJF/SRTF:** Best average waiting time
- **Round Robin:** Best responsiveness
- **FCFS:** Simplest implementation

**⚖️ Fairness Champions:**
- **Round Robin:** Equal time slices
- **FCFS:** Arrival-order fairness

**🎪 Quick Decision Matrix:**
- **Batch systems** → SJF or FCFS
- **Interactive systems** → Round Robin
- **Real-time systems** → Priority scheduling  
- **Mixed workloads** → Round Robin or SRTF

${context.processCount ? `\n🔍 **For your current workload** (${context.processCount} processes):
Try the comparison tab to see actual performance differences!` : ''}

💡 Use the comparison feature to benchmark with YOUR specific workload!`;
    }

    getHelpResponse() {
        return `🤖 **CPU Scheduling Assistant Help**

**🎯 I can help you with:**

📊 **Algorithm Analysis & Recommendations**
- Compare FCFS, SJF, SRTF, Round Robin, Priority
- Recommend optimal algorithms for your workload
- Predict performance outcomes

⚡ **Performance Optimization**  
- Optimize time quantum for Round Robin
- Analyze performance metrics
- Suggest improvements

🔍 **Workload Analysis**
- Classify your process patterns
- Identify optimal algorithms
- Provide optimization strategies

**💬 Try asking:**
- "What's the best algorithm for my workload?"
- "How do I optimize Round Robin quantum?"
- "Explain the convoy effect"
- "Compare SJF vs SRTF"

Just ask me anything about CPU scheduling! 😊`;
    }

    getGeneralResponse(context) {
        const contextAware = context.processCount > 0 ? 
            `I can see you have ${context.processCount} processes configured. ` : '';
        
        const responses = [
            `${contextAware}I'm your CPU scheduling expert! Ask me about algorithms, performance optimization, or workload analysis.`,
            `${contextAware}What would you like to know about CPU scheduling? I can explain concepts, suggest optimizations, or analyze your processes.`,
            `${contextAware}Feel free to ask about FCFS, SJF, Round Robin, Priority scheduling, or any performance questions!`,
            `${contextAware}I'm here to help optimize your CPU scheduling! What specific topic interests you?`,
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Compatibility methods for existing code
    async analyzeWorkload(processes) {
        const workloadAnalysis = detectWorkloadPattern(processes);
        const context = {
            processCount: processes.length,
            avgBurstTime: workloadAnalysis.avgBurstTime,
            workloadPattern: workloadAnalysis.pattern
        };

        return this.getContextualWorkloadAdvice(context);
    }

    async getAlgorithmRecommendationForProcesses(processes) {
        const workloadAnalysis = detectWorkloadPattern(processes);
        const context = {
            processCount: processes.length,
            avgBurstTime: workloadAnalysis.avgBurstTime,
            workloadPattern: workloadAnalysis.pattern
        };

        return this.getContextualAlgorithmRecommendation(context);
    }

    async optimizeQuantum(processes) {
        const avgBurst = processes.reduce((sum, p) => sum + p.burstTime, 0) / processes.length;
        const context = {
            processCount: processes.length,
            avgBurstTime: avgBurst.toFixed(2)
        };

        return this.getContextualQuantumAdvice(context);
    }
}

// Initialize global AI service
let aiApiService;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        try {
            aiApiService = new AIAPIService();
            console.log('AI API Service initialized');
        } catch (error) {
            console.error('Failed to initialize AI API Service:', error);
        }
    }, 1000);
});