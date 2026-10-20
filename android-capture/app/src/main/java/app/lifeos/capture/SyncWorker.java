package app.lifeos.capture;

import android.content.Context;
import androidx.work.*;
import org.json.JSONObject;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

public class SyncWorker extends Worker {
    private static final String WORK_NAME="lifeos-capture-sync";
    private static final ExecutorService scheduler=Executors.newSingleThreadExecutor();
    public SyncWorker(Context context,WorkerParameters params){super(context,params);}
    static void schedule(Context context){schedule(context,false);}
    static void retryNow(Context context){schedule(context,true);}
    private static void schedule(Context context,boolean immediate){
        Context app=context.getApplicationContext();
        // Serialize inspection/enqueue off the UI thread. Coalesce wakeups while preserving a
        // successor if capture arrives just as a running worker is finishing its empty-queue check.
        scheduler.execute(()->{
            try{
                WorkManager manager=WorkManager.getInstance(app);boolean running=false,queued=false;
                for(WorkInfo info:manager.getWorkInfosForUniqueWork(WORK_NAME).get(15,TimeUnit.SECONDS)){
                    running|=info.getState()==WorkInfo.State.RUNNING;
                    queued|=info.getState()==WorkInfo.State.ENQUEUED||info.getState()==WorkInfo.State.BLOCKED;
                }
                if(queued&&(running||!immediate))return;
                ExistingWorkPolicy policy=immediate&&!running?ExistingWorkPolicy.REPLACE:ExistingWorkPolicy.APPEND_OR_REPLACE;
                OneTimeWorkRequest work=new OneTimeWorkRequest.Builder(SyncWorker.class).setConstraints(new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).setBackoffCriteria(BackoffPolicy.EXPONENTIAL,30,TimeUnit.SECONDS).build();
                manager.enqueueUniqueWork(WORK_NAME,policy,work).getResult().get(15,TimeUnit.SECONDS);
            }catch(Exception e){
                try(Store store=new Store(app)){store.put("lastError","Não foi possível agendar o envio. Reabra o Captura e toque em Tentar sincronizar agora. Os textos continuam guardados.");}catch(Exception ignored){}
            }
        });
    }
    public Result doWork(){
        Context context=getApplicationContext();try(Store store=new Store(context)){
            if(!store.authorized())return Result.success();
            String owner=store.user();store.bindOwner(owner);
            for(int n=0;n<10&&!isStopped();n++){
                JSONObject item=store.first(owner);if(item==null){store.put("lastError","");return Result.success();}
                store.put("lastAttemptAt",String.valueOf(System.currentTimeMillis()));
                JSONObject result=Api.call("/api/capture/inbox",item,store.get("credentials"));
                if(!result.optBoolean("saved")||!item.getString("id").equals(result.optString("id")))throw new java.io.IOException("O servidor ainda não confirmou o salvamento.");
                store.confirmed(item.getString("id"),owner);store.put("lastError","");store.put("lastSavedAt",String.valueOf(System.currentTimeMillis()));CaptureWidget.updateAll(context);
            }
            if(store.count()>0)schedule(context);return Result.success();
        }catch(Exception e){
            try(Store store=new Store(context)){
                if(e instanceof Api.Error&&((Api.Error)e).status==401){store.put("needsAuth","1");store.put("lastError","Reconecte ao LifeOS para enviar as capturas pendentes.");return Result.success();}
                String message=e instanceof Api.Error?e.getMessage():e instanceof java.net.SocketTimeoutException?"O servidor demorou para responder. A captura continua guardada; a próxima tentativa verificará se ela já chegou.":e instanceof java.io.IOException?"Não foi possível confirmar o envio pela rede. As capturas continuam guardadas; uma nova tentativa será feita.":"Não foi possível processar a fila local. Seus textos foram mantidos; use Copiar pendentes para resgatá-los.";
                store.put("lastError",message);
                if(e instanceof Api.Error&&((Api.Error)e).status==422)return Result.success();
            }catch(Exception ignored){}
            return Result.retry();
        }finally{CaptureWidget.updateAll(context);}
    }
}
