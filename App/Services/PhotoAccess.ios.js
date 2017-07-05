import RNPhotosFramework from 'react-native-photos-framework'
import RNFetchBlob from 'react-native-fetch-blob'
import RNDeviceInfo from 'react-native-device-info'
import _ from 'lodash'
import CachedImage from 'react-native-cached-image'

let album = null

function getScreenshotAlbum(onChange){
  let isInSlimulator = RNDeviceInfo.getModel()==='Simulator'||__DEV__
  return new Promise((resolve, reject)=>{
    if(album){
      resolve(album)
    }else{
      RNPhotosFramework.getAlbums({
        type: 'smartAlbum',
        subType: isInSlimulator ?'smartAlbumUserLibrary' :'smartAlbumScreenshots',
        assetCount: 'estimated',
        includeMetadata: false,
        fetchOptions: {
          includeHiddenAssets: false,
          includeAllBurstAssets: false
        },
      }).then((queryResult)=>{
        album = queryResult.albums[0]
        if(!album){
          return reject('authorization failed')
        }
        album.onChange(onAssetsQueryResultChange(onChange))
        resolve(queryResult)
      })
    }
  })
}

function onAssetsQueryResultChange(onChange){
  return (changeDetails, update) => {
    console.tron.display({
      name: 'Assets Changed',
      value: changeDetails
    })
    onChange && onChange(changeDetails, update)
  }
}

function getAssets(album, startIndex, batchSize, thumbnailSize){
  return album.getAssets({
    includeMetadata: true,
    trackInsertsAndDeletes: true,
    includeResourcesMetadata:false,
    trackChanges: false,
    startIndex: startIndex,
    endIndex: startIndex + batchSize - 1,
    // prepareForSizeDisplay: thumbnailSize,
    fetchOptions: {
      mediaTypes: ['image'],
      sortDescriptors: [{
        key: 'creationDate',
        ascending: true
      }]
    },
    assetDisplayBottomUp: false,
    assetDisplayStartToEnd: false
  })
}

function getScreenshots(startIndex, batchSize, onChange, thumbnailSize){
  return new Promise((resolve,reject)=>{
    getScreenshotAlbum(onChange).then((queryResult)=>{
      getAssets(album, startIndex, batchSize, thumbnailSize).then((assetsResult)=>{
        resolve(assetsResult)
      })
    }).catch((e)=>{
      console.tron.inspect(e)
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
  let assetWithNewDeliveryMode = asset.withOptions({
      //one of opportunistic|highQuality|fast
      deliveryMode : 'opportunistic',
      //one of none|fast|exact
      resizeMode: 'exact',
      //one of original|unadjusted|current
      version: 'unadjusted'
  })
  let {width, height, mediaType, uri, localIdentifier, creationDateUTCSeconds} = assetWithNewDeliveryMode
  assetWithNewDeliveryMode.key = localIdentifier
  // let newAssetObj = {
  //   key:localIdentifier,
  //   creationDateUTCSeconds,
  //   mediaType,
  //   image:{
  //     uri,
  //     width,
  //     height,
  //   },
  // }
  return assetWithNewDeliveryMode
}
function getPlainAssetObj(asset){
  return {
    key:asset.key||asset.localIdentifier,
    createdAt:asset.creationDateUTCSeconds,
    updatedAt:asset.modificationDateUTCSeconds,
    name: (asset.image||{}).name,
    image: {uri: (asset.image||{}).uri, width: asset.width, height: asset.height}
  }
}
function prepare(){
  return RNPhotosFramework.requestAuthorization()
}

function deleteAssetsFromLibrary(deviceAssets){
  if(deviceAssets.length>0){
    let localIdentifiers = deviceAssets
    if(!deviceAssets[0].localIdentifier){
      localIdentifiers = _.map(deviceAssets, p=>{return {localIdentifier:p.key}})
    }
    return RNPhotosFramework.deleteAssets(localIdentifiers)
  }else{
    return {success: true}
  }
}

function convertToRelativePath(path){
  return path.replace(RNFetchBlob.fs.dirs.DocumentDir,'')
}

function convertToAbsolutePath(asset){
  let path = asset.image.uri
  if(asset.remote){
    return CachedImage.ImageCacheProvider.getCachedImageFilePath(path, {useQueryParamsInCacheKey: false})
  }else{
    if(_.startsWith(path,'/')){
      return RNFetchBlob.fs.dirs.DocumentDir + path
    }else{
      return path
    }
  }
}
//Video only.
// function saveAssetsToAppLocal(assets, onProgress,){
//   return RNPhotosFramework.saveAssetsToDisk(
//     assets.map(asset => ({asset: asset})), {
//     onProgress: (e) => {
//       onProgress && onProgress(e)
//       console.tron.inspect({e,stage:'onProgress'})
//     }
//   })
// }
export default {
  getScreenshots,
  getNormalizedAssetObj,
  getPlainAssetObj,
  prepare,
  convertToRelativePath,
  convertToAbsolutePath,
  deleteAssetsFromLibrary,
  // saveAssetsToAppLocal,
}
