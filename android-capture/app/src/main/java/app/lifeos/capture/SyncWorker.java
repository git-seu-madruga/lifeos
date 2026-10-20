package app.lifeos.capture;

import android.content.Context;
import androidx.work.*;
import org.json.JSONObject;
import java.util.concurrent.TimeUnit;

public class SyncWorker extends Worker {
    public SyncWorker(Context context,WorkerParameters params){super(context,params);}
    static void schedule(Context context){
        OneTimeWorkRequest work=new OneTimeWorkRequest.Builder(SyncWorker.class).setConstraints(new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).setBackoffCriteria(BackoffPolicy.EXPONENTIAL,30,TimeUnit.SECONDS).build();
        WorkManager.getInstance(context).enqueueUniqueWork("lifeos-capture-sync",ExistingWorkPolicy.APPEND_OR_REPLACE,work);
    }
    public Result doWork(){
        Context context=getApplicationContext();try(Store store=new Store(context)){
            if(!store.authorized())return Result.success();
            String owner=store.user();store.bindOwner(owner);
            for(int n=0;n<10&&!isStopped();n++){
                JSONObject item=store.first(owner);if(item==null){store.put("lastError","");return Result.success();}
                JSONObject result=Api.call("/api/capture/inbox",item,store.get("credentials"));
                if(!result.optBoolean("saved")||!item.getString("id").equals(result.optString("id")))throw new java.io.IOException("O servidor ainda não confirmou o salvamento.");
                store.confirmed(item.getString("id"),owner);store.put("lastError","");CaptureWidget.updateAll(context);
            }
            if(store.count()>0)schedule(context);return Result.success();
        }catch(Exception e){
            try(Store store=new Store(context)){
                if(e instanceof Api.Error&&((Api.Error)e).status==401){store.put("needsAuth","1");store.put("lastError","Reconecte ao LifeOS para enviar as capturas pendentes.");return Result.success();}
                store.put("lastError",e instanceof Api.Error?e.getMessage():"Sem conexão. As capturas continuam guardadas no aparelho.");
                if(e instanceof Api.Error&&((Api.Error)e).status==422)return Result.success();
            }catch(Exception ignored){}
            return Result.retry();
        }finally{CaptureWidget.updateAll(context);}
    }
}
