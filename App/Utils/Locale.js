import i18n from 'react-native-i18n'

export function getCountry() {
  const locale = i18n.locale
  let country = 'US'
  if(locale.length>=5) {
    // en-US
    country = locale.substr(-2, 2)
  }
  return country
}