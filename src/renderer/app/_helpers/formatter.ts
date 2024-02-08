function always2DigitNumber(number: number) {
  if (number >= 10) { return '' + number; }
  return '0' + number;
}

function hour24ToAmPm(hour: number) {
  if (hour === 0) { return { time: 'AM', hour: 12 } }
  else if (hour < 12) { return { time: 'AM', hour } }
  else if (hour === 12) { return { time: 'PM', hour } }
  return { time: 'PM', hour: hour - 12 }
}

export function convertToPriceFormat(number?: number) {
  if (number === undefined) { return '-'; }
  return '$' + Number(number).toLocaleString();
}

export function convertToDateFormat(isoDate: string) {
  const date = new Date(isoDate);
  const hourAmPm = hour24ToAmPm(date.getHours());

  const year = always2DigitNumber(date.getFullYear());
  const month = always2DigitNumber(date.getMonth() + 1);
  const day = always2DigitNumber(date.getDate());
  const hour = always2DigitNumber(hourAmPm.hour);
  const min = always2DigitNumber(date.getMinutes());
  const sec = always2DigitNumber(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${min}:${sec} ${hourAmPm.time}`
}

export function getFlavorShortNames(
  flavorIds: number[],
  allFlavors: { id: number, printName?: string, name: string}[]
) {
  const items = flavorIds.map(id => {
    const flavor = allFlavors.find(el => el.id === id)
    if (!flavor) { return '-' }
    return flavor.printName ? flavor.printName : flavor.name.substring(0, 3).toUpperCase()
  })

  return items.length === 0 ? '' : `(${items.join(',')})`
}
