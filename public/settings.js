async function getCurrentUser(){

  const token = localStorage.getItem("token");
  if(!token) return null;

  try{
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userId =
      payload.sub ||
      payload.user_id ||
      payload.id;

    if(!userId){
      console.error("NO USER ID IN TOKEN", payload);
      return null;
    }

    return {
      id: userId,
      role: payload.role || "client"
    };

  }catch(e){
    console.error("Token error", e);
    return null;
  }
}

async function updateProfile(){

  const user = await getCurrentUser();

  const name = document.getElementById("userName").value;

  await window.sb
    .from("users")
    .update({ name })
    .eq("new_id", user.id);

  alert("Profil mis à jour");
}

async function loadUserInfo(){

  // AUTH USER
  const {
    data: authData,
    error: authError
  } = await window.sb.auth.getUser();

  if(authError || !authData.user){
    console.error("No authenticated user");
    return;
  }

  const authUser = authData.user;

  // TRY FIND PROFILE
  let {
    data: profile,
    error: profileError
  } = await window.sb
    .from("users")
    .select("*")
    .eq("new_id", authUser.id)
    .maybeSingle();

  // IF PROFILE DOES NOT EXIST → CREATE IT
  if(!profile){

    const newProfile = {
      new_id: authUser.id,
      email: authUser.email,
      name:
        authUser.user_metadata?.display_name ||
        authUser.user_metadata?.name ||
        "Utilisateur",
      role: "client",
      is_deleted: false
    };

    const {
      data: insertedProfile,
      error: insertError
    } = await window.sb
      .from("users")
      .insert(newProfile)
      .select()
      .maybeSingle();

    if(insertError){
      console.error("Insert profile error:", insertError);
      return;
    }

    profile = insertedProfile;
  }

  // FINAL VALUES
  const name =
    profile.name ||
    "Utilisateur";

  const email =
    profile.email ||
    authUser.email ||
    "—";

  let role =
    profile.role || "client";

  if(role === "client"){
    role = "Étudiant";
  }

  if(role === "admin"){
    role = "Administrateur";
  }

  // INJECT
  document.getElementById("displayName").textContent =
    name;

  document.getElementById("displayEmail").textContent =
    email;

  document.getElementById("displayRole").textContent =
    role;

  // HERO
  const heroName =
  document.getElementById("heroName");

  if(heroName){
    heroName.textContent =
      `Bienvenue, ${name}`;
  }

  const heroEmail =
  document.getElementById("heroEmail");

  if(heroEmail){
    heroEmail.textContent =
      email;
  }

  // AVATAR
  const avatar =
  document.getElementById("welcomeAvatar");

  if(avatar){
    avatar.textContent =
      name.charAt(0).toUpperCase();
  }

}

async function updatePassword(){

  const current = document.getElementById("currentPassword").value;
  const next = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if(next !== confirm){
    alert("Les mots de passe ne correspondent pas");
    return;
  }

  const user = await getCurrentUser();

const { data: authUser } = await window.sb.auth.getUser();

const { error: loginError } = await window.sb.auth.signInWithPassword({
  email: authUser.user.email,
  password: current
});

  if(loginError){
    alert("Mot de passe actuel incorrect");
    return;
  }

  // update password
  const { error } = await window.sb.auth.updateUser({
    password: next
  });

  if(error){
    alert("Erreur lors du changement");
    return;
  }

  alert("Mot de passe mis à jour");
}

function savePreferences(){
  alert("Préférences sauvegardées");
}

async function deleteAccount(){

  const password = document.getElementById("deletePassword").value;

  if(!password){
    alert("Veuillez entrer votre mot de passe");
    return;
  }

  const { data: authUser } = await window.sb.auth.getUser();
  const email = authUser.user.email;

  if(!confirm("Supprimer définitivement votre compte ?")){
    return;
  }

  // 🔐 verify password
  const { error: loginError } =
  await window.sb.auth.signInWithPassword({
    email,
    password
  });

  if(loginError){
    alert("Mot de passe incorrect");
    return;
  }

  const user = await getCurrentUser();

  // 🔥 mark as deleted
  const { error } = await window.sb
    .from("users")
    .update({ is_deleted: true })
    .eq("new_id", user.id);

  if(error){
    alert("Erreur suppression");
    return;
  }

  // logout
  await window.sb.auth.signOut();
  localStorage.clear();

  alert("Compte supprimé");

  window.location.href = "/";
}

function scrollToSection(id){

  // remove active from all
  document
    .querySelectorAll(".settings-tab")
    .forEach(tab => {
      tab.classList.remove("active");
    });

  // add active to clicked button
  const clickedButton =
    event.currentTarget;

  clickedButton.classList.add("active");

  // scroll
  const el =
    document.getElementById(id);

  if(!el) return;

  el.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}

async function openAdminPanel(event){

  event.preventDefault();

  // authenticated user
  const {
    data: authData,
    error: authError
  } = await window.sb.auth.getUser();

  if(authError || !authData.user){

    alert("Vous devez être connecté.");
    return;

  }

  const authUser = authData.user;

  // get profile
  const {
    data: profile,
    error: profileError
  } = await window.sb
    .from("users")
    .select("role")
    .eq("new_id", authUser.id)
    .maybeSingle();

  if(profileError || !profile){

    alert("Impossible de vérifier les permissions.");
    return;

  }

  // admin access
  if(profile.role === "admin"){

    window.location.href = "/admin.html";

  } else {

    alert(
      "Accès refusé. Cette section est réservée aux administrateurs."
    );

  }

}