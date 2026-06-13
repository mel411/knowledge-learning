const SUPABASE_URL="https://rpxgjrngdldfzvmeskyc.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable__E2-wNKz1DEqMJ4wI4Sr0A_o0mPOOiJ";

window.sb = window.supabase.createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY
);

function loadLayout() {
  // Load header
  fetch('components/header.html')
  .then(res => res.text())
  .then(data => {

    document.getElementById('header').innerHTML = data;

    updateUserUI();

    initializeMegaMenu();

  })
    .catch(err => console.error("Header error:", err));

  // Load footer
  fetch('components/footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer').innerHTML = data;
    })
    .catch(err => console.error("Footer error:", err));
}

// LOGOUT
async function logout(event){

if(event){
event.preventDefault();
}

try{

await sb.auth.signOut();

}catch(error){

console.error(
"Logout error:",
error
);

}

/* clear local auth */
localStorage.removeItem("sb-access-token");
localStorage.removeItem("sb-refresh-token");
localStorage.removeItem("userEmail");

/* optional hard clean */
sessionStorage.clear();

/* redirect */
window.location.replace("/");

}

async function updateUserUI(){

const authBtn =
document.getElementById("authBtn");

if(!authBtn) return;

const {
data: { session }
} = await sb.auth.getSession();

/* NOT CONNECTED */
if(!session){

authBtn.href="connexion.html";

authBtn.className=
"nav-icon user-icon outlined";

return;
}

/* CONNECTED */
authBtn.href="account.html";

authBtn.className=
"nav-icon user-icon filled";

}

function initializeMegaMenu(){

const triggers =
document.querySelectorAll(".mega-trigger");

triggers.forEach(button => {

button.addEventListener("click", (e) => {

e.preventDefault();
e.stopPropagation();

const parent =
button.closest(".mega-item");

/* CLOSE OTHERS */

document
.querySelectorAll(".mega-item")
.forEach(item => {

if(item !== parent){
item.classList.remove("active");
}

});

/* TOGGLE */

parent.classList.toggle("active");

});

});

/* CLICK OUTSIDE */

document.addEventListener("click", () => {

document
.querySelectorAll(".mega-item")
.forEach(item => {
item.classList.remove("active");
});

});

}


loadLayout();

sb.auth.onAuthStateChange(() => {
updateUserUI();
});

async function restoreSession() {

  const access = localStorage.getItem("sb-access-token");
  const refresh = localStorage.getItem("sb-refresh-token");

  if (!access || !refresh) {
    return;
  }

  const { error } = await window.sb.auth.setSession({
    access_token: access,
    refresh_token: refresh
  });

  if (error) {

    console.error("Session restore failed:", error);

    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");

    return;
  }

  updateUserUI();

}
window.restoreSession = restoreSession;

restoreSession();
