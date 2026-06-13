const sb = window.sb;

if(!window.sb){
console.error("Supabase client missing");
}

// GET COURSE ID 
const params = new URLSearchParams(window.location.search);
const courseId = parseInt(params.get("id"), 10);

if (!courseId) {
  document.getElementById("courseTitle").innerText = "Formation introuvable";
  throw new Error("Invalid course ID");
}

// GLOBAL STATE
// validation progress
let state =
JSON.parse(
localStorage.getItem(
"course_" + courseId
)
) || {};

let purchasedCourse=false;

// LOAD EVERYTHING
async function loadCourse() {

    await loadPurchases();
    await loadValidations ();

  // GET COURSE
  const { data: course, error: courseError } = await sb
    .from("cursus")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError || !course) {
    document.getElementById("courseTitle").innerText = "Formation introuvable";
    console.error(courseError);
    return;
  }

  document.getElementById("courseTitle").innerText = course.title;

  document.getElementById("coursePrice").innerText = course.price + "€";

  // GET LESSONS
  const { data: lessons, error: lessonsError } = await sb
    .from("lessons")
    .select("*")
    .eq("cursus_id", courseId);

  if (lessonsError) {
    console.error(lessonsError);
    return;
  }

  renderLessons(lessons);
  updateCoursePurchaseUI();
  updateProgress(lessons);
  checkCertificate(lessons);
}

function updateCoursePurchaseUI(){

const zone =
document.getElementById(
"coursePurchaseZone"
);

if(!zone) return;

if(purchasedCourse){

zone.innerHTML=`
<button
class="btn-outline"
disabled
>
Formation débloquée ✓
</button>
`;

}

}

// RENDER
function renderLessons(lessons) {
  const container = document.getElementById("lessonsContainer");
  container.innerHTML = "";

  lessons.forEach(lesson => {
    const isBought = purchasedCourse;

    const isValidated = state[lesson.id]?.validated || false;

    const div = document.createElement("div");
    div.className = "lesson-card";

    div.innerHTML = `
      <div class="lesson-media ${!isBought ? "locked" : ""}">
        ${isBought && lesson.video_url ? `
          <iframe 
            src="${lesson.video_url.replace("watch?v=", "embed/")}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        ` : `
          <div class="lesson-locked">
            <div class="locked-icon">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="3" stroke="#2563eb" stroke-width="1.8"/>
    <path d="M8 10V7a4 4 0 118 0v3" stroke="#2563eb" stroke-width="1.8"/>
  </svg>
</div>

<div>Contenu verrouillé</div>
          </div>
        `}
      </div>
      <div class="lesson-body">

<h3>${lesson.title}</h3>

<div class="lesson-content">
${formatLessonContent(lesson.content)}
</div>

<div class="lesson-actions">

${
isBought
?
(
  isValidated
  ?
  `
  <button class="btn-success-outline" disabled>
    ✔ Leçon validée
  </button>
  `
  :
  `
  <button
    class="btn-success"
    onclick="validateLesson(${lesson.id}, this)"
  >
    Valider cette leçon
  </button>
  `
)
:
`
`
}

</div>

</div>

</div>

    `;

    container.appendChild(div);
  });
}

function formatLessonContent(content) {

  // Split "Objectifs"
  const parts = content.split("Objectifs");

  const intro = parts[0];
  const objectifsRaw = parts[1] || "";

  // Clean objectifs
  const objectifs = objectifsRaw
    .replace(":", "")
    .split("-")
    .map(o => o.trim())
    .filter(o => o.length > 0);

  return `
    <p class="lesson-intro">${intro}</p>

    ${objectifs.length ? `
      <div class="lesson-objectives">
        <strong>Objectifs</strong>
        <ul>
          ${objectifs.map(o => `<li>${o}</li>`).join("")}
        </ul>
      </div>
    ` : ""}
  `;
}

// BUY
async function getCurrentUser(){

const {
  data: { session }
} = await sb.auth.getSession();

if(!session || !session.user){
  return null;
}

return {
  id: session.user.id
};

}

async function loadPurchases(){

const user =
await getCurrentUser();
console.log("Current user:", user);

if(!user){
  purchasedCourse = false;
  return;
}

const {
data,
error
}
=
await sb
.from("purchases")
.select("*")
.eq(
"user_id",
user.id
)
.in(
"status",
["cart","paid"]
);

if(error){
console.error(error);
return;
}

purchasedCourse =
(data || []).some(
    i =>
    i.item_type==="course" && 
    i.item_id===courseId
);

}

async function loadValidations(){

const user = await getCurrentUser();

if(!user){
  state = {};
  return;
}

const { data, error } = await sb
.from("validations")
.select("*")
.eq("user_id", user.id);

if(error){
  console.error(error);
  return;
}

state = {};

(data || []).forEach(v => {

state[v.lesson_id] = {
validated: true
};

});

localStorage.setItem(
"course_" + courseId,
JSON.stringify(state)
);

}

async function addCourseToCart(){

 const user = await getCurrentUser();

 if(!user){
   showLoginMessage();
   return;
 }

 const { data: existingRows, error: checkError } =
 await sb
   .from("purchases")
   .select("id")
   .eq("user_id", user.id)
   .eq("item_type","course")
   .eq("item_id", courseId)
   .in("status", ["cart","paid"]);

 if(checkError){
   console.error(checkError);
   return;
 }

 if(existingRows.length > 0){
   alert("Cette formation est déjà dans votre panier");
   return;
 }

 // GET COURSE PRICE
 const {
   data: course,
   error: courseError
 } =
 await sb
   .from("cursus")
   .select("price")
   .eq("id",courseId)
   .maybeSingle();

 if(courseError){
   console.error(courseError);
   return;
 }

 // INSERT INTO CART
 const { error } =
 await sb
  .from("purchases")
  .insert([{
      user_id:user.id,
      item_type:"course",
      item_id:courseId,
      price:course.price,
      quantity:1,
      status:"cart"
  }]);

 if(error){
   console.error(error);
   return;
 }

 alert("Formation ajoutée au panier");

 window.location.href="cart.html";

}

// VALIDATE
async function validateLesson(id){

const user = await getCurrentUser();

if(!user){
alert("Connectez-vous");
return;
}

try{

const { error } = await sb
.from("validations")
.insert([{
user_id: user.id,
lesson_id: id,
cert: false
}]);

if(error){
console.error(error);
alert("Erreur validation");
return;
}

if(!state[id]){
state[id] = {};
}

state[id].validated = true;

localStorage.setItem(
"course_" + courseId,
JSON.stringify(state)
);

loadCourse();

}catch(err){
console.error(err);
}
}

function updateProgress(lessons){

if(!purchasedCourse){

document
.getElementById("progressText")
.innerText = "0% complété";

document
.getElementById("progressFill")
.style.width = "0%";

return;

}

const total = lessons.length;

const validated =
lessons.filter(
l => state[l.id]?.validated
).length;

const percent =
total
? Math.round((validated / total) * 100)
: 0;

document
.getElementById("progressText")
.innerText =
percent + "% complété";

document
.getElementById("progressFill")
.style.width =
percent + "%";

}

// CERTIFICATE
function checkCertificate(lessons){

const allValidated =
lessons.length > 0 &&
lessons.every(
l => state[l.id]?.validated
);

const certificate =
document.getElementById("certificate");

if(
purchasedCourse &&
allValidated
){

createCertification();

certificate.classList.remove("hidden");

}else{

certificate.classList.add("hidden");

}

}

async function createCertification(){

const user = await getCurrentUser();

if(!user) return;

/* already exists ? */
const {
data: existing,
error: existingError
}
=
await sb
.from("certifications")
.select("id")
.eq("user_id", user.id)
.eq("cursus_id", Number(courseId));

if(existingError){

console.error(existingError);
return;

}

/* prevent duplicates */
if(existing && existing.length > 0){
return;
}

/* create certification */
const {
error
}
=
await sb
.from("certifications")
.insert([{
user_id: user.id,
cursus_id: Number(courseId),
obtained_at: new Date().toISOString()
}]);

if(error){
console.error(error);
}

}

function showLoginMessage() {

  const msg = document.createElement("div");
  msg.className = "login-warning";
  msg.innerText = "Merci de vous connecter pour acheter cette formation";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 3000);
}

document.addEventListener(
"DOMContentLoaded",
loadCourse
);