const socket = io()
const body = document.querySelector('.js-body')
const form = document.querySelector('.js-join')
const joined = document.querySelector('.js-joined')
const buzzer = document.querySelector('.js-buzzer')
const joinedInfo = document.querySelector('.js-joined-info')
const editInfo = document.querySelector('.js-edit')
const pointInfo = document.querySelector('.js-points')
const buzzer_div = document.querySelector('.buzz-button')
const countdown = document.querySelector('.countdown')
const guess = document.querySelector('.guess-text')
const multipleChoice = document.querySelector('.multiple_choice')
const mc1_button = document.querySelector('.mc1')
const mc2_button = document.querySelector('.mc2')
const mc3_button = document.querySelector('.mc3')
const mc4_button = document.querySelector('.mc4')

let user = {}

let oldpoints = 0

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncConfetti() {
  confetti.start()
  await timeout(3000);
  confetti.stop()
}

function ProgressCountdown(timeleft, text) {
  return new Promise((resolve, reject) => {
    var countdownTimer = setInterval(() => {
      timeleft--;

      document.querySelector(text).textContent = timeleft + " Sekunden zum Antworten verbleiben.";

      if (timeleft <= 0) {
        clearInterval(countdownTimer);
        resolve(true);
      }
    }, 1000);
  });
}

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.name) {
    form.querySelector('[name=name]').value = user.name
  }
}
const saveUserInfo = () => {
  localStorage.setItem('user', JSON.stringify(user))
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  user.name = form.querySelector('[name=name]').value
  if (!user.id) {
    user.id = Math.floor(Math.random() * new Date())
  }
  socket.emit('join', user)
  saveUserInfo()
  joinedInfo.innerText = `${user.name}`
  form.classList.add('hidden')
  joined.classList.remove('hidden')
  body.classList.add('buzzer-mode')
  document.getElementById("footer-link").style.color = 'white';
})

buzzer.addEventListener('click', (e) => {
  socket.emit('buzz', [user, ""])
})

mc1_button.addEventListener('click', (e) => {
  mc1_button.classList.add("mc_selected");
  mc2_button.classList.remove("mc_selected");
  mc3_button.classList.remove("mc_selected");
  mc4_button.classList.remove("mc_selected");
})

mc2_button.addEventListener('click', (e) => {
  mc2_button.classList.add("mc_selected");
  mc1_button.classList.remove("mc_selected");
  mc3_button.classList.remove("mc_selected");
  mc4_button.classList.remove("mc_selected");
})

mc3_button.addEventListener('click', (e) => {
  mc3_button.classList.add("mc_selected");
  mc1_button.classList.remove("mc_selected");
  mc2_button.classList.remove("mc_selected");
  mc4_button.classList.remove("mc_selected");
})

mc4_button.addEventListener('click', (e) => {
  mc4_button.classList.add("mc_selected");
  mc1_button.classList.remove("mc_selected");
  mc2_button.classList.remove("mc_selected");
  mc3_button.classList.remove("mc_selected");
})

socket.on('points', (users) => {
  var sorted = []
  for (user_info in users) {
    if(users[user_info]["sid"] != ""){
      sorted[sorted.length] = users[user_info]
    }
  }
  sorted.sort((a,b) => (a.points < b.points) ? 1 : ((b.points < a.points) ? -1 : 0));

  for (var i=0; i<sorted.length; i++){
    if (sorted[i]["name"] == user.name) {
      place = i+1
      for (var j=0; j<sorted.length; j++){
        if(sorted[j]["points"] == sorted[i]["points"] && sorted[j]["name"] != sorted[i]["name"] && j < i){
          place = j+1
          break
        }
      }
      if(sorted[i]["points"] > oldpoints + 1){
        oldpoints = sorted[i]["points"]
        asyncConfetti()
      }
      else{
        oldpoints = sorted[i]["points"]
      }
      if(parseInt(sorted[i]["points"]) == 0){
        oldpoints = 0
      }
      pointInfo.innerText = "Du hast " + sorted[i]["points"] + " Punkte.\n"
      pointInfo.innerText += "Du bist Platz " + place + " von " + sorted.length;
      break
    }
  }
})

socket.on('start_guess', (time) => {
  buzzer_div.classList.add('hidden')
  guess.classList.remove('hidden')
  countdown.classList.remove('hidden')
  document.querySelector(".js-countdown-left").textContent = time + " Sekunden zum Antworten verbleiben.";
  document.querySelector('[name=guess]').value = ""
  document.querySelector('[name=guess]').focus()

  ProgressCountdown(parseInt(time), '.js-countdown-left').then(function(value) {
    buzzer_div.classList.remove('hidden')
    countdown.classList.add('hidden')
    guess.classList.add('hidden')
    socket.emit('buzz', [user, document.querySelector('[name=guess]').value])
  });
})

socket.on('start_mc', (time) => {
  buzzer_div.classList.add('hidden')
  multipleChoice.classList.remove('hidden')
  countdown.classList.remove('hidden')
  document.querySelector(".js-countdown-left").textContent = time + " Sekunden zum Antworten verbleiben.";
  document.querySelector('[name=guess]').value = ""
  document.querySelector('[name=guess]').focus()

  ProgressCountdown(parseInt(time), '.js-countdown-left').then(function(value) {
    buzzer_div.classList.remove('hidden')
    countdown.classList.add('hidden')
    multipleChoice.classList.add('hidden')
    socket.emit('buzz', [user, document.querySelector('.mc_selected').textContent])
    mc1_button.classList.remove("mc_selected");
    mc2_button.classList.remove("mc_selected");
    mc3_button.classList.remove("mc_selected");
    mc4_button.classList.remove("mc_selected");
  });
})

editInfo.addEventListener('click', () => {
  joined.classList.add('hidden')
  form.classList.remove('hidden')
  body.classList.remove('buzzer-mode')
})

getUserInfo()
