import I18n from 'react-native-i18n'
import moment from 'moment-timezone'
var zhTimeLocale = require('moment/locale/zh-cn')

zhTimeLocale.calendar = {
    sameDay : '[今天] LT',
    nextDay : '[明天] LT',
    nextWeek : '[下周]dddd LT',
    lastDay : '[昨天] LT',
    lastWeek : 'MoDo LT',
    sameElse : 'MoDo LT, YYYY'
}
moment.updateLocale('zh-cn', zhTimeLocale)
// Enable fallbacks if you want `en-US` and `en-GB` to fallback to `en`
I18n.fallbacks = true

// English language is the main language for fall back:
I18n.translations = {
  en: require('./english.json')
}

let languageCode = I18n.locale.substr(0, 2)
moment.locale(I18n.locale)//, {calendar: calendarFormatLocales[languageCode]} )


// All other translations for the app goes to the respective language file:
switch (languageCode) {
  case 'zh':
    I18n.translations.zh = require('./zh.json')
    break
}
