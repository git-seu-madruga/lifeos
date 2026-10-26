package app.lifeos.capture;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;

/** Parse untrusted Android shares without reading files, opening links or sending data. */
final class SharedCapture {
    final String text;final Uri image;
    private SharedCapture(String text,Uri image){this.text=text;this.image=image;}
    static SharedCapture read(Intent intent){
        if(intent==null||!Intent.ACTION_SEND.equals(intent.getAction()))throw new IllegalArgumentException("Este compartilhamento não é compatível.");
        String type=intent.getType();boolean picture=type!=null&&type.startsWith("image/");
        if(!picture&&!"text/plain".equals(type))throw new IllegalArgumentException("Compartilhe um texto, link ou uma imagem por vez.");
        CharSequence value=intent.getCharSequenceExtra(Intent.EXTRA_TEXT);String text=value==null?"":value.toString();
        Uri uri=intent.getParcelableExtra(Intent.EXTRA_STREAM);ClipData clip=intent.getClipData();
        if(picture&&clip!=null)for(int n=0;n<clip.getItemCount();n++){
            Uri candidate=clip.getItemAt(n).getUri();if(candidate==null)continue;
            if(uri!=null&&!uri.equals(candidate))throw new IllegalArgumentException("Compartilhe apenas uma imagem por captura.");uri=candidate;
        }
        if(!picture&&uri!=null)throw new IllegalArgumentException("O arquivo compartilhado não é uma imagem.");
        if(!picture&&text.isEmpty()&&clip!=null&&clip.getItemCount()==1){CharSequence plain=clip.getItemAt(0).getText();if(plain!=null)text=plain.toString();}
        CharSequence title=intent.getCharSequenceExtra(Intent.EXTRA_SUBJECT);String subject=title==null?"":title.toString().trim();
        if(!subject.isEmpty()&&!text.contains(subject))text=subject+(text.isEmpty()?"":"\n"+text);
        if(text.length()>10000)throw new IllegalArgumentException("O texto compartilhado ultrapassa 10.000 caracteres.");
        if(picture&&(uri==null||!"content".equals(uri.getScheme())))throw new IllegalArgumentException("O aplicativo de origem não liberou a imagem. Tente compartilhar novamente.");
        if(text.trim().isEmpty()&&uri==null)throw new IllegalArgumentException("O compartilhamento está vazio.");
        return new SharedCapture(text,uri);
    }
    String appendTo(String draft){
        String result=draft.isEmpty()?text:text.isEmpty()?draft:draft+"\n\n"+text;
        if(result.length()>10000)throw new IllegalArgumentException("O rascunho junto do compartilhamento ultrapassa 10.000 caracteres. Envie o rascunho primeiro.");return result;
    }
}
