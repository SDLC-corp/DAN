export function isElementDuplicated(arr = [], element) {
    let index = arr.indexOf(element);
    return index !== -1 && arr.indexOf(element, index + 1) !== -1;
  }
  