package app.lifeos.capture;

import android.content.Intent;

/** Export only the share entry point; the widget activity remains private. */
public class ShareCaptureActivity extends QuickCaptureActivity {
    @Override protected Intent sharedIntent(){return getIntent();}
}
