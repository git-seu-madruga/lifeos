// Runs the real Java worker against deterministic host doubles (not an Android/device test).
// Requires JDK 17: JAVA_HOME=/path/to/jdk npm run test:android-queue
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lifeos-worker-test-'));
const sources={
 'android/content/Context.java':`package android.content; public class Context { public Context getApplicationContext(){return this;} }`,
 'org/json/JSONObject.java':`package org.json; import java.util.*; public class JSONObject {
 private final Map<String,Object> values=new HashMap<>(); public JSONObject put(String k,Object v){values.put(k,v);return this;}
 public String getString(String k){return (String)values.get(k);} public String optString(String k){return (String)values.getOrDefault(k,"");}
 public Object opt(String k){return values.get(k);} public boolean optBoolean(String k){return Boolean.TRUE.equals(values.get(k));} }`,
 'androidx/work/WorkerParameters.java':`package androidx.work; public class WorkerParameters {}`,
 'androidx/work/Worker.java':`package androidx.work; import android.content.Context; public abstract class Worker {
 private final Context context; public Worker(Context c,WorkerParameters p){context=c;} public Context getApplicationContext(){return context;}
 public boolean isStopped(){return false;} public abstract Result doWork();
 public enum Result { SUCCESS,RETRY; public static Result success(){return SUCCESS;} public static Result retry(){return RETRY;} } }`,
 'androidx/work/WorkInfo.java':`package androidx.work; public class WorkInfo {
 public enum State {RUNNING,ENQUEUED,BLOCKED,SUCCEEDED,CANCELLED,FAILED} private final State state;
 public WorkInfo(State s){state=s;} public State getState(){return state;} }`,
 'androidx/work/ExistingWorkPolicy.java':`package androidx.work; public enum ExistingWorkPolicy {APPEND_OR_REPLACE,REPLACE}`,
 'androidx/work/NetworkType.java':`package androidx.work; public enum NetworkType {CONNECTED}`,
 'androidx/work/BackoffPolicy.java':`package androidx.work; public enum BackoffPolicy {EXPONENTIAL}`,
 'androidx/work/Constraints.java':`package androidx.work; public class Constraints {public static class Builder {
 public Builder setRequiredNetworkType(NetworkType n){return this;} public Constraints build(){return new Constraints();}}}`,
 'androidx/work/OneTimeWorkRequest.java':`package androidx.work; import java.util.concurrent.TimeUnit; public class OneTimeWorkRequest {public static class Builder {
 public Builder(Class<?> c){} public Builder setConstraints(Constraints c){return this;} public Builder setBackoffCriteria(BackoffPolicy p,long n,TimeUnit u){return this;}
 public OneTimeWorkRequest build(){return new OneTimeWorkRequest();}}}`,
 'androidx/work/WorkManager.java':`package androidx.work; import java.util.*; import java.util.concurrent.*; import android.content.Context;
 public class WorkManager {public static final WorkManager INSTANCE=new WorkManager(); public List<WorkInfo> infos=new ArrayList<>();
 public final List<ExistingWorkPolicy> policies=new ArrayList<>(); public static WorkManager getInstance(Context c){return INSTANCE;}
 public CompletableFuture<List<WorkInfo>> getWorkInfosForUniqueWork(String n){return CompletableFuture.completedFuture(new ArrayList<>(infos));}
 public Operation enqueueUniqueWork(String n,ExistingWorkPolicy p,OneTimeWorkRequest r){policies.add(p);
 if(p==ExistingWorkPolicy.REPLACE)infos.clear(); infos.add(new WorkInfo(infos.stream().anyMatch(i->i.getState()==WorkInfo.State.RUNNING)?WorkInfo.State.BLOCKED:WorkInfo.State.ENQUEUED));return new Operation();}
 public static class Operation {public CompletableFuture<Void> getResult(){return CompletableFuture.completedFuture(null);}} }`,
 'app/lifeos/capture/Store.java':`package app.lifeos.capture; import android.content.Context; import org.json.JSONObject; import java.util.*;
 final class Store implements AutoCloseable {static final Map<String,String> prefs=new HashMap<>();static final List<JSONObject> queue=new ArrayList<>();static boolean auth=true;
 Store(Context c){} public void close(){} boolean authorized(){return auth&&get("needsAuth").isEmpty();}String user(){return "owner";}
 void bindOwner(String s){} JSONObject first(String owner){return queue.isEmpty()?null:queue.get(0);}int count(){return queue.size();}
 String get(String k){return prefs.getOrDefault(k,"");}void put(String k,String v){prefs.put(k,v);}
 void confirmed(String id,String owner){queue.removeIf(q->q.getString("id").equals(id));} }`,
 'app/lifeos/capture/Api.java':`package app.lifeos.capture; import org.json.JSONObject; final class Api {
 static JSONObject lastInput=null; static int calls=0; static boolean badAck=false;static Exception error=null;
 static final class Error extends Exception {final int status;Error(int s,String m){super(m);status=s;}}
 static JSONObject call(String p,JSONObject input,String c)throws Exception {lastInput=input;calls++;if(error!=null)throw error;
 return new JSONObject().put("saved",true).put("id",badAck?"wrong-id":input.getString("id"));} }`,
 'app/lifeos/capture/CaptureWidget.java':`package app.lifeos.capture; import android.content.Context; public class CaptureWidget {static void updateAll(Context c){}}`,
 'app/lifeos/capture/QueueTest.java':`package app.lifeos.capture;
 import android.content.Context;import androidx.work.*;import java.util.*;import java.util.concurrent.*;import org.json.JSONObject;
 public class QueueTest {
 static Context context=new Context();static WorkManager wm=WorkManager.getInstance(context);
 static void check(boolean ok,String message){if(!ok)throw new AssertionError(message);}
 static void flush()throws Exception {var field=SyncWorker.class.getDeclaredField("scheduler");field.setAccessible(true);((ExecutorService)field.get(null)).submit(()->{}).get(5,TimeUnit.SECONDS);}
 static void state(WorkInfo.State...states){wm.infos.clear();for(var s:states)wm.infos.add(new WorkInfo(s));wm.policies.clear();}
 static void reset(){Store.queue.clear();Store.prefs.clear();Store.auth=true;Api.calls=0;Api.error=null;Api.badAck=false;state();}
 static void add(String id){Store.queue.add(new JSONObject().put("id",id).put("text","captura"));}
 static Worker.Result run(){return new SyncWorker(context,new WorkerParameters()).doWork();}
 public static void main(String[]args){try{
 state(WorkInfo.State.ENQUEUED);SyncWorker.schedule(context);flush();check(wm.policies.isEmpty(),"não acumular trabalhos atrás do backoff");
 SyncWorker.retryNow(context);flush();check(wm.policies.equals(List.of(ExistingWorkPolicy.REPLACE)),"tentativa manual reinicia trabalho adiado");
 state(WorkInfo.State.RUNNING);SyncWorker.retryNow(context);flush();check(wm.policies.equals(List.of(ExistingWorkPolicy.APPEND_OR_REPLACE)),"preservar requisição em curso e acordar sucessor");
 SyncWorker.schedule(context);flush();check(wm.policies.size()==1,"agrupar novos pedidos enquanto sucessor aguarda");
 state(WorkInfo.State.SUCCEEDED);SyncWorker.schedule(context);flush();check(wm.policies.size()==1,"captura ao final de uma execução agenda novo envio");
 reset();add("one");Api.badAck=true;check(run()==Worker.Result.RETRY,"confirmação errada precisa repetir");check(Store.queue.size()==1,"não apagar antes da confirmação do ID");
 Api.badAck=false;check(run()==Worker.Result.SUCCESS&&Store.queue.isEmpty(),"confirmação correta retira apenas item salvo");check(!Store.prefs.get("lastSavedAt").isEmpty(),"registrar horário confirmado");
 reset();add("timeout");Api.error=new java.net.SocketTimeoutException();check(run()==Worker.Result.RETRY&&Store.queue.size()==1,"timeout mantém captura");check(Store.prefs.get("lastError").contains("demorou"),"explicar timeout sem alegar envio perdido");
 reset();add("auth");Api.error=new Api.Error(401,"expirou");check(run()==Worker.Result.SUCCESS&&Store.queue.size()==1,"reautorização não apaga fila");check(Store.prefs.get("needsAuth").equals("1"),"pedir reautorização");
 reset();add("ambiguous");Api.error=new Api.Error(409,"aguardando confirmação");check(run()==Worker.Result.RETRY&&Store.queue.size()==1,"resultado ambíguo mantém fila e tenta consultar novamente");
 reset();for(int i=0;i<12;i++)add("batch-"+i);check(run()==Worker.Result.SUCCESS&&Store.queue.size()==2,"drenar lote com limite");flush();check(!wm.policies.isEmpty(),"continuar lote restante");check(run()==Worker.Result.SUCCESS&&Store.queue.isEmpty(),"concluir fila restante");
 reset();JSONObject image=new JSONObject().put("mime","image/png").put("base64","binary-base64");Store.queue.add(new JSONObject().put("id","image-item").put("text","").put("image",image));Api.badAck=true;check(run()==Worker.Result.RETRY&&Store.queue.size()==1,"imagem sem confirmação permanece na fila");check(Api.lastInput.opt("image")==image,"worker encaminha os bytes da imagem junto do texto");Api.badAck=false;check(run()==Worker.Result.SUCCESS&&Store.queue.isEmpty(),"imagem só sai após confirmação do ID");
 reset();Store.auth=false;add("offline");check(run()==Worker.Result.SUCCESS&&Api.calls==0&&Store.queue.size()==1,"não enviar sem autorização");
 System.out.println("PASSOU: Java real do worker — backoff manual, agrupamento, corrida de término, confirmação, timeout, autorização e lotes. Simulação host; não substitui teste Android.");System.exit(0);
 }catch(Throwable e){e.printStackTrace();System.exit(1);}}
 }`
};
try{
 for(const [name,code]of Object.entries(sources)){const file=path.join(temp,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,code);}
 const worker='app/lifeos/capture/SyncWorker.java';fs.copyFileSync(path.resolve('android-capture/app/src/main/java',worker),path.join(temp,worker));
 const bin=name=>process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',name):name;
 for(const [exe,args]of [[bin('javac'),['-encoding','UTF-8','-d',temp,...Object.keys(sources).map(n=>path.join(temp,n)),path.join(temp,worker)]],[bin('java'),['-cp',temp,'app.lifeos.capture.QueueTest']]]){
  const result=spawnSync(exe,args,{stdio:'inherit',timeout:30000});if(result.error)throw result.error;if(result.status!==0)process.exitCode=result.status||1;if(process.exitCode)break;
 }
}finally{fs.rmSync(temp,{recursive:true,force:true});}
