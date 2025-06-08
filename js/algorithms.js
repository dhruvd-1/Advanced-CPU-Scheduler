// CPU Scheduling Algorithms Implementation

// First-Come, First-Served (FCFS) Scheduling
function fcfsScheduling() {
    let sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let schedule = [];
    let currentTime = 0;

    sortedProcesses.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        
        if (process.responseTime === -1) {
            process.responseTime = currentTime - process.arrivalTime;
        }
        
        process.startTime = currentTime;
        
        schedule.push({
            processId: process.id,
            startTime: currentTime,
            endTime: currentTime + process.burstTime,
            duration: process.burstTime
        });
        
        currentTime += process.burstTime;
        process.completionTime = currentTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
    });

    return schedule;
}

// Shortest Job First (SJF) Scheduling
function sjfScheduling() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = [...processes];

    while (remainingProcesses.length > 0) {
        let availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (availableProcesses.length === 0) {
            currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            continue;
        }

        // Sort by burst time (shortest first)
        availableProcesses.sort((a, b) => {
            if (a.burstTime === b.burstTime) {
                return a.arrivalTime - b.arrivalTime; // FCFS for tie-breaking
            }
            return a.burstTime - b.burstTime;
        });
        
        let selectedProcess = availableProcesses[0];
        
        if (selectedProcess.responseTime === -1) {
            selectedProcess.responseTime = currentTime - selectedProcess.arrivalTime;
        }

        selectedProcess.startTime = currentTime;

        schedule.push({
            processId: selectedProcess.id,
            startTime: currentTime,
            endTime: currentTime + selectedProcess.burstTime,
            duration: selectedProcess.burstTime
        });

        currentTime += selectedProcess.burstTime;
        selectedProcess.completionTime = currentTime;
        selectedProcess.turnaroundTime = selectedProcess.completionTime - selectedProcess.arrivalTime;
        selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;

        remainingProcesses = remainingProcesses.filter(p => p.id !== selectedProcess.id);
    }

    return schedule;
}

// Shortest Remaining Time First (SRTF) Scheduling
function srtfScheduling() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = processes.map(p => ({ ...p }));
    let contextSwitches = 0;
    let lastProcess = null;
    
    while (remainingProcesses.some(p => p.remainingTime > 0)) {
        let availableProcesses = remainingProcesses.filter(p => 
            p.arrivalTime <= currentTime && p.remainingTime > 0
        );
        
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        // Sort by remaining time (shortest first)
        availableProcesses.sort((a, b) => {
            if (a.remainingTime === b.remainingTime) {
                return a.arrivalTime - b.arrivalTime; // FCFS for tie-breaking
            }
            return a.remainingTime - b.remainingTime;
        });
        
        let selectedProcess = availableProcesses[0];
        
        if (selectedProcess.responseTime === -1) {
            selectedProcess.responseTime = currentTime - selectedProcess.arrivalTime;
        }

        if (lastProcess && lastProcess.id !== selectedProcess.id) {
            contextSwitches++;
        }
        lastProcess = selectedProcess;

        // Check when next process arrives
        let nextArrival = remainingProcesses
            .filter(p => p.arrivalTime > currentTime && p.remainingTime > 0)
            .map(p => p.arrivalTime)
            .sort((a, b) => a - b)[0];

        let executionTime;
        if (nextArrival && nextArrival < currentTime + selectedProcess.remainingTime) {
            executionTime = nextArrival - currentTime;
        } else {
            executionTime = selectedProcess.remainingTime;
        }

        schedule.push({
            processId: selectedProcess.id,
            startTime: currentTime,
            endTime: currentTime + executionTime,
            duration: executionTime
        });

        selectedProcess.remainingTime -= executionTime;
        currentTime += executionTime;

        if (selectedProcess.remainingTime === 0) {
            selectedProcess.completionTime = currentTime;
            selectedProcess.turnaroundTime = selectedProcess.completionTime - selectedProcess.arrivalTime;
            selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;
        }
    }

    // Update original processes array
    remainingProcesses.forEach(rp => {
        let originalProcess = processes.find(p => p.id === rp.id);
        if (originalProcess) {
            Object.assign(originalProcess, rp);
        }
    });

    return schedule;
}

// Round Robin (RR) Scheduling
function roundRobinScheduling() {
    let schedule = [];
    let currentTime = 0;
    let queue = [];
    let remainingProcesses = processes.map(p => ({ ...p }));
    let processIndex = 0;
    let contextSwitches = 0;

    while (remainingProcesses.some(p => p.remainingTime > 0) || queue.length > 0) {
        // Add newly arrived processes to queue
        while (processIndex < remainingProcesses.length && 
               remainingProcesses[processIndex].arrivalTime <= currentTime) {
            queue.push(remainingProcesses[processIndex]);
            processIndex++;
        }

        if (queue.length === 0) {
            if (processIndex < remainingProcesses.length) {
                currentTime = remainingProcesses[processIndex].arrivalTime;
            }
            continue;
        }

        let currentProcess = queue.shift();
        
        if (currentProcess.responseTime === -1) {
            currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
        }

        contextSwitches++;
        let executionTime = Math.min(timeQuantum, currentProcess.remainingTime);

        schedule.push({
            processId: currentProcess.id,
            startTime: currentTime,
            endTime: currentTime + executionTime,
            duration: executionTime
        });

        currentTime += executionTime;
        currentProcess.remainingTime -= executionTime;

        // Add newly arrived processes before reinserting current process
        while (processIndex < remainingProcesses.length && 
               remainingProcesses[processIndex].arrivalTime <= currentTime) {
            queue.push(remainingProcesses[processIndex]);
            processIndex++;
        }

        if (currentProcess.remainingTime > 0) {
            queue.push(currentProcess);
        } else {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        }
    }

    // Update original processes array
    remainingProcesses.forEach(rp => {
        let originalProcess = processes.find(p => p.id === rp.id);
        if (originalProcess) {
            Object.assign(originalProcess, rp);
        }
    });

    return schedule;
}

// Priority Scheduling (Non-preemptive)
function prioritySchedulingNonPreemptive() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = [...processes];

    while (remainingProcesses.length > 0) {
        let availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (availableProcesses.length === 0) {
            currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            continue;
        }

        // Sort by priority (lower number = higher priority), then by arrival time
        availableProcesses.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.priority - b.priority;
        });
        
        let selectedProcess = availableProcesses[0];
        
        if (selectedProcess.responseTime === -1) {
            selectedProcess.responseTime = currentTime - selectedProcess.arrivalTime;
        }

        selectedProcess.startTime = currentTime;

        schedule.push({
            processId: selectedProcess.id,
            startTime: currentTime,
            endTime: currentTime + selectedProcess.burstTime,
            duration: selectedProcess.burstTime
        });

        currentTime += selectedProcess.burstTime;
        selectedProcess.completionTime = currentTime;
        selectedProcess.turnaroundTime = selectedProcess.completionTime - selectedProcess.arrivalTime;
        selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;

        remainingProcesses = remainingProcesses.filter(p => p.id !== selectedProcess.id);
    }

    return schedule;
}

// Priority Scheduling (Preemptive)
function prioritySchedulingPreemptive() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = processes.map(p => ({ ...p }));
    let contextSwitches = 0;
    let lastProcess = null;
    
    while (remainingProcesses.some(p => p.remainingTime > 0)) {
        let availableProcesses = remainingProcesses.filter(p => 
            p.arrivalTime <= currentTime && p.remainingTime > 0
        );
        
        if (availableProcesses.length === 0) {
            currentTime++;
            continue;
        }

        // Sort by priority (lower number = higher priority), then by arrival time
        availableProcesses.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.priority - b.priority;
        });
        
        let selectedProcess = availableProcesses[0];
        
        if (selectedProcess.responseTime === -1) {
            selectedProcess.responseTime = currentTime - selectedProcess.arrivalTime;
        }

        if (lastProcess && lastProcess.id !== selectedProcess.id) {
            contextSwitches++;
        }
        lastProcess = selectedProcess;

        // Check when next higher priority process arrives
        let nextHigherPriorityArrival = remainingProcesses
            .filter(p => p.arrivalTime > currentTime && 
                        p.remainingTime > 0 && 
                        p.priority < selectedProcess.priority)
            .map(p => p.arrivalTime)
            .sort((a, b) => a - b)[0];

        let executionTime;
        if (nextHigherPriorityArrival && nextHigherPriorityArrival <= currentTime + selectedProcess.remainingTime) {
            executionTime = nextHigherPriorityArrival - currentTime;
        } else {
            executionTime = selectedProcess.remainingTime;
        }

        schedule.push({
            processId: selectedProcess.id,
            startTime: currentTime,
            endTime: currentTime + executionTime,
            duration: executionTime
        });

        selectedProcess.remainingTime -= executionTime;
        currentTime += executionTime;

        if (selectedProcess.remainingTime === 0) {
            selectedProcess.completionTime = currentTime;
            selectedProcess.turnaroundTime = selectedProcess.completionTime - selectedProcess.arrivalTime;
            selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;
        }
    }

    // Update original processes array
    remainingProcesses.forEach(rp => {
        let originalProcess = processes.find(p => p.id === rp.id);
        if (originalProcess) {
            Object.assign(originalProcess, rp);
        }
    });

    return schedule;
}

// Multilevel Feedback Queue (MLFQ) Scheduling - Bonus Algorithm
function mlfqScheduling() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = processes.map(p => ({ ...p, queueLevel: 0 }));
    
    // Three queues with different time quantums
    const queues = [[], [], []];
    const quantums = [2, 4, 8]; // Different time slices for each queue
    let processIndex = 0;

    while (remainingProcesses.some(p => p.remainingTime > 0) || 
           queues.some(queue => queue.length > 0)) {
        
        // Add newly arrived processes to highest priority queue (queue 0)
        while (processIndex < remainingProcesses.length && 
               remainingProcesses[processIndex].arrivalTime <= currentTime) {
            remainingProcesses[processIndex].queueLevel = 0;
            queues[0].push(remainingProcesses[processIndex]);
            processIndex++;
        }

        // Find the highest priority non-empty queue
        let currentQueue = -1;
        for (let i = 0; i < queues.length; i++) {
            if (queues[i].length > 0) {
                currentQueue = i;
                break;
            }
        }

        if (currentQueue === -1) {
            if (processIndex < remainingProcesses.length) {
                currentTime = remainingProcesses[processIndex].arrivalTime;
            }
            continue;
        }

        let currentProcess = queues[currentQueue].shift();
        
        if (currentProcess.responseTime === -1) {
            currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
        }

        let executionTime = Math.min(quantums[currentQueue], currentProcess.remainingTime);

        schedule.push({
            processId: currentProcess.id,
            startTime: currentTime,
            endTime: currentTime + executionTime,
            duration: executionTime
        });

        currentTime += executionTime;
        currentProcess.remainingTime -= executionTime;

        // Add newly arrived processes during execution
        while (processIndex < remainingProcesses.length && 
               remainingProcesses[processIndex].arrivalTime <= currentTime) {
            remainingProcesses[processIndex].queueLevel = 0;
            queues[0].push(remainingProcesses[processIndex]);
            processIndex++;
        }

        if (currentProcess.remainingTime > 0) {
            // Demote to lower priority queue if not completed
            if (currentQueue < queues.length - 1) {
                currentProcess.queueLevel = currentQueue + 1;
                queues[currentQueue + 1].push(currentProcess);
            } else {
                // Stay in lowest priority queue
                queues[currentQueue].push(currentProcess);
            }
        } else {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        }
    }

    // Update original processes array
    remainingProcesses.forEach(rp => {
        let originalProcess = processes.find(p => p.id === rp.id);
        if (originalProcess) {
            Object.assign(originalProcess, rp);
        }
    });

    return schedule;
}

// Completely Fair Scheduler (CFS) - Simplified Implementation
function cfsScheduling() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = processes.map(p => ({ 
        ...p, 
        vruntime: 0,  // Virtual runtime
        weight: 1024, // Default weight
        lastRunTime: 0
    }));
    let processIndex = 0;

    while (remainingProcesses.some(p => p.remainingTime > 0)) {
        // Add newly arrived processes
        while (processIndex < remainingProcesses.length && 
               remainingProcesses[processIndex].arrivalTime <= currentTime) {
            processIndex++;
        }

        let availableProcesses = remainingProcesses.filter(p => 
            p.arrivalTime <= currentTime && p.remainingTime > 0
        );

        if (availableProcesses.length === 0) {
            if (processIndex < remainingProcesses.length) {
                currentTime = remainingProcesses[processIndex].arrivalTime;
            }
            continue;
        }

        // Select process with minimum virtual runtime
        availableProcesses.sort((a, b) => a.vruntime - b.vruntime);
        let selectedProcess = availableProcesses[0];

        if (selectedProcess.responseTime === -1) {
            selectedProcess.responseTime = currentTime - selectedProcess.arrivalTime;
        }

        // Calculate time slice (simplified)
        let timeSlice = Math.min(4, selectedProcess.remainingTime);

        schedule.push({
            processId: selectedProcess.id,
            startTime: currentTime,
            endTime: currentTime + timeSlice,
            duration: timeSlice
        });

        currentTime += timeSlice;
        selectedProcess.remainingTime -= timeSlice;
        
        // Update virtual runtime
        selectedProcess.vruntime += (timeSlice * 1024) / selectedProcess.weight;
        selectedProcess.lastRunTime = currentTime;

        if (selectedProcess.remainingTime === 0) {
            selectedProcess.completionTime = currentTime;
            selectedProcess.turnaroundTime = selectedProcess.completionTime - selectedProcess.arrivalTime;
            selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;
        }
    }

    // Update original processes array
    remainingProcesses.forEach(rp => {
        let originalProcess = processes.find(p => p.id === rp.id);
        if (originalProcess) {
            Object.assign(originalProcess, rp);
        }
    });

    return schedule;
}

// Lottery Scheduling - Probabilistic Algorithm
function lotteryScheduling() {
    let schedule = [];
    let currentTime = 0;
    let remainingProcesses = processes.map(p => ({ 
        ...p, 
        tickets: p.priority ? (6 - p.priority) * 10 : 10 // Higher priority gets more tickets
    }));
    let processIndex = 0;

    while (remainingProcesses.some(p => p.remainingTime > 0)) {
        // Add newly arrived processes
        while (processIndex < remainingProcesses.length && 
               remainingProcesses[processIndex].arrivalTime <= currentTime) {
            processIndex++;
        }

        let availableProcesses = remainingProcesses.filter(p => 
            p.arrivalTime <= currentTime && p.remainingTime > 0
        );

        if (availableProcesses.length === 0) {
            if (processIndex < remainingProcesses.length) {
                currentTime = remainingProcesses[processIndex].arrivalTime;
            }
            continue;
        }

        // Calculate total tickets
        let totalTickets = availableProcesses.reduce((sum, p) => sum + p.tickets, 0);
        
        // Draw random ticket
        let winningTicket = Math.floor(Math.random() * totalTickets);
        
        // Find winner
        let currentTickets = 0;
        let selectedProcess = null;
        for (let process of availableProcesses) {
            currentTickets += process.tickets;
            if (winningTicket < currentTickets) {
                selectedProcess = process;
                break;
            }
        }

        if (!selectedProcess) {
            selectedProcess = availableProcesses[0]; // Fallback
        }

        if (selectedProcess.responseTime === -1) {
            selectedProcess.responseTime = currentTime - selectedProcess.arrivalTime;
        }

        // Execute for time slice
        let timeSlice = Math.min(3, selectedProcess.remainingTime);

        schedule.push({
            processId: selectedProcess.id,
            startTime: currentTime,
            endTime: currentTime + timeSlice,
            duration: timeSlice
        });

        currentTime += timeSlice;
        selectedProcess.remainingTime -= timeSlice;

        if (selectedProcess.remainingTime === 0) {
            selectedProcess.completionTime = currentTime;
            selectedProcess.turnaroundTime = selectedProcess.completionTime - selectedProcess.arrivalTime;
            selectedProcess.waitingTime = selectedProcess.turnaroundTime - selectedProcess.burstTime;
        }
    }

    // Update original processes array
    remainingProcesses.forEach(rp => {
        let originalProcess = processes.find(p => p.id === rp.id);
        if (originalProcess) {
            Object.assign(originalProcess, rp);
        }
    });

    return schedule;
}

// Algorithm performance analyzer
function analyzeAlgorithmPerformance(algorithmName, processSet) {
    // Save current state
    const originalProcesses = processes;
    const originalAlgorithm = currentAlgorithm;
    
    // Set up for analysis
    processes = processSet.map(p => ({ ...p }));
    currentAlgorithm = algorithmName;
    
    // Run algorithm
    let schedule = runSchedulingAlgorithm();
    let metrics = calculateMetrics();
    
    // Restore original state
    processes = originalProcesses;
    currentAlgorithm = originalAlgorithm;
    
    return {
        algorithm: algorithmName,
        schedule: schedule,
        metrics: metrics,
        processCount: processSet.length,
        totalTime: Math.max(...processSet.map(p => p.completionTime || 0))
    };
}

// Workload pattern detection
function detectWorkloadPattern(processSet) {
    const burstTimes = processSet.map(p => p.burstTime);
    const arrivalTimes = processSet.map(p => p.arrivalTime);
    
    const avgBurst = burstTimes.reduce((a, b) => a + b, 0) / burstTimes.length;
    const maxBurst = Math.max(...burstTimes);
    const minBurst = Math.min(...burstTimes);
    const burstVariance = burstTimes.reduce((sum, burst) => sum + Math.pow(burst - avgBurst, 2), 0) / burstTimes.length;
    
    const avgArrival = arrivalTimes.reduce((a, b) => a + b, 0) / arrivalTimes.length;
    const maxArrival = Math.max(...arrivalTimes);
    
    // Classify workload
    let pattern = "Mixed";
    let characteristics = [];
    
    if (burstVariance < 2) {
        pattern = "Uniform";
        characteristics.push("Similar execution times");
    } else if (maxBurst / minBurst > 3) {
        pattern = "Heterogeneous";
        characteristics.push("Varying execution times");
    }
    
    if (avgBurst < 3) {
        characteristics.push("I/O intensive");
    } else if (avgBurst > 8) {
        characteristics.push("CPU intensive");
    } else {
        characteristics.push("Balanced workload");
    }
    
    if (maxArrival < 5) {
        characteristics.push("Batch arrival");
    } else {
        characteristics.push("Distributed arrival");
    }
    
    return {
        pattern: pattern,
        characteristics: characteristics,
        avgBurstTime: avgBurst.toFixed(2),
        burstTimeRange: `${minBurst}-${maxBurst}`,
        arrivalTimeSpan: maxArrival,
        processCount: processSet.length
    };
}