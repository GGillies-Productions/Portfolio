//button fall anime.js
const element = document.querySelector("#btn");
element.addEventListener("click", () => {
  element.classList.add("animate__animated", "animate__hinge");
});

//set page change delay after button press
const transition = document.querySelector("#btn");
transition.addEventListener("click", () => {
  setTimeout(function () {
    window.location.href = "./portfolio/home.html";
  }, 500);
});