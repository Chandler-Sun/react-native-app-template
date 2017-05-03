
export function needLogout (response) {
  if(!response.data || !response.data.code){
    return false
  }
  return response.data.code >= 10000 && response.data.code < 20000
}

export function isResponseOK (response) {
  return response.ok && ( 
    (response.data && !response.data.code) 
    || 
    !response.data
  )
}