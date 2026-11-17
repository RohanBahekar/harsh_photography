const menuButton = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => navLinks.classList.toggle('show'));
}

const emailJsConfig = window.emailJsConfig;

document.querySelectorAll('[data-emailjs-form]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const notice = form.querySelector('.notice');
    const submitButton = form.querySelector('[type="submit"]');

    if (!notice) {
      console.error('EmailJS form is missing its status message element.');
      return;
    }

    if (window.location.protocol === 'file:') {
      notice.textContent = 'Open this site through a local web server (http://localhost), not as a file, to send enquiries.';
      return;
    }

    if (!emailJsConfig || !emailJsConfig.serviceId || !emailJsConfig.templateId || !emailJsConfig.publicKey) {
      notice.textContent = 'Email setup is incomplete. Configure the .env file and run npm run build.';
      return;
    }

    if (emailJsConfig.templateId === emailJsConfig.serviceId) {
      notice.textContent = 'Email setup is incomplete: check the EmailJS Template ID in your .env file.';
      return;
    }

    if (!window.emailjs) {
      notice.textContent = 'The email service could not load. Check your internet connection and try again.';
      return;
    }

    notice.textContent = 'Sending your message...';
    if (submitButton) submitButton.disabled = true;

    try {
      window.emailjs.init({ publicKey: emailJsConfig.publicKey });
      await window.emailjs.sendForm(
        emailJsConfig.serviceId,
        emailJsConfig.templateId,
        form
      );
      notice.textContent = 'Thanks! Your message has been sent.';
      form.reset();
    } catch (error) {
      console.error('EmailJS form submission failed:', error);
      const details = error && (error.text || error.message);
      notice.textContent = `We could not send your message. Please try again or contact us at harshpatil1080@gmail.com.${details ? ` Details: ${details}` : ''}`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});

document.querySelectorAll('[data-demo-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const notice = form.querySelector('.notice');
    if (notice) {
      notice.textContent = 'This is a demo only. Real login and account creation are not set up yet.';
    }
    form.reset();
  });
});
