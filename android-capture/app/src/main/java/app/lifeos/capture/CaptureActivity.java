package app.lifeos.capture;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.text.*;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import org.json.JSONObject;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

/** Lightweight native capture: typing never waits for a network request. */
public class CaptureActivity extends Activity {
    private Store store;private EditText text;private TextView status,account;private Button connect;private final Handler handler=new Handler(Looper.getMainLooper());private final ExecutorService network=Executors.newSingleThreadExecutor();private boolean visible,checking,saving;
    private final Runnable saveDraft=()->{try{store.put("draft",text.getText().toString());}catch(Exception e){toast("Não foi possível guardar o rascunho. Mantenha a tela aberta.");}};
    private final Runnable tick=new Runnable(){public void run(){if(!visible)return;refresh();checkPair();handler.postDelayed(this,2000);}};
    private int dp(int value){return (int)(getResources().getDisplayMetrics().density*value);}
    private GradientDrawable box(int color,int border){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(14));if(border!=0)d.setStroke(dp(1),border);return d;}
    private TextView label(String value,int size,int color){TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(color);return t;}
    private void add(LinearLayout parent,View view,int top){LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);lp.topMargin=dp(top);parent.addView(view,lp);}
    private Button button(String title,boolean primary,Runnable action){Button b=new Button(this);b.setText(title);b.setAllCaps(false);b.setTextColor(Color.WHITE);b.setTextSize(15);b.setBackground(box(Color.parseColor(primary?"#237DE1":"#1B293C"),0));b.setPadding(dp(14),dp(10),dp(14),dp(10));b.setOnClickListener(v->action.run());return b;}
    public void onCreate(Bundle state){
        super.onCreate(state);store=new Store(this);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.setBackgroundColor(Color.parseColor("#0D1117"));
        LinearLayout body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);body.setPadding(dp(22),dp(22),dp(22),dp(24));scroll.addView(body);setContentView(scroll);
        // Respect system insets on Android 15's enforced edge-to-edge window.
        scroll.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop(),bottom=insets.getSystemWindowInsetBottom();v.setPadding(0,top,0,bottom);return insets;});
        TextView brand=label("LifeOS · Captura",23,Color.parseColor("#58A6FF"));brand.setTypeface(null,Typeface.BOLD);add(body,brand,0);
        add(body,label("Inbox rápido",28,Color.WHITE),24);
        status=label("",13,Color.parseColor("#A8B8CE"));add(body,status,12);
        text=new EditText(this);text.setTextColor(Color.WHITE);text.setHintTextColor(Color.parseColor("#91A2BA"));text.setTextSize(18);text.setHint("O que você quer guardar?\nUse Enter para novas linhas.");text.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE|android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);text.setGravity(Gravity.TOP|Gravity.START);text.setMinLines(5);text.setMaxLines(10);text.setFilters(new InputFilter[]{new InputFilter.LengthFilter(10000)});text.setPadding(dp(16),dp(16),dp(16),dp(16));text.setBackground(box(Color.parseColor("#142033"),Color.parseColor("#58A6FF")));text.setImeOptions(android.view.inputmethod.EditorInfo.IME_FLAG_NO_ENTER_ACTION);
        try{text.setText(store.get("draft"));text.setSelection(text.length());}catch(Exception e){toast("Falha ao abrir o rascunho. Não desinstale o aplicativo.");}
        add(body,text,18);text.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int start,int count,int after){}public void onTextChanged(CharSequence s,int start,int before,int count){handler.removeCallbacks(saveDraft);handler.postDelayed(saveDraft,200);}public void afterTextChanged(Editable e){}});
        add(body,button("＋ Adicionar ao Inbox",true,this::capture),16);
        add(body,label("Guardado no aparelho antes do envio. Você pode sair após a confirmação local.",12,Color.parseColor("#91A2BA")),10);
        account=label("",12,Color.parseColor("#91A2BA"));add(body,account,24);
        connect=button("Conectar ao LifeOS",false,this::pair);add(body,connect,12);
        add(body,button("Tentar sincronizar agora",false,()->{SyncWorker.retryNow(this);refresh();toast("Nova tentativa solicitada. Se já houver um envio em curso, ele será preservado.");}),10);
        add(body,button("Abrir LifeOS",false,()->openBrowser(BuildConfig.LIFEOS_URL)),10);
        LinearLayout extras=new LinearLayout(this);extras.setOrientation(LinearLayout.HORIZONTAL);
        Button copy=button("Copiar pendentes",false,this::copyPending);Button exit=button("Desconectar",false,this::disconnect);
        LinearLayout.LayoutParams half=new LinearLayout.LayoutParams(0,-2,1);half.setMargins(0,0,dp(6),0);extras.addView(copy,half);extras.addView(exit,new LinearLayout.LayoutParams(0,-2,1));add(body,extras,16);
        add(body,label("O widget mostra só o relógio dourado enquanto houver pendências e o check verde quando a fila terminar. Não exibe o conteúdo das capturas.",12,Color.parseColor("#91A2BA")),16);
        int transparency=0;try{String value=store.get("widgetTransparency");if(!value.isEmpty())transparency=Math.max(0,Math.min(100,Integer.parseInt(value)));}catch(Exception ignored){}
        TextView transparencyLabel=label("Transparência do fundo: "+transparency+"%",14,Color.parseColor("#C2D1E5"));add(body,transparencyLabel,24);
        SeekBar transparencyBar=new SeekBar(this);transparencyBar.setMax(100);transparencyBar.setProgress(transparency);transparencyBar.setContentDescription("Transparência do fundo do widget");add(body,transparencyBar,8);
        add(body,label("0%: fundo sólido · 100%: sem fundo. Textos e símbolos mantêm a visibilidade. O widget ocupa uma linha de 2 a 4 colunas.",12,Color.parseColor("#91A2BA")),4);
        transparencyBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onStartTrackingTouch(SeekBar bar){}public void onStopTrackingTouch(SeekBar bar){}public void onProgressChanged(SeekBar bar,int progress,boolean fromUser){transparencyLabel.setText("Transparência do fundo: "+progress+"%");if(fromUser)try{store.put("widgetTransparency",String.valueOf(progress));CaptureWidget.updateAll(CaptureActivity.this);}catch(Exception e){toast("Não foi possível salvar a transparência.");}}});
        text.requestFocus();if(getIntent().getBooleanExtra("quick",false))text.postDelayed(()->((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showSoftInput(text,InputMethodManager.SHOW_IMPLICIT),200);
    }
    private void capture(){
        if(saving)return;String value=text.getText().toString();if(value.trim().isEmpty()){text.setError("Digite uma entrada.");return;}saving=true;
        try{store.enqueue(value);}catch(Exception e){saving=false;toast(e.getMessage()==null?"Não foi possível guardar. Mantenha o texto nesta tela.":e.getMessage());return;}
        handler.removeCallbacks(saveDraft);text.setText("");
        try{SyncWorker.schedule(this);}catch(Exception ignored){}
        CaptureWidget.updateAll(this);refresh();saving=false;toast("Guardado no aparelho. O envio continuará em segundo plano.");if(getIntent().getBooleanExtra("quick",false))finish();
    }
    private void refresh(){
        try{int count=store.count();boolean authorized=store.authorized();status.setText(count>0?"◷ "+count+" envio(s) pendente(s)"+(authorized?"":" · conecte ao LifeOS"):authorized?"✓ Tudo sincronizado":"Conecte para enviar. Você já pode digitar.");status.setTextColor(Color.parseColor(count>0?"#FFC857":authorized?"#79D9A8":"#A8B8CE"));JSONObject u=store.userInfo();String message=count>0||!authorized?store.get("lastError"):"";String stamp=store.get(count>0?"lastAttemptAt":"lastSavedAt");String timing=stamp.isEmpty()?"":(count>0?"Última tentativa: ":"Último envio confirmado: ")+java.text.DateFormat.getDateTimeInstance(java.text.DateFormat.SHORT,java.text.DateFormat.SHORT).format(new java.util.Date(Long.parseLong(stamp)));account.setText((u.optString("email").isEmpty()?"":u.optString("email")+"\n")+timing+(message.isEmpty()?"":"\n"+message));connect.setText(authorized?"Ver dispositivos autorizados":"Conectar ao LifeOS");}
        catch(Exception e){status.setText("Falha no armazenamento. Não desinstale; os dados precisam ser recuperados.");}
    }
    private void pair(){
        try{if(store.authorized()){openBrowser(BuildConfig.LIFEOS_URL+"/capture/pair");return;}}catch(Exception e){toast("Não foi possível abrir as credenciais.");return;}
        if(checking)return;checking=true;connect.setEnabled(false);
        network.execute(()->{try{
            String secret=Store.secret();JSONObject result=Api.call("/api/capture/device",new JSONObject().put("action","start").put("secretHash",Store.hash(secret)).put("device",Build.MANUFACTURER+" "+Build.MODEL),null);
            store.put("pending",result.getString("id")+"."+secret);store.put("pairCode",result.getString("code"));store.put("pairUrl",result.getString("url"));
            runOnUiThread(()->{if(isFinishing()||isDestroyed())return;new AlertDialog.Builder(this).setTitle("Confira o código").setMessage(result.optString("code")+"\n\nNo navegador, entre na conta autorizada e confirme o mesmo código. Depois volte ao LifeOS Captura.").setPositiveButton("Abrir autorização",(dialog,which)->openBrowser(result.optString("url"))).setNegativeButton("Depois",null).show();});
        }catch(Exception e){runOnUiThread(()->toast(e.getMessage()));}finally{runOnUiThread(()->{checking=false;connect.setEnabled(true);});}});
    }
    private void checkPair(){
        if(checking)return;String pending;try{pending=store.get("pending");}catch(Exception e){return;}if(pending.isEmpty())return;checking=true;
        network.execute(()->{try{
            JSONObject response=Api.call("/api/capture/device",null,pending);String state=response.optString("status");
            if(state.equals("approved")){
                JSONObject user=response.getJSONObject("user");
                try{String previous=store.user();if(!previous.isEmpty()&&!previous.equals(user.getString("id"))&&(store.count()>0||!store.get("draft").trim().isEmpty()))throw new IllegalStateException("Há capturas ou rascunho de outra conta. Reconecte a conta original.");store.bindOwner(user.getString("id"));}catch(Exception mismatch){try{Api.call("/api/capture/device",new JSONObject().put("action","disconnect"),pending);}catch(Exception ignored){}store.put("pending","");throw mismatch;}
                store.put("credentials",pending);store.put("user",user.toString());store.put("expires",String.valueOf(response.getLong("expiresAt")));store.put("needsAuth","");store.put("lastError","");store.put("pending","");SyncWorker.schedule(this);CaptureWidget.updateAll(this);runOnUiThread(()->{refresh();toast("Conectado ao Inbox de "+user.optString("email"));});
            }else if(state.equals("denied")){store.put("pending","");runOnUiThread(()->toast("Autorização recusada. Seus textos continuam no aparelho."));}
        }catch(Exception e){try{if(e instanceof Api.Error&&((Api.Error)e).status==401)store.put("pending","");store.put("lastError",e instanceof Api.Error?e.getMessage():"Confira a conexão e volte após autorizar.");}catch(Exception ignored){}}
        finally{runOnUiThread(()->{checking=false;refresh();});}});
    }
    private void disconnect(){
        if(text.length()>0){toast("Guarde ou limpe o rascunho antes de desconectar.");return;}
        new AlertDialog.Builder(this).setTitle("Desconectar captura?").setMessage("Entradas pendentes ficam no aparelho e só poderão ser enviadas ao reconectar a mesma conta.").setPositiveButton("Desconectar",(d,w)->network.execute(()->{
            try{String credentials=store.get("credentials");if(!credentials.isEmpty())Api.call("/api/capture/device",new JSONObject().put("action","disconnect"),credentials);}
            catch(Exception ignored){}
            try{store.put("credentials","");store.put("pending","");store.put("needsAuth","1");if(store.count()==0)store.put("user","");}catch(Exception ignored){}
            CaptureWidget.updateAll(this);runOnUiThread(this::refresh);
        })).setNegativeButton("Cancelar",null).show();
    }
    private void copyPending(){try{String value=store.exportPending();if(value.isEmpty()){toast("Não há capturas pendentes.");return;}((android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("Capturas pendentes",value));toast("Pendentes copiados. Isso não confirma nem remove os envios.");}catch(Exception e){toast("Não foi possível copiar os pendentes.");}}
    private void openBrowser(String url){Intent intent=new Intent(Intent.ACTION_VIEW,Uri.parse(url));intent.setPackage("com.android.chrome");try{startActivity(intent);}catch(ActivityNotFoundException e){intent.setPackage(null);try{startActivity(intent);}catch(Exception missing){toast("Instale um navegador para autorizar.");}}}
    private void toast(String text){Toast.makeText(this,text==null?"Não foi possível concluir.":text,Toast.LENGTH_LONG).show();}
    protected void onResume(){super.onResume();visible=true;handler.post(tick);try{if(store.count()>0&&store.authorized())SyncWorker.schedule(this);}catch(Exception ignored){}}
    protected void onPause(){visible=false;handler.removeCallbacks(tick);handler.removeCallbacks(saveDraft);saveDraft.run();super.onPause();}
    protected void onDestroy(){handler.removeCallbacksAndMessages(null);network.execute(()->store.close());network.shutdown();super.onDestroy();}
}
