const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false
});

exports.sendVerificationEmail = async (email, token) => {
  const activationLink = `http://localhost:3001/api/auth/activate/${token}`;

  await transporter.sendMail({
    from: '"Knowledge Learning" <no-reply@test.com>',
    to: email,
    subject: "Activation de votre compte",
    html: `
      <h2>Bienvenue 👋</h2>
      <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
      <a href="${activationLink}">${activationLink}</a>
    `
  });

  console.log("Email envoyé à:", email);
};

exports.sendContactEmail = async ({ prenom, nom, email, sujet, message }) => {

  await transporter.sendMail({
    from: '"Knowledge Learning" <contact@knowledge-learning.com>',
    to: email,
    subject: "Nous avons bien reçu votre message",
    
    html: `
      <div style="font-family: Inter, Arial; padding: 20px;">
        
        <h2>Bonjour ${prenom},</h2>

        <p>
          Merci pour votre message.  
          Notre équipe vous répondra dans les plus brefs délais.
        </p>

        <div style="
          margin-top:20px;
          padding:15px;
          background:#f8fafc;
          border-radius:8px;
        ">
          <strong>Votre message:</strong><br><br>
          ${message}
        </div>

        <p style="margin-top:20px;">
          — Équipe Knowledge Learning
        </p>

      </div>
    `
  });

  console.log("Email confirmation envoyé à l'utilisateur");
};

exports.sendNewsletterEmail = async (email) => {
  await transporter.sendMail({
    from: '"Knowledge Learning" <contact@knowledge-learning.com>',
    to: email,
    subject: "Bienvenue dans notre newsletter !",

    html:`



<div style="



font-family:Arial;



max-width:600px;



margin:auto;



padding:40px;



background:#ffffff;



border-radius:14px;



border:1px solid #eee;



">



<h1 style="



color:#2563eb;



margin-bottom:25px;



">



Knowledge Learning



</h1>



<h2>



Bienvenue 💙



</h2>



<p>



Merci pour votre inscription à notre newsletter.



</p>



<div style="



background:#f8fafc;



padding:20px;



border-radius:10px;



margin:25px 0;



">



<p>



✓ Conseils pratiques



</p>



<p>



✓ Ressources exclusives



</p>



<p>



✓ Nouvelles formations



</p>



</div>



<p>



Nous sommes ravis de vous accompagner dans votre apprentissage.



</p>



<br>



<p>



— Équipe Knowledge Learning



</p>



</div>



`
  });

  console.log("Newsletter email envoyé à:", email);
};