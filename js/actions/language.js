export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE'
export const CHANGE_RULE = 'CHANGE_RULE'

export const changeLanguage = language => {
  return {
    type: CHANGE_LANGUAGE,
    currentLanguage: language
  }
}

export const changeRule = rule => {
  return {
    type: CHANGE_RULE,
    currentRule: rule
  }
}
