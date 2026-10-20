package app.lifeos.capture;

import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.os.Bundle;
import android.content.res.Configuration;
import android.graphics.Color;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.view.View;
import android.widget.RemoteViews;

public class CaptureWidget extends AppWidgetProvider {
    public void onUpdate(Context context,AppWidgetManager manager,int[] ids){updateAll(context);try(Store store=new Store(context)){if(store.count()>0&&store.authorized())SyncWorker.schedule(context);}catch(Exception ignored){}}
    public void onAppWidgetOptionsChanged(Context context,AppWidgetManager manager,int id,Bundle options){updateAll(context);}
    static void updateAll(Context context){
        AppWidgetManager manager=AppWidgetManager.getInstance(context);int[] ids=manager.getAppWidgetIds(new ComponentName(context,CaptureWidget.class));
        for(int id:ids){RemoteViews view=new RemoteViews(context.getPackageName(),R.layout.capture_widget);int icon=R.drawable.ic_connect;String description="Conectar ao LifeOS";
            int transparency=0;
            try(Store store=new Store(context)){
                String preference=store.get("widgetTransparency");if(!preference.isEmpty())transparency=Math.max(0,Math.min(100,Integer.parseInt(preference)));
                if(store.count()>0){icon=R.drawable.ic_clock;description=store.count()+" envios pendentes. "+(store.authorized()?"Aguardando sincronização.":"Abra e reconecte ao LifeOS.");}
                else if(store.authorized()){icon=R.drawable.ic_check;description="Tudo sincronizado. Nenhum envio pendente.";}
            }catch(Exception e){description="Abra o aplicativo para conferir o armazenamento.";}
            view.setInt(R.id.widget_background,"setImageAlpha",Math.round(255*(100-transparency)/100f));
            Bundle options=manager.getAppWidgetOptions(id);
            boolean landscape=context.getResources().getConfiguration().orientation==Configuration.ORIENTATION_LANDSCAPE;
            int width=options.getInt(landscape?AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH:AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
            // Give the action room in a 2-column widget; restore the complete brand as it widens.
            boolean fullBrand=width>=240;
            SpannableString brand=new SpannableString("LifeOS");brand.setSpan(new ForegroundColorSpan(Color.parseColor("#6EA8FE")),4,6,Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            view.setTextViewText(R.id.widget_brand,brand);view.setViewVisibility(R.id.widget_brand,fullBrand?View.VISIBLE:View.GONE);
            Intent capture=new Intent(context,QuickCaptureActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent action=PendingIntent.getActivity(context,0,capture,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            view.setOnClickPendingIntent(R.id.widget_capture,action);view.setTextViewText(R.id.widget_prompt,width>=330?"＋ Capturar no Inbox":"＋ Inbox");view.setOnClickPendingIntent(R.id.widget_status,action);view.setImageViewResource(R.id.widget_status,icon);view.setContentDescription(R.id.widget_status,description);manager.updateAppWidget(id,view);
        }
    }
}
