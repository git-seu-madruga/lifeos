package app.lifeos.capture;

import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

final class Api {
    static final class Error extends Exception { final int status;Error(int status,String message){super(message);this.status=status;} }
    static JSONObject call(String path,JSONObject input,String credentials) throws Exception {
        if(!path.equals("/api/capture/device")&&!path.equals("/api/capture/inbox"))throw new IllegalArgumentException("Caminho inválido");
        HttpURLConnection c=(HttpURLConnection)new URL(BuildConfig.LIFEOS_URL+path).openConnection();
        c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(65000);c.setRequestProperty("Accept","application/json");c.setRequestProperty("User-Agent","LifeOS-Captura/"+BuildConfig.VERSION_NAME);
        if(credentials!=null&&!credentials.isEmpty())c.setRequestProperty("Authorization","Bearer "+credentials);
        try {
            if(input!=null){c.setRequestMethod("POST");c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json; charset=utf-8");try(OutputStream out=c.getOutputStream()){out.write(input.toString().getBytes(StandardCharsets.UTF_8));}}
            int status=c.getResponseCode();InputStream stream=status>=200&&status<300?c.getInputStream():c.getErrorStream();StringBuilder body=new StringBuilder();
            if(stream!=null)try(Reader r=new InputStreamReader(stream,StandardCharsets.UTF_8)){char[] buffer=new char[2048];int n;while((n=r.read(buffer))>=0){body.append(buffer,0,n);if(body.length()>100000)throw new IOException("Resposta inválida");}}
            JSONObject data;try{data=new JSONObject(body.toString());}catch(Exception e){throw new Error(status,"Servidor indisponível. Confira se a versão com Captura já foi publicada.");}
            if(status<200||status>=300)throw new Error(status,data.optString("error","Falha de conexão. O texto continua no aparelho."));
            return data;
        }finally{c.disconnect();}
    }
}
