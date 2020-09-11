const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const pointList = document.querySelector('.js-points')
const clear = document.querySelector('.js-clear')
const clearpoints = document.querySelector('.js-clearpoints')
const pushGuess = document.querySelector('.js-push-guess')
var audio = new Audio('sounds/buzz.mp3')
var sound_override = true

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

pushGuess.addEventListener('click', () => {
  socket.emit('guess', document.querySelector('[name=guess_time]').value)
  document.querySelector('#guess_text').hidden=true;
  document.querySelector('#guess_spinner').style.display="inline-block";
  document.querySelector(".js-push-guess").disabled = true;
  ProgressCountdown(parseInt(document.querySelector('[name=guess_time]').value)).then(function(value) {
    document.querySelector('#guess_text').hidden=false;
    document.querySelector('#guess_spinner').style.display="none";
    document.querySelector(".js-push-guess").disabled = false;
  });
})
