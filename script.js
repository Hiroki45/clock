document.addEventListener('DOMContentLoaded', () => {
    // --- Clock Functionality ---
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const ampmEl = document.getElementById('ampm');
    const gregDateEl = document.getElementById('gregorian-date');
    const hijriDateEl = document.getElementById('hijri-date');

    function updateClock() {
        const now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();
        let s = now.getSeconds();
        const ampm = h >= 12 ? 'م' : 'ص'; // Arabic AM/PM

        h = h % 12;
        h = h ? h : 12; // 0 should be 12

        hoursEl.textContent = h.toString().padStart(2, '0');
        minutesEl.textContent = m.toString().padStart(2, '0');
        secondsEl.textContent = s.toString().padStart(2, '0');
        ampmEl.textContent = ampm;

        // Gregorian Date
        const gregOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        gregDateEl.textContent = now.toLocaleDateString('ar-SA', gregOptions);

        // Hijri Date
        const hijriOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
        hijriDateEl.textContent = now.toLocaleDateString('ar-SA-u-ca-islamic', hijriOptions);
    }

    setInterval(updateClock, 1000);
    updateClock();

    // --- Navigation Functionality ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active section
            sections.forEach(sec => sec.classList.remove('active-section'));
            document.getElementById(targetId).classList.add('active-section');
        });
    });

    // --- Alarm Functionality ---
    const alarmList = document.getElementById('alarm-list');
    const addAlarmBtn = document.getElementById('add-alarm-btn');
    const alarmModal = document.getElementById('alarm-modal');
    const saveAlarmBtn = document.getElementById('save-alarm');
    const cancelAlarmBtn = document.getElementById('cancel-alarm');
    const alarmTimeInput = document.getElementById('alarm-time-input');
    const ringingOverlay = document.getElementById('alarm-ringing');
    const stopAlarmBtn = document.getElementById('stop-alarm');

    let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    let alarmSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple beep sound
    alarmSound.loop = true;

    function renderAlarms() {
        alarmList.innerHTML = '';
        if (alarms.length === 0) {
            alarmList.innerHTML = '<div class="empty-state">لا توجد منبهات</div>';
            return;
        }

        alarms.forEach((alarm, index) => {
            const div = document.createElement('div');
            div.className = 'alarm-item';
            div.innerHTML = `
                <div class="alarm-time">${alarm.time}</div>
                <div class="alarm-toggle">
                    <label class="switch">
                        <input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="toggleAlarm(${index})">
                        <span class="slider"></span>
                    </label>
                    <button class="delete-alarm" onclick="deleteAlarm(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            alarmList.appendChild(div);
        });
    }

    window.toggleAlarm = (index) => {
        alarms[index].active = !alarms[index].active;
        saveAlarms();
    };

    window.deleteAlarm = (index) => {
        alarms.splice(index, 1);
        saveAlarms();
        renderAlarms();
    };

    function saveAlarms() {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }

    addAlarmBtn.addEventListener('click', () => {
        alarmModal.classList.remove('hidden');
        alarmTimeInput.value = ''; // clear
    });

    cancelAlarmBtn.addEventListener('click', () => {
        alarmModal.classList.add('hidden');
    });

    saveAlarmBtn.addEventListener('click', () => {
        const time = alarmTimeInput.value;
        if (time) {
            alarms.push({ time, active: true });
            saveAlarms();
            renderAlarms();
            alarmModal.classList.add('hidden');
        }
    });

    stopAlarmBtn.addEventListener('click', () => {
        ringingOverlay.classList.add('hidden');
        alarmSound.pause();
        alarmSound.currentTime = 0;
    });

    // Check Alarms
    setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const seconds = now.getSeconds();

        if (seconds === 0) { // Check only at start of minute to avoid multiple triggers
            alarms.forEach(alarm => {
                if (alarm.active && alarm.time === currentTime) {
                    ringingOverlay.classList.remove('hidden');
                    alarmSound.play().catch(e => console.log("Audio play failed interaction needed"));
                }
            });
        }
    }, 1000);

    renderAlarms();

    // --- Stopwatch Functionality ---
    let stopwatchInterval;
    let stopwatchTime = 0;
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const startSwBtn = document.getElementById('stopwatch-start');
    const pauseSwBtn = document.getElementById('stopwatch-pause');
    const resetSwBtn = document.getElementById('stopwatch-reset');
    const lapSwBtn = document.getElementById('stopwatch-lap');
    const lapsList = document.getElementById('laps-list');

    function formatTime(ms) {
        const date = new Date(ms);
        const m = date.getUTCMinutes().toString().padStart(2, '0');
        const s = date.getUTCSeconds().toString().padStart(2, '0');
        const cs = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
        return `${m}:${s}.${cs}`;
    }

    startSwBtn.addEventListener('click', () => {
        const startTime = Date.now() - stopwatchTime;
        stopwatchInterval = setInterval(() => {
            stopwatchTime = Date.now() - startTime;
            stopwatchDisplay.textContent = formatTime(stopwatchTime);
        }, 10);

        startSwBtn.classList.add('hidden');
        pauseSwBtn.classList.remove('hidden');
    });

    pauseSwBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        startSwBtn.classList.remove('hidden');
        pauseSwBtn.classList.add('hidden');
    });

    resetSwBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        stopwatchDisplay.textContent = "00:00.00";
        startSwBtn.classList.remove('hidden');
        pauseSwBtn.classList.add('hidden');
        lapsList.innerHTML = '';
    });

    lapSwBtn.addEventListener('click', () => {
        if (stopwatchTime > 0) {
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            lapItem.innerHTML = `<span>لفة ${lapsList.children.length + 1}</span> <span>${formatTime(stopwatchTime)}</span>`;
            lapsList.prepend(lapItem);
        }
    });

    // --- Timer Functionality ---
    const timerHours = document.getElementById('timer-hours');
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    const timerCountdown = document.getElementById('timer-countdown');
    const timerInputs = document.querySelector('.timer-inputs');
    const startTimerBtn = document.getElementById('timer-start');
    const pauseTimerBtn = document.getElementById('timer-pause');
    const resetTimerBtn = document.getElementById('timer-reset');

    let timerInterval;
    let totalSeconds = 0;

    function formatTimer(total) {
        const h = Math.floor(total / 3600).toString().padStart(2, '0');
        const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
        const s = (total % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    startTimerBtn.addEventListener('click', () => {
        if (!timerInterval) { // First start
            const h = parseInt(timerHours.value) || 0;
            const m = parseInt(timerMinutes.value) || 0;
            const s = parseInt(timerSeconds.value) || 0;
            totalSeconds = h * 3600 + m * 60 + s;

            if (totalSeconds <= 0) return;

            timerInputs.classList.add('hidden');
            timerCountdown.classList.remove('hidden');
            timerCountdown.textContent = formatTimer(totalSeconds);
        }

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                timerCountdown.textContent = formatTimer(totalSeconds);
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alarmSound.play().catch(e => console.log("Audio play failed"));
                ringingOverlay.classList.remove('hidden'); // Reusing alarm overlay

                // Reset UI
                timerInputs.classList.remove('hidden');
                timerCountdown.classList.add('hidden');
                startTimerBtn.classList.remove('hidden');
                pauseTimerBtn.classList.add('hidden');
            }
        }, 1000);

        startTimerBtn.classList.add('hidden');
        pauseTimerBtn.classList.remove('hidden');
    });

    pauseTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        startTimerBtn.classList.remove('hidden');
        pauseTimerBtn.classList.add('hidden');
    });

    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timerInputs.classList.remove('hidden');
        timerCountdown.classList.add('hidden');
        startTimerBtn.classList.remove('hidden');
        pauseTimerBtn.classList.add('hidden');
        timerHours.value = '';
        timerMinutes.value = '';
        timerSeconds.value = '';
    });

    // --- Sleep Tracking Functionality ---
    const sleepStartBtn = document.getElementById('sleep-start-btn');
    const sleepStopBtn = document.getElementById('sleep-stop-btn');
    const chartContainer = document.getElementById('chart-container');
    const manualControls = document.getElementById('manual-controls');
    const manualWakeBtn = document.getElementById('manual-wake-btn');

    // Dashboard Elements
    const statusCard = document.getElementById('status-card');
    const currentStateText = document.getElementById('current-state');
    const statusIcon = statusCard.querySelector('.status-icon i');
    const sleepDurationDisplay = document.getElementById('sleep-duration');
    const totalTrackingDisplay = document.getElementById('total-tracking-time');

    let sleepStartTime = 0;
    let actualSleepStartTime = 0;
    let totalSleepDuration = 0; // accumulated ms
    let sleepInterval;
    let isTracking = false;
    let wakeLock = null;
    let lastMotionTime = Date.now();
    let sleepState = 'AWAKE'; // AWAKE, SLEEPING
    const SLEEP_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
    const WAKE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes motion to verify wake
    let motionEvents = [];

    // Initialize Chart
    let sleepChart;
    const ctx = document.getElementById('sleepChart').getContext('2d');

    function initChart() {
        if (sleepChart) sleepChart.destroy();
        sleepChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'الحركة',
                    data: [],
                    borderColor: '#ffd700',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: { display: false },
                    y: { display: false, min: 0, max: 10 }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.log(`${err.name}, ${err.message}`);
        }
    }

    function formatDuration(ms) {
        let h = Math.floor(ms / 3600000).toString().padStart(2, '0');
        let m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
        let s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function handleMotion(event) {
        if (!isTracking) return;

        const acc = event.acceleration;
        if (!acc) return;
        const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

        // Graph Update
        if (motionEvents.length > 50) {
            motionEvents.shift();
            sleepChart.data.labels.shift();
            sleepChart.data.datasets[0].data.shift();
        }
        motionEvents.push(magnitude);
        sleepChart.data.labels.push('');
        sleepChart.data.datasets[0].data.push(magnitude);
        sleepChart.update('none');

        // Logic
        if (magnitude > 0.8) {
            lastMotionTime = Date.now();
            if (sleepState === 'SLEEPING') {
                // If moving significantly while sleeping
                // We don't immediately wake up, but we log motion.
                // If motion persists, we might auto-wake or set to restless.
                // For now, let's keep it simple: Motion implies potential wakefulness.
                // We rely on manual wake or sustained motion (not implemented fully for complexity).
            }
        }
    }

    function updateDashboardState(state) {
        if (state === 'SLEEPING') {
            statusCard.classList.add('sleeping');
            currentStateText.textContent = "نائم";
            statusIcon.className = "fas fa-bed";
            manualControls.classList.remove('hidden'); // Allow user to confirm wake
        } else {
            statusCard.classList.remove('sleeping');
            currentStateText.textContent = "مستيقظ / قلق";
            statusIcon.className = "fas fa-eye";
            manualControls.classList.add('hidden');
        }
    }

    manualWakeBtn.addEventListener('click', () => {
        sleepState = 'AWAKE';
        updateDashboardState('AWAKE');
        lastMotionTime = Date.now(); // Reset motion timer
    });

    sleepStartBtn.addEventListener('click', () => {
        // Permission check...
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response == 'granted') startSleepTracking();
                })
                .catch(console.error);
        } else {
            startSleepTracking();
        }
    });

    function startSleepTracking() {
        isTracking = true;
        sleepStartTime = Date.now();
        lastMotionTime = Date.now();
        totalSleepDuration = 0;
        sleepState = 'AWAKE';

        sleepStartBtn.classList.add('hidden');
        sleepStopBtn.classList.remove('hidden');
        chartContainer.classList.remove('hidden');
        updateDashboardState('AWAKE');

        initChart();
        requestWakeLock();
        window.addEventListener('devicemotion', handleMotion);

        sleepInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - sleepStartTime;

            // Update Total Tracking Timer
            totalTrackingDisplay.textContent = formatDuration(elapsed);

            // Sleep Logic
            const timeSinceLastMotion = now - lastMotionTime;

            if (sleepState === 'AWAKE') {
                if (timeSinceLastMotion > SLEEP_THRESHOLD_MS) {
                    sleepState = 'SLEEPING';
                    updateDashboardState('SLEEPING');
                    // We assume sleep started 10 mins ago? Or from now? 
                    // Let's count sleep from now for simplicity or retroactive.
                    // Simple: Start counting duration from now.
                }
            } else if (sleepState === 'SLEEPING') {
                totalSleepDuration += 1000; // Add 1 sec per tick
            }

            // Update Sleep Duration Timer
            sleepDurationDisplay.textContent = formatDuration(totalSleepDuration);

        }, 1000);
    }

    sleepStopBtn.addEventListener('click', () => {
        isTracking = false;
        clearInterval(sleepInterval);
        window.removeEventListener('devicemotion', handleMotion);
        if (wakeLock) wakeLock.release();

        sleepStartBtn.classList.remove('hidden');
        sleepStopBtn.classList.add('hidden');
        manualControls.classList.add('hidden');
        currentStateText.textContent = "تم الانتهاء";
        statusCard.classList.remove('sleeping');
    });

    // --- Developer Mode / Sensor Status ---
    const devBtn = document.getElementById('dev-mode-btn');
    const sensorModal = document.getElementById('sensor-modal');
    const closeSensorBtn = document.getElementById('close-sensor-modal');
    const enableSensorsBtn = document.getElementById('enable-sensors-btn');

    // Elements for sensor data
    const accX = document.getElementById('acc-x');
    const accY = document.getElementById('acc-y');
    const accZ = document.getElementById('acc-z');
    const accTotal = document.getElementById('acc-total');

    const orientAlpha = document.getElementById('orient-alpha');
    const orientBeta = document.getElementById('orient-beta');
    const orientGamma = document.getElementById('orient-gamma');

    const sensorBar = document.getElementById('sensor-bar-fill');
    const sensorStatus = document.getElementById('sensor-status');

    devBtn.addEventListener('click', () => {
        sensorModal.classList.remove('hidden');
    });

    closeSensorBtn.addEventListener('click', () => {
        sensorModal.classList.add('hidden');
        window.removeEventListener('devicemotion', updateSensorDisplay);
        window.removeEventListener('deviceorientation', updateOrientationDisplay);
    });

    enableSensorsBtn.addEventListener('click', () => {
        startSensorTest();
    });

    function startSensorTest() {
        sensorStatus.textContent = "جاري طلب الإذن...";

        // Request Motion Permission (iOS 13+)
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response == 'granted') {
                        activateSensorListener();
                    } else {
                        sensorStatus.textContent = "تم رفض إذن الحركة (Motion)";
                    }
                })
                .catch(e => {
                    sensorStatus.textContent = "خطأ الحركة: " + e;
                    // Try orientation as fallback
                    requestOrientationPermission();
                });
        } else {
            activateSensorListener();
        }
    }

    function requestOrientationPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response == 'granted') {
                        activateSensorListener();
                    } else {
                        sensorStatus.textContent += " | تم رفض إذن التوجيه (Orientation)";
                    }
                })
                .catch(console.error);
        }
    }

    function activateSensorListener() {
        sensorStatus.textContent = "تم التفعيل. حرك الجهاز...";
        sensorStatus.style.color = "var(--primary-light)";

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', updateSensorDisplay);
        } else {
            sensorStatus.textContent = "Motion API غير مدعوم";
        }

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', updateOrientationDisplay);
        }
    }

    function updateSensorDisplay(event) {
        const acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        // Simple magnitude change for viz
        // Note: accelerationIncludingGravity includes ~9.8 on one axis usually
        const total = Math.sqrt(x * x + y * y + z * z);
        // We just show raw magnitude here for debugging

        accX.textContent = x.toFixed(2);
        accY.textContent = y.toFixed(2);
        accZ.textContent = z.toFixed(2);
        accTotal.textContent = total.toFixed(2);

        // Visual bar (cap at 20 for full width logic visualization)
        // If gravity is included, 9.8 is baseline.
        const percentage = Math.min((Math.abs(total - 9.8) / 5) * 100, 100);
        sensorBar.style.width = `${percentage}%`;

        if (Math.abs(total - 9.8) > 0.5) {
            sensorStatus.textContent = "يتم رصد حركة (Motion)!";
            sensorStatus.style.color = "var(--accent-color)";
        }
    }

    function updateOrientationDisplay(event) {
        orientAlpha.textContent = (event.alpha || 0).toFixed(0);
        orientBeta.textContent = (event.beta || 0).toFixed(0);
        orientGamma.textContent = (event.gamma || 0).toFixed(0);
    }

});
