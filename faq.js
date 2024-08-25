let questions = document.querySelectorAll(".q");
let arrows = document.querySelectorAll(".qarrow");
let answers = document.querySelectorAll(".a");
for (let i = 0; i < questions.length; i++) {
    questions[i].className = "q" + i;
    answers[i].className = "a" + i;
    questions[i].addEventListener("click", ()=> {
        if (answers[i].style.display != "block") {
            console.log("opening!" + i);
            answers[i].style.display = "block";
            answers[i].style.height = "auto";
            arrows[i].style.transform = "rotate(180deg)";
        } else {
            console.log("closing!" + i);
            answers[i].style.display = "none";
            answers[i].style.height = "0";
            arrows[i].style.transform = "rotate(0deg)";
        }
    });
};