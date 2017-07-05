import {
  CameraRoll,
  Alert,
  PermissionsAndroid
} from 'react-native'
import RNFetchBlob from 'react-native-fetch-blob'
import RNDeviceInfo from 'react-native-device-info'

let album = null
let lastCursor = null

function getScreenshots(startIndex, batchSize, onChange){
  return new Promise((resolve,reject)=>{
    const fetchParams = {
      first: batchSize,
      assetType: 'Photos',
    };
    if (lastCursor) {
      fetchParams.after = lastCursor;
    }
    CameraRoll.getPhotos(fetchParams).then((data)=>{
      let result = {
        includesLastAsset: !data.page_info.has_next_page,
        assets: data.edges
      }
      if (data.edges.length > 0) {
        lastCursor = data.page_info.end_cursor
      }
      resolve(result);
    })
  })
}

/**
 * Sample photo obj:
  mediaSubTypes: 
    0:photoScreenshot
  mediaType:image
  localIdentifier:6409F23D-CD2A-447B-B8E9-384075B085F6/L0/001
  isFavorite:false
  width:1242
  modificationDateUTCSeconds:1493358335.767881
  sourceType:userLibrary
  isHidden:false
  location:{}
  ▶resourcesMetadata:[] 1 item
    ▶0:{}
    mimeType:image/png
    originalFilename:IMG_1871.PNG
    assetLocalIdentifier:6409F23D-CD2A-447B-B8E9-384075B085F6/L0/001
    uniformTypeIdentifier:public.png
    type:photo
    fileExtension:PNG
  creationDateUTCSeconds:1493186046
  height:2208
  collectionIndex:191
  ▶_assetObj:{}
  _uri:photos://6409F23D-CD2A-447B-B8E9-384075B085F6/L0/001
  ▶_imageRef:{}
    width:1242
    height:2208
    uri:photos://6409F23D-CD2A-447B-B8E9-384075B085F6/L0/001
    name:test.jpg
*/
function getNormalizedAssetObj(asset){
  let normalizedAsset = asset.node
  normalizedAsset.key = asset.node.image.uri
  normalizedAsset.createdAt = asset.node.timestamp
  return normalizedAsset
}
function getPlainAssetObj(asset){
  return {
    key:asset.key, 
    createdAt: asset.createdAt,
    updatedAt: asset.createdAt,
    image: {uri: asset.image.uri}}
}
function prepare(){
  return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Permission Explanation',
        message: 'We would like to access your pictures.',
      },
    )
}

export default {
  getScreenshots,
  getNormalizedAssetObj,
  getPlainAssetObj,
  prepare
}
