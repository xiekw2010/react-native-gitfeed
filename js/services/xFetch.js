/**
 * Created by xiekaiwei on 16/8/24.
 */

const checkIfErrorOccurs = res => {
  return {
    code: res.status,
    res
  }
}

const TIME_OUT = 15000

async function xFetch(path, headerOptions, ops = { noParse: false }) {
  const normalFetch = fetch(path, headerOptions)
  if (ops.noParse) {
    return timeoutPromise(TIME_OUT, normalFetch)
  }

  const res = await timeoutPromise(TIME_OUT, normalFetch.then(checkIfErrorOccurs))
  const response = await res.res.json()
  if (res.code < 300) {
    return response
  } else {
    throw new Error(`${res.code} ${response.message}`)
  }
}

export const timeoutPromise = function timeoutPromise(ms, promise) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("request time out"))
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  })
}

export default xFetch
