// Light Preset Pill -- JS half of the component (light-preset-pill.css has
// the styling). Builds the whole dawn/day/dusk/night radio pill, including
// the icon SVGs, and wires it to a map's light preset in one call:
//
//   createLightPresetPill(map);
//
// Optional second arg: { defaultValue: 'day', container: document.body }.
// Returns the created element, already appended to `container`.

function createLightPresetPill(map, { defaultValue = 'day', container = document.body } = {}) {
    const ICONS = {
        dawn: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19" r="18.5" fill="white"></circle>
            <path d="M29.9414 29.9673L7.44141 29.9673" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M24.717 29.9669C24.717 26.8095 22.1574 24.25 19.0001 24.25C15.8427 24.25 13.2832 26.8095 13.2832 29.9669" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.998 17.9084V20.3202" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.998 12.7725L18.998 6.53246" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M22.1094 8.33984L19.0723 5.95312" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
            <path d="M15.8867 8.33984L18.9238 5.95312" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
            <path d="M10.4746 21.4402L12.1786 23.1458" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.5245 21.4402L25.8184 23.1458" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>`,
        day: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19.0002" r="18.5" fill="white"></circle>
            <path d="M19 24.5467C22.0635 24.5467 24.5469 22.0632 24.5469 18.9998C24.5469 15.9363 22.0635 13.4529 19 13.4529C15.9366 13.4529 13.4531 15.9363 13.4531 18.9998C13.4531 22.0632 15.9366 24.5467 19 24.5467Z" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M19 7.30005V9.6401" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10.7285 10.7268L12.3819 12.3817" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M7.30078 18.9998H9.64083" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10.7285 27.2725L12.3834 25.6182" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M19 30.6999V28.3589" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.2726 27.2725L25.6172 25.6182" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M30.6994 19.0002H28.3594" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.2726 10.7268L25.6172 12.3817" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>`,
        dusk: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19" r="18.5" fill="white"></circle>
            <path d="M24.4979 28.9589C24.4979 25.923 22.0368 23.4619 19.0009 23.4619C15.965 23.4619 13.5039 25.923 13.5039 28.9589" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M19 17.3643V19.6833" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10.8008 20.7603L12.4393 22.4003" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M30.25 28.9592L7.75 28.9592" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.1991 20.7603L25.5586 22.4003" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.998 5.90894L18.998 12.1489" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15.8887 10.3416L18.9258 12.7283" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
            <path d="M22.1113 10.3416L19.0742 12.7283" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
          </g>
        </svg>`,
        night: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19" r="18.5" fill="white"></circle>
            <path d="M18.53 27.9489C14.9462 28.7919 11.3593 27.5714 9.01172 25.0631C10.617 25.5423 12.3651 25.6235 14.1138 25.2139C19.4467 23.9597 22.7537 18.6189 21.4996 13.2864C21.0884 11.5378 20.2364 10.01 19.0919 8.78589C22.3837 9.77013 25.0744 12.4361 25.9173 16.0214C27.1705 21.3549 23.864 26.6947 18.53 27.9489Z" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>`,
    };

    const wrap = document.createElement('div');
    wrap.className = 'radio-group';
    wrap.innerHTML = Object.keys(ICONS).map((value) => `
      <label class="radio-wrapper">
        <input type="radio" name="light" value="${value}" class="radiobutton" ${value === defaultValue ? 'checked' : ''} />
        ${ICONS[value]}
      </label>`).join('');

    wrap.addEventListener('change', (e) => {
        if (e.target.name === 'light') map.setConfigProperty('basemap', 'lightPreset', e.target.value);
    });

    container.appendChild(wrap);
    return wrap;
}
