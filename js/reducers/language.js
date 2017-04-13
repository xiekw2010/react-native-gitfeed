import * as lg from '../actions/language'

export const defaultState = {
  allLanguages: [
    "All Languages",
    "ActionScript",
    "C",
    "C#",
    "C++",
    "Clojure",
    "CoffeeScript",
    "CSS",
    "Go",
    "Haskell",
    "HTML",
    "Java",
    "JavaScript",
    "Lua",
    "Matlab",
    "Objective-C",
    "Objective-C++",
    "Perl",
    "PHP",
    "Python",
    "R",
    "Ruby",
    "Scala",
    "Shell",
    "Swift",
    "TeX",
    "VimL"
  ],
  trendingLanguages: [
    "All Languages",
    "C#",
    "C++",
    "Go",
    "Java",
    "JavaScript",
    "Objective-C",
    "PHP",
    "Python",
    "Ruby",
    "Scala",
    "Shell",
    "Swift",
  ],
  rules: [
    "Best matches",
    "Most stars",
    "Most forks",
    "Recent updated"
  ],
  currentLanguage: "All Languages",
  currentRule: "Best matches"
}

export const language = (state = defaultState, action) => {
  switch (action.type) {
    case lg.CHANGE_LANGUAGE:
      return { ...state, currentLanguage: action.currentLanguage }
    case lg.CHANGE_RULE:
      return { ...state, currentRule: action.currentRule }
  }

  return state
}

export const mapRuleToQuery = rule => {
  let res = ''
  switch (rule) {
    case 'Best matches':
      res = ''
      break
    case 'Most stars':
      res = 'stars'
      break
    case 'Most forks':
      res = 'forks'
      break
    case 'Recent updated':
      res = 'updated'
      break
  }

  if (!res.length) return res
  return `+sort:${res}`
}