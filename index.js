'use strict';

// =============================================================================
// Configuration

const config = {
    viewRadiusMm: 315,
    clockRadiusMm: 300,
    clockBorderMm: 2,
    ringBorderMm: 1,
    secondsRingRadiusMm: 50,
    ringGapMm: 5,
    majorTickLengthRatio: 0.666,
    majorTickThicknessMm: 1.7,
    minorTickLengthRatio: 0.25,
    minorTickThicknessMm: 1,
};

const vc = config.viewRadiusMm;

/** Partially from <https://coolors.co/palettes/trending>, 3rd entry */
const theme = {
    primaryDark: '#cb997e',
    primaryMed: '#ddbea9',
    primaryLight: '#ffe8d6',
    secondaryLight: '#b7b7a4',
    secondaryMed: '#a5a58d',
    secondaryDark: '#6b705c',
    black: '#000000',
    indicatorRed: '#F44',
};

// =============================================================================
// Ring configuration

let periods = [1, 60, 3600, 3600 * 24, 60 * 5, 30, 5];

/** 1st: # of divisions; 2nd: mod of major tick */
const ringTickConfig = [
    [0, 0], // (unusued)
    [60, 5], // seconds wheel (1 min)
    [60, 5], // minutes wheel (1 hour)
    [24 * 2, 2], // hours wheel (1 day)
    [60 * 5, 10], // 5 min
    // [120, 5], // 2 min
    [300, 10], // (30 sec)
    // [100, 10], // (10 sec)
    [50, 10], // (5 sec)
]

const allRingLabels = [
    [], // unused
    ['0', '', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
    ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
    ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
    ['5:00', '0:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30'],
    // ['5:00', '30 sec', '1 min', '1 min 30 sec', '2 min', '2 min 30 sec', '3 min', '3 min 30 sec', '4 min', '4 min 30 sec'],
    // 2 min ['120', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110'],
    // 10 sec ['10', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    ['30', '', '', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    ['5', '1', '2', '3', '4'],
]

const ringTitles = [
['', 0],
['Seconds', 12],
['Minutes', 7],
['HH', 11.5],
['Five Minutes', 28],
['Seconds div 30', 30],
['Seconds div 5', 16],
];


// =============================================================================
// SVG display logic

const svgProps = `version="1.1" \
baseProfile="full" \
xmlns="http://www.w3.org/2000/svg" \
xmlns:xlink="http://www.w3.org/1999/xlink" \
xmlns:ev="http://www.w3.org/2001/xml-events" \
viewBox="0 0 ${vc * 2} ${vc * 2}" \
`;

const clockSvg = `
<svg ${svgProps} style="position: absolute; width: 100vw; height: 100vh;">
    <circle
        cx="${vc}" cy="${vc}" r="${config.clockRadiusMm}"
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
        cx="${vc}"
        cy="${vc}"
        r="${config.secondsRingRadiusMm}"
        stroke="${theme.black}"
        stroke-width="${config.ringBorderMm}"
        fill="${theme.primaryLight}"
    />
    <path fill="${theme.black}"
        d="M ${vc},${vc}
           v -${config.secondsRingRadiusMm}
           a ${config.secondsRingRadiusMm} ${config.secondsRingRadiusMm} 180 0 1 0 ${config.secondsRingRadiusMm * 2}
        "
    />
</svg>
`;

function getRingRadii(ringNumber, total) {
    const totalStart = config.secondsRingRadiusMm + config.ringGapMm;
    const totalEndIncludingGap = config.clockRadiusMm;
    const ringInterval = (totalEndIncludingGap - totalStart) / (total - 1);
    const ringWidth = ringInterval - config.ringGapMm;

    const thisRingStart = totalStart + (ringNumber - 1) * ringInterval;

    return {
        innerMm: thisRingStart,
        centerMm: thisRingStart + (ringWidth / 2),
        outerMm: thisRingStart + ringWidth,
    };
}

function generateRingSvg(period, ringNumber, total) {
    const { innerMm, centerMm, outerMm } = getRingRadii(ringNumber, total);
    const ringWidthMm = outerMm - innerMm;
    const borderProps = `cx="${vc}" cy="${vc}"`;
    const [tickCount, tickMajorMod] = ringTickConfig[ringNumber];

    const tickArray = Array.from(Array(tickCount))
        .map((_, i) => ({ frac: i / tickCount, isMajor: i % tickMajorMod === 0 }));

    const ringLabels = allRingLabels[ringNumber];
    const [ringTitle, ringTitleOffset] = ringTitles[ringNumber];

    return `
<svg id="ringNumber${ringNumber}" ${svgProps} style="position: absolute; width: 100vw; height: 100vh; ${generateSpinCss(period)}">
    <g stroke="${theme.black}" stroke-width="${config.ringBorderMm}" fill="none">
        <circle ${borderProps} r="${innerMm}" />
        <circle ${borderProps} r="${outerMm}" />
    </g>
    <circle cx="${vc}" cy="${vc}" r="${centerMm}"
        stroke="${theme.primaryLight}" stroke-width="${outerMm - innerMm - config.ringBorderMm}" fill="none"
    />
    <g stroke="${theme.black}">
        ${tickArray.map(({ frac, isMajor }) => `\
            <line x1="${vc}" x2="${vc}"
                y1="${vc - innerMm}"
                y2="${vc - innerMm - ringWidthMm / 2 * (isMajor ? config.majorTickLengthRatio : config.minorTickLengthRatio)}"
                transform="rotate(${frac * 360},${vc},${vc})"
            />
            <line x1="${vc}" x2="${vc}"
                y1="${vc - outerMm}"
                y2="${vc - outerMm + ringWidthMm / 2 * (isMajor ? config.majorTickLengthRatio : config.minorTickLengthRatio)}"
                transform="rotate(${frac * 360},${vc},${vc})"
            />`
        )
        .join('\n')}
    </g>
    <g font-family="Times, 'Times New Roman', Georgia, serif"
        font-size="14px"
        ${ringTitle === 'HH' ? 'font-weight="bold"' : ''}
        text-anchor="middle"
        dominant-baseline="central"
    >
        ${ringLabels.map((label, i, arr) => {
            const frac = i / arr.length;
            const placement = `x="${vc}" y="${vc - centerMm}"`;
            return `<text ${placement} ${i === 0 ? 'font-weight="bolder" font-size="larger"' : ''} \
                transform="rotate(${frac * 360},${vc},${vc})"\
                >${label}</text>`;
        })}
    </g>
    <path id="titlePath${ringNumber}" display="none"
        d="M ${vc},${vc - centerMm} a ${centerMm} ${centerMm} 180 0 1 0 ${centerMm * 2}"
    />
    <text dominant-baseline="central"
        font-family="Veranda, sans-serif" font-style="italic" font-size="12">
        <textPath href="#titlePath${ringNumber}" startOffset="${ringTitleOffset}">
            ${ringTitle}
        </textPath>
    </text>
</svg>`;
}

const markerSvg = `<svg id="marker" ${svgProps} style="position: absolute; width: 100vw; height: 100vh;">
    <rect x="${vc - 10}" width="20" y="${vc - config.clockRadiusMm - 10}" height="${config.clockRadiusMm + 10}"
        stroke="${theme.secondaryDark}" stroke-width="2" fill="none"
    />
    <rect x="${vc - 10}" width="20" y="${vc - config.clockRadiusMm - 10}" height="${config.clockRadiusMm + 10}"
        fill="${theme.secondaryLight}" opacity="0.5"
    />
    <line x1="${vc}" x2="${vc}" y1="${vc}" y2="${vc - config.clockRadiusMm - 10}"
        stroke="${theme.indicatorRed}" stroke-width="1"
    />
    <circle cx="${vc}" cy="${vc}" r="15" stroke="black" fill="#333" />
</svg>`;

// =============================================================================
// Display logic

/** @type {Array<HTMLElement>} */
let rings /* = [ seconds, minutes, hours... ]*/;

function initDisplay() {
    root.innerHTML = `
        ${clockSvg}
        ${secondsRingSvg}
        ${periods.slice(1).map((p, i) => generateRingSvg(p, i + 1, 7)).join('\n')}
        ${markerSvg}
    `;

    rings = [
        document.getElementById('secondsRingSvg'),
        document.getElementById('ringNumber1'),
        document.getElementById('ringNumber2'),
        document.getElementById('ringNumber3'),
        document.getElementById('ringNumber4'),
        document.getElementById('ringNumber5'),
        document.getElementById('ringNumber6'),
    ];
}

function calibrateAnimations() {
    const now = new Date();
    const secondsFraction = now.getMilliseconds() / 1000;
    const minutesFraction = (now.getSeconds() + secondsFraction) / 60;
    const hoursFraction = (now.getMinutes() + minutesFraction) / 60;
    const daysFraction = (now.getHours() + hoursFraction) / 24;
    const animationCurrentTime = daysFraction * 1000 * 60 * 60 * 24;

    rings.map(ring => ring.getAnimations()[0])
        .forEach((anim) => anim.currentTime = animationCurrentTime);
}

// =============================================================================
// Main

const root = document.getElementById('root');
const debugTime = document.getElementById('debug-time');

initDisplay();
calibrateAnimations();

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
        calibrateAnimations();
    }
});

root.addEventListener('click', calibrateAnimations);

function debugStep(_timestamp) {
    const now = new Date();
    const secondsFraction = now.getMilliseconds() / 1000;

    debugTime.innerText = `${now.toISOString()} - fracSec: ${secondsFraction}`;
    debugTime.style.backgroundColor = secondsFraction < 0.5 ? 'gray' : 'white';

    window.requestAnimationFrame(debugStep);
}
// DISABLE DEBUG window.requestAnimationFrame(debugStep);
