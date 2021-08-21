'use strict';

// =============================================================================
// Configuration

const config = {
    viewRadiusMm: 350,
    clockRadiusMm: 300,
    clockBorderMm: 1,
    // TODO: ringGapMm: 5,
    // TODO: innerRingRadiusMm: 50,
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

const svgProps = `version="1.1"\
baseProfile="full" \
xmlns="http://www.w3.org/2000/svg" \
xmlns:xlink="http://www.w3.org/1999/xlink" \
xmlns:ev="http://www.w3.org/2001/xml-events"`;

const clockSvg = `
<svg ${svgProps}
    width="100vw"
    height="100vh"
    viewBox="0 0 ${config.viewRadiusMm * 2} ${config.viewRadiusMm * 2}"
>
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

// =============================================================================
// Main

const root = document.getElementById('root');

function initDisplay() {
    root.innerHTML = `
        ${clockSvg}
    `
}

initDisplay();
