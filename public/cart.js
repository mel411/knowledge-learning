let cartItems=[];
let currentUser=null;
const sb = window.sb;

/* ------------------------- START ------------------------- */

document.addEventListener(
"DOMContentLoaded",
async ()=>{

await loadLayout();
await initializeCart();

}
);

/* ------------------------- HEADER / FOOTER LOAD ------------------------- */

async function loadLayout(){

const header =
await fetch("components/header.html")
.then(r=>r.text());

document.getElementById(
"header"
).innerHTML=header;

updateUserUI();

const footer =
await fetch("components/footer.html")
.then(r=>r.text());

document.getElementById(
"footer"
).innerHTML=footer;

}

/* ------------------------- INIT ------------------------- */

async function initializeCart(){

showLoading();

currentUser =
await getCurrentUser();

if(!currentUser){

renderGuestState();
return;

}

await loadCart();

}

/* ------------------------- AUTH ------------------------- */

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

/* ------------------------- LOAD CART ------------------------- */

async function loadCart(){

    console.log("Current user id:", currentUser.id);
const {
data,
error
}
=
await sb
.from("purchases")
.select("*")
.eq("user_id", currentUser.id)
.eq("status","cart")
.order(
"created_at",
{ascending:false}
);

if(error){

console.error(error);

renderError(
"Impossible de charger le panier."
);

return;

}

console.log("Cart data from DB:", data);

cartItems = data || [];

await hydrateProducts();

renderCart();

}

/* ------------------------- ENRICH ITEMS (fetch lesson/course titles) ------------------------- */

async function hydrateProducts(){

for(
let item of cartItems
){

if(
item.item_type==="lesson"
){

const {
data
}
=
await sb
.from("lessons")
.select(
"title,price"
)
.eq(
"id",
item.item_id
)
.maybeSingle();

if(data){

item.title=
data.title;

if(!item.price)
item.price=
data.price;

}

}

if(
item.item_type==="course"
){

const {
data
}
=
await sb
.from("cursus")
.select(
"title,price"
)
.eq(
"id",
item.item_id
)
.maybeSingle();

if(data){

item.title=
data.title;

if(!item.price)
item.price=
data.price;

}

}

}

}

/* ------------------------- RENDER ------------------------- */

function renderCart(){

const wrapper =
document.getElementById(
"cartItems"
);

const emptyState =
document.getElementById(
"emptyCart"
);

/* EMPTY CART */

if(!cartItems.length){

wrapper.innerHTML = "";

emptyState.classList.remove(
"hidden"
);

updateSummary();

disableCheckout();

return;

}

/* HAS ITEMS */

emptyState.classList.add(
"hidden"
);

wrapper.innerHTML = "";

cartItems.forEach(item => {

wrapper.innerHTML +=
itemCardHTML(item);

});

updateSummary();

enableCheckout();

}

/* ------------------------- COMPONENTS ------------------------- */

function itemCardHTML(item){

return `

<div class="cart-item">

<div class="cart-item-left">

<div class="cart-badge">
${item.item_type==="lesson"
?"Leçon"
:"Formation"}
</div>

<h3>
${item.title || "Contenu premium"}
</h3>

<p>
Accès à vie • Certificat inclus
</p>

</div>

<div class="cart-item-right">

<div class="cart-price">
${item.price}€
</div>

<button
class="remove-btn"
onclick="removeItem(${item.id})"
>
Supprimer
</button>

</div>

</div>

`;

}

/* ------------------------- GUEST ------------------------- */

function renderGuestState(){

document.getElementById(
"cartItems"
).innerHTML = `

<div class="guest-cart-minimal">

<div class="guest-cart-icon">

<svg
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="1.8"
>

<circle cx="9" cy="20" r="1"></circle>

<circle cx="18" cy="20" r="1"></circle>

<path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H7"></path>

</svg>

</div>

<h3>
Votre panier est vide
</h3>

<p>
Connectez-vous pour accéder à vos formations
et retrouver vos achats.
</p>

<a
href="connexion.html"
class="btn-main"
>
Se connecter
</a>

</div>

`;

updateSummary();

disableCheckout();

}

/* ------------------------- REMOVE ------------------------- */

async function removeItem(id){

const button =
event.target;

button.disabled=true;
button.innerText="...";

const {
error
}
=
await sb
.from("purchases")
.delete()
.eq(
"id",
id
);

if(error){

alert(
"Erreur suppression"
);

return;

}

cartItems=
cartItems.filter(
i=>i.id!==id
);

renderCart();

}

/* ------------------------- SUMMARY ------------------------- */

function updateSummary(){

let subtotal =
cartItems.reduce(
(sum,item)=>
sum + (item.price || 0),
0
);

/* 20% TVA */
let vat =
subtotal * 0.20;

/* FINAL TOTAL */
let total =
subtotal + vat;

/* ROUND */
vat =
Math.round(vat * 100) / 100;

total =
Math.round(total * 100) / 100;

document.getElementById(
"cartCount"
).innerText =
cartItems.length <= 1
?
`${cartItems.length} article`
:
`${cartItems.length} articles`;

document.getElementById(
"subtotal"
).innerText =
subtotal + "€";

document.getElementById(
"vat"
).innerText =
vat + "€";

document.getElementById(
"total"
).innerText =
total + "€";

}

/* ------------------------- CHECKOUT ------------------------- */

function enableCheckout(){

const btn=
document.getElementById(
"checkoutBtn"
);

if(btn){

btn.disabled=false;

}

}

function disableCheckout(){

const btn=
document.getElementById(
"checkoutBtn"
);

if(btn){

btn.disabled=true;

}

}

async function checkout(){

if(!cartItems.length){
return;
}

const confirmBuy =
confirm(
"Confirmer votre achat ?"
);

if(!confirmBuy){
return;
}


/* move cart items to paid */
const {
error
}
=
await sb
.from("purchases")
.update({
status:"paid"
})
.eq(
"user_id",
currentUser.id
)
.eq(
"status",
"cart"
);

if(error){

console.error(error);

alert(
"Erreur paiement test"
);

return;

}

alert(
"Achat confirmé ! Vos formations sont débloqués."
);


/* reload cart */
await loadCart();

}

/* ------------------------- UI STATES ------------------------- */

function showLoading(){

document
.getElementById(
"cartItems"
)
.innerHTML=`

<div class="loading-cart">
Chargement du panier...
</div>

`;

}

function renderError(message){

document
.getElementById(
"cartItems"
)
.innerHTML=`

<div class="empty-cart-card">

<h3>
Erreur
</h3>

<p>
${message}
</p>

</div>

`;

}
