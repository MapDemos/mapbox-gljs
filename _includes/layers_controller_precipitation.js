// Custom layers controller for precipitation demo with improved time controls

// Override initTimeSlider to work with new UI
const originalInitTimeSlider = window.initTimeSlider || function() {};

window.initTimeSlider = function(val) {
    const timeslider = document.getElementById('slider');
    if (!timeslider) return;

    timeslider.max = bandlist.length - 1;
    timeslider.value = val;

    const timediv = document.getElementById('timediv');
    const date = document.getElementById('active-date');
    const time = document.getElementById('active-time');

    if (timediv) timediv.innerHTML = '';
    if (date) date.innerHTML = '';
    if (time) time.innerHTML = '';

    const playPauseBtn = document.getElementById('play-pause');

    if (bandlist.length >= 1) {
        const timeResult = convertTimeValue(bandlist[val]);

        if (typeof timeResult === 'object') {
            // New format returning {date, time}
            if (date) date.innerHTML = timeResult.date;
            if (time) time.innerHTML = timeResult.time;
        } else {
            // Old format returning string
            const currentDateTime = timeResult.split(' ');
            if (date) date.innerHTML = currentDateTime[0];
            if (time) time.innerHTML = currentDateTime[1];
        }

        timeslider.disabled = false;
        if (playPauseBtn) playPauseBtn.disabled = false;
        timeslider.style.visibility = 'visible';

        let index = 0;
        if (timediv) {
            bandlist.forEach(datetime => {
                const timeResult = convertTimeValue(datetime);
                let timeStr;

                if (typeof timeResult === 'object') {
                    timeStr = timeResult.time;
                } else {
                    timeStr = timeResult.split(' ')[1];
                }

                const timespan = timediv.appendChild(document.createElement('span'));
                if (index === 0 || index === bandlist.length - 1) {
                    timespan.innerHTML = timeStr;
                } else {
                    timespan.innerHTML = `・`;
                }
                index++;
            });
        }

        if (bandlist.length === 1) {
            const timeControls = document.getElementById('time-controls');
            if (timeControls) timeControls.style.display = 'none';
        }
    } else {
        timeslider.disabled = true;
        timeslider.style.visibility = 'hidden';
        if (autoFlag && typeof play === 'function') play();
        if (playPauseBtn) playPauseBtn.disabled = true;

        const timeControls = document.getElementById('time-controls');
        if (timeControls) timeControls.style.display = 'none';
    }
};

// Override play function to work with new button
const originalPlay = window.play;

window.play = function() {
    const playPauseBtn = document.getElementById('play-pause');
    const playIcon = document.getElementById('play-icon');

    if (!playPauseBtn) {
        // Fallback to original play if new buttons don't exist
        if (originalPlay) return originalPlay();
        return;
    }

    if (playPauseBtn.classList.contains('playing')) {
        autoFlag = false;
        playPauseBtn.classList.remove('playing');
        if (playIcon) playIcon.textContent = '▶';
    } else {
        autoFlag = true;
        autoUpdate();
        playPauseBtn.classList.add('playing');
        if (playIcon) playIcon.textContent = '⏸';
    }
};
