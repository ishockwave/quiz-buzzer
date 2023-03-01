const socket = io()
const parser = new DOMParser();

socket.on('points', (users) => {
    for(let user in users){
        var elementExists = !!document.getElementsByClassName('name ' + users[user]["id"])[0]
        if(users[user]["sid"] != "" && elementExists){
            let curr_points = parseInt(document.getElementsByClassName('points ' + users[user]["id"])[0].innerText.split(" ")[0])
            document.getElementsByClassName('name ' + users[user]["id"])[0].innerText = users[user]["name"]
            document.getElementsByClassName('points ' + users[user]["id"])[0].innerText = users[user]["points"] + " Punkte"
            
            if (users[user]["points"] > curr_points){
                document.getElementsByClassName('name ' + users[user]["id"])[0].parentElement.parentElement.classList.add("win_animation")
                setTimeout(function() {
                    document.getElementsByClassName('name ' + users[user]["id"])[0].parentElement.parentElement.classList.remove("win_animation");
                }, 2000);
            }
        }
        else if (users[user]["sid"] != "" && !elementExists){
            let context = document.createElement('div');
            let user_div = document.createElement('div');
            let name_row = document.createElement('div');
            let points_row = document.createElement('div');
            let answer_row = document.createElement('div');

            let h3_name = document.createElement('h3');
            let h3_points = document.createElement('h3');
            let h4_answer = document.createElement('h4');

            context.classList.add('user_context');
            user_div.classList.add('user');
            name_row.classList.add('row');
            points_row.classList.add('row');
            answer_row.classList.add('row');

            h3_name.classList.add('name', users[user]["id"]);
            h3_points.classList.add('points', users[user]["id"]);
            h4_answer.classList.add('answer', users[user]["id"]);

            h3_name.innerText = users[user]["name"];
            h3_points.innerText = users[user]["points"] + " Punkte";
            h4_answer.innerText = "";

            name_row.append(h3_name);
            points_row.append(h3_points);
            answer_row.append(h4_answer);

            user_div.append(name_row);
            user_div.append(points_row);
            user_div.append(answer_row);

            context.append(user_div);

            document.getElementsByClassName('wrapper')[0].append(context);
        }
        else {
            console.log(users);
            console.log(document.getElementsByClassName('name ' + users[user]["id"]));
            document.getElementsByClassName('name ' + users[user]["id"])[0].parentElement.parentElement.parentElement.remove();
        }
    }
})

socket.on('question', (socket_data) => {
    var question_element = document.getElementsByClassName('question')[0]
    question_element.classList.add('animate__animated', 'animate__zoomOut');
    
    question_element.addEventListener('animationend', () => {
        question_element.classList.remove('animate__zoomOut');
        question_element.innerText = "Frage " + (parseInt(socket_data[0]) + 1).toString() + "/" + socket_data[1] + ": " + socket_data[2]
        question_element.classList.add('animate__zoomIn');
    });
})

socket.on('buzzes', (buzzes) => {
    console.log(buzzes)
    for(let buzz in buzzes){
        (function () {
            var answer_element = document.getElementsByClassName('answer ' + buzz)[0]
            if(buzzes[buzz]["guess"] != "" && answer_element.innerText != buzzes[buzz]["guess"]){
                answer_element.classList.add('animate__animated', 'animate__flipOutY');
                
                answer_element.addEventListener('animationend', () => {
                    answer_element.classList.remove('animate__flipOutY');
                    answer_element.innerText = buzzes[buzz]["guess"]
                    answer_element.classList.add('animate__flipInY');
                });
            }
        }());
    }
})

socket.on('blank_live', (blanks) => {
    for(let blank in blanks){
        var div_loc = [blank.split("blank")[1].split("_")[0], blank.split("_")[1]]
        var iDiv = document.createElement('div');
        iDiv.setAttribute("id", div_loc);
        var id = div_loc
        if (document.getElementById(id) && !blanks[blank]){
            document.getElementById(id).remove();
        }
        else if (!document.getElementById(id) && blanks[blank]){
            console.log(div_loc[0])
            console.log(div_loc[1])
            iDiv.style.gridArea=`${div_loc[0]} / ${div_loc[1]}`;

            document.getElementsByClassName('wrapper')[0].append(iDiv)
        }
    }

})