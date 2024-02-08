export function countInArray<T>(id: T, array: T[]) {
  return array.reduce((total, el) => el === id ? total + 1 : total, 0)
}
