document.addEventListener("DOMContentLoaded", () => {

  // load header/footer
  if (typeof loadLayout === "function") {
    loadLayout();
  }

  const form = document.querySelector("form");

  if (!form) {
    console.error("Form not found");
    return;
  }

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const submitBtn = document.querySelector(".login-btn");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      message.innerText = "Veuillez remplir tous les champs";
      message.className = "error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Connexion...";

    const { data, error } = await window.sb.auth.signInWithPassword({
      email,
      password
    });

    if (error) {

      message.innerText = "Email ou mot de passe incorrect";
      message.className = "error";

      submitBtn.disabled = false;
      submitBtn.innerText = "Se connecter";

      return;
    }

    message.innerText = "Connexion réussie";
    message.className = "success";

    // redirect
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 700);

  });

});

async function forgotPassword(){

const email =
document
.getElementById("loginEmail")
.value
.trim();

if(!email){

alert(
"Veuillez entrer votre email."
);

return;

}

const {
error
} =
await window.sb.auth.resetPasswordForEmail(
email,
{
redirectTo:
window.location.origin +
"/reset-password.html"
}
);

if(error){

console.error(error);

alert(
"Erreur lors de l’envoi de l’email."
);

return;

}

alert(
"Un email de réinitialisation a été envoyé."
);

}