export const RESPONSIBLES=[{email:'periclesbernardes@gmail.com',name:'Péricles'},{email:'leticiacost3@gmail.com',name:'Letícia'}];
export const responsibleName=email=>RESPONSIBLES.find(p=>p.email===email)?.name||'';
export const sharingPatch=(shared,responsible,email)=>({shared:!!shared,responsible:shared?(responsible||email||RESPONSIBLES[0].email):''});
