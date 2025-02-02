function sendMessage() {
    const wordInput = document.getElementById("wordInput");
    const userText = wordInput.value.trim();

    if (userText) {
        displayMessage(userText, "user");

        translateToEnglish(userText)
            .then(translatedText => {
                fetchDefinition(translatedText);
            })
            .catch(error => {
                displayMessage("Désolé, une erreur s'est produite avec la traduction.", "bot");
            });

        wordInput.value = '';
    }
}

function translateToEnglish(text) {
    return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&q=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => data[0].map(item => item[0]).join(' '))
        .catch(error => {
            console.error('Erreur de traduction :', error);
            throw error;
        });
}

function fetchDefinition(word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Mot non trouvé');
            }
            return response.json();
        })
        .then(data => {
            const wordData = data[0];
            const definition = wordData.meanings.map(meaning => 
                meaning.definitions.map(def => `<b>${def.definition}</b>`).join('<br>')
            ).join('<br><br>');
            const phonetic = wordData.phonetic || 'Non disponible';
            const audio = wordData.phonetics[0]?.audio || '';

            const botResponse = `
                Définition : <br>${definition}<br><br>
                Phonétique : ${phonetic}<br>
                ${audio ? `<audio controls><source src="${audio}" type="audio/mp3"></audio>` : ''}
            `;

            translateBotResponseToFrench(botResponse);
        })
        .catch(error => {
            displayMessage(`Désolé, je n'ai pas trouvé le mot "${word}". Veuillez réessayer.`, "bot");
        });
}

function translateBotResponseToFrench(text) {
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            const translatedText = data[0].map(item => item[0]).join(' ');
            displayMessage(translatedText, "bot");
        })
        .catch(error => {
            console.error('Erreur de traduction :', error);
            displayMessage("Désolé, une erreur s'est produite avec la traduction.", "bot");
        });
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("wordInput").addEventListener("keypress", function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
