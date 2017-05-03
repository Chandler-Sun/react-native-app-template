const linkify = require('linkify-it')();
const phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
const phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export function containsURL(content) {
  var links = linkify.match(content)
  if (links && links.length > 0) {
    return links
  }else{
    return false
  }
}

export function isValidPhoneNumber(number, country) {
  if (number.length < 2) {
    return false
  }
  var result = false
  try {     
    const phoneNum = phoneNumberUtil.parse(number, country)
    result = phoneNumberUtil.isValidNumber(phoneNum)
  } catch (e) {
    console.tron.log("NumberParseException was thrown: " + e.toString());
    result = false
  }
  return result
}

export function getCountryCodeForRegion(country) {
    if (!country) {return null}
    const countryCode = phoneNumberUtil.getCountryCodeForRegion(country.toUpperCase());
    return "+" + countryCode
}

export function isValidEmail(text) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(text)) {
    return true
  } else {
    return false
  }
}