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
  if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(text)) {
    return true
  } else {
    return false
  }
}
export function containAddress(text){
  const regex = /(.{1,}(Road|Qu|Sheng|City|Shi|road|qu|sheng|city|shi|square|Square|St|Rd)){2,}|(.{1,}(路|区|省|市|广场|层|号|村|城|县|大道|镇|公园|山|酒店|大厦|学校|公寓|街道|街|村道|湾|海|港|江|河|湖)){2,}/
  let addresses = text.match(regex)
  if (addresses && addresses.length > 0) {
    return addresses
  }else{
    return false
  }
}