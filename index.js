'use strict';

// =============================================================================
// Configuration

const config = {
    viewRadiusMm: 350,
    clockRadiusMm: 300,
    clockBorderMm: 1,
    ringBorderMm: 0.7,
    secondsRingRadiusMm: 50,
    // TODO: ringGapMm: 5,
    // TODO: majorTickLengthRatio: 1,
    // TODO: minorTickLengthRatio: 0.1,
};

/** From <https://coolors.co/palettes/trending>, 3rd entry */
const theme = {
    primaryDark: '#cb997e',
    primaryMed: '#ddbea9',
    primaryLight: '#ffe8d6',
    secondaryLight: '#b7b7a4',
    secondaryMed: '#a5a58d',
    secondaryDark: '#6b705c',
    black: '#000000',
};

// =============================================================================
// SVG display logic

const svgProps = `version="1.1" \
baseProfile="full" \
xmlns="http://www.w3.org/2000/svg" \
xmlns:xlink="http://www.w3.org/1999/xlink" \
xmlns:ev="http://www.w3.org/2001/xml-events" \
viewBox="0 0 ${config.viewRadiusMm * 2} ${config.viewRadiusMm * 2}" \
`;

const clockSvg = `
<svg ${svgProps} style="position: absolute; width: 100vw; height: 100vh;">
    <circle
        cx="${config.viewRadiusMm}"
        cy="${config.viewRadiusMm}"
        r="${config.clockRadiusMm}"
        stroke="${theme.black}"
        stroke-width="${config.clockBorderMm}"
        fill="${theme.primaryMed}"
    />
</svg>
`;

/**
 * @param {number} period - number of seconds in the spin cycle
 */
function generateSpinCss(period) {
    return `animation: ${period}s linear rotate infinite`;
}

const secondsRingSvg = `
<svg id="secondsRingSvg" ${svgProps} style="position: absolute; width: 100vw; height: 100vh; ${generateSpinCss(1)}">
    <circle
        cx="${config.viewRadiusMm}"
        cy="${config.viewRadiusMm}"
        r="${config.secondsRingRadiusMm}"
        stroke="${theme.black}"
        stroke-width="${config.ringBorderMm}"
        fill="${theme.primaryLight}"
    />
    <path fill="${theme.black}"
        d="M ${config.viewRadiusMm},${config.viewRadiusMm}
           v -${config.secondsRingRadiusMm}
           a ${config.secondsRingRadiusMm} ${config.secondsRingRadiusMm} 180 0 0 0 ${config.secondsRingRadiusMm * 2}
        "
    />
</svg>
`

// =============================================================================
// Display logic

/** @type {Array<HTMLElement>} */
let rings /* = [ seconds, minutes, hours... ]*/;

function initDisplay() {
    root.innerHTML = `
        ${clockSvg}
        ${secondsRingSvg}
    `;

    rings = [
        document.getElementById('secondsRingSvg'),
    ];
}

function calibrateAnimations() {
    const now = new Date();
    const secondsFraction = now.getMilliseconds() / 1000;
    const secondsAnimation = rings[0].getAnimations()[0];
    secondsAnimation.currentTime = secondsFraction * 1000;
}

// =============================================================================
// Main

const root = document.getElementById('root');
const debugTime = document.getElementById('debug-time');

initDisplay();
calibrateAnimations();

function step(_timestamp) {
    const now = new Date();
    const secondsFraction = now.getMilliseconds() / 1000;

    debugTime.innerText = `${now.toISOString()} - fracSec: ${secondsFraction}`;
    debugTime.style.backgroundColor = secondsFraction > 0.5 ? 'gray' : 'white';

    window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);
