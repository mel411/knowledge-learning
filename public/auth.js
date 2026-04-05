function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");

  alert("Déconnexion réussie");
  
  updateUserUI();
}