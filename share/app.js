const STORE_IOS = 'https://apps.apple.com/app/id1572710265';
const INSTALL_FOOTNOTE =
  'Install MapCrumbs, then scan the code again to open this.';

const SHARE_PAYLOAD_VERSION = 1;
const MAX_SHARE_PAYLOAD_ENCODED_LENGTH = 2048;

const decodeBase64Url = (input) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + '='.repeat(4 - padding);
  const binary = atob(padded);
  return decodeURIComponent(
    binary
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
};

const isFiniteNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value);

const isValidLat = (lat) => lat >= -90 && lat <= 90;
const isValidLng = (lng) => lng >= -180 && lng <= 180;

const isNonEmptyString = (value, maxLength = 200) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= maxLength;

const isOptionalString = (value, maxLength = 200) =>
  value === undefined ||
  (typeof value === 'string' && value.length <= maxLength);

const parseCrumbPayload = (raw) => {
  if (
    !isFiniteNumber(raw.lat) ||
    !isFiniteNumber(raw.lng) ||
    !isValidLat(raw.lat) ||
    !isValidLng(raw.lng) ||
    !isNonEmptyString(raw.name) ||
    !isNonEmptyString(raw.locality) ||
    typeof raw.category !== 'number' ||
    !isOptionalString(raw.notes, 500) ||
    !isOptionalString(raw.google_id)
  ) {
    return null;
  }

  return {
    type: 'crumb',
    name: String(raw.name).trim(),
    locality: String(raw.locality).trim(),
  };
};

const parseCityPayload = (raw) => {
  if (
    !isNonEmptyString(raw.name) ||
    !isNonEmptyString(raw.country_code, 8) ||
    !isNonEmptyString(raw.country_name) ||
    !isFiniteNumber(raw.lat) ||
    !isFiniteNumber(raw.lng) ||
    !isValidLat(raw.lat) ||
    !isValidLng(raw.lng)
  ) {
    return null;
  }

  return {
    type: 'city',
    name: String(raw.name).trim(),
    country_name: String(raw.country_name).trim(),
  };
};

const parseJourneyInvitePayload = (raw) => {
  const journeysId =
    typeof raw.journeys_id === 'number'
      ? raw.journeys_id
      : typeof raw.journeys_id === 'string'
        ? Number.parseInt(raw.journeys_id, 10)
        : NaN;

  if (
    !Number.isFinite(journeysId) ||
    journeysId <= 0 ||
    !isNonEmptyString(raw.share_id, 120) ||
    !isOptionalString(raw.owner_id, 120) ||
    !isOptionalString(raw.owner_name)
  ) {
    return null;
  }

  const payload = {type: 'journey_invite'};
  if (typeof raw.owner_name === 'string' && raw.owner_name.trim().length > 0) {
    payload.owner_name = raw.owner_name.trim();
  }
  return payload;
};

const parseSharePayload = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  if (raw.v !== SHARE_PAYLOAD_VERSION || typeof raw.type !== 'string') {
    return null;
  }

  switch (raw.type) {
    case 'crumb':
      return parseCrumbPayload(raw);
    case 'city':
      return parseCityPayload(raw);
    case 'journey_invite':
      return parseJourneyInvitePayload(raw);
    default:
      return null;
  }
};

const decodeSharePayload = (encoded) => {
  if (!encoded || encoded.length > MAX_SHARE_PAYLOAD_ENCODED_LENGTH) {
    return null;
  }

  try {
    const json = decodeBase64Url(encoded);
    return parseSharePayload(JSON.parse(json));
  } catch {
    return null;
  }
};

const getEncodedParam = () => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('d');
  return encoded?.trim() ? encoded.trim() : null;
};

const renderPreview = (payload) => {
  const titleEl = document.getElementById('preview-title');
  const subtitleEl = document.getElementById('preview-subtitle');
  const labelEl = document.getElementById('preview-label');
  const taglineEl = document.getElementById('brand-tagline');

  if (!payload) {
    taglineEl.textContent = 'Open this share in MapCrumbs';
    labelEl.textContent = 'Shared link';
    titleEl.textContent = 'Waiting for you in the app';
    subtitleEl.textContent =
      'Install MapCrumbs to view this Crumb, city, or live journey.';
    return;
  }

  switch (payload.type) {
    case 'crumb':
      taglineEl.textContent = 'A friend shared a Crumb with you';
      labelEl.textContent = 'Crumb';
      titleEl.textContent = payload.name;
      subtitleEl.textContent = payload.locality;
      break;
    case 'city':
      taglineEl.textContent = 'A friend shared a city with you';
      labelEl.textContent = 'City';
      titleEl.textContent = payload.name;
      subtitleEl.textContent = payload.country_name;
      break;
    case 'journey_invite':
      taglineEl.textContent = "You're invited to follow a live journey";
      labelEl.textContent = 'Live journey';
      titleEl.textContent = 'Join the journey';
      subtitleEl.textContent = payload.owner_name
        ? `${payload.owner_name} is sharing their trip`
        : 'Follow along in real time in MapCrumbs.';
      break;
    default:
      taglineEl.textContent = 'Open this share in MapCrumbs';
      labelEl.textContent = 'Shared link';
      titleEl.textContent = 'Waiting for you in the app';
      subtitleEl.textContent = 'Install MapCrumbs to continue.';
  }
};

const init = () => {
  const encoded = getEncodedParam();
  const payload = encoded ? decodeSharePayload(encoded) : null;
  renderPreview(payload);

  document.getElementById('store-ios').href = STORE_IOS;
  document.getElementById('footnote').textContent = INSTALL_FOOTNOTE;
};

init();
