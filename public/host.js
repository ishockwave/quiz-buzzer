const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const pointList = document.querySelector('.js-points')
const clear = document.querySelector('.js-clear')
const clearpoints = document.querySelector('.js-clearpoints')
const pushGuess = document.querySelector('.js-push-guess')
const pushMc = document.querySelector('.js-push-mc')
const pushSaveQ = document.querySelector('.js-save-questions')
const pushNextQ = document.querySelector('.js-next-question')
const pushPrevQ = document.querySelector('.js-prev-question')
const checkboxElems = document.querySelectorAll("input[type='checkbox']");

var audio = new Audio('sounds/buzz.mp3')
var sound_override = true

var q_id = -1
var selections = {};

function ProgressCountdown(timeleft) {
  return new Promise((resolve, reject) => {
    var countdownTimer = setInterval(() => {
      timeleft--;

      if (timeleft <= 0) {
        clearInterval(countdownTimer);
        resolve(true);
      }
    }, 1000);
  });
}

for (var i = 0; i < checkboxElems.length; i++) {
  checkboxElems[i].addEventListener("click", displayCheck);
}

function displayCheck(e) {
  if (e.target.checked) {
    selections[e.target.name] = true
  }
  else{
    selections[e.target.name] = false
  }

  socket.emit("blank", selections)
}

socket.on('buzzes', (buzzes) => {
  let html = ""
  buzzList.innerHTML = html
  for (buzz in buzzes){
    html += `<div class="row">
      <div class="column">
        <button class="right button-${buzz}-right">${buzzes[buzz]["name"]} ${(buzzes[buzz]["guess"] != "")? " - " + buzzes[buzz]["guess"]: ""}</button>
      </div>
      <div class="column">
        <button class="wrong button-${buzz}-wrong">${buzzes[buzz]["name"]} ${(buzzes[buzz]["guess"] != "")? " - " + buzzes[buzz]["guess"]: ""}</button>
      </div>
    </div>`
  }
  buzzList.innerHTML = html
  for (let buzz in buzzes){
    document.querySelector('.button-' + buzz + '-right').addEventListener('click', () => {
      socket.emit('right', [buzz, document.querySelector('[name=points_right]').value])
    })
    document.querySelector('.button-' + buzz + '-wrong').addEventListener('click', () => {
      socket.emit('wrong', [buzz, document.querySelector('[name=points_wrong]').value])
    })
  }
  if (document.getElementById("buzz_sound").checked && sound_override){
    var playPromise = audio.play();
  }
  else if (!sound_override){
    sound_override = true;
  }
})

socket.on('points', (users) => {
  pointList.innerHTML = ""
  var sorted = []
  for (user in users) {
    sorted[sorted.length] = users[user]
  }
  sorted.sort((a,b) => (a.points < b.points) ? 1 : ((b.points < a.points) ? -1 : 0));
  for(var i=0; i<sorted.length; i++){
    if(sorted[i]["sid"] != ""){
      pointList.innerHTML += "<h3 class=points>" + sorted[i]["name"] + " - " +  sorted[i]["points"] + "</ol>"
    }
  }
})

clear.addEventListener('click', () => {
  sound_override = false;
  socket.emit('clear')
})

clearpoints.addEventListener('click', () => {
  socket.emit('clearpoints')
})

pushSaveQ.addEventListener('click', () => {
  var questions = document.getElementsByClassName("questions")[0].value.split("\n")
  socket.emit('save_questions', questions)
})

pushNextQ.addEventListener('click', () => {
  var questions = document.getElementsByClassName("questions")[0].value.split("\n")
  
  if(typeof questions[q_id + 1] !== "undefined"  && q_id < questions.length && questions.length > 0){
    q_id += 1
    var question_string = questions[q_id]
    document.getElementsByClassName("curr-question")[0].innerText = "Frage " + (q_id+1) + " von " + questions.length
    socket.emit('new_question', [q_id, questions.length, question_string])
  }
})

pushPrevQ.addEventListener('click', () => {
  var questions = document.getElementsByClassName("questions")[0].value.split("\n")

  if(typeof questions[q_id - 1] !== "undefined" && q_id > 0){
    q_id -= 1
    var question_string = questions[q_id]
    document.getElementsByClassName("curr-question")[0].innerText = "Frage " + (q_id+1) + " von " + questions.length
    socket.emit('new_question', [q_id, questions.length, question_string])
  }
})

pushGuess.addEventListener('click', () => {
  socket.emit('guess', document.querySelector('[name=guess_time]').value)
  document.querySelector('#guess_text').hidden=true;
  document.querySelector('#guess_spinner').style.display="inline-block";
  document.querySelector(".js-push-guess").disabled = true;
  document.querySelector(".js-push-mc").disabled = true;
  ProgressCountdown(parseInt(document.querySelector('[name=guess_time]').value)).then(function(value) {
    document.querySelector('#guess_text').hidden=false;
    document.querySelector('#guess_spinner').style.display="none";
    document.querySelector(".js-push-guess").disabled = false;
    document.querySelector(".js-push-mc").disabled = false;
  });
})

pushMc.addEventListener('click', () => {
  socket.emit('mc', document.querySelector('[name=mc_time]').value)
  document.querySelector('#mc_text').hidden=true;
  document.querySelector('#mc_spinner').style.display="inline-block";
  document.querySelector(".js-push-guess").disabled = true;
  document.querySelector(".js-push-mc").disabled = true;
  ProgressCountdown(parseInt(document.querySelector('[name=mc_time]').value)).then(function(value) {
    document.querySelector('#mc_text').hidden=false;
    document.querySelector('#mc_spinner').style.display="none";
    document.querySelector(".js-push-guess").disabled = false;
    document.querySelector(".js-push-mc").disabled = false;
  });
})
