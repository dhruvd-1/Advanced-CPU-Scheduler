// Visualization Functions for CPU Scheduler

// Render Gantt Chart
function renderGanttChart(schedule) {
    const ganttTimeline = document.getElementById('ganttTimeline');
    const timeAxis = document.getElementById('timeAxis');
    
    if (!ganttTimeline || !timeAxis) return;
    
    ganttTimeline.innerHTML = '';
    timeAxis.innerHTML = '';

    if (schedule.length === 0) {
        ganttTimeline.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-gantt"></i>
                <p>No scheduling data to display</p>
            </div>
        `;
        return;
    }

    const maxTime = Math.max(...schedule.map(s => s.endTime));
    const containerWidth = ganttTimeline.parentElement.offsetWidth - 48;
    const totalDuration = maxTime;
    const blockWidth = Math.max(containerWidth / totalDuration, 40);

    // Create consolidated schedule (merge consecutive blocks of same process)
    const consolidatedSchedule = consolidateSchedule(schedule);

    // Render gantt blocks
    consolidatedSchedule.forEach((item, index) => {
        const block = document.createElement('div');
        block.className = 'gantt-block slide-in';
        block.style.width = (item.duration * blockWidth) + 'px';
        block.style.minWidth = '30px'; // Ensure readability
        
        const processIndex = processes.findIndex(p => p.id === item.processId);
        block.style.background = processColors[processIndex % processColors.length];
        block.style.animationDelay = (index * 0.1) + 's';
        block.textContent = item.processId;
        
        // Enhanced tooltip
        block.title = `${item.processId}\nStart: ${item.startTime}\nEnd: ${item.endTime}\nDuration: ${item.duration}`;
        
        // Click handler for detailed info
        block.addEventListener('click', () => showProcessDetail(item));
        
        // Hover effects
        block.addEventListener('mouseenter', () => {
            block.style.transform = 'scale(1.05)';
            block.style.zIndex = '100';
            block.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });
        
        block.addEventListener('mouseleave', () => {
            block.style.transform = 'scale(1)';
            block.style.zIndex = '1';
            block.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
        
        ganttTimeline.appendChild(block);
    });

    // Render time axis
    for (let time = 0; time <= maxTime; time++) {
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.style.width = blockWidth + 'px';
        marker.style.minWidth = '30px';
        marker.textContent = time;
        timeAxis.appendChild(marker);
    }

    // Store animation data for playback
    animationData = schedule;
    animationStep = 0;
    
    // Show process execution info
    displayProcessExecutionInfo(schedule);
}

// Consolidate consecutive blocks of the same process
function consolidateSchedule(schedule) {
    if (schedule.length === 0) return [];
    
    const consolidated = [];
    let current = { ...schedule[0] };
    
    for (let i = 1; i < schedule.length; i++) {
        const item = schedule[i];
        
        // If same process and consecutive time, merge
        if (item.processId === current.processId && item.startTime === current.endTime) {
            current.endTime = item.endTime;
            current.duration = current.endTime - current.startTime;
        } else {
            consolidated.push(current);
            current = { ...item };
        }
    }
    
    consolidated.push(current);
    return consolidated;
}

// Display process execution information
function displayProcessExecutionInfo(schedule) {
    const timeline = document.getElementById('ganttTimeline');
    
    // Add process execution summary
    const summary = document.createElement('div');
    summary.className = 'execution-summary';
    summary.style.cssText = `
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: var(--border-radius);
        font-size: 0.875rem;
    `;
    
    const totalTime = Math.max(...schedule.map(s => s.endTime));
    const uniqueProcesses = [...new Set(schedule.map(s => s.processId))];
    const contextSwitches = schedule.length - 1;
    
    summary.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
            <div><strong>Total Time:</strong> ${totalTime} units</div>
            <div><strong>Processes:</strong> ${uniqueProcesses.length}</div>
            <div><strong>Context Switches:</strong> ${contextSwitches}</div>
            <div><strong>CPU Utilization:</strong> 100%</div>
        </div>
    `;
    
    // Remove existing summary if present
    const existingSummary = timeline.parentElement.querySelector('.execution-summary');
    if (existingSummary) {
        existingSummary.remove();
    }
    
    timeline.parentElement.appendChild(summary);
}

// Show detailed process information
function showProcessDetail(item) {
    const process = processes.find(p => p.id === item.processId);
    if (!process) return;
    
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
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    content.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${processColors[processes.findIndex(p => p.id === process.id) % processColors.length]}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${process.id}
            </div>
            <h3 style="margin: 0; color: var(--text-primary);">Process Details</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Arrival Time</div>
                <div style="font-weight: 600; color: var(--text-primary);">${process.arrivalTime}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Burst Time</div>
                <div style="font-weight: 600; color: var(--text-primary);">${process.burstTime}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Priority</div>
                <div style="font-weight: 600; color: var(--text-primary);">${process.priority}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Completion Time</div>
                <div style="font-weight: 600; color: var(--text-primary);">${process.completionTime}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Turnaround Time</div>
                <div style="font-weight: 600; color: var(--primary-color);">${process.turnaroundTime}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Waiting Time</div>
                <div style="font-weight: 600; color: var(--warning-color);">${process.waitingTime}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Response Time</div>
                <div style="font-weight: 600; color: var(--accent-color);">${process.responseTime}</div>
            </div>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px;">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Efficiency</div>
                <div style="font-weight: 600; color: var(--text-primary);">${((process.burstTime / process.turnaroundTime) * 100).toFixed(1)}%</div>
            </div>
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button onclick="this.closest('.modal').remove()" 
                    style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                Close
            </button>
            <button onclick="exportProcessData('${process.id}'); this.closest('.modal').remove();" 
                    style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                Export Data
            </button>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Export individual process data
function exportProcessData(processId) {
    const process = processes.find(p => p.id === processId);
    if (!process) return;
    
    const data = {
        processId: process.id,
        algorithm: currentAlgorithm,
        metrics: {
            arrivalTime: process.arrivalTime,
            burstTime: process.burstTime,
            priority: process.priority,
            completionTime: process.completionTime,
            turnaroundTime: process.turnaroundTime,
            waitingTime: process.waitingTime,
            responseTime: process.responseTime,
            efficiency: ((process.burstTime / process.turnaroundTime) * 100).toFixed(2)
        },
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process_${processId}_${currentAlgorithm}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Render Results Table
function renderResultsTable() {
    const resultsBody = document.getElementById('resultsBody');
    if (!resultsBody) return;
    
    resultsBody.innerHTML = '';

    if (processes.length === 0) {
        resultsBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    Run simulation to view detailed results
                </td>
            </tr>
        `;
        return;
    }

    processes.forEach((process, index) => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.style.animationDelay = (index * 0.1) + 's';
        
        // Add efficiency calculation
        const efficiency = process.turnaroundTime > 0 ? 
            ((process.burstTime / process.turnaroundTime) * 100).toFixed(1) : 0;
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${processColors[index % processColors.length]};"></div>
                    <span class="process-id">${process.id}</span>
                </div>
            </td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.completionTime}</td>
            <td>${process.turnaroundTime}</td>
            <td>${process.waitingTime}</td>
            <td>${process.responseTime}</td>
        `;
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'var(--bg-tertiary)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
        
        resultsBody.appendChild(row);
    });
}

// Animation Control Functions
function playAnimation() {
    if (animationData.length === 0) {
        showAlert('Please run a simulation first to enable animation.');
        return;
    }

    const playIcon = document.getElementById('playIcon');
    if (!playIcon) return;
    
    if (isAnimating) {
        // Pause animation
        isAnimating = false;
        playIcon.className = 'fas fa-play';
        updateStatusText('Animation paused');
    } else {
        // Start animation
        isAnimating = true;
        playIcon.className = 'fas fa-pause';
        updateStatusText('Animation playing');
        animateStep();
    }
}

function animateStep() {
    if (!isAnimating || animationStep >= animationData.length) {
        isAnimating = false;
        const playIcon = document.getElementById('playIcon');
        if (playIcon) playIcon.className = 'fas fa-play';
        updateStatusText('Animation complete');
        return;
    }

    // Highlight current step
    const ganttBlocks = document.querySelectorAll('.gantt-block');
    const consolidatedData = consolidateSchedule(animationData);
    
    // Find which consolidated block corresponds to current step
    let currentBlockIndex = -1;
    let currentTime = 0;
    
    for (let i = 0; i <= animationStep && i < animationData.length; i++) {
        if (i === animationStep) {
            currentTime = animationData[i].startTime;
            break;
        }
    }
    
    // Find the consolidated block that contains this time
    for (let i = 0; i < consolidatedData.length; i++) {
        const block = consolidatedData[i];
        if (currentTime >= block.startTime && currentTime < block.endTime) {
            currentBlockIndex = i;
            break;
        }
    }
    
    ganttBlocks.forEach((block, index) => {
        if (index === currentBlockIndex) {
            block.style.border = '3px solid var(--accent-color)';
            block.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
            block.style.transform = 'scale(1.05)';
        } else if (index < currentBlockIndex) {
            block.style.opacity = '0.7';
            block.style.border = 'none';
            block.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            block.style.transform = 'scale(1)';
        } else {
            block.style.opacity = '0.3';
            block.style.border = 'none';
            block.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            block.style.transform = 'scale(1)';
        }
    });

    // Update current process info
    updateCurrentProcessInfo();
    animationStep++;

    setTimeout(() => {
        if (isAnimating) {
            animateStep();
        }
    }, animationSpeed);
}

function stepForward() {
    if (animationData.length === 0) {
        showAlert('Please run a simulation first.');
        return;
    }

    if (animationStep < animationData.length) {
        const ganttBlocks = document.querySelectorAll('.gantt-block');
        const consolidatedData = consolidateSchedule(animationData);
        
        // Similar logic as animateStep but for single step
        let currentTime = animationData[animationStep].startTime;
        let currentBlockIndex = -1;
        
        for (let i = 0; i < consolidatedData.length; i++) {
            const block = consolidatedData[i];
            if (currentTime >= block.startTime && currentTime < block.endTime) {
                currentBlockIndex = i;
                break;
            }
        }
        
        if (ganttBlocks[currentBlockIndex]) {
            ganttBlocks[currentBlockIndex].style.border = '3px solid var(--accent-color)';
            ganttBlocks[currentBlockIndex].style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
        }
        
        animationStep++;
        updateCurrentProcessInfo();
        updateStatusText(`Step ${animationStep}/${animationData.length}`);
    }
}

function resetAnimation() {
    isAnimating = false;
    animationStep = 0;
    const playIcon = document.getElementById('playIcon');
    if (playIcon) playIcon.className = 'fas fa-play';
    
    const ganttBlocks = document.querySelectorAll('.gantt-block');
    ganttBlocks.forEach(block => {
        block.style.opacity = '1';
        block.style.border = 'none';
        block.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        block.style.transform = 'scale(1)';
    });
    
    updateCurrentProcessInfo();
    updateStatusText('Animation reset');
}

function updateCurrentProcessInfo() {
    const currentProcessElement = document.getElementById('currentProcess');
    const currentTimeElement = document.getElementById('currentTime');
    const remainingTimeElement = document.getElementById('remainingTime');
    const queueLengthElement = document.getElementById('queueLength');
    
    if (animationData.length > 0 && animationStep < animationData.length) {
        const currentItem = animationData[animationStep];
        
        if (currentProcessElement) currentProcessElement.textContent = currentItem.processId;
        if (currentTimeElement) currentTimeElement.textContent = currentItem.startTime;
        if (remainingTimeElement) remainingTimeElement.textContent = currentItem.duration;
        if (queueLengthElement) queueLengthElement.textContent = Math.max(0, processes.length - animationStep - 1);
    } else {
        if (currentProcessElement) currentProcessElement.textContent = '-';
        if (currentTimeElement) currentTimeElement.textContent = '0';
        if (remainingTimeElement) remainingTimeElement.textContent = '-';
        if (queueLengthElement) queueLengthElement.textContent = '0';
    }
}

// Advanced Visualization Features

// Create process flow diagram
function createProcessFlowDiagram() {
    const flowContainer = document.createElement('div');
    flowContainer.className = 'process-flow-diagram';
    flowContainer.style.cssText = `
        margin: 1rem 0;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
    `;
    
    const title = document.createElement('h4');
    title.textContent = 'Process State Flow';
    title.style.cssText = 'margin: 0 0 1rem 0; color: var(--text-primary);';
    
    const statesContainer = document.createElement('div');
    statesContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    `;
    
    const states = [
        { name: 'New', color: '#94a3b8', icon: 'fas fa-plus' },
        { name: 'Ready', color: '#3b82f6', icon: 'fas fa-clock' },
        { name: 'Running', color: '#10b981', icon: 'fas fa-play' },
        { name: 'Waiting', color: '#f59e0b', icon: 'fas fa-pause' },
        { name: 'Terminated', color: '#ef4444', icon: 'fas fa-check' }
    ];
    
    states.forEach((state, index) => {
        const stateElement = document.createElement('div');
        stateElement.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0.75rem;
            background: ${state.color};
            color: white;
            border-radius: var(--border-radius);
            min-width: 80px;
            font-size: 0.875rem;
            font-weight: 500;
        `;
        
        stateElement.innerHTML = `
            <i class="${state.icon}" style="font-size: 1.25rem; margin-bottom: 0.25rem;"></i>
            <span>${state.name}</span>
        `;
        
        statesContainer.appendChild(stateElement);
        
        // Add arrow between states (except last)
        if (index < states.length - 1) {
            const arrow = document.createElement('i');
            arrow.className = 'fas fa-arrow-right';
            arrow.style.cssText = 'color: var(--text-tertiary); font-size: 1.25rem;';
            statesContainer.appendChild(arrow);
        }
    });
    
    flowContainer.appendChild(title);
    flowContainer.appendChild(statesContainer);
    
    return flowContainer;
}

// Create CPU utilization timeline
function createCPUUtilizationTimeline(schedule) {
    const container = document.createElement('div');
    container.className = 'cpu-utilization-timeline';
    container.style.cssText = `
        margin: 1rem 0;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
    `;
    
    const title = document.createElement('h4');
    title.textContent = 'CPU Utilization Timeline';
    title.style.cssText = 'margin: 0 0 1rem 0; color: var(--text-primary);';
    
    const timeline = document.createElement('div');
    timeline.style.cssText = `
        height: 60px;
        background: var(--bg-primary);
        border-radius: 4px;
        border: 1px solid var(--border-color);
        position: relative;
        overflow: hidden;
    `;
    
    if (schedule.length > 0) {
        const maxTime = Math.max(...schedule.map(s => s.endTime));
        
        schedule.forEach(item => {
            const block = document.createElement('div');
            const widthPercent = (item.duration / maxTime) * 100;
            const leftPercent = (item.startTime / maxTime) * 100;
            
            block.style.cssText = `
                position: absolute;
                left: ${leftPercent}%;
                width: ${widthPercent}%;
                height: 100%;
                background: linear-gradient(135deg, #10b981, #059669);
                border-right: 1px solid rgba(255, 255, 255, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 0.75rem;
                font-weight: 500;
            `;
            
            block.textContent = '100%';
            block.title = `Time: ${item.startTime}-${item.endTime}, Process: ${item.processId}`;
            
            timeline.appendChild(block);
        });
        
        // Add time markers
        const markers = document.createElement('div');
        markers.style.cssText = `
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
        `;
        
        for (let i = 0; i <= maxTime; i += Math.max(1, Math.floor(maxTime / 10))) {
            const marker = document.createElement('span');
            marker.textContent = i;
            markers.appendChild(marker);
        }
        
        container.appendChild(title);
        container.appendChild(timeline);
        container.appendChild(markers);
    }
    
    return container;
}

// Create performance comparison radar chart (using Canvas)
function createPerformanceRadarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw radar chart background
    const metrics = ['Turnaround', 'Waiting', 'Response', 'Throughput', 'Efficiency'];
    const angleStep = (2 * Math.PI) / metrics.length;
    
    // Draw concentric circles
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    metrics.forEach((metric, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        const labelX = centerX + (radius + 20) * Math.cos(angle);
        const labelY = centerY + (radius + 20) * Math.sin(angle);
        ctx.fillText(metric, labelX, labelY);
    });
    
    // Draw data polygon if data provided
    if (data && data.length === metrics.length) {
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        data.forEach((value, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const distance = (value / 100) * radius; // Assuming values are 0-100
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#3b82f6';
        data.forEach((value, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const distance = (value / 100) * radius;
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

// Enhanced tooltip system
function initializeTooltips() {
    const tooltip = document.createElement('div');
    tooltip.id = 'custom-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        pointer-events: none;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.2s ease;
        max-width: 200px;
    `;
    document.body.appendChild(tooltip);
    
    // Add tooltip functionality to gantt blocks
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('gantt-block')) {
            const rect = e.target.getBoundingClientRect();
            tooltip.innerHTML = e.target.title;
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - 40 + 'px';
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateX(-50%)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('gantt-block')) {
            tooltip.style.opacity = '0';
        }
    });
}

// Initialize visualization enhancements
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
});

// Export visualization as image
function exportVisualization() {
    const ganttContainer = document.querySelector('.gantt-container');
    if (!ganttContainer) {
        showAlert('No visualization to export.');
        return;
    }
    
    // Use html2canvas if available, otherwise provide instructions
    if (typeof html2canvas !== 'undefined') {
        html2canvas(ganttContainer).then(canvas => {
            const link = document.createElement('a');
            link.download = `gantt_chart_${currentAlgorithm}_${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        showAlert('To export visualizations as images, please include the html2canvas library.');
    }
}

// Add these functions at the end of your visualization.js file

// Export Gantt chart as image
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
    const ganttBars = document.querySelectorAll('.gantt-bar');
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
        
        const processId = bar.dataset.processId || `P${index + 1}`;
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
        const timeLabels = timeAxis.querySelectorAll('.time-label');
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

// Add this to the end of displayResults function in visualization.js
function displayResults(results) {
    // ... existing code ...
    
    // Add analytics integration at the end
    setTimeout(() => {
        if (typeof addToAnalytics === 'function') {
            addToAnalytics(selectedAlgorithm, currentProcesses, results);
        }
    }, 100);
}