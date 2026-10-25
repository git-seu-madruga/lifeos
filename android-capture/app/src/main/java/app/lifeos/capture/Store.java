package app.lifeos.capture;

import android.content.*;
import android.database.Cursor;
import android.database.sqlite.*;
import android.security.keystore.*;
import android.util.Base64;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

/** App-private durable queue; payloads and credentials encrypted with Android Keystore. */
final class Store extends SQLiteOpenHelper {
    private final SharedPreferences prefs;
    Store(Context context) { super(context,"capture.db",null,2); prefs=context.getSharedPreferences("capture",Context.MODE_PRIVATE); }
    public void onCreate(SQLiteDatabase db) { db.execSQL("CREATE TABLE queue (id TEXT PRIMARY KEY, payload TEXT NOT NULL, owner TEXT, created INTEGER NOT NULL, image TEXT)"); db.execSQL("CREATE TABLE draft (id INTEGER PRIMARY KEY, payload TEXT NOT NULL, image TEXT)"); }
    public void onUpgrade(SQLiteDatabase db,int oldVersion,int newVersion) { if(oldVersion<2){db.execSQL("ALTER TABLE queue ADD COLUMN image TEXT");db.execSQL("ALTER TABLE draft ADD COLUMN image TEXT");} }
    private static synchronized SecretKey key() throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
        if(!ks.containsAlias("lifeos-capture")) {
            KeyGenerator gen=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
            gen.init(new KeyGenParameterSpec.Builder("lifeos-capture",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());gen.generateKey();
        }
        return (SecretKey)ks.getKey("lifeos-capture",null);
    }
    private synchronized String encrypt(String text) throws Exception {
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key());
        return Base64.encodeToString(cipher.getIV(),Base64.NO_WRAP)+":"+Base64.encodeToString(cipher.doFinal(text.getBytes(StandardCharsets.UTF_8)),Base64.NO_WRAP);
    }
    private synchronized String decrypt(String text) throws Exception {
        String[] p=text.split(":",2);Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(p[0],Base64.NO_WRAP)));
        return new String(cipher.doFinal(Base64.decode(p[1],Base64.NO_WRAP)),StandardCharsets.UTF_8);
    }
    synchronized String get(String name) throws Exception { String value;if(name.equals("draft")){try(Cursor c=getReadableDatabase().rawQuery("SELECT payload FROM draft WHERE id = 1",null)){value=c.moveToFirst()?c.getString(0):null;}}else value=prefs.getString(name,null);return value==null?"":decrypt(value); }
    synchronized void put(String name,String value) throws Exception { if(name.equals("draft")){ContentValues v=new ContentValues();v.put("id",1);v.put("payload",encrypt(value));if(getWritableDatabase().insertWithOnConflict("draft",null,v,SQLiteDatabase.CONFLICT_REPLACE)<0)throw new IllegalStateException("Não foi possível guardar o rascunho.");return;}if(!prefs.edit().putString(name,encrypt(value)).commit())throw new IllegalStateException("Não foi possível guardar no aparelho."); }
    String user() throws Exception { String raw=get("user");return raw.isEmpty()?"":new JSONObject(raw).getString("id"); }
    JSONObject userInfo() throws Exception { String raw=get("user");return raw.isEmpty()?new JSONObject():new JSONObject(raw); }
    boolean authorized() throws Exception { return !get("credentials").isEmpty()&&get("needsAuth").isEmpty()&&Long.parseLong(get("expires").isEmpty()?"0":get("expires"))>System.currentTimeMillis(); }
    synchronized String draftImage() throws Exception {try(Cursor c=getReadableDatabase().rawQuery("SELECT image FROM draft WHERE id=1",null)){return c.moveToFirst()&&!c.isNull(0)?decrypt(c.getString(0)):"";}}
    synchronized void putDraft(String text,String image) throws Exception {ContentValues v=new ContentValues();v.put("id",1);v.put("payload",encrypt(text));if(!image.isEmpty())v.put("image",encrypt(image));else v.putNull("image");if(getWritableDatabase().insertWithOnConflict("draft",null,v,SQLiteDatabase.CONFLICT_REPLACE)<0)throw new IllegalStateException("Não foi possível guardar o rascunho.");}
    synchronized void enqueue(String text) throws Exception {enqueue(text,"");}
    synchronized void enqueue(String text,String image) throws Exception {
        if(count()>=500)throw new IllegalStateException("Há 500 entradas pendentes. Sincronize antes de continuar.");
        ContentValues values=new ContentValues();values.put("id",UUID.randomUUID().toString());values.put("payload",encrypt(text));if(!image.isEmpty())values.put("image",encrypt(image));String owner=user();if(!owner.isEmpty())values.put("owner",owner);values.put("created",System.currentTimeMillis());
        SQLiteDatabase db=getWritableDatabase();db.beginTransaction();try{db.insertOrThrow("queue",null,values);db.delete("draft",null,null);db.setTransactionSuccessful();}finally{db.endTransaction();}
    }
    int count() { try(Cursor c=getReadableDatabase().rawQuery("SELECT count(*) FROM queue",null)){c.moveToFirst();return c.getInt(0);} }
    synchronized void bindOwner(String id) throws Exception {
        try(Cursor c=getReadableDatabase().rawQuery("SELECT owner FROM queue WHERE owner IS NOT NULL AND owner <> ? LIMIT 1",new String[]{id})){if(c.moveToFirst())throw new IllegalStateException("Há capturas de outra conta. Reconecte a conta original antes de enviá-las.");}
        ContentValues v=new ContentValues();v.put("owner",id);getWritableDatabase().update("queue",v,"owner IS NULL",null);
    }
    JSONObject first(String owner) throws Exception {
        try(Cursor c=getReadableDatabase().rawQuery("SELECT id,payload,image FROM queue WHERE owner = ? ORDER BY created,id LIMIT 1",new String[]{owner})){
            if(!c.moveToFirst())return null;JSONObject item=new JSONObject().put("id",c.getString(0)).put("text",decrypt(c.getString(1)));if(!c.isNull(2))item.put("image",new JSONObject(decrypt(c.getString(2))));return item;
        }
    }
    synchronized void confirmed(String id,String owner) { getWritableDatabase().delete("queue","id = ? AND owner = ?",new String[]{id,owner}); }
    String exportPending() throws Exception {
        StringBuilder all=new StringBuilder();try(Cursor c=getReadableDatabase().rawQuery("SELECT payload,image FROM queue ORDER BY created,id",null)){while(c.moveToNext()){if(all.length()>0)all.append("\n\n────────\n\n");all.append(decrypt(c.getString(0)));if(!c.isNull(1))all.append("\n[Imagem guardada no aparelho; Copiar pendentes copia somente o texto.]");}}return all.toString();
    }
    static String secret() { byte[] bytes=new byte[32];new SecureRandom().nextBytes(bytes);StringBuilder s=new StringBuilder();for(byte b:bytes)s.append(String.format(Locale.ROOT,"%02x",b&255));return s.toString(); }
    static String hash(String value) throws Exception {byte[] bytes=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));StringBuilder s=new StringBuilder();for(byte b:bytes)s.append(String.format(Locale.ROOT,"%02x",b&255));return s.toString();}
}
