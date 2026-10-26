package app.lifeos.capture;

import android.app.Activity;
import android.os.*;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.text.*;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;

/** Small floating editor opened directly by the widget; no server load or settings screen. */
public class QuickCaptureActivity extends Activity {
    private Store store;private ClipboardEditText input;private boolean saving,shareHandled,draftReadable=true;
    private final Handler handler=new Handler(Looper.getMainLooper());
    private final Runnable draft=()->{if(!draftReadable)return;try{store.putDraft(input.getText().toString(),input.imageJson());}catch(Exception e){Toast.makeText(this,"Não foi possível guardar o rascunho. Mantenha a janela aberta.",Toast.LENGTH_LONG).show();}};
    private int dp(int n){return (int)(getResources().getDisplayMetrics().density*n);}
    private GradientDrawable background(String color,String border){GradientDrawable d=new GradientDrawable();d.setColor(Color.parseColor(color));d.setCornerRadius(dp(18));if(border!=null)d.setStroke(dp(1),Color.parseColor(border));return d;}
    public void onCreate(Bundle state){
        super.onCreate(state);shareHandled=state!=null&&state.getBoolean("shareHandled");store=new Store(this);setFinishOnTouchOutside(true);
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setPadding(dp(20),dp(16),dp(20),dp(18));panel.setBackground(background("#142033","#30445F"));
        LinearLayout head=new LinearLayout(this);head.setGravity(Gravity.CENTER_VERTICAL);
        TextView title=new TextView(this);title.setText("Inbox");title.setTextColor(Color.parseColor("#E8EDF5"));title.setTextSize(19);title.setTypeface(null,Typeface.BOLD);head.addView(title,new LinearLayout.LayoutParams(0,-2,1));
        Button close=new Button(this);close.setText("×");close.setTextColor(Color.parseColor("#AFBED2"));close.setTextSize(24);close.setBackgroundColor(Color.TRANSPARENT);close.setContentDescription("Fechar captura e manter rascunho");close.setOnClickListener(v->finish());head.addView(close,new LinearLayout.LayoutParams(dp(44),dp(44)));panel.addView(head);
        input=new ClipboardEditText(this);input.setTextColor(Color.WHITE);input.setHintTextColor(Color.parseColor("#91A2BA"));input.setTextSize(17);input.setHint("O que você quer guardar?");input.setGravity(Gravity.TOP|Gravity.START);input.setMinLines(4);input.setMaxLines(8);input.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE|android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);input.setImeOptions(android.view.inputmethod.EditorInfo.IME_FLAG_NO_ENTER_ACTION);input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(10000)});input.setPadding(dp(12),dp(12),dp(12),dp(12));input.setBackground(background("#0D1727","#58A6FF"));
        try{input.setText(store.get("draft"));input.restoreImage(store.draftImage());input.setSelection(input.length());}catch(Exception e){draftReadable=false;Toast.makeText(this,"Falha ao abrir rascunho. Não desinstale o app.",Toast.LENGTH_LONG).show();}
        LinearLayout.LayoutParams field=new LinearLayout.LayoutParams(-1,-2);field.topMargin=dp(8);panel.addView(input,field);
        input.attachPreview(panel);input.onImageChanged(()->{handler.removeCallbacks(draft);draft.run();});input.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int start,int count,int after){}public void onTextChanged(CharSequence s,int start,int before,int count){handler.removeCallbacks(draft);handler.postDelayed(draft,200);}public void afterTextChanged(Editable value){}});
        Button send=new Button(this);send.setText("Enviar ao Inbox");send.setAllCaps(false);send.setTextColor(Color.WHITE);send.setTextSize(16);send.setBackground(background("#237DE1",null));send.setOnClickListener(v->capture());LinearLayout.LayoutParams action=new LinearLayout.LayoutParams(-1,dp(48));action.topMargin=dp(14);panel.addView(send,action);
        try{if(!store.authorized()){TextView connect=new TextView(this);connect.setText("Conectar para enviar · o texto pode ser guardado agora");connect.setTextColor(Color.parseColor("#FFC857"));connect.setTextSize(12);connect.setPadding(0,dp(12),0,0);connect.setOnClickListener(v->{startActivity(new Intent(this,CaptureActivity.class));finish();});panel.addView(connect);}}catch(Exception ignored){}
        ScrollView scroll=new ScrollView(this);scroll.addView(panel);setContentView(scroll);getWindow().setBackgroundDrawableResource(android.R.color.transparent);getWindow().setLayout((int)(getResources().getDisplayMetrics().widthPixels*.94),WindowManager.LayoutParams.WRAP_CONTENT);getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE|WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE);
        if(sharedIntent()!=null&&!shareHandled&&draftReadable)receiveShare();
        input.requestFocus();input.postDelayed(()->{if(!isFinishing())((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showSoftInput(input,InputMethodManager.SHOW_IMPLICIT);},150);
    }
    protected Intent sharedIntent(){return null;}
    @Override protected void onSaveInstanceState(Bundle state){state.putBoolean("shareHandled",shareHandled);super.onSaveInstanceState(state);}
    private void receiveShare(){
        final SharedCapture shared;
        try{shared=SharedCapture.read(sharedIntent());}catch(Exception e){shareHandled=true;Toast.makeText(this,e.getMessage()==null?"Compartilhamento inválido.":e.getMessage(),Toast.LENGTH_LONG).show();return;}
        if(shared.image!=null&&!input.imageJson().isEmpty()){
            shareHandled=true;new android.app.AlertDialog.Builder(this).setTitle("Já há uma imagem no rascunho").setMessage("Envie ou remova a imagem atual e compartilhe novamente. O rascunho foi preservado.").setPositiveButton("OK",null).show();return;
        }
        Runnable apply=()->{
            try{
                String combined=shared.appendTo(input.getText().toString());
                if(shared.image!=null&&!input.importSharedImage(shared.image)){shareHandled=true;return;}
                input.setText(combined);input.setSelection(input.length());shareHandled=true;handler.removeCallbacks(draft);draft.run();
            }catch(Exception e){shareHandled=true;Toast.makeText(this,e.getMessage()==null?"Não foi possível receber o compartilhamento.":e.getMessage(),Toast.LENGTH_LONG).show();}
        };
        if(input.length()>0||!input.imageJson().isEmpty())new android.app.AlertDialog.Builder(this).setTitle("Manter o rascunho atual?").setMessage("O conteúdo compartilhado será acrescentado ao rascunho, sem substituir o que você já escreveu.").setPositiveButton("Acrescentar",(dialog,which)->apply.run()).setNegativeButton("Cancelar",(dialog,which)->shareHandled=true).setOnCancelListener(dialog->shareHandled=true).show();
        else apply.run();
    }
    private void capture(){
        if(!draftReadable){Toast.makeText(this,"Não foi possível abrir o rascunho. Reabra o Captura antes de enviar.",Toast.LENGTH_LONG).show();return;}
        if(saving)return;String text=input.getText().toString();if(text.trim().isEmpty()&&input.imageJson().isEmpty()){input.setError("Digite uma entrada.");return;}saving=true;
        try{store.enqueue(text,input.imageJson());}catch(Exception e){saving=false;Toast.makeText(this,"Não foi possível guardar. O texto foi mantido nesta janela.",Toast.LENGTH_LONG).show();return;}
        handler.removeCallbacks(draft);input.clearImage();input.setText("");try{SyncWorker.schedule(this);}catch(Exception ignored){}CaptureWidget.updateAll(this);Toast.makeText(this,"Guardado no aparelho. Envio em segundo plano.",Toast.LENGTH_SHORT).show();finish();
    }
    protected void onPause(){handler.removeCallbacks(draft);draft.run();super.onPause();}
    protected void onDestroy(){handler.removeCallbacksAndMessages(null);store.close();super.onDestroy();}
}
