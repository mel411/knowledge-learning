// ========================= // USER // =========================

async function getCurrentUser(){

  if (window.restoreSession) {
  await window.restoreSession();
}

  const {
    data: { session }
  } = await window.sb.auth.getSession();

  if(!session || !session.user){
    return null;
  }

  return {
    id: session.user.id,
    role: "client"
  };
}

async function renderCourses(purchases){

    const user = await getCurrentUser();

    const container=
    document.getElementById(
        "userCourses"
    );
    
    const courses=
    purchases.filter(
        p=>p.item_type==="course"
    );
    
    if(!courses.length){
        container.innerHTML=
        `
        <div class="account-lesson-card">
        <div class="account-lesson-body">
        <h3>Aucune formation active</h3>
        </div>
        </div>
        `;

        return;
    }
    
    let html="";
    for(let c of courses){
        
        const { data: coursesData } =
await window.sb
.from("cursus")
.select("title")
.eq("id", c.item_id);

const course = coursesData && coursesData.length > 0
  ? coursesData[0]
  : null;
        
        const { data: certs } = await window.sb
  .from("certifications")
  .select("id")
  .eq("user_id", user.id)
  .eq("cursus_id", c.item_id);

const status = certs && certs.length > 0 ? "Certifié" : "En cours";

html += `
<div class="account-lesson-card">

    <div class="ui-accent"></div>

    <div class="account-lesson-left">
        <h3>${course?.title || "Cursus"}</h3>
        ${status === "Certifié"
  ? `<div class="cert-badge">✔ Certifié</div>`
  : `<p>En cours</p>`
}
    </div>

    <div class="account-lesson-footer">
        <a href="/lessons.html?id=${c.item_id}" class="btn-main">
            Continuer
        </a>
    </div>

</div>
`;

}

container.innerHTML=html;

}

async function renderOrders(purchases){

const container=
document.getElementById(
"ordersRows"
);

if(!purchases.length){

container.innerHTML="";
return;

}

let html="";
html += `
<div class="order-header">

  <div>Nº</div>
  <div>Formation</div>
  <div>Prix</div>
  <div>Date</div>
  <div>Statut</div>

</div>
`;

for(let p of purchases){

let itemName="Contenu";

if(
p.item_type==="course"
){

const {
data:course
}
=
await window.sb
.from("cursus")
.select("title")
.eq(
"id",
p.item_id
)
.maybeSingle();

if(course){
itemName=course.title;
}

}


if(
p.item_type==="lesson"
){

const {
data:lesson
}
=
await window.sb
.from("lessons")
.select("title")
.eq(
"id",
p.item_id
)
.maybeSingle();

if (lesson && lesson.length > 0) {
  itemName = lesson[0].title
}

}


html += `
<div class="order-row">

  <div>#${p.id}</div>

  <div>${itemName}</div>

  <div>${p.price}€</div>

  <div>
    ${new Date(p.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}
  </div>

  <div>
    <span class="validated-block">
      Payé
    </span>
  </div>

</div>
`;

}

container.innerHTML=html;

}

async function loadCertificates(){

const user = await getCurrentUser();
if(!user) return;

const { data, error } = await window.sb
  .from("certifications")
  .select(`
    *,
    cursus:cursus_id (
      title,
      image
    )
  `)
  .eq("user_id", user.id);

const container = document.getElementById("certificatesArea");

if(!data || data.length === 0){

container.innerHTML = `
<div class="certificate-card">
<h3>Aucun certificat obtenu</h3>
<p>Complétez une formation pour obtenir un certificat.</p>
</div>
`;

document.getElementById("certificateCount").innerText = "0";

return;
}

document.getElementById("certificateCount").innerText = data.length;

container.innerHTML = "";

data.forEach(cert => {

container.innerHTML += `
        <div class="cert-card">
          <div class="cert-image">
            <img src="/images/${cert.cursus?.image}" alt="${cert.cursus?.title}">
            </div>
            <div class="cert-content">
              <div class="cert-badge">
                ✔ Certifié
              </div>
              <h3 class="cert-title">${cert.cursus?.title || "Formation"}</h3>
              <p class="cert-date">
                ${cert.obtained_at 
                ? "Certifié le " + new Date(cert.obtained_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
                : ""}
              </p>
              <button class="btn-lesson" onclick="viewCert('${cert.id}')">
                Voir le certificat
              </button>
            </div>
          </div>
        `;

});

}

async function loadLastActivity(){

  const statNumber =
  document.getElementById("lastActivityCount");

  const statLabel =
  document.getElementById("lastActivityLabel");

  const {
    data: { session }
  } = await window.sb.auth.getSession();

  if(!session){
    statNumber.innerText = "—";
    statLabel.innerText = "Aucune activité";
    return;
  }

  const lastLogin =
    session.user.last_sign_in_at;

  if(!lastLogin){
    statNumber.innerText = "—";
    statLabel.innerText = "Aucune activité";
    return;
  }

  const formatted =
  new Date(lastLogin)
  .toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  statNumber.innerText = formatted;
  statLabel.innerText = "Dernière connexion";
}

// ========================= // LOAD DASHBOARD // =========================

async function loadAccountDashboard(){

const user=
await getCurrentUser();

if(!user){
window.location.href="connexion.html";
return;
}

// ------------------ // purchases // ------------------

const {
  data: purchases,
  error: purchasesError
} = await window.sb
  .from("purchases")
  .select("*")
  .eq("user_id", user.id)
  .in("status", ["paid", "cart"]);

if (purchasesError) {
  console.error(purchasesError);
}

const safePurchases = purchases || [];

const active=
safePurchases.filter(
p=>
p.item_type==="course"
).length;

document
.getElementById(
"activeCoursesCount"
)
.innerText=
active;

// ------------------ // progress // ------------------

let totalLessons=0;
let validatedLessons=0;

for(let key in localStorage){

if(
key.startsWith("course_")
){

const progress=
JSON.parse(
localStorage.getItem(key)
);

for(
let lessonId in progress
){

totalLessons++;

if(
progress[lessonId].validated
){
validatedLessons++;
}

}

}

}

const percent=
totalLessons
?
Math.round(
(validatedLessons/totalLessons)*100
)
:0;

// ------------------ // courses render // ------------------

await renderCourses(
safePurchases
);

// ------------------ // orders render // ------------------

await renderOrders(
safePurchases
);

await loadCertificates ();
await loadLastActivity ();
}

function viewCert(id){
window.location.href=
`/certificate.html?id=${id}`;
}

loadAccountDashboard();