package com.gitfeed;

import com.facebook.react.ReactActivity;
import com.microsoft.codepush.react.CodePush;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.microsoft.codepush.react.CodePush;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {
    private CodePush _codePush;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getJSBundleFile() {
        return this._codePush.getBundleUrl("index.android.bundle");
    }

    @Override
    protected String getMainComponentName() {
        return "GitFeed";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
   @Override
   protected List<ReactPackage> getPackages() {
       // 4. Instantiate an instance of the CodePush runtime, using the right deployment key
       this._codePush = new CodePush("YOUR_CODE_PUSH_KEY", this, BuildConfig.DEBUG);

       // 5. Add the CodePush package to the list of existing packages
       return Arrays.<ReactPackage>asList(
               new MainReactPackage(),
               this._codePush.getReactPackage(),
               new VectorIconsPackage());
   }
}
