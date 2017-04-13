//export const debounce = (func, wait = 1000, immediate = true) => {
//  var timeout;
//  return function() {
//    var context = this, args = arguments;
//    var later = function() {
//      timeout = null;
//      if (!immediate) func.apply(context, args);
//    };
//    var callNow = immediate && !timeout;
//    clearTimeout(timeout);
//    timeout = setTimeout(later, wait);
//    if (callNow) func.apply(context, args);
//  };
//}

exports.debounce = (func, wait = 1000, immediate = true) => {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}