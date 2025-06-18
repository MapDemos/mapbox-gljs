// Converted from TypeScript to JavaScript

const roundToNearestFive = (date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.floor(minutes / 5) * 5;
    date.setMinutes(roundedMinutes);
    return date;
};

const getTimeWithOffset = (baseDate, offsetMinutes) => {
    const utc = baseDate.getTime(); // in ms
    const adjusted = utc + offsetMinutes * 60 * 1000;
    return new Date(adjusted);
};

const formatTimeWithOffset = (baseDate, offsetMinutes) => {
    const newDate = getTimeWithOffset(baseDate, offsetMinutes);
    const jstDate = new Date(newDate.getTime() + 9 * 60 * 60 * 1000);
    return `${jstDate.getUTCHours().toString().padStart(2, '0')}:${jstDate.getUTCMinutes().toString().padStart(2, '0')}`;
};

const parseDateString = (dateString) => {
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1;
    const day = parseInt(dateString.slice(6, 8), 10);
    const hour = parseInt(dateString.slice(8, 10), 10);
    const minute = parseInt(dateString.slice(10, 12), 10);
    const second = parseInt(dateString.slice(12, 14), 10);
    return new Date(Date.UTC(year, month, day, hour, minute, second));
};

const parseDateStringJST = (dateString) => {
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1;
  const day = parseInt(dateString.slice(6, 8), 10);
  const hour = parseInt(dateString.slice(8, 10), 10);
  const minute = parseInt(dateString.slice(10, 12), 10);
  const second = parseInt(dateString.slice(12, 14), 10);
  return new Date(Date.UTC(year, month, day, hour - 9, minute, second));
};

const convertToJST = (date) => {
    const jstTimestamp = date.getTime() + (9 * 60 * 60 * 1000);
    return new Date(jstTimestamp);
};

const convertToUTC = (date) => {
    const utcTimestamp = date.getTime() - (9 * 60 * 60 * 1000);
    return new Date(utcTimestamp);
};

const formatDateString = (date) => {
    const yyyy = date.getUTCFullYear().toString();
    const MM = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dd = date.getUTCDate().toString().padStart(2, '0');
    const HH = date.getUTCHours().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
};

const toJST = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    const jstDate = convertToJST(date);
    return formatDateString(jstDate);
};

const toUTC = (JSTyyyyMMddHHmmSS) => {
    const jstDate = parseDateString(JSTyyyyMMddHHmmSS);
    const utcDate = convertToUTC(jstDate);
    return formatDateString(utcDate);
};

const utcStringToJST = (utcyyyyMMddHHmmSS) => {
    const utcDate = parseDateString(utcyyyyMMddHHmmSS);
    const jstDate = convertToJST(utcDate);
    return formatDateString(jstDate);
};

const jstStringToUnixTimestamp = (JSTyyyyMMddHHmmSS) => {
    const jstDate = parseDateString(JSTyyyyMMddHHmmSS);
    const utcDate = convertToUTC(jstDate);
    return Math.floor(utcDate.getTime() / 1000);
};

const getLastHalfOrExactHour = (input, isUTC) => {
    let date = parseDateString(input);
    if (!isUTC) {
        date = convertToUTC(date);
    }
    if (date.getUTCMinutes() >= 30) {
        date.setUTCMinutes(30, 0, 0);
    } else {
        date.setUTCMinutes(0, 0, 0);
    }
    if (!isUTC) {
        date = convertToJST(date);
    }
    return formatDateString(date);
};

const getLastExactHour = (input, isUTC) => {
    let date = parseDateString(input);
    if (!isUTC) {
        date = convertToUTC(date);
    }
    date.setUTCMinutes(0, 0, 0);
    if (!isUTC) {
        date = convertToJST(date);
    }
    return formatDateString(date);
};

const datetimeToJapanese = (datetime) => {
    const dateObj = parseDateStringJST(datetime);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hour = dateObj.getHours().toString().padStart(2, '0');
    const minute = dateObj.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hour}:${minute}時点`;
};

class TimeManager {
    constructor(JSTyyyyMMddHHmmSS) {
        this.baseDate = roundToNearestFive(parseDateStringJST(JSTyyyyMMddHHmmSS));
        this.refDate = new Date(this.baseDate);
    }

    setBaseDate(yyyyMMddHHmmSS) {
        this.baseDate = roundToNearestFive(parseDateStringJST(yyyyMMddHHmmSS));
        this.refDate = new Date(this.baseDate);
    }

    getMinutesDifference() {
        const diffInMilliseconds = this.refDate.getTime() - this.baseDate.getTime();
        return Math.floor(diffInMilliseconds / (1000 * 60));
    }

    getPastPresentFuture() {
        return ''
        const timeDiff = this.getMinutesDifference();
        if (timeDiff > 1) return '（予想）';
        else if (timeDiff < -1) return '（時点）';
        else return '（現在）';
    }

    updateTimeByOffset(offsetMinutes) {
        this.refDate = getTimeWithOffset(this.baseDate, offsetMinutes);
    }

    getFormattedDateTime() {
        const jstDate = new Date(this.refDate.getTime() + 9 * 60 * 60 * 1000);
        return `${(jstDate.getUTCMonth() + 1)}月 ${jstDate.getUTCDate()}日 ${formatTimeWithOffset(this.refDate, 0)} ${this.getPastPresentFuture()}`;
    }

    getFormattedTime(offsetMinutes = 0) {
        return formatTimeWithOffset(this.baseDate, offsetMinutes);
    }

    getyyyyMMddHHmmSS(offsetMinutes = 0) {
        const date = getTimeWithOffset(this.baseDate, offsetMinutes);
        const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        const year = jstDate.getUTCFullYear();
        const month = (jstDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = jstDate.getUTCDate().toString().padStart(2, '0');
        const hour = jstDate.getUTCHours().toString().padStart(2, '0');
        const minute = jstDate.getUTCMinutes().toString().padStart(2, '0');
        const second = jstDate.getUTCSeconds().toString().padStart(2, '0');
        return `${year}${month}${day}${hour}${minute}${second}`;
    }

    getRefyyyyMMddHHmmSS() {
        const jstDate = new Date(this.refDate.getTime() + 9 * 60 * 60 * 1000);
        const year = jstDate.getUTCFullYear();
        const month = (jstDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = jstDate.getUTCDate().toString().padStart(2, '0');
        const hour = jstDate.getUTCHours().toString().padStart(2, '0');
        const minute = jstDate.getUTCMinutes().toString().padStart(2, '0');
        const second = jstDate.getUTCSeconds().toString().padStart(2, '0');
        return `${year}${month}${day}${hour}${minute}${second}`;
    }

    getHHmm() {
        return formatTimeWithOffset(this.refDate, 0);
    }

    isPast(yyyyMMddHHmmSS) {
        return Number(yyyyMMddHHmmSS) < Number(this.getyyyyMMddHHmmSS());
    }

    isCurrent(yyyyMMddHHmmSS) {
        return Number(yyyyMMddHHmmSS) === Number(this.getyyyyMMddHHmmSS());
    }

    isCurrentOrPast(yyyyMMddHHmmSS) {
        return this.isCurrent(yyyyMMddHHmmSS) || this.isPast(yyyyMMddHHmmSS);
    }

    getOffsetMinutes(yyyyMMddHHmmSS) {
        const date = parseDateStringJST(yyyyMMddHHmmSS);
        const diffInMilliseconds = date.getTime() - this.baseDate.getTime();
        return Math.floor(diffInMilliseconds / (1000 * 60));
    }
}

// window.TimeManager = TimeManager;
// window.toJST = toJST;
// window.toUTC = toUTC;
// window.utcStringToJST = utcStringToJST;
// window.jstStringToUnixTimestamp = jstStringToUnixTimestamp;
// window.getLastHalfOrExactHour = getLastHalfOrExactHour;
// window.getLastExactHour = getLastExactHour;
// window.datetimeToJapanese = datetimeToJapanese;