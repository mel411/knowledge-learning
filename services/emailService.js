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