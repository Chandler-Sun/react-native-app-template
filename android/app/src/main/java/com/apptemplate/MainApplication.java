package com.apptemplate;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.BV.LinearGradient.LinearGradientPackage;
import com.rnfs.RNFSPackage;
import com.jadsonlourenco.RNShakeEvent.RNShakeEventPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.theweflex.react.WeChatPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import cl.json.RNSharePackage;
import com.kevinejohn.RNMixpanel.RNMixpanel;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.smixx.fabric.FabricPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new LinearGradientPackage(),
            new RNFSPackage(),
            new RNShakeEventPackage(),
            new ReactNativePushNotificationPackage(),
            new WeChatPackage(),
            new RNViewShotPackage(),
            new VectorIconsPackage(),
            new SvgPackage(),
            new RNSharePackage(),
            new RNMixpanel(),
            new ImageResizerPackage(),
            new ReactNativeI18n(),
            new FabricPackage(),
            new RNDeviceInfo(),
            new RCTCameraPackage(),
            new BlurViewPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
