package app.lifeos.capture;

import android.app.AlertDialog;
import android.content.*;
import android.graphics.*;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.*;
import android.view.inputmethod.*;
import android.widget.*;
import org.json.JSONObject;
import java.io.*;

/** Plain text plus one pasted binary image; no picker, HTML, remote URL or storage permission. */
final class ClipboardEditText extends EditText {
    private JSONObject image;private LinearLayout preview;private Runnable changed=()->{};
    ClipboardEditText(Context context){super(context);if(android.os.Build.VERSION.SDK_INT>=31)setOnReceiveContentListener(new String[]{"image/*"},(view,payload)->{ClipData clip=payload.getClip();for(int i=0;i<clip.getItemCount();i++)if(receive(clip.getItemAt(i).getUri()))return null;return payload;});}
    void onImageChanged(Runnable callback){changed=callback;}
    String imageJson(){return image==null?"":image.toString();}
    void restoreImage(String value)throws Exception{image=value.isEmpty()?null:new JSONObject(value);renderPreview();}
    void clearImage(){image=null;renderPreview();}
    void attachPreview(LinearLayout parent){preview=new LinearLayout(getContext());preview.setGravity(Gravity.CENTER_VERTICAL);parent.addView(preview);renderPreview();}
    private void renderPreview(){
        if(preview==null)return;preview.removeAllViews();preview.setVisibility(image==null?GONE:VISIBLE);if(image==null)return;
        try{
            byte[] bytes=Base64.decode(image.getString("base64"),Base64.NO_WRAP);BitmapFactory.Options options=new BitmapFactory.Options();options.inSampleSize=4;Bitmap bitmap=BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);
            ImageView thumb=new ImageView(getContext());thumb.setImageBitmap(bitmap);thumb.setScaleType(ImageView.ScaleType.CENTER_INSIDE);int size=(int)(96*getResources().getDisplayMetrics().density);preview.addView(thumb,new LinearLayout.LayoutParams(size,size));thumb.setContentDescription("Ampliar imagem colada");thumb.setOnClickListener(v->{ImageView full=new ImageView(getContext());full.setAdjustViewBounds(true);full.setImageBitmap(BitmapFactory.decodeByteArray(bytes,0,bytes.length));new AlertDialog.Builder(getContext()).setView(full).setPositiveButton("Fechar",null).show();});
            Button remove=new Button(getContext());remove.setText("×");remove.setTextColor(Color.parseColor("#58A6FF"));remove.setBackgroundColor(Color.TRANSPARENT);remove.setContentDescription("Remover imagem");preview.addView(remove);remove.setOnClickListener(v->{clearImage();changed.run();});
        }catch(Exception e){Toast.makeText(getContext(),"Não foi possível abrir a imagem guardada. Não limpe o rascunho.",Toast.LENGTH_LONG).show();}
    }
    private boolean receive(Uri uri){
        if(uri==null||!"content".equals(uri.getScheme()))return false;
        String type;try{type=getContext().getContentResolver().getType(uri);}catch(Exception e){Toast.makeText(getContext(),"Copie a imagem novamente para liberar a leitura.",Toast.LENGTH_LONG).show();return true;}if(type==null||!type.startsWith("image/"))return false;
        if(image!=null){Toast.makeText(getContext(),"Remova a imagem atual antes de colar outra.",Toast.LENGTH_LONG).show();return true;}
        try{
            byte[] bytes;try(InputStream input=getContext().getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){
                if(input==null)throw new IOException();byte[] buffer=new byte[8192];int n;while((n=input.read(buffer))!=-1){if(out.size()+n>8*1024*1024)throw new IOException("A imagem copiada é muito grande (limite de leitura: 8 MB).");out.write(buffer,0,n);}bytes=out.toByteArray();
            }
            BitmapFactory.Options options=new BitmapFactory.Options();options.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);
            if(options.outWidth<=0||options.outHeight<=0||(long)options.outWidth*options.outHeight>40000000)throw new IOException("A imagem copiada é inválida ou muito grande.");
            options.inJustDecodeBounds=false;options.inSampleSize=1;while(Math.max(options.outWidth,options.outHeight)/options.inSampleSize>1600)options.inSampleSize*=2;
            Bitmap bitmap=BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);if(bitmap==null)throw new IOException("Não foi possível ler esta imagem.");
            boolean alpha=bitmap.hasAlpha();ByteArrayOutputStream encoded=new ByteArrayOutputStream();
            for(;;){encoded.reset();bitmap.compress(alpha?Bitmap.CompressFormat.PNG:Bitmap.CompressFormat.JPEG,88,encoded);if(encoded.size()<=512*1024)break;Bitmap smaller=Bitmap.createScaledBitmap(bitmap,Math.max(1,bitmap.getWidth()/2),Math.max(1,bitmap.getHeight()/2),true);bitmap.recycle();bitmap=smaller;}
            bitmap.recycle();image=new JSONObject().put("mime",alpha?"image/png":"image/jpeg").put("base64",Base64.encodeToString(encoded.toByteArray(),Base64.NO_WRAP));renderPreview();changed.run();return true;
        }catch(Exception e){Toast.makeText(getContext(),e.getMessage()==null?"Não foi possível colar a imagem. Copie-a novamente e tente colar.":e.getMessage(),Toast.LENGTH_LONG).show();return true;}
    }
    @Override public boolean onTextContextMenuItem(int id){
        if(id==android.R.id.paste||id==android.R.id.pasteAsPlainText){
            ClipboardManager manager=(ClipboardManager)getContext().getSystemService(Context.CLIPBOARD_SERVICE);ClipData clip=manager.getPrimaryClip();
            if(clip!=null)for(int i=0;i<clip.getItemCount();i++)if(receive(clip.getItemAt(i).getUri()))return true;
            // Keep text insertion plain even if the source contains styled HTML.
            return super.onTextContextMenuItem(android.R.id.pasteAsPlainText);
        }
        return super.onTextContextMenuItem(id);
    }
    @Override public InputConnection onCreateInputConnection(EditorInfo attrs){
        InputConnection connection=super.onCreateInputConnection(attrs);attrs.contentMimeTypes=new String[]{"image/png","image/jpeg","image/webp","image/gif"};if(connection==null)return null;
        return new InputConnectionWrapper(connection,false){@Override public boolean commitContent(InputContentInfo content,int flags,Bundle opts){
            boolean permission=(flags&InputConnection.INPUT_CONTENT_GRANT_READ_URI_PERMISSION)!=0;
            try{if(permission)content.requestPermission();return receive(content.getContentUri());}
            catch(Exception e){Toast.makeText(getContext(),"O teclado não liberou esta imagem. Copie-a novamente e use Colar.",Toast.LENGTH_LONG).show();return false;}
            finally{if(permission)try{content.releasePermission();}catch(Exception ignored){}}
        }};
    }
}
