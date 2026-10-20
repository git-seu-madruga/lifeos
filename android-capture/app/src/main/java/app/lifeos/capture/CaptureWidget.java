package app.lifeos.capture;

import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.widget.RemoteViews;

public class CaptureWidget extends AppWidgetProvider {
    public void onUpdate(Context context,AppWidgetManager manager,int[] ids){updateAll(context);try(Store store=new Store(context)){if(store.count()>0&&store.authorized())SyncWorker.schedule(context);}catch(Exception ignored){}}
    static void updateAll(Context context){
        AppWidgetManager manager=AppWidgetManager.getInstance(context);int[] ids=manager.getAppWidgetIds(new ComponentName(context,CaptureWidget.class));
        for(int id:ids){RemoteViews view=new RemoteViews(context.getPackageName(),R.layout.capture_widget);int icon=R.drawable.ic_connect;String description="Conectar ao LifeOS";
            try(Store store=new Store(context)){
                if(store.count()>0){icon=R.drawable.ic_clock;description=store.count()+" envios pendentes. "+(store.authorized()?"Aguardando sincronização.":"Abra e reconecte ao LifeOS.");}
                else if(store.authorized()){icon=R.drawable.ic_check;description="Tudo sincronizado. Nenhum envio pendente.";}
            }catch(Exception e){description="Abra o aplicativo para conferir o armazenamento.";}
            Intent capture=new Intent(context,CaptureActivity.class).putExtra("quick",true).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent action=PendingIntent.getActivity(context,0,capture,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            view.setOnClickPendingIntent(R.id.widget_add,action);view.setOnClickPendingIntent(R.id.widget_status,action);view.setImageViewResource(R.id.widget_status,icon);view.setContentDescription(R.id.widget_status,description);manager.updateAppWidget(id,view);
        }
    }
}
