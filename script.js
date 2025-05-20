let xmlData;
let score = 0;
let currentQuestion = 0;
let startTime;
let questions = [];
let userAnswers = [];
let correctAnswers = [];
let questionTexts = [];

document.getElementById("language").addEventListener("change", loadXML);
window.onload = () => {
  loadXML();
  startTime = Date.now();
  setInterval(updateTimer, 1000);
};

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timer").textContent = `Tiempo: ${seconds}s`;
}

function loadXML() {
  const lang = document.getElementById("language").value;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `preguntas${lang === 'es' ? 'Esp' : 'Eng'}.xml`, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      xmlData = xhr.responseXML;
      questions = Array.from(xmlData.getElementsByTagName("question"));
      currentQuestion = 0;
      score = 0;
      document.getElementById("scoreBox").innerText = "";
      // Actualizar el título según el idioma
      document.querySelector('h1').innerHTML = lang === 'es' 
        ? "⚽ Quiz sobre La Liga Española" 
        : "⚽ Quiz about The Spanish League";
      renderForm();
    }
  };
  xhr.send();
}

function renderForm() {
  const form = document.getElementById("quizForm");
  form.innerHTML = "";
  
  document.getElementById("scoreBox").style.display = "block";
  document.getElementById("scoreBox").innerText = `Puntuación actual: ${score} / ${currentQuestion}`;
  
  if (currentQuestion >= questions.length) {
    const lang = document.getElementById("language").value;
    const congratsMessage = lang === 'es' 
      ? "🏆 <span>¡Enhorabuena! Has completado el Cuestionario</span> 🎉"
      : "🏆 <span>Congratulations! You have completed the Quiz</span> 🎉";
      
    form.innerHTML = `<p class='congratulations'>${congratsMessage}</p>`;
    document.body.classList.add('quiz-completed');
    document.getElementById("scoreBox").innerText = `${lang === 'es' ? 'Puntuación final' : 'Final score'}: ${score} / ${questions.length}`;
    
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    
    const restartButton = document.createElement("button");
    restartButton.className = "quiz-button restart-button";
    restartButton.textContent = lang === 'es' ? "Reiniciar Quiz" : "Restart Quiz";
    restartButton.onclick = restartQuiz;
    
    buttonContainer.appendChild(restartButton);
    form.appendChild(buttonContainer);
    return;
  }

  const q = questions[currentQuestion];
  const wording = q.getElementsByTagName("wording")[0].textContent;
  const choices = q.getElementsByTagName("choice");

  const div = document.createElement("div");
  div.className = "question";
  div.innerHTML = `<p><strong>${wording}</strong></p>`;

  for (let i = 0; i < choices.length; i++) {
    const c = choices[i];
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "choice";
    radio.value = c.getAttribute("correct") === "yes" ? "1" : "0";
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + c.textContent));
    div.appendChild(label);
    div.appendChild(document.createElement("br"));
  }

  // Crear contenedor para botones
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const lang = document.getElementById("language").value;

  // Botón Siguiente
  const nextButton = document.createElement("button");
  nextButton.className = "quiz-button next-button";
  nextButton.textContent = lang === 'es' ? "Siguiente" : "Next";
  nextButton.onclick = evaluateAnswer;

  // Botón Reiniciar
  const restartButton = document.createElement("button");
  restartButton.className = "quiz-button restart-button";
  restartButton.textContent = lang === 'es' ? "Reiniciar" : "Restart";
  restartButton.onclick = restartQuiz;

  buttonContainer.appendChild(nextButton);
  buttonContainer.appendChild(restartButton);
  
  div.appendChild(buttonContainer);
  form.appendChild(div);
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  startTime = Date.now();
  document.body.classList.remove('quiz-completed');
  loadXML();
}

function evaluateAnswer() {
  const options = document.getElementsByName("choice");
  let selected = false;
  let userAnswer = '';
  let correctAnswer = '';
  
  const currentQ = questions[currentQuestion];
  const choices = currentQ.getElementsByTagName("choice");
  
  options.forEach((opt, index) => {
    if (opt.checked) {
      selected = true;
      userAnswer = choices[index].textContent;
      Array.from(choices).forEach(choice => {
        if (choice.getAttribute("correct") === "yes") {
          correctAnswer = choice.textContent;
        }
      });
    }
  });

  if (!selected) {
    const lang = document.getElementById("language").value;
    alert(lang === 'es' ? "Selecciona una respuesta" : "Select an answer");
    return;
  }

  // Guardar la pregunta y las respuestas
  questionTexts.push(currentQ.getElementsByTagName("wording")[0].textContent);
  userAnswers.push(userAnswer);
  correctAnswers.push(correctAnswer);

  currentQuestion++;
  
  if (currentQuestion >= questions.length) {
    showFinalResults();
  } else {
    renderForm();
  }
}

function showFinalResults() {
  const form = document.getElementById("quizForm");
  const lang = document.getElementById("language").value;
  
  // Mostrar mensaje de finalización
  const congratsMessage = lang === 'es' 
    ? "🏆 Resultados del Cuestionario"
    : "🏆 Quiz Results";
    
  form.innerHTML = `<h2>${congratsMessage}</h2>`;
  
  // Mostrar puntuación final
  document.getElementById("scoreBox").innerText = 
    `${lang === 'es' ? 'Tu puntuación' : 'Your score'}: ${score} / ${questions.length}`;
  
  // Mostrar tiempo empleado
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const timeText = lang === 'es' ? 'Tiempo empleado' : 'Time spent';
  form.innerHTML += `<p>${timeText}: ${seconds}s</p>`;

  // Mostrar correcciones
  questionTexts.forEach((question, index) => {
    const isCorrect = userAnswers[index] === correctAnswers[index];
    const div = document.createElement('div');
    div.className = `question-correction ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`;
    
    div.innerHTML = `
      <div class="correction-header">${index + 1}. ${question}</div>
      <div class="user-answer">Tu respuesta: ${userAnswers[index]}</div>
      ${!isCorrect ? `<div class="correct-answer-text">Respuesta correcta: ${correctAnswers[index]}</div>` : ''}
    `;
    
    form.appendChild(div);
  });

  // Botón de reinicio
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  
  const restartButton = document.createElement("button");
  restartButton.className = "quiz-button restart-button";
  restartButton.textContent = lang === 'es' ? "Reiniciar Quiz" : "Restart Quiz";
  restartButton.onclick = restartQuiz;
  
  buttonContainer.appendChild(restartButton);
  form.appendChild(buttonContainer);
}

// Modifica tu función de envío del formulario para incluir la corrección
function handleSubmit(event) {
  event.preventDefault();
  // ... existing code ...

  // Después de calcular la puntuación, muestra las correcciones
  showCorrections(userAnswers, correctAnswers, questions);
}
