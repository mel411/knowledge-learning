document.addEventListener("DOMContentLoaded", async () => {

  loadLayout();

  await checkAdminAccess();

});

/* ========================================================= CHECK ADMIN ACCESS ========================================================= */

async function checkAdminAccess(){

  const adminContent =
    document.getElementById("adminContent");

  const denied =
    document.getElementById("accessDenied");

  try{

    // AUTH USER
    const {
      data: authData,
      error: authError
    } = await window.sb.auth.getUser();

    if(authError || !authData.user){

      adminContent.style.display = "none";
      denied.style.display = "block";

      return;
    }

    const user = authData.user;

    // GET PROFILE
    const {
      data: profile,
      error: profileError
    } = await window.sb
      .from("users")
      .select("*")
      .eq("new_id", user.id)
      .single();

    if(profileError || !profile){

      adminContent.style.display = "none";
      denied.style.display = "block";

      return;
    }

    // CHECK ROLE
    if(profile.role !== "admin"){

      adminContent.style.display = "none";
      denied.style.display = "block";

      return;
    }

    // ADMIN OK
    denied.style.display = "none";
    adminContent.style.display = "block";

    // LOAD DATA
    loadUsers();
    loadPurchases();
    loadCertifications();
    loadValidations();
    loadContacts();

  }catch(error){

    console.error(error);

    adminContent.style.display = "none";
    denied.style.display = "block";
  }
}

/* =========================================================
USERS
========================================================= */

async function loadUsers(){

  const {
    data,
    error
  } = await window.sb
    .from("users")
    .select("*")
    .order("created_at",{
      ascending:false
    });

  if(error){
    console.error(error);
    return;
  }

  document.getElementById("usersCount")
    .textContent = data.length;

  const table =
    document.getElementById("usersTable");

  table.innerHTML = "";

  const {
  data: authData
} = await window.sb.auth.getUser();

const currentAdminId =
  authData.user.id || null;

  data.forEach(user => {

  const createdDate =
    user.created_at
    ? new Date(user.created_at)
        .toLocaleDateString("fr-FR")
    : "—";

  const roleContent =

    currentAdminId &&
    user.new_id === currentAdminId

    ?

    `
    <span class="admin-badge">
      Administrateur
    </span>
    `

    :

    `
    <select
      class="role-select"
      onchange="changeRole('${user.new_id}',this.value)"
    >

      <option
        value="client"
        ${user.role === "client" ? "selected" : ""}
      >
        Étudiant
      </option>

      <option
        value="admin"
        ${user.role === "admin" ? "selected" : ""}
      >
        Administrateur
      </option>

    </select>
    `;

  table.innerHTML += `
    <tr>

      <td>${user.name || "—"}</td>

      <td>${user.email || "—"}</td>

      <td>${roleContent}</td>

      <td>${createdDate}</td>

    </tr>
  `;
});
}

/* =========================================================
CHANGE ROLE
========================================================= */

async function changeRole(userId,newRole){

  const { error } = await window.sb
    .from("users")
    .update({
      role:newRole
    })
    .eq("new_id",userId);

  if(error){

    alert("Erreur lors de la modification");
    console.error(error);

    return;
  }

  alert("Rôle mis à jour");
}

/* =========================================================
PURCHASES
========================================================= */

async function loadPurchases(){

  const {
    data,
    error
  } = await window.sb
    .from("purchases")
    .select("*")
    .order("created_at",{
      ascending:false
    });

  if(error){
    console.error(error);
    return;
  }

  document.getElementById(
    "purchasesCount"
  ).textContent = data.length;

  const table =
    document.getElementById(
      "purchasesTable"
    );

  table.innerHTML = "";

  for(const item of data){

    /* GET USER EMAIL */

    const {
      data:userData
    } = await window.sb
      .from("users")
      .select("email")
      .eq("new_id", item.user_id)
      .maybeSingle();

    table.innerHTML += `

      <tr>

        <td>
          ${userData?.email || "—"}
        </td>

        <td>
          Formation
        </td>

        <td>
          ${item.price || 0}€
        </td>

        <td>

          <span class="status-paid">
            Payé
          </span>

        </td>

      </tr>

    `;
  }
}

/* ========================================================= CERTIFICATIONS ========================================================= */

async function loadCertifications(){

  const {
    data,
    error
  } = await window.sb
    .from("certifications")
    .select("*");

  if(error){
    console.error(error);
    return;
  }

  document.getElementById("certificationsCount")
    .textContent = data.length;

  const table =
    document.getElementById("certificationsTable");

  table.innerHTML = "";

  for(const item of data){

    // GET USER EMAIL
    const {
      data:userData
    } = await window.sb
      .from("users")
      .select("email")
      .eq("new_id", item.user_id)
      .maybeSingle();

    // GET CURSUS TITLE
    const {
      data:cursusData
    } = await window.sb
      .from("cursus")
      .select("title")
      .eq("id", item.cursus_id)
      .maybeSingle();

    table.innerHTML += `
      <tr>

        <td>
          ${userData?.email || "—"}
        </td>

        <td>
          ${cursusData?.title || "—"}
        </td>

        <td>
          ${
            item.obtained_at
            ? new Date(item.obtained_at)
                .toLocaleDateString("fr-FR")
            : "—"
          }
        </td>

      </tr>
    `;
  }
}

/* ========================================================= VALIDATIONS ========================================================= */

async function loadValidations(){

  const {
    data,
    error
  } = await window.sb
    .from("validations")
    .select("*")
    .order("validated_at", {
      ascending:false
    });

  if(error){
    console.error(error);
    return;
  }

  document.getElementById("validationsCount")
    .textContent = data.length;

  const table =
    document.getElementById("validationsTable");

  table.innerHTML = "";

  for(const item of data){

    // GET USER EMAIL
    const {
      data:userData
    } = await window.sb
      .from("users")
      .select("email")
      .eq("new_id", item.user_id)
      .maybeSingle();

    // GET LESSON
const {
  data: lessonData
} = await window.sb
  .from("lessons")
  .select("title")
  .eq("id", item.lesson_id)
  .maybeSingle();

    table.innerHTML += `
      <tr>

        <td>
          ${userData?.email || "—"}
        </td>

        <td>
          ${lessonData?.title || "—"}
        </td>

        <td>
          ${
            item.validated_at
            ? new Date(item.validated_at)
                .toLocaleDateString("fr-FR")
            : "—"
          }
        </td>

      </tr>
    `;
  }
}

function filterUsers(){

  const value =
    document
      .getElementById("usersSearch")
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      "#usersTable tr"
    );

  rows.forEach(row => {

    const text =
      row.innerText.toLowerCase();

    row.style.display =
      text.includes(value)
      ? ""
      : "none";

  });
}

/* =========================================================
CONTACT MESSAGES
========================================================= */

async function loadContacts(){

  const {
    data,
    error
  } = await window.sb
    .from("contact_messages")
    .select("*")
    .order("created_at", {
      ascending:false
    });

  if(error){

    console.error(error);
    return;

  }

  const table =
    document.getElementById(
      "contactTable"
    );

  table.innerHTML = "";

  data.forEach(item => {

    table.innerHTML += `

      <tr>

        <td>
          ${item.prenom || ""} ${item.nom || ""}
        </td>

        <td>
          ${item.email || "—"}
        </td>

        <td>
          ${item.sujet || "—"}
        </td>

        <td>
          ${item.message || "—"}
        </td>

        <td>
          ${
            item.created_at
            ? new Date(item.created_at)
                .toLocaleDateString("fr-FR")
            : "—"
          }
        </td>

      </tr>

    `;

  });

}