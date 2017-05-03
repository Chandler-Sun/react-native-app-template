import CDNConfig from '../Config/CDNConfig'
let qiniu = require('react-native-qiniu')//CDN

export default {
  /**
   * Upload file to CDN
   */
  uploadFile: function(token, key, uploadServer, filePath, onprogress) {
    return new Promise((resolve, reject) => {
      var fileName = filePath.split('/').splice(-1,1)[0]
      var formInput = {
          name: fileName,
          uri: filePath
      }
      if (typeof filePath != 'string' || filePath == '' || typeof key == 'undefined') {
        reject && reject(null);
        return;
      }
      if (filePath[0] == '/') {
        filePath = "file://" + filePath;
      }
      var xhr = new XMLHttpRequest();
      xhr.timeout = 1000 * 60 * 3
      xhr.open('POST', uploadServer);
      xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE) {
          if(xhr.status === 200){
            resolve && resolve(xhr);
          }else{
            console.tron.display({
              name: 'onreadystatechange',
              preview:xhr.readyState,
              value:xhr
            })
            reject && reject(xhr);
            return;
          }
        }
      };
      xhr.ontimeout = () => {
        reject && reject(xhr);
      }
      var formdata = new FormData();
      formdata.append("key", key);
      formdata.append("token", token);
      if (!formInput.type)
        formInput.type = 'application/octet-stream';
      formdata.append("file", formInput);
      xhr.upload.onprogress = (event) => {
        onprogress && onprogress(event, xhr);
      };
      xhr.send(formdata);
    });
  }
}