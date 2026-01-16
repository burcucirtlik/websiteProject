const stripeForm = document.querySelector("#stripe-form");
const ticketButtons = document.querySelectorAll(".ticket-card .primary-btn");
const navCta = document.querySelector(".nav-cta");
const heroCta = document.querySelector(".hero-actions .primary-btn");

const focusTickets = () => {
  document.querySelector("#tickets").scrollIntoView({ behavior: "smooth" });
};

navCta?.addEventListener("click", focusTickets);
heroCta?.addEventListener("click", focusTickets);

ticketButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stripeForm.scrollIntoView({ behavior: "smooth" });
  });
});

stripeForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  alert(
    "Stripe Checkout would open here. Connect this button to your backend endpoint to create a session."
  );
});
