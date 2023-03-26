// recursively query the entire dom, and find elements where any key includes a certain key and the value is a function
// this isn't used anywhere, it's just useful for finding stuff when developing
function findElementWithAttribute(elements, search, path, found, deep = 0) {
  if (deep > 1) return
  for (let i = 0; i < elements.length; i++) {
    if (typeof elements[i] === 'object' && elements[i] !== null) {
      for (const [key, value] of Object.entries(elements[i])) {
        if (key.toLowerCase().includes(search) && typeof value === 'function' && !found.includes(path + '/' + key)) {
          console.log('found', path + '/' + key, elements[i])
          found.push(path + '/' + key)
        }

        findElementWithAttribute([value], search, path + '/' + key, found, deep + 1)
      }
    }
  }
}

findElementWithAttribute(document.querySelectorAll('*'), 'key', '', [])