/************************************* Any *****************************************/
const log = a => (console.log(a), a)
const identify = a => a
/***********************************************************************************/




/*********************************** Promise ***************************************/
const isPromise = a => a instanceof Promise
const then = (a, f) => isPromise(a) ? a.then(f) : f(a)
/***********************************************************************************/




/********************************** Generator **************************************/
const values = function* (obj) { for (const value of obj) yield value }
const entries = function* (obj) { for (const key in obj) yield [key, obj[key]] }
const range = function *(num) { for (let i = 0; i < num; i++) yield i }
/***********************************************************************************/




/*********************************** Iterator **************************************/
const hasIter = a => Boolean(a && a[Symbol.iterator])
const getIter = a => hasIter(a) ? a[Symbol.iterator]() : values(a)
/***********************************************************************************/




/*********************************** Function **************************************/
const curry = f => (a, ..._) => !_.length ? (..._) => f(a, ..._) : f(a, ..._)
const go = (...fs) => reduce((acc, f) => f(acc), fs)
/***********************************************************************************/




/********************************** LikeArray **************************************/
const push = (arr, v) => (arr.push(v), arr)
const pick = index => (...args) => args[index]
/***********************************************************************************/




/*********************************** Collection **************************************/
const reduce = curry(function(f, acc, coll) {
  if (arguments.length == 2) {
    const iter = getIter(acc)
    return reduce(f, iter.next().value, iter)
  }
  
  const iter = getIter(coll)
  return function recur() {
    let curIter, cur
    while (!(curIter = iter.next()).done) {
      cur = curIter.value
      acc = then(acc, acc => f(acc, cur))
      if (isPromise(acc)) return acc.then(recur)
    }
    return acc
  }()
})
const map = curry((f, coll) => reduce((acc, cur) => then(f(cur), cur => push(acc, cur)), coll, []))
const each = curry((f, coll) => reduce((_, cur) => (f(cur), coll), coll))
const take = curry((num, coll) => {
  const result = []
  if(!num) return result

  const iter = getIter(coll)
  return function recur() {
    let curIter, cur
    while (!(curIter = iter.next()).done) {
      cur = curIter.value
      if (isPromise(cur))
        return cur.then(cur => push(result, cur).length == num ? result : recur())
      
      result.push(cur)
      if (result.length == num) return result
    }
    return result
  }()
})
const takeWhile = curry((f, coll) => {
  const result = []
  const iter = getIter(coll)
  return function recur() {
    for (const cur of iter) {
      const D = then(cur, f)  // 판별식(Discriminant)의 앞글자 "D"
      if(!D) break
      if(isPromise(D)) return D.then(async D => D ? push(result, await cur) && recur() : result)
      push(result, cur)
    }
    return result
  }()
})
const flat = function *(coll) {
  const iter = getIter(coll)
  for (const cur of iter) {
    if (hasIter(cur)) yield* cur;
    else yield cur;
  }
};
/***********************************************************************************/
